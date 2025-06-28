from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta
from threading import Timer

from .models import (
    HealthCheck,
    DiseaseHistory,
    Symptom,
    Notification,
    Reproduction,
)




# 🔥 HealthCheck: Evaluasi dan Buat Notifikasi jika abnormal
@receiver(post_save, sender=HealthCheck)
def check_and_update_health_status(sender, instance, created, **kwargs):
    if instance.disease_histories.exists():
        if instance.status != 'handled':
            HealthCheck.objects.filter(id=instance.id).update(status='handled')
        return

    abnormal = False
    messages = []

    rectal_temp = float(instance.rectal_temperature)
    heart_rate = int(instance.heart_rate)
    respiration_rate = int(instance.respiration_rate)
    rumination = float(instance.rumination)

    if rectal_temp < 38.0 or rectal_temp > 39.3:
        abnormal = True
        messages.append("Abnormal body temperature.")

    if heart_rate < 60 or heart_rate > 80:
        abnormal = True
        messages.append("Abnormal heartbeat.")

    if respiration_rate < 20 or respiration_rate > 40:
        abnormal = True
        messages.append("Abnormal breathing rate.")

    if rumination < 1.0 or rumination > 3.0:
        abnormal = True
        messages.append("Rumenation is outside normal limits.")

    new_status = 'healthy' if not abnormal else 'pending'
    new_needs_attention = abnormal

    if instance.status != new_status or instance.needs_attention != new_needs_attention:
        HealthCheck.objects.filter(id=instance.id).update(
            status=new_status,
            needs_attention=new_needs_attention
        )

    # ✅ Buat notifikasi saat abnormal, baik create maupun update
    if abnormal:
        user = instance.checked_by if created else instance.edited_by
        if user:
            Notification.objects.create(
                cow=instance.cow,
                user=user,
message = f"Cow health check for {instance.cow.name} detected: " + " ".join(messages),
                type="health_check",
                created_at=now()
            )

# ⏰ Interval dalam detik (30 menit)
REMINDER_INTERVAL = 30 * 60  # 1800 detik

def send_followup_reminder(health_check_id, attempt=1, max_attempts=10):
    refreshed = HealthCheck.objects.filter(id=health_check_id).first()
    if not refreshed or refreshed.status == 'handled' or attempt > max_attempts:
        return  # Stop jika sudah ditangani atau melebihi jumlah percobaan

    user = refreshed.checked_by or getattr(refreshed, 'created_by', None)
    if user:
        Notification.objects.create(
            cow=refreshed.cow,
            user=user,
            message=f"[#{attempt}] Please check the health of cow {refreshed.cow.name}immediately! The examination has not been handled yet.",
            type="follow_up",
            created_at=now()
        )

    # Jadwalkan ulang pengingat setelah interval
    Timer(REMINDER_INTERVAL, send_followup_reminder, args=(health_check_id, attempt + 1)).start()

@receiver(post_save, sender=HealthCheck)
def schedule_followup_check(sender, instance, created, **kwargs):
    if created:
        Timer(REMINDER_INTERVAL, send_followup_reminder, args=(instance.id,)).start()



# 🔥 Update status HealthCheck ke handled saat DiseaseHistory dibuat
@receiver(post_save, sender=DiseaseHistory)
def update_healthcheck_status(sender, instance, created, **kwargs):
    if created and instance.health_check:
        health_check = instance.health_check
        if health_check.status == 'pending':
            health_check.status = 'handled'
            health_check.save(update_fields=['status'])


# 🔥 Tandai follow-up saat symptom dicatat
@receiver(post_save, sender=Symptom)
def mark_followup(sender, instance, **kwargs):
    health_check = instance.health_check
    if not health_check.is_followed_up:
        health_check.is_followed_up = True
        health_check.save()


# 🔥 Cek alert saat Reproduction dibuat
@receiver(post_save, sender=Reproduction)
def check_reproduction_alert(sender, instance, created, **kwargs):
    alerts = instance.is_alert_needed()
    user = instance.created_by if created else instance.edited_by  # Ambil user pembuat atau pengedit

    if alerts and user:
        for alert_msg in alerts:
            Notification.objects.create(
                cow=instance.cow,
                user=user,
message=f"Reproduksi sapi {instance.cow.name}: {alert_msg}",
                type="reproduction",
                created_at=now()
            )
