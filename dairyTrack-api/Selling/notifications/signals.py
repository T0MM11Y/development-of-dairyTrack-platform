from django.db.models.signals import post_save
from django.dispatch import receiver
from sales.models import Order
from stock.models import ProductStock, MilkBatch
from .models import Notification
from django.db import transaction

@receiver(post_save, sender=Order)
def create_order_notification(sender, instance, created, **kwargs):
    if created:
        # Create notification with order number, customer name, and order items
        Notification.objects.create(
            order=instance,
            user_id=2,  # Replace with appropriate user ID, e.g., from request.user
            message=f"Pesanan baru #{instance.order_no} dari {instance.customer_name}",
            type='ORDER',
            is_read=False
        )

@receiver(post_save, sender=ProductStock)
def create_stock_notification(sender, instance, created, **kwargs):
    if created:
        # Initialize message components
        batch_info = []
        total_milk_used = float(instance.total_milk_used)
        
        # Get fresh milk batches ordered by production date (FIFO)
        milk_batches = MilkBatch.objects.filter(status='FRESH').order_by('production_date')
        remaining_milk_needed = total_milk_used
        
        # Track batch usage for notification
        with transaction.atomic():
            for batch in milk_batches:
                if remaining_milk_needed <= 0:
                    break
                if batch.total_volume <= remaining_milk_needed:
                    used_volume = batch.total_volume
                    remaining_milk_needed -= used_volume
                    batch_info.append(f"{batch.batch_number}: {used_volume}L")
                else:
                    used_volume = remaining_milk_needed
                    remaining_milk_needed = 0
                    batch_info.append(f"{batch.batch_number}: {used_volume}L")
        
        # Combine batch info into a readable string
        batch_details = "; ".join(batch_info) if batch_info else "No batches used"
        
        # Create notification with batch number and milk usage details
        Notification.objects.create(
            product_stock=instance,
            user_id=2,  # Replace with appropriate user ID
            message=f"Produk baru dibuat: {instance.id} - Status: {instance.status} - Milk Used: {total_milk_used}L from {batch_details}",
            type='PRODUCT_STOCK',
            is_read=False
        )