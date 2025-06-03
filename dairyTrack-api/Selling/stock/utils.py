# stock/utils.py
from django.core import management

def run_background_tasks():
    """Menjalankan process_tasks dalam thread terpisah."""
    management.call_command('process_tasks')