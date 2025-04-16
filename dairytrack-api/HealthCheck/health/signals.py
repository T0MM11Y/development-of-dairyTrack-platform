from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import HealthCheck, DiseaseHistory, Symptom
from .models import Notification
from .models import Reproduction
from django.utils.timezone import now

# 🔥 Signal: Deteksi abnormal otomatis saat pemeriksaan dibuat/diubah
@receiver(pre_save, sender=HealthCheck)
def check_health_status(sender, instance, **kwargs):
    abnormal = False
    messages = []


    if instance.rectal_temperature < 38.0 or instance.rectal_temperature > 39.3:
        abnormal = True
        messages.append("Suhu tubuh abnormal.")

    if instance.heart_rate < 60 or instance.heart_rate > 80:
        abnormal = True
        messages.append("Detak jantung tidak normal.")

    if instance.respiration_rate < 20 or instance.respiration_rate > 40:
        abnormal = True
        messages.append("Laju pernapasan tidak normal.")

    if instance.rumination < 1.0 or instance.rumination > 3.0:
        abnormal = True
        messages.append("Rumenasi berada di luar batas normal.")

    instance.needs_attention = abnormal
    # ✅ Tambah notifikasi jika abnormal dan instance baru (bukan update)
    if abnormal and instance.pk is None:
        Notification.objects.create(
            cow=instance.cow,
            message="⚠️ Pemeriksaan kesehatan mendeteksi: " + " ".join(messages),
            date=now().date()
        )

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

@receiver(post_save, sender=Reproduction)
def check_reproduction_alert(sender, instance, created, **kwargs):
    if created:
        alerts = instance.is_alert_needed()
        for alert_msg in alerts:
            Notification.objects.create(
                cow=instance.cow,
                message=f"⚠️ Reproduksi: {alert_msg}",
                date=now().date()
            )