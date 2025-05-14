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
    

class User(models.Model):

    class Meta:
        db_table = "users"
        managed = False

    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    contact = models.CharField(max_length=15, null=True, blank=True)
    religion = models.CharField(max_length=50, null=True, blank=True)
    role_id = models.IntegerField()  # Tidak pakai ForeignKey
    token = models.CharField(max_length=255, null=True, blank=True)
    token_created_at = models.DateTimeField(null=True, blank=True)
    name = models.CharField(max_length=100)
    birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.username}"

