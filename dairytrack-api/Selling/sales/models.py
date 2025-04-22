import uuid
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db import models
from stock.models import ProductStock, ProductType
from finance.models import Income
from .utils.whatsapp import send_gupshup_whatsapp_message
import logging

logger = logging.getLogger(__name__)

class Order(models.Model):
    class Meta:
        db_table = "order"
    
    STATUS_CHOICES = [
        ('Requested', 'Requested'),
        ('Processed', 'Processed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('', 'Select Payment Method'),
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
    notes = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.order_no:
            self.order_no = f"ORD{uuid.uuid4().hex[:6].upper()}"

        if self.pk is not None:
            previous_order = Order.objects.get(pk=self.pk)
            previous_status = previous_order.status
            previous_shipping_cost = previous_order.shipping_cost
            
            if previous_shipping_cost != self.shipping_cost and self.status == 'Requested':
                self.status = 'Processed'
        else:
            previous_status = None

        if self.pk is not None and previous_status != "Completed" and self.status == "Completed":
            if not self.payment_method:
                raise ValidationError("Metode pembayaran harus dipilih sebelum menyelesaikan order.")

        super().save(*args, **kwargs)
        
        if self.pk is not None:
            self.update_total_price()

        if self.pk is not None and previous_status != "Completed" and self.status == "Completed":
            self.process_completion()

    def update_total_price(self):
        total = sum(item.total_price for item in self.order_items.all())
        self.total_price = total + self.shipping_cost
        super().save(update_fields=['total_price'])

    def send_order_details_to_whatsapp(self):
        # Pastikan order_items tidak kosong
        if not self.order_items.exists():
            logger.error(f"No order items found for order {self.order_no}")
            return

        # Buat detail item untuk pesan
        items_details = "\n".join(
            f"- {item.quantity} x {item.product_type.product_name} (Rp {item.total_price})"
            for item in self.order_items.all()
        )
        message = (
            f"Order Baru: {self.order_no}\n"
            f"Nama: {self.customer_name}\n"
            f"Lokasi: {self.location}\n"
            f"Item:\n{items_details}\n"
            f"Biaya Pengiriman: Rp {self.shipping_cost}\n"
            f"Total Harga: Rp {self.total_price}\n"
            f"Status: {self.status}\n"
            f"Terima kasih atas pesanan Anda!"
        )
        logger.debug(f"Sending WhatsApp message to {self.phone_number}: {message}")
        send_gupshup_whatsapp_message(self.phone_number, message)

    def process_completion(self):
        with transaction.atomic():
            total_quantity = 0
            for item in self.order_items.all():
                ProductStock.sell_product(item.product_type, item.quantity)
                total_quantity += item.quantity
            
            SalesTransaction.objects.create(
                order=self,
                quantity=total_quantity,
                total_price=self.total_price,
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
        if not hasattr(self.product_type, 'price') or self.product_type.price is None:
            logger.error(f"ProductType {self.product_type} has no price or price is None")
            raise ValidationError(f"Harga untuk {self.product_type.product_name} tidak tersedia.")
        
        self.price_per_unit = self.product_type.price
        self.total_price = self.quantity * self.price_per_unit
        logger.debug(f"OrderItem saved: {self.quantity} x {self.product_type.product_name}, total_price={self.total_price}")
        super().save(*args, **kwargs)

        self.order.update_total_price()

    def __str__(self):
        return f"{self.quantity} x {self.product_type} in {self.order.order_no}"

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

        if not Income.objects.filter(description=f"Sales Transaction {self.pk}").exists():
            Income.objects.create(
                income_type="sales",
                amount=self.total_price,
                description=f"Sales Transaction {self.pk}"
            )

    def __str__(self):
        return f"Transaction {self.pk} - Order {self.order.order_no} - {self.payment_method}" # pylint: disable=no-member
