from django.utils import timezone
from django.db import transaction
from background_task import background # pylint: disable=import-error
from stock.models import ProductStock, StockHistory, User
from notifications.models import Notification
from datetime import timedelta
import logging

logger = logging.getLogger('stock')  # Gunakan logger 'stock' sesuai settings.py

@background(schedule=60)
def check_product_expiration():
    try:
        logger.info("Starting product expiration check at %s WIB", timezone.now().astimezone(timezone.get_current_timezone()))
        now = timezone.now()
        four_hours = now + timedelta(hours=4)
        two_hours = now + timedelta(hours=2)
        two_hours_ago = now - timedelta(hours=2)
        
        products = ProductStock.objects.filter(status="available")
        logger.info("Found %d available products to check", products.count())
        
        if not products.exists():
            logger.info("No available products to process")
            return
        
        # Ambil admin (misalnya, role_id=1)
        admins = User.objects.filter(role_id=1)
        if not admins.exists():
            logger.error("No admin users found for notifications")
            return
        
        with transaction.atomic():
            for product in products:
                time_to_expiry = product.expiry_at - now
                expiry_wib = product.expiry_at.astimezone(timezone.get_current_timezone())
                logger.debug("Checking product %s: expiry_at=%s, time_to_expiry=%s", 
                             product.id, expiry_wib, time_to_expiry)
                
                # Check if expiration is within 4 hours
                if time_to_expiry <= timedelta(hours=4) and time_to_expiry > timedelta(hours=2):
                    if not Notification.objects.filter(
                        product_stock=product,
                        type='EXPIRY_WARN_4H',
                        is_read=False
                    ).exists():
                        for admin in admins:
                            Notification.objects.create(
                                product_stock=product,
                                user_id=admin.id,
                                message=f"Produk {product.product_type} expires in less than 4 hours on {expiry_wib.strftime('%Y-%m-%d %H:%M:%S %Z')}!",
                                type='EXPIRY_WARN_4H',
                                is_read=False,
                                created_at_wib=timezone.now().astimezone(timezone.get_current_timezone())
                            )
                            logger.info("Sent 4-hour warning for product %s to user %s", product.id, admin.id)
                
                # Check if expiration is within 2 hours
                elif time_to_expiry <= timedelta(hours=2) and time_to_expiry > timedelta(seconds=0):
                    if not Notification.objects.filter(
                        product_stock=product,
                        type='EXPIRY_WARN_2H',
                        is_read=False
                    ).exists():
                        for admin in admins:
                            Notification.objects.create(
                                product_stock=product,
                                user_id=admin.id,
                                message=f"Produk {product.product_type} expires in less than 2 hours on {expiry_wib.strftime('%Y-%m-%d %H:%M:%S %Z')}!",
                                type='EXPIRY_WARN_2H',
                                is_read=False,
                                created_at_wib=timezone.now().astimezone(timezone.get_current_timezone())
                            )
                            logger.info("Sent 2-hour warning for product %s to user %s", product.id, admin.id)
                
                # Check if product has expired
                elif product.expiry_at <= now:
                    product.status = "expired"
                    StockHistory.objects.create(
                        product_stock=product,
                        change_type="expired",
                        quantity_change=product.quantity
                    )
                    product.save()
                    if not Notification.objects.filter(
                        product_stock=product,
                        type='PROD_EXPIRED',
                        is_read=False
                    ).exists():
                        for admin in admins:
                            Notification.objects.create(
                                product_stock=product,
                                user_id=admin.id,
                                message=f"Produk {product.product_type} telah kadaluarsa pada {expiry_wib.strftime('%Y-%m-%d %H:%M:%S %Z')}!",
                                type='PROD_EXPIRED',
                                is_read=False,
                                created_at_wib=timezone.now().astimezone(timezone.get_current_timezone())
                            )
                            logger.info("Marked product %s as expired and notified user %s", product.id, admin.id)
            
            # Check products expired more than 2 hours ago
            long_expired_products = ProductStock.objects.filter(
                status="expired",
                expiry_at__lt=two_hours_ago
            )
            logger.info("Found %d products expired more than 2 hours ago", long_expired_products.count())
            for product in long_expired_products:
                expiry_wib = product.expiry_at.astimezone(timezone.get_current_timezone())
                logger.debug("Product %s expired at %s (>2 hours ago)", product.id, expiry_wib)
                if not Notification.objects.filter(
                    product_stock=product,
                    type='PRODUCT_LONG_EXPIRED',
                    is_read=False
                ).exists():
                    for admin in admins:
                        Notification.objects.create(
                            product_stock=product,
                            user_id=admin.id,
                            message=f"Produk {product.product_type} telah kadaluarsa lebih dari 2 jam pada {expiry_wib.strftime('%Y-%m-%d %H:%M:%S %Z')}. Harap ditindaklanjuti!",
                            type='PRODUCT_LONG_EXPIRED',
                            is_read=False,
                            created_at_wib=timezone.now().astimezone(timezone.get_current_timezone())
                        )
                        logger.info("Sent long expired notification for product %s to user %s", product.id, admin.id)
    except Exception as e:
        logger.error("Error in check_product_expiration: %s", str(e), exc_info=True)