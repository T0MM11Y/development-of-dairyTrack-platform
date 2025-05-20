from django.db.models.signals import post_save
from django.dispatch import receiver
from sales.models import Order
from stock.models import ProductStock
from .models import Notification

@receiver(post_save, sender=Order)
def create_order_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            order=instance,
            user_id=None,  # Ganti dengan ID pengguna yang sesuai, misalnya dari request.user
            message=f"Pesanan baru dari {instance.customer_name}",
            type='ORDER',  # Sesuaikan dengan tipe notifikasi
            is_read=False
        )

@receiver(post_save, sender=ProductStock)
def create_stock_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            product_stock=instance,
            user_id=None,  # Ganti dengan ID pengguna yang sesuai
            message=f"Produk baru dibuat: {instance.id} - Status: {instance.status}",
            type='PRODUCT_STOCK',
            is_read=False
        )