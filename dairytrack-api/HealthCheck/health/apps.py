from django.apps import AppConfig


class HealthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'health'
    def ready(self):
        import health.signals  # ⬅️ penting agar signal aktif