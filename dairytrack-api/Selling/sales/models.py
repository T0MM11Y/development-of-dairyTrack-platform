import uuid
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db import models
from stock.models import ProductStock, ProductType
from finance.models import Income


# Create your models here.
class Order(models.Model):
    
    class Meta:
        db_table = "order"
    
    STATUS_CHOICES = [
        ('Requested', 'Requested'),  # Status default ketika order dibuat
        ('Processed', 'Processed'),  # Setelah produk dicek dan biaya pengiriman ditambahkan
        ('Completed', 'Completed'),  # Setelah pembayaran dipilih
        ('Cancelled', 'Cancelled'),  # Jika dibatalkan
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('', 'Select Payment Method'),  # Default kosong, tidak boleh langsung completed
        ('Cash', 'Cash'),
        ('Credit Card', 'Credit Card'),
        ('Bank Transfer', 'Bank Transfer'),
    ]

    objects = models.Manager()
    order_no = models.CharField(max_length=20, unique=True, editable=False)
    customer_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Requested')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def save(self, *args, **kwargs):

        if not self.order_no:
            self.order_no = f"ORD{uuid.uuid4().hex[:6].upper()}"  # ID unik No Orderan

        if self.pk is not None:
            previous_status = Order.objects.get(pk=self.pk).status
        else:
            previous_status = None  # Order baru

        # ✅ Pastikan metode pembayaran harus dipilih sebelum menyelesaikan order
        if previous_status != "Completed" and self.status == "Completed":
            if not self.payment_method:
                raise ValidationError("Metode pembayaran harus dipilih sebelum menyelesaikan order.")

        super().save(*args, **kwargs)

        # ✅ Proses completion hanya jika status berubah menjadi "Completed"
        if previous_status != "Completed" and self.status == "Completed":
            self.process_completion()

    def update_total_price(self):
        """ Hitung total harga berdasarkan OrderItem """
        total = sum(item.total_price for item in self.order_items.all()) # pylint: disable=no-member
        self.total_price = total + self.shipping_cost
        super().save(update_fields=['total_price'])

    def process_completion(self):
        """ Buat transaksi penjualan dan perbarui stok saat pesanan selesai """
        with transaction.atomic():
            for item in self.order_items.all(): # pylint: disable=no-member
                # Gunakan method sell_product dari ProductStock
                ProductStock.sell_product(item.product_type, item.quantity)

                # Buat transaksi penjualan
                SalesTransaction.objects.create(
                    order=self,
                    quantity=item.quantity,
                    total_price=item.total_price,
                    payment_method=self.payment_method
                )

    def __str__(self):
        return f"Order {self.order_no} - {self.customer_name}"


class OrderItem(models.Model):
    
    class Meta:
        db_table = "order_item"

    objects = models.Manager()
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_items")
    product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, editable=False)


    def save(self, *args, **kwargs):
        """ Hitung total harga sebelum menyimpan """
        self.price_per_unit = self.product_type.price   # pylint: disable=no-member
        self.total_price = self.quantity * self.price_per_unit
        super().save(*args, **kwargs)

        # Setelah menyimpan OrderItem, update total_price Order
        self.order.update_total_price() # pylint: disable=no-member


    def __str__(self):
        return f"{self.quantity} x {self.product_type} in {self.order.order_no}" # pylint: disable=no-member

class SalesTransaction(models.Model):
    
    class Meta:
        db_table = "sales_transaction"

    objects = models.Manager()
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    transaction_date = models.DateTimeField(auto_now_add=True)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=Order.PAYMENT_METHOD_CHOICES, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Jika transaksi belum ada di income, tambahkan otomatis
        if not Income.objects.filter(description=f"Sales Transaction {self.pk}").exists(): # pylint: disable=no-member
            Income.objects.create(
                income_type="sales",
                amount=self.total_price,
                description=f"Sales Transaction {self.pk}"
            )

    def __str__(self):
        return f"Transaction {self.pk} - Order {self.order.order_no} - {self.payment_method}" # pylint: disable=no-member