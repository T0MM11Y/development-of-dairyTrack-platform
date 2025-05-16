from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import HealthCheck, DiseaseHistory, Symptom
from .models import Notification
from .models import Reproduction
from django.utils.timezone import now
from datetime import timedelta
from threading import Timer  # Untuk delay simple tanpa celery
# 🔥 Signal: Cek kondisi HealthCheck setelah disimpan
@receiver(post_save, sender=HealthCheck)
def check_and_update_health_status(sender, instance, created, **kwargs):
    # 🚀 Kalau HealthCheck sudah ada DiseaseHistory, kunci status jadi handled
    if hasattr(instance, 'disease_history'):
        if instance.status != 'handled':
            HealthCheck.objects.filter(id=instance.id).update(status='handled')
        return  # ⛔ Tidak cek kondisi lagi

    # 🚀 Kalau belum ada DiseaseHistory, cek normal / abnormal
    abnormal = False
    messages = []

    rectal_temp = float(instance.rectal_temperature)
    heart_rate = int(instance.heart_rate)
    respiration_rate = int(instance.respiration_rate)
    rumination = float(instance.rumination)

    if rectal_temp < 38.0 or rectal_temp > 39.3:
        abnormal = True
        messages.append("Suhu tubuh abnormal.")

    if heart_rate < 60 or heart_rate > 80:
        abnormal = True
        messages.append("Detak jantung tidak normal.")

    if respiration_rate < 20 or respiration_rate > 40:
        abnormal = True
        messages.append("Laju pernapasan tidak normal.")

    if rumination < 1.0 or rumination > 3.0:
        abnormal = True
        messages.append("Rumenasi berada di luar batas normal.")

    new_status = 'healthy' if not abnormal else 'pending'
    new_needs_attention = abnormal

    if instance.status != new_status or instance.needs_attention != new_needs_attention:
        HealthCheck.objects.filter(id=instance.id).update(
            status=new_status,
            needs_attention=new_needs_attention
        )

    # 🔥 Hanya buat notifikasi kalau saat create dan abnormal
    if abnormal and created:
        Notification.objects.create(
            cow=instance.cow,
            message="⚠️ Pemeriksaan kesehatan mendeteksi: " + " ".join(messages),
            date=now().date()
        )


    if abnormal and created:
        Notification.objects.create(
            cow=instance.cow,
            message="⚠️ Pemeriksaan kesehatan mendeteksi: " + " ".join(messages),
            date=now().date()
        )



# 🔥 Signal: Follow-up reminder jika pemeriksaan belum ditangani 1 hari
@receiver(post_save, sender=HealthCheck)
def schedule_followup_check(sender, instance, created, **kwargs):
    if created:
        # Delay 24 jam (86400 detik)
        def check_status_later():
            refreshed = HealthCheck.objects.filter(id=instance.id).first()
            if refreshed and refreshed.status != 'handled':
                Notification.objects.create(
                    cow=refreshed.cow,
                    message="🚨 Segera periksa kesehatan sapi! Pemeriksaan belum ditangani lebih dari 1 hari.",
                    date=now().date()
                )

        Timer(86400, check_status_later).start()
# 🔥 Signal: Update status jadi "handled" jika riwayat penyakit ditangani
@receiver(post_save, sender=DiseaseHistory)
def update_healthcheck_status(sender, instance, created, **kwargs):
    if created and instance.health_check:
        health_check = instance.health_check
        print("🚀 SIGNAL TRIGGERED")
        print("HealthCheck ID:", health_check.id)
        print("Current Status:", health_check.status)

        if health_check.status == 'pending':
            print("✅ Status is pending. Updating to handled...")
            health_check.status = 'handled'
            health_check.save(update_fields=['status'])
            print("✅ Status updated to handled!")
        else:
            print("⚠️ Status is not pending, no update.")



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