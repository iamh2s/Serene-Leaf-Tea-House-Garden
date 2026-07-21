"""
Views for Serene Leaf Tea House API
"""
import uuid
import traceback
import razorpay
from decimal import Decimal
from django.conf import settings
from django.db.models import Sum, Count, Q
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.authtoken.models import Token

from .models import Category, Product, Customer, Order, OrderItem, Review, ContactMessage
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateSerializer, ProductUpdateSerializer,
    CustomerSerializer, OrderSerializer, OrderCreateSerializer,
    OrderStatusUpdateSerializer, ReviewSerializer, ReviewCreateSerializer,
    ContactMessageSerializer, ContactMessageUpdateSerializer,
    AdminLoginSerializer, RazorpayVerifySerializer,
)

razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


# ---------- Helper ----------
def get_product_by_id_or_slug(pid):
    """Find product by UUID or by slug. Returns None if not found."""
    if not pid:
        return None
    try:
        uuid_obj = uuid.UUID(str(pid))
        product = Product.objects.filter(id=uuid_obj).first()
        if product:
            return product
    except (ValueError, TypeError, AttributeError):
        pass
    return Product.objects.filter(slug=str(pid)).first()


# ============ Categories ============
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


# ============ Products ============
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    lookup_field = 'slug'
    pagination_class = None

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'toggle_stock']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductCreateSerializer
        if self.action in ['update', 'partial_update', 'toggle_stock']:
            return ProductUpdateSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        # Show ALL products (in-stock AND out-of-stock)
        # Frontend visually marks out-of-stock items
        queryset = Product.objects.all()

        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category__slug=category)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(origin__icontains=search)
            )

        sort = self.request.query_params.get('sort', 'default')
        sort_map = {
            'price-low': 'price',
            'price-high': '-price',
            'rating': '-rating',
            'name': 'name',
        }
        if sort in sort_map:
            queryset = queryset.order_by(sort_map[sort])
        else:
            # In-stock first, then featured, then newest
            queryset = queryset.order_by('-in_stock', '-is_featured', '-created_at')

        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        # Only show in-stock featured products
        featured = Product.objects.filter(is_featured=True, in_stock=True)[:8]
        return Response(ProductListSerializer(featured, many=True).data)

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        product = self.get_object()
        related = Product.objects.filter(
            category=product.category, in_stock=True
        ).exclude(id=product.id)[:4]
        return Response(ProductListSerializer(related, many=True).data)

    @action(detail=True, methods=['patch'])
    def toggle_stock(self, request, slug=None):
        product = self.get_object()
        product.in_stock = not product.in_stock
        if not product.in_stock:
            product.stock_quantity = 0
        elif product.stock_quantity == 0:
            product.stock_quantity = 50
        product.save()
        return Response(ProductListSerializer(product).data)


# ============ Reviews ============
class ReviewListCreateView(generics.ListCreateAPIView):
    queryset = Review.objects.all()
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_permissions(self):
        return [AllowAny()]

    def get_queryset(self):
        queryset = Review.objects.select_related('product').all()
        product = self.request.query_params.get('product')
        if product:
            queryset = queryset.filter(product__slug=product)
        rating = self.request.query_params.get('rating')
        if rating:
            queryset = queryset.filter(rating=int(rating))
        return queryset

    def perform_create(self, serializer):
        review = serializer.save()
        product = review.product
        agg = product.reviews.aggregate(avg=Sum('rating'), cnt=Count('id'))
        product.rating = round(agg['avg'] / agg['cnt'], 1) if agg['cnt'] else 4.5
        product.reviews_count = agg['cnt']
        product.save()


