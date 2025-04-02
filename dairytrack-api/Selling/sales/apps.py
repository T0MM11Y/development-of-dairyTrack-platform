from django.apps import AppConfig


class SalesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sales'

    # def ready(self):
    #     import sales.signals  # Ganti `your_app` dengan nama aplikasimu
