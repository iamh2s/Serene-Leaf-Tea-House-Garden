"""
Django Admin configuration for Serene Leaf Tea House
"""
from django.contrib import admin
from .models import Category, Product, Customer, Order, OrderItem, Review, ContactMessage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'products_count']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']

    def products_count(self, obj):
        return obj.products.count()
    products_count.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'weight', 'in_stock', 'is_featured', 'rating']
    list_filter = ['category', 'in_stock', 'is_featured', 'badge']
    list_editable = ['price', 'in_stock', 'is_featured']
    search_fields = ['name', 'description', 'origin']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['rating', 'reviews_count', 'created_at', 'updated_at']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'product_price', 'quantity', 'subtotal']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'customer_email', 'total', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    list_editable = ['status']
    search_fields = ['id', 'customer_name', 'customer_email', 'razorpay_payment_id']
    readonly_fields = ['id', 'subtotal', 'shipping_cost', 'total', 'razorpay_order_id', 
                       'razorpay_payment_id', 'razorpay_signature', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'city', 'orders_count', 'created_at']
    search_fields = ['name', 'email', 'phone']
    readonly_fields = ['created_at']

    def orders_count(self, obj):
        return obj.orders.count()
    orders_count.short_description = 'Orders'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'customer_name', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'customer_name', 'comment']
    readonly_fields = ['created_at']


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'subject', 'is_read', 'is_closed', 'created_at']
    list_filter = ['is_read', 'is_closed', 'created_at']
    list_editable = ['is_read', 'is_closed']
    search_fields = ['name', 'email', 'phone', 'subject', 'message']
    readonly_fields = ['created_at']
