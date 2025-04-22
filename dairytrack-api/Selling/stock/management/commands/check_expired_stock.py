from django.core.management.base import BaseCommand
from django.utils import timezone
from stock.models import ProductStock, StockHistory  # Sesuaikan dengan nama app Anda
from django.db import transaction

class Command(BaseCommand):
    help = 'Update expired status for product stock and record to StockHistory'

    def handle(self, *args, **kwargs):
        self.stdout.write("\n[INFO] Checking expired product stocks...")

        expired_products = ProductStock.objects.filter(
            expiry_at__lt=timezone.now(), status='available')

        if not expired_products.exists():
            self.stdout.write(self.style.SUCCESS("Tidak ada stok yang kadaluarsa saat ini.")) # pylint: disable=no-member
            return

        with transaction.atomic():
            for product in expired_products:
                product.status = 'expired'
                product.save()

                StockHistory.objects.create(
                    product_stock=product,
                    change_type="expired",
                    quantity_change=product.quantity
                )

                self.stdout.write(
                    self.style.WARNING( # pylint: disable=no-member
                        f"Produk '{product.product_type}' dengan ID {product.id} telah dikadaluarsa."
                    ) # pylint: disable=no-member
                )

        self.stdout.write(self.style.SUCCESS("\n[SUCCESS] Status expired berhasil diperbarui dan dicatat ke StockHistory.")) # pylint: disable=no-member


# python manage.py check_expired_stock