# ============ Orders ============
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ['list', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Order.objects.all()
        s = self.request.query_params.get('status')
        if s and s != 'all':
            queryset = queryset.filter(status=s)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(id__icontains=search) |
                Q(customer_name__icontains=search) |
                Q(customer_email__icontains=search)
            )
        return queryset

    def create(self, request):
        ser = OrderCreateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        data = ser.validated_data
        subtotal = Decimal('0')
        order_items = []

        for item_data in data['items']:
            pid = item_data.get('product_id')
            product = get_product_by_id_or_slug(pid)

            if not product:
                return Response(
                    {'error': f"Product '{pid}' not found"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Prevent ordering out-of-stock items
            if not product.in_stock:
                return Response(
                    {'error': f"'{product.name}' is out of stock"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            qty = int(item_data['quantity'])
            sub = product.price * qty
            subtotal += sub

            order_items.append({
                'product': product,
                'product_name': product.name,
                'product_price': product.price,
                'quantity': qty,
                'subtotal': sub,
            })

        shipping = Decimal('0') if subtotal >= 999 else Decimal('99')
        total = subtotal + shipping

        customer, _ = Customer.objects.get_or_create(
            email=data['customer_email'],
            defaults={
                'name': data['customer_name'],
                'phone': data.get('customer_phone', ''),
            },
        )

        order = Order.objects.create(
            customer=customer,
            customer_name=data['customer_name'],
            customer_email=data['customer_email'],
            customer_phone=data.get('customer_phone', ''),
            shipping_address=data['shipping_address'],
            city=data.get('city', ''),
            state=data.get('state', ''),
            pincode=data.get('pincode', ''),
            subtotal=subtotal,
            shipping_cost=shipping,
            total=total,
            notes=data.get('notes', ''),
        )

        for i in order_items:
            OrderItem.objects.create(order=order, **i)

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        ser = OrderStatusUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        order.status = ser.validated_data['status']
        order.save()
        return Response(OrderSerializer(order).data)


# ============ Razorpay ============
class RazorpayCreateOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            amount = int(request.data.get('amount', 0))
            if amount <= 0:
                return Response(
                    {'error': 'Invalid amount'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            rz_order = razorpay_client.order.create({
                'amount': amount,
                'currency': 'INR',
                'payment_capture': 1,
            })
            return Response({
                'id': rz_order['id'],
                'amount': rz_order['amount'],
                'currency': rz_order['currency'],
                'key_id': settings.RAZORPAY_KEY_ID,
            })
        except Exception as e:
            print(traceback.format_exc())
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RazorpayVerifyPaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RazorpayVerifySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': data['razorpay_order_id'],
                'razorpay_payment_id': data['razorpay_payment_id'],
                'razorpay_signature': data['razorpay_signature'],
            })
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {'error': 'Verification failed'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order_id_str = str(data['order_id'])
        order = Order.objects.filter(id=order_id_str).first()
        if not order:
            try:
                order_uuid = uuid.UUID(order_id_str)
                order = Order.objects.filter(id=order_uuid).first()
            except (ValueError, TypeError):
                pass

        if not order:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        order.razorpay_order_id = data['razorpay_order_id']
        order.razorpay_payment_id = data['razorpay_payment_id']
        order.razorpay_signature = data['razorpay_signature']
        order.status = 'paid'
        order.save()

        return Response({
            'status': 'success',
            'order': OrderSerializer(order).data,
        })


# ============ Contact Messages ============
class ContactMessageCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]


class ContactMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None


class ContactMessageUpdateView(generics.UpdateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageUpdateSerializer
    permission_classes = [IsAdminUser]


# ============ Admin Auth ============
class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')
        try:
            user = User.objects.get(email=email)
            user = authenticate(username=user.username, password=password)
        except User.DoesNotExist:
            user = None

        if user and user.is_staff:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'is_admin': user.is_staff,
                },
            })
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class AdminLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'status': 'logged out'})


class DashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Only count revenue from PAID orders (paid, processing, shipped, delivered)
        # Exclude: pending, cancelled
        paid_statuses = ['paid', 'processing', 'shipped', 'delivered']
        paid_orders = Order.objects.filter(status__in=paid_statuses)

        return Response({
            'total_revenue': paid_orders.aggregate(total=Sum('total'))['total'] or 0,
            'total_orders': Order.objects.count(),
            'paid_orders_count': paid_orders.count(),
            'total_products': Product.objects.count(),
            'total_customers': Customer.objects.count(),
            'pending_orders': Order.objects.filter(status='pending').count(),
            'cancelled_orders': Order.objects.filter(status='cancelled').count(),
            'unread_messages': ContactMessage.objects.filter(is_read=False).count(),
            'recent_orders': OrderSerializer(Order.objects.all()[:10], many=True).data,
        })


class CustomerListView(generics.ListAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminUser]
    pagination_class = None

    def get_queryset(self):
        return Customer.objects.annotate(
            orders_count_val=Count('orders'),
            total_spent_val=Sum('orders__total'),
        ).order_by('-total_spent_val')