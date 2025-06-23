import os
from django.conf import settings
from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework import serializers
# from notifications.models import User

# Model Batch Susu
class MilkBatch(models.Model):
    class Meta:
        db_table = "milk_batches"
        managed = False

    objects = models.Manager()
    batch_number = models.CharField(max_length=50, unique=True)
    total_volume = models.FloatField()
    status = models.CharField(max_length=20, choices=[('FRESH', 'Fresh'), ('EXPIRED', 'Expired'), ('USED', 'Used')], default='FRESH')
    production_date = models.DateTimeField()
    expiry_date = models.DateTimeField(null=True, blank=True)
    notes = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Batch {self.batch_number} - {self.total_volume}L ({self.status})"

class User(models.Model):
    class Meta:
        db_table = "users"
        managed = False

    objects = models.Manager()
    id = models.IntegerField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    contact = models.CharField(max_length=15, null=True, blank=True)
    religion = models.CharField(max_length=50, null=True, blank=True)
    role_id = models.IntegerField()
    token = models.CharField(max_length=255, null=True, blank=True)
    token_created_at = models.DateTimeField(null=True, blank=True)
    name = models.CharField(max_length=100)
    birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.username}"


# Model Tipe Produk
class ProductType(models.Model):

    class Meta:
        db_table = "product_type"
        managed = False

    objects = models.Manager()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="product_type_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="product_type_updated")
    product_name = models.CharField(max_length=255, unique=True)
    product_description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product_name}"
    
    def delete(self, *args, **kwargs):
        if self.image:
            image_path = os.path.join(settings.MEDIA_ROOT, str(self.image))
            if os.path.isfile(image_path):
                os.remove(image_path)
        super().delete(*args, **kwargs)


# Model Stok Produk
class ProductStock(models.Model):
    product_type_detail = serializers.SerializerMethodField()

    class Meta:
        db_table = "product_stock"
        managed = False
    
    objects = models.Manager()
    product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="product_stock_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="product_stock_updated")
    initial_quantity = models.IntegerField()
    quantity = models.IntegerField()
    production_at = models.DateTimeField(default=timezone.now)
    expiry_at = models.DateTimeField()
    status = models.CharField(max_length=60)
    total_milk_used = models.DecimalField(max_digits=7, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product_type}"

    def deduct_milk_batch(self):
        """Mengurangi stok dari milk_batches berdasarkan total_milk_used menggunakan FIFO"""
        if self.total_milk_used <= 0:
            return

        milk_batches = MilkBatch.objects.filter(status='FRESH').order_by('production_date')

        total_available = sum(batch.total_volume for batch in milk_batches)
        if self.total_milk_used > total_available:
            raise ValidationError("Stok susu di milk_batches tidak mencukupi untuk produksi!")

        remaining_milk_needed = float(self.total_milk_used)

        with transaction.atomic():
            for batch in milk_batches:
                if remaining_milk_needed <= 0:
                    break

                if batch.total_volume <= remaining_milk_needed:
                    remaining_milk_needed -= batch.total_volume
                    batch.total_volume = 0
                    batch.status = 'USED'
                else:
                    batch.total_volume -= remaining_milk_needed
                    remaining_milk_needed = 0
                    if batch.total_volume == 0:
                        batch.status = 'USED'

                batch.save()

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        previous = None

        if not is_new:
            try:
                previous = ProductStock.objects.get(pk=self.pk)
            except ProductStock.DoesNotExist: # pylint: disable=no-member
                pass

        super().save(*args, **kwargs)

        # Check for status change to "contamination" or "expired"
        if previous and previous.status != self.status:
            if self.status == "contamination" and self.quantity > 0:
                StockHistory.objects.create(
                    product_stock=self,
                    change_type="contamination",
                    quantity_change=self.quantity,
                    total_price=0.0
                )
                self.quantity = 0
                super().save(update_fields=["quantity"])
            elif self.status == "expired" and previous.status != "expired":
                StockHistory.objects.create(
                    product_stock=self,
                    change_type="expired",
                    quantity_change=self.quantity,
                    total_price=0.0
                )
    @classmethod
    def check_expired_products(cls):
        """Otomatis set produk expired jika sudah melewati tanggal kadaluarsa dan kirim notifikasi"""
        from notifications.models import Notification
        expired_products = cls.objects.filter(expiry_at__lt=timezone.now(), status="available")
        
        with transaction.atomic():
            for product in expired_products:
                product.status = "expired"
                product.save()  # This will trigger the save method, which handles StockHistory creation

                # Kirim notifikasi bahwa produk telah kadaluarsa
                Notification.objects.create(
                    product_stock=product,
                    user_id=2,  # Ganti dengan ID pengguna yang sesuai
                    message=f"Produk {product.product_type} telah kadaluarsa pada {product.expiry_at}!",
                    type='PRODUCT_EXPIRED',
                    is_read=False
                )

    @classmethod
    def sell_product(cls, product_type, quantity):
        """Jual produk berdasarkan FIFO jika tersedia"""
        available_stocks = cls.objects.filter(
            product_type=product_type, 
            status="available", 
            quantity__gt=0
        ).order_by("production_at")

        remaining = quantity
        stock_usage = []

        with transaction.atomic():
            for stock in available_stocks:
                if remaining <= 0:
                    break

                sold_quantity = min(stock.quantity, remaining)
                remaining -= sold_quantity
                stock.quantity -= sold_quantity

                if stock.quantity == 0:
                    stock.status = "sold_out"

                total_price = sold_quantity * stock.product_type.price

                history_entry = StockHistory.objects.create(
                    product_stock=stock,
                    change_type="sold",
                    quantity_change=sold_quantity,
                    total_price=total_price
                )

                stock_usage.append({
                    "stock_id": stock.id,
                    "sold_quantity": sold_quantity,
                    "history_id": history_entry.id,
                    "total_price": float(total_price)
                })

                stock.save()

        if remaining > 0:
            raise ValidationError("Stok tidak mencukupi!")

        return stock_usage


# Model Histori Perubahan Stok
class StockHistory(models.Model):

    class Meta:
        db_table = "product_stock_history"
        managed = False

    objects = models.Manager()
    product_stock = models.ForeignKey(ProductStock, on_delete=models.CASCADE)
    change_type = models.CharField(max_length=20, choices=[("sold", "Sold"), ("expired", "Expired"), ("contamination", "Contamination")])  # 'Added' atau 'Removed'
    quantity_change = models.IntegerField()
    change_date = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0.0)

    def __str__(self):
        return f"{self.change_type} {self.quantity_change}"
