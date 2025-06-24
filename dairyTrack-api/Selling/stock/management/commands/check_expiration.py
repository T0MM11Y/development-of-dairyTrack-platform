# stock/management/commands/check_expiration.py
from django.core.management.base import BaseCommand
from stock.tasks import check_product_expiration
import logging

logger = logging.getLogger('stock')

class Command(BaseCommand):
    help = 'Check for expired products and send notifications'

    def handle(self, *args, **options):
        logger.info("Running check_expiration command")
        try:
            check_product_expiration()
            
            self.stdout.write(self.style.SUCCESS('Successfully checked product expirations'))  # pylint: disable=pointless-statement
        except Exception as e:
            logger.error("Error in check_expiration command: %s", str(e), exc_info=True)
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))  # pylint: disable=pointless-statement