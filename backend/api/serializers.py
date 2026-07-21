"""
Serializers for Serene Leaf Tea House API
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Customer, Order, OrderItem, Review, ContactMessage


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'products_count']
    def get_products_count(self, obj):
        return obj.products.filter(in_stock=True).count()


class ProductListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.slug')
    category_name = serializers.CharField(source='category.name')
    image = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name', 'price',
            'short_description', 'description', 'image', 'origin', 'weight', 'badge',
            'in_stock', 'stock_quantity', 'rating', 'reviews_count', 'is_featured'
        ]
    def get_image(self, obj):
        return obj.get_image_url()


class ProductDetailSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.slug')
    category_name = serializers.CharField(source='category.name')
    image = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'category_name', 'price',
            'description', 'short_description', 'image', 'origin', 'weight',
            'badge', 'in_stock', 'stock_quantity', 'rating', 'reviews_count',
            'is_featured', 'reviews', 'created_at'
        ]
    def get_image(self, obj):
        return obj.get_image_url()
    def get_reviews(self, obj):
        return ReviewSerializer(obj.reviews.all()[:10], many=True).data


class ProductCreateSerializer(serializers.ModelSerializer):
    category_slug = serializers.SlugField(write_only=True)
    class Meta:
        model = Product
        fields = [
            'name', 'slug', 'category_slug', 'price', 'description',
            'short_description', 'image_url', 'origin', 'weight', 'badge',
            'in_stock', 'stock_quantity', 'is_featured'
        ]
    def create(self, validated_data):
        slug = validated_data.pop('category_slug')
        try:
            validated_data['category'] = Category.objects.get(slug=slug)
        except Category.DoesNotExist:
            raise serializers.ValidationError({'category_slug': f"'{slug}' not found"})
        return super().create(validated_data)


class ProductUpdateSerializer(serializers.ModelSerializer):
    category_slug = serializers.SlugField(write_only=True, required=False)
    class Meta:
        model = Product
        fields = [
            'name', 'category_slug', 'price', 'description', 'short_description',
            'image_url', 'origin', 'weight', 'badge',
            'in_stock', 'stock_quantity', 'is_featured'
        ]
    def update(self, instance, validated_data):
        slug = validated_data.pop('category_slug', None)
        if slug:
            try:
                validated_data['category'] = Category.objects.get(slug=slug)
            except Category.DoesNotExist:
                raise serializers.ValidationError({'category_slug': f"'{slug}' not found"})
        if 'stock_quantity' in validated_data:
            if validated_data['stock_quantity'] == 0:
                validated_data['in_stock'] = False
            elif validated_data['stock_quantity'] > 0 and 'in_stock' not in validated_data:
                validated_data['in_stock'] = True
        if 'in_stock' in validated_data and not validated_data['in_stock']:
            validated_data['stock_quantity'] = 0
        return super().update(instance, validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    product_image = serializers.SerializerMethodField()
    class Meta:
        model = Review
        fields = ['id', 'product', 'product_name', 'product_slug', 'product_image',
                  'customer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at', 'product_name', 'product_slug']
    def get_product_image(self, obj):
        return obj.product.get_image_url() if obj.product else ''


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['product', 'customer_name', 'rating', 'comment']
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class CustomerSerializer(serializers.ModelSerializer):
    orders_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()
    class Meta:
        model = Customer
        fields = ['id', 'email', 'name', 'phone', 'address', 'city', 'state',
                  'pincode', 'orders_count', 'total_spent', 'created_at']
    def get_orders_count(self, obj):
        return obj.orders.count()
    def get_total_spent(self, obj):
        return sum(o.total for o in obj.orders.exclude(status='cancelled'))


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.UUIDField(source='product.id', read_only=True)
    product_image = serializers.SerializerMethodField()
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'product_price',
                  'product_image', 'quantity', 'subtotal']
    def get_product_image(self, obj):
        return obj.product.get_image_url() if obj.product else ''


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_email', 'customer_phone',
            'shipping_address', 'city', 'state', 'pincode',
            'subtotal', 'shipping_cost', 'total', 'status',
            'razorpay_order_id', 'razorpay_payment_id',
            'items', 'items_count', 'notes', 'created_at', 'updated_at'
        ]
    def get_items_count(self, obj):
        return sum(item.quantity for item in obj.items.all())


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    shipping_address = serializers.CharField()
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    pincode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(child=serializers.DictField(), min_length=1)
    def validate_items(self, value):
        for item in value:
            if 'product_id' not in item or 'quantity' not in item:
                raise serializers.ValidationError("Each item needs product_id and quantity")
            if item['quantity'] < 1:
                raise serializers.ValidationError("Quantity must be >= 1")
        return value


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message',
                  'is_read', 'is_closed', 'admin_note', 'created_at']
        read_only_fields = ['id', 'created_at']


class ContactMessageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['is_read', 'is_closed', 'admin_note']


class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RazorpayOrderSerializer(serializers.Serializer):
    amount = serializers.IntegerField()
    currency = serializers.CharField(default='INR')
    receipt = serializers.CharField()


class RazorpayVerifySerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()
    order_id = serializers.CharField()


class DashboardStatsSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders = serializers.IntegerField()
    total_products = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    recent_orders = OrderSerializer(many=True)
