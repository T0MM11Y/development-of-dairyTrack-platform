from django.core.management.commands.runserver import Command as RunserverCommand
from stock.utils import run_background_tasks
import threading
import logging

logger = logging.getLogger('stock')

class Command(RunserverCommand):
    def handle(self, *args, **options):
        logger.info("Starting background task thread")
        task_thread = threading.Thread(target=run_background_tasks, daemon=True)
        task_thread.start()
        logger.info("Background task thread started")
        super().handle(*args, **options)