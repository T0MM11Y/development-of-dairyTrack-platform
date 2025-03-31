from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta
from .models import HealthCheck, Symptom, Notification

# ✅ Notifikasi otomatis jika suhu sapi tidak normal
@receiver(post_save, sender=HealthCheck)
def create_health_notification(sender, instance, created, **kwargs):
    if instance.rectal_temperature > 39.0:
        message = f"Sapi {instance.cow.name} memiliki suhu tinggi ({instance.rectal_temperature}°C). Segera periksa kesehatannya!"
        Notification.objects.create(cow=instance.cow, message=message)

    elif instance.rectal_temperature < 38.0:
        message = f"Sapi {instance.cow.name} memiliki suhu rendah ({instance.rectal_temperature}°C). Segera cek kondisinya!"
        Notification.objects.create(cow=instance.cow, message=message)

# ✅ Notifikasi otomatis jika gejala menunjukkan kondisi serius
@receiver(post_save, sender=Symptom)
def create_symptom_notification(sender, instance, created, **kwargs):
    warning_signs = []

    # 📌 Mata
    if instance.eye_condition in ["Mata merah", "Mata tidak cemerlang dan atau tidak bersih", "Terdapat kotoran atau lendir pada mata"]:
        warning_signs.append(f"Kondisi mata: {instance.eye_condition}")

    # 📌 Mulut
    if instance.mouth_condition in ["Mulut berbusa", "Mulut mengeluarkan lendir", "Mulut terdapat kotoran (terutama di sudut mulut)", "Warna bibir pucat", "Mulut berbau tidak enak", "Terdapat luka di mulut"]:
        warning_signs.append(f"Kondisi mulut: {instance.mouth_condition}")

    # 📌 Hidung
    if instance.nose_condition in ["Hidung mengeluarkan ingus", "Hidung mengeluarkan darah", "Di sekitar lubang hidung terdapat kotoran"]:
        warning_signs.append(f"Kondisi hidung: {instance.nose_condition}")

    # 📌 Anus
    if instance.anus_condition in ["Kotoran terlalu keras", "Mencret", "Kotoran terdapat bercak darah"]:
        warning_signs.append(f"Kondisi anus: {instance.anus_condition}")

    # 📌 Kaki
    if instance.leg_condition in ["Kaki bengkak", "Kaki terdapat luka", "Luka pada kuku kaki"]:
        warning_signs.append(f"Kondisi kaki: {instance.leg_condition}")

    # 📌 Kulit
    if instance.skin_condition in ["Kulit tidak bersih", "Terdapat benjolan atau bentol-bentol", "Terdapat luka pada kulit", "Terdapat banyak kutu"]:
        warning_signs.append(f"Kondisi kulit: {instance.skin_condition}")

    # 📌 Perilaku
    if instance.behavior in ["Nafsu makan berkurang", "Memisahkan diri dari kawanannya", "Seringkali dalam posisi duduk/tidur"]:
        warning_signs.append(f"Perilaku tidak normal: {instance.behavior}")

    # 📌 Bobot badan
    if instance.weight_condition in ["Terjadi penurunan bobot dibandingkan sebelumnya", "Terlihat tulang karena ADG semakin menurun"]:
        warning_signs.append(f"Kondisi berat badan: {instance.weight_condition}")

    # 📌 Kelamin
    if instance.reproductive_condition in ["Kelamin sulit mengeluarkan urine", "Kelamin berlendir", "Kelamin berdarah"]:
        warning_signs.append(f"Kondisi kelamin: {instance.reproductive_condition}")

    # Jika ada gejala serius, buat notifikasi
    if warning_signs:
        message = f"Sapi {instance.health_check.cow.name} menunjukkan gejala serius:\n- " + "\n- ".join(warning_signs)
        Notification.objects.create(cow=instance.health_check.cow, message=message)

# ✅ Notifikasi jika sapi belum ditangani dalam 5 jam
def check_pending_treatment():
    five_hours_ago = now() - timedelta(hours=5)
    untreated_checks = HealthCheck.objects.filter(treatment_status="Not Treated", checkup_date__lte=five_hours_ago)

    for check in untreated_checks:
        message = f"Sapi {check.cow.name} belum ditangani setelah 5 jam sejak pemeriksaan. Segera lakukan tindakan!"
        Notification.objects.create(cow=check.cow, message=message)
