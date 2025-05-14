# utils/whatsapp.py (Alternatif)
import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
import logging
import urllib.parse

logger = logging.getLogger(__name__)

def send_gupshup_whatsapp_message(to_number, message):
    url = "https://api.gupshup.io/wa/api/v1/msg"
    headers = {
        "apikey": settings.GUPSHUP_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache"
    }
    # Hapus tanda "+" dari nomor telepon
    source_number = settings.GUPSHUP_SOURCE_NUMBER.lstrip('+')
    destination_number = to_number.lstrip('+')
    
    # Kirim pesan sebagai teks langsung (tanpa JSON payload)
    payload = {
        "channel": "whatsapp",
        "source": source_number,  # Misalnya: 917834811114
        "destination": destination_number,  # Misalnya: 6285264351660
        "message": message,
        "src.name": "DairyTrack"
    }
    try:
        logger.debug(f"Sending WhatsApp message to {destination_number}: {message}")
        response = requests.post(url, data=payload, headers=headers)
        logger.debug(f"Gupshup payload: {payload}")
        response.raise_for_status()
        logger.info(f"Gupshup response: {response.json()}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Gupshup response: {response.text}, Error: {str(e)}")
        raise ImproperlyConfigured(f"Error sending WhatsApp message: {str(e)}")