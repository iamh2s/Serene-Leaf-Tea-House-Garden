"""
URL patterns for Serene Leaf Tea House API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),

    # Reviews (list + create)
    path('reviews/', views.ReviewListCreateView.as_view(), name='reviews'),

    # Payment
    path('payment/create-order/', views.RazorpayCreateOrderView.as_view(), name='razorpay-create-order'),
    path('payment/verify/', views.RazorpayVerifyPaymentView.as_view(), name='razorpay-verify'),

    # Contact messages
    path('contact/', views.ContactMessageCreateView.as_view(), name='contact-create'),

    # Admin
    path('admin/login/', views.AdminLoginView.as_view(), name='admin-login'),
    path('admin/logout/', views.AdminLogoutView.as_view(), name='admin-logout'),
    path('admin/dashboard/', views.DashboardStatsView.as_view(), name='dashboard'),
    path('admin/customers/', views.CustomerListView.as_view(), name='customer-list'),
    path('admin/messages/', views.ContactMessageListView.as_view(), name='message-list'),
    path('admin/messages/<int:pk>/', views.ContactMessageUpdateView.as_view(), name='message-update'),
]
