import uuid
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db import models
from django.db.models import Sum
from stock.models import ProductStock, ProductType
from finance.models import Income, IncomeType
from .utils.whatsapp import send_gupshup_whatsapp_message
import logging

logger = logging.getLogger(__name__)

class Order(models.Model):
    class Meta:
        db_table = "order"
        managed = False
    
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

        # Simpan status dan shipping_cost sebelumnya
        if self.pk is not None:
            previous_order = Order.objects.get(pk=self.pk)
            previous_status = previous_order.status
            previous_shipping_cost = previous_order.shipping_cost
        else:
            previous_status = None
            previous_shipping_cost = None

        # Jika status tidak diubah melalui JSON dan shipping_cost berubah, ubah status ke Processed
        status_from_json = 'status' in self.__dict__ and self.__dict__['status'] != previous_status
        if not status_from_json and self.pk is not None and previous_shipping_cost != self.shipping_cost and self.status == 'Requested':
            self.status = 'Processed'

        # Validasi metode pembayaran dan stok saat status menjadi Completed
        if self.pk is not None and previous_status != "Completed" and self.status == "Completed":
            if not self.payment_method:
                raise ValidationError("Metode pembayaran harus dipilih sebelum menyelesaikan order.")
            for item in self.order_items.all(): # pylint: disable=no-member
                total_stock = ProductStock.objects.filter(product_type=item.product_type).aggregate(total=Sum('quantity'))['total'] or 0
                if item.quantity > total_stock:
                    raise ValidationError(f"Stok untuk {item.product_type.product_name} tidak mencukupi!")

        # Simpan perubahan ke database
        super().save(*args, **kwargs)

        # Update total_price setelah simpan
        if self.pk is not None:
            self.update_total_price()

        # Kirim pesan WhatsApp berdasarkan perubahan status
        if self.pk is not None and self.phone_number:
            if previous_status != "Processed" and self.status == "Processed":
                try:
                    self.send_processed_whatsapp_message()
                except Exception as e:
                    logger.error(f"Failed to send Processed WhatsApp message for order {self.order_no}: {str(e)}")
            elif previous_status != "Completed" and self.status == "Completed":
                try:
                    self.send_completed_whatsapp_message()
                except Exception as e:
                    logger.error(f"Failed to send Completed WhatsApp message for order {self.order_no}: {str(e)}")

        # Proses penyelesaian pesanan jika status Completed
        if self.pk is not None and previous_status != "Completed" and self.status == "Completed":
            self.process_completion()

    def update_total_price(self):
        total = sum(item.total_price for item in self.order_items.all()) # pylint: disable=no-member
        self.total_price = total + self.shipping_cost
        super().save(update_fields=['total_price'])

    def send_order_details_to_whatsapp(self):
        if not self.order_items.exists(): # pylint: disable=no-member
            logger.error(f"No order items found for order {self.order_no}")
            return

        items_details = "\n".join(
            f"- {item.quantity} x {item.product_type.product_name} (Rp {item.total_price:,})"
            for item in self.order_items.all() # pylint: disable=no-member
        )
        message = (
            f"🌟 Selamat datang di DairyTrack! 🌟\n\n"
            f"Terima kasih atas pesanan Anda. Berikut adalah detail pesanan Anda:\n\n"
            f"📋 Nomor Pesanan: {self.order_no}\n"
            f"👤 Nama: {self.customer_name}\n"
            f"📍 Lokasi: {self.location}\n"
            f"🧀 Item Pesanan:\n{items_details}\n"
            f"🚚 Biaya Pengiriman: Rp {self.shipping_cost:,}\n"
            f"💵 Total Harga: Rp {self.total_price:,}\n"
            f"📊 Status: {self.status}\n\n"
            f"⏳ Mohon menunggu konfirmasi dari admin kami untuk melanjutkan proses berikutnya dan menetapkan biaya pengiriman.\n\n"
            f"😊 Senang berbelanja bersama kami! Terima kasih atas kepercayaan Anda kepada DairyTrack.\n"
        )
        logger.debug(f"Sending WhatsApp message to {self.phone_number}: {message}")
        send_gupshup_whatsapp_message(self.phone_number, message)

    def send_processed_whatsapp_message(self):
        if not self.order_items.exists(): # pylint: disable=no-member
            logger.error(f"No order items found for order {self.order_no}")
            return

        items_details = "\n".join(
            f"- {item.quantity} x {item.product_type.product_name} (Rp {item.total_price:,})"
            for item in self.order_items.all() # pylint: disable=no-member
        )
        message = (
            f"🌟 DairyTrack - Pesanan Anda Sedang Diproses! 🌟\n\n"
            f"Berikut adalah pembaruan untuk pesanan Anda:\n\n"
            f"📋 Nomor Pesanan: {self.order_no}\n"
            f"👤 Nama: {self.customer_name}\n"
            f"📍 Lokasi: {self.location}\n"
            f"🧀 Item Pesanan:\n{items_details}\n"
            f"🚚 Biaya Pengiriman: Rp {self.shipping_cost:,}\n"
            f"💵 Total Harga: Rp {self.total_price:,}\n"
            f"📊 Status: Sedang Diproses\n\n"
            f"⏳ Admin kami akan segera menghubungi Anda untuk menetapkan metode pembayaran dan melanjutkan proses pengiriman.\n\n"
            f"😊 Terima kasih atas kepercayaan Anda kepada DairyTrack!\n"
        )
        logger.debug(f"Sending Processed WhatsApp message to {self.phone_number}: {message}")
        send_gupshup_whatsapp_message(self.phone_number, message)

    def send_completed_whatsapp_message(self):
        if not self.order_items.exists(): # pylint: disable=no-member
            logger.error(f"No order items found for order {self.order_no}")
            return

        items_details = "\n".join(
            f"- {item.quantity} x {item.product_type.product_name} (Rp {item.total_price:,})"
            for item in self.order_items.all() # pylint: disable=no-member
        )
        message = (
            f"🌟 DairyTrack - Pesanan Anda Selesai! 🌟\n\n"
            f"Kami dengan senang hati menginformasikan bahwa pesanan Anda telah selesai:\n\n"
            f"📋 Nomor Pesanan: {self.order_no}\n"
            f"👤 Nama: {self.customer_name}\n"
            f"📍 Lokasi: {self.location}\n"
            f"🧀 Item Pesanan:\n{items_details}\n"
            f"🚚 Biaya Pengiriman: Rp {self.shipping_cost:,}\n"
            f"💵 Total Harga: Rp {self.total_price:,}\n"
            f"💳 Metode Pembayaran: {self.payment_method}\n"
            f"📊 Status: Selesai\n\n"
            f"😊 Terima kasih telah berbelanja bersama DairyTrack! Kami berharap dapat melayani Anda kembali.\n"
        )
        logger.debug(f"Sending Completed WhatsApp message to {self.phone_number}: {message}")
        send_gupshup_whatsapp_message(self.phone_number, message)

    def process_completion(self):
        with transaction.atomic():
            total_quantity = 0
            for item in self.order_items.all(): # pylint: disable=no-member
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
        managed = False

    objects = models.Manager()
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_items")
    product_type = models.ForeignKey(ProductType, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        if not hasattr(self.product_type, 'price') or self.product_type.price is None: # pylint: disable=no-member
            logger.error(f"ProductType {self.product_type} has no price or price is None")
            raise ValidationError(f"Harga untuk {self.product_type.product_name} tidak tersedia.") # pylint: disable=no-member
        
        self.price_per_unit = self.product_type.price # pylint: disable=no-member
        self.total_price = self.quantity * self.price_per_unit
        logger.debug(f"OrderItem saved: {self.quantity} x {self.product_type.product_name}, total_price={self.total_price}") # pylint: disable=no-member
        super().save(*args, **kwargs)

        self.order.update_total_price() # pylint: disable=no-member

    def __str__(self):
        return f"{self.quantity} x {self.product_type} in {self.order.order_no}" # pylint: disable=no-member

class SalesTransaction(models.Model):
    class Meta:
        db_table = "sales_transaction"
        managed = False

    objects = models.Manager()
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions')
    transaction_date = models.DateTimeField(auto_now_add=True)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=Order.PAYMENT_METHOD_CHOICES, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Fetch the IncomeType instance for 'sales'
        try:
            income_type = IncomeType.objects.get(name='sales')
        except IncomeType.DoesNotExist: # pylint: disable=no-member
            logger.error("IncomeType 'sales' does not exist. Please seed the IncomeType table.")
            raise ValidationError("IncomeType 'sales' does not exist. Please ensure the IncomeType table is seeded.")

        if not Income.objects.filter(description=f"Sales Transaction {self.pk}").exists():
            Income.objects.create(
                income_type=income_type,  # Use the IncomeType instance
                amount=self.total_price,
                description=f"Sales Transaction {self.pk}",
            )

    def __str__(self):
        return f"Transaction {self.pk} - Order {self.order.order_no} - {self.payment_method}" # pylint: disable=no-member