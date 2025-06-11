from django.db import models
from sales.models import Order
from stock.models import ProductStock

class Notification(models.Model):
    class Meta:
        db_table = "notifications"
        managed = False

    objects = models.Manager()
    user_id = models.IntegerField(null=True, blank=True)
    cow_id = models.IntegerField(null=True, blank=True)
    # feed_stock_id = models.IntegerField(null=True, blank=True)
    message = models.TextField()
    type = models.CharField(max_length=30, default='FEED_STOCK')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_at_wib = models.DateTimeField(null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    product_stock = models.ForeignKey(ProductStock, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')

    def __str__(self):
        return f"{self.message}"