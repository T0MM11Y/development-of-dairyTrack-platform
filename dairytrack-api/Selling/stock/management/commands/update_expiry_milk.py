from django.core.management.base import BaseCommand
from django.utils import timezone
from stock.models import RawMilk

class Command(BaseCommand):
    help = 'Update status susu mentah yang sudah melewati waktu kadaluarsa'

    def handle(self, *args, **options):
        now = timezone.now()
        
        # Cari semua susu mentah yang fresh tapi sudah melewati expiration_time
        expired_milk = RawMilk.objects.filter(
            status='fresh',
            expiration_time__lt=now
        )
        
        # Update status menjadi expired
        count = expired_milk.update(status='expired')
        
        self.stdout.write(
            self.style.SUCCESS(f'Berhasil mengupdate {count} susu mentah menjadi expired') # pylint: disable=no-member
        )
# python manage.py update_expiry_milk