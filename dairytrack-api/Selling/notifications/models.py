from django.db import models
from sales.models import Order
from stock.models import ProductStock

class Notification(models.Model):

    class Meta:
        db_table = "notifications"
    # Hanya pakai IntegerField untuk cow_id
    objects = models.Manager()
    cow_id = models.IntegerField(null=True, blank=True)  # Tanpa relasi
    date = models.DateField()
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    feed_stock_id = models.IntegerField(null=True, blank=True)


    
    # Tambahan yang baru
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    product_stock = models.ForeignKey(ProductStock, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.message}"
