from django.db.models.signals import post_save
from django.dispatch import receiver
from sales.models import Order
from stock.models import ProductStock
from .models import Notification
from datetime import date

@receiver(post_save, sender=Order)
def create_order_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            order=instance,
            message=f"Pesanan baru dari {instance.customer_name}",
            date=date.today()
        )

@receiver(post_save, sender=ProductStock)
def create_stock_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            product_stock=instance,
            message=f"Produk baru dibuat: {instance.id} - Status: {instance.status}",
            date=date.today()
        )