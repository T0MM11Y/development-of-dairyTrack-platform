from django.apps import AppConfig


class StockConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stock'
    def ready(self):
        from stock.tasks import check_product_expiration
        check_product_expiration(repeat=60)  # Jalankan setiap 60 detik
