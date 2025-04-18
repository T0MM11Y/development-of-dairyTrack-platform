from django.db import models, transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework import serializers

# Create your models here.
# Model Produksi Susu Mentah
class RawMilk(models.Model):

    class Meta:
        db_table = "raw_milks"
        managed = False

    objects = models.Manager()
    cow_id = models.IntegerField()
    production_time = models.DateTimeField(default=timezone.now)
    expiration_time = models.DateTimeField(default=timezone.now)  # Bisa diubah saat save()
    volume_liters = models.DecimalField(max_digits=5, decimal_places=2)
    previous_volume = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='fresh')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    daily_total_id = models.IntegerField(null=True, blank=True)  # Hanya sebagai kolom biasa, bukan FK
    session = models.IntegerField()
    available_stocks = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        """Set expiration_time otomatis berdasarkan produksi"""
        if not self.expiration_time:
            self.expiration_time = self.production_time + timezone.timedelta(hours=8)  # Sesuai default DB
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Cow {self.cow_id} - {self.available_stocks}L available"


# Model Tipe Produk
class ProductType(models.Model):

    class Meta:
        db_table = "product_type"

    objects = models.Manager()
    product_name = models.CharField(max_length=255)
    product_description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product_name}"


# Model Stok Produk
class ProductStock(models.Model):
    product_type_detail = serializers.SerializerMethodField()

    class Meta:
        db_table = "product_stock"
    
    objects = models.Manager()
    product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE)
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

    def deduct_raw_milk(self):
        """ Mengurangi stok susu mentah berdasarkan total_milk_used tanpa perhitungan tambahan """
        if self.total_milk_used <= 0:
            return  # Jika tidak ada susu yang digunakan, keluar dari fungsi

        # Ambil stok susu dari yang paling lama (FIFO)
        raw_milk_entries = RawMilk.objects.filter(status="fresh").order_by("production_time")

        total_available = sum(entry.available_stocks for entry in raw_milk_entries)
        if self.total_milk_used > total_available:
            raise ValidationError("Stok susu mentah tidak mencukupi untuk produksi!")

        remaining_milk_needed = self.total_milk_used

        with transaction.atomic():
            for entry in raw_milk_entries:
                if remaining_milk_needed <= 0:
                    break

                if entry.available_stocks <= remaining_milk_needed:
                    remaining_milk_needed -= entry.available_stocks
                    entry.available_stocks = 0
                    entry.status = "used"
                else:
                    entry.available_stocks -= remaining_milk_needed
                    remaining_milk_needed = 0

                entry.save()

    # def save(self, *args, **kwargs):
    #     """ Periksa apakah produk sudah expired saat disimpan """
    #     if self.expiry_at < timezone.now():
    #         self.status = "expired"
    #         # raise ValidationError("Tanggal kedaluwarsa tidak boleh lebih kecil dari waktu sekarang.")
    #         # self.quantity = 0  # Set stok menjadi 0 jika expired
    #         # StockHistory.objects.create(
    #         #     product_stock=self,
    #         #     change_type="expired",
    #         #     quantity_change=self.quantity
    #         # )

    #     super().save(*args, **kwargs)
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        previous = None

        if not is_new:
            try:
                previous = ProductStock.objects.get(pk=self.pk)
            except ProductStock.DoesNotExist: # pylint: disable=no-member
                pass

        super().save(*args, **kwargs)  # Simpan dulu untuk dapat ID jika belum ada

        if previous and previous.status != "contamination" and self.status == "contamination":
            # Hanya jika berubah menjadi contamination
            if self.quantity > 0:
                StockHistory.objects.create(
                    product_stock=self,
                    change_type="contamination",
                    quantity_change=self.quantity
                )
                self.quantity = 0
                super().save(update_fields=["quantity"])  # Update hanya quantity


    @classmethod
    def check_expired_products(cls):
        """ Otomatis set produk expired jika sudah melewati tanggal kadaluarsa """
        expired_products = cls.objects.filter(expiry_at__lt=timezone.now(), status="available")
        
        with transaction.atomic():
            for product in expired_products:
                product.status = "expired"
                StockHistory.objects.create(
                    product_stock=product,
                    change_type="expired",
                    quantity_change=product.quantity
                )
                # product.quantity = 0  # Set stok menjadi 0
                product.save()

    @classmethod
    def sell_product(cls, product_type, quantity):
        """ Jual produk berdasarkan FIFO jika tersedia """
        available_stocks = cls.objects.filter(
            product_type=product_type, 
            status="available", 
            quantity__gt=0
        ).order_by("production_at")

        remaining = quantity
        stock_usage = []  # Untuk tracking penggunaan stock

        with transaction.atomic():
            for stock in available_stocks:
                if remaining <= 0:
                    break

                sold_quantity = min(stock.quantity, remaining)
                remaining -= sold_quantity
                stock.quantity -= sold_quantity

                if stock.quantity == 0:
                    stock.status = "sold_out"

                # Hitung total harga transaksi
                total_price = sold_quantity * stock.product_type.price

                # Simpan history penjualan
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

    objects = models.Manager()
    product_stock = models.ForeignKey(ProductStock, on_delete=models.CASCADE)
    change_type = models.CharField(max_length=20, choices=[("sold", "Sold"), ("expired", "Expired"), ("contamination", "Contamination")])  # 'Added' atau 'Removed'
    quantity_change = models.IntegerField()
    change_date = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, editable=False, default=0.0)

    def __str__(self):
        return f"{self.change_type} {self.quantity_change}"
