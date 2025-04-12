from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import HealthCheck, DiseaseHistory, Symptom

# 🔥 Signal: Deteksi abnormal otomatis saat pemeriksaan dibuat/diubah
@receiver(pre_save, sender=HealthCheck)
def check_health_status(sender, instance, **kwargs):
    abnormal = False

    if instance.rectal_temperature < 38.0 or instance.rectal_temperature > 39.3:
        abnormal = True
    if instance.heart_rate < 60 or instance.heart_rate > 80:
        abnormal = True
    if instance.respiration_rate < 10 or instance.respiration_rate > 30:
        abnormal = True
    if instance.rumination < 6.0 or instance.rumination > 10.0:
        abnormal = True

    instance.needs_attention = abnormal

# 🔥 Signal: Update status jadi "handled" jika riwayat penyakit ditangani
@receiver(post_save, sender=DiseaseHistory)
def update_healthcheck_status(sender, instance, **kwargs):
    if instance.treatment_done:
        health_check = instance.health_check
        if health_check.status != 'handled':
            health_check.status = 'handled'
            health_check.save()

# 🔥 Signal: Tandai follow-up selesai saat symptom dibuat
@receiver(post_save, sender=Symptom)
def mark_followup(sender, instance, **kwargs):
    health_check = instance.health_check
    if not health_check.is_followed_up:
        health_check.is_followed_up = True
        health_check.save()
