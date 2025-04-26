from django.db import models
from django.utils.timezone import now

class Farmer(models.Model):
    email = models.CharField(max_length=100, unique=True)
    first_name = models.CharField(max_length=50, null=True, blank=True)
    last_name = models.CharField(max_length=50, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    contact = models.CharField(max_length=15, null=True, blank=True)
    religion = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    total_cattle = models.IntegerField(null=True, blank=True)
    join_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, null=True, blank=True)
    password = models.CharField(max_length=128)  # Sudah sesuai struktur
    role = models.CharField(max_length=250, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name or ''} {self.last_name or ''}"

    class Meta:
        db_table = "farmers"

class RawMilk(models.Model):
    cow = models.ForeignKey("Cow", on_delete=models.CASCADE)
    production_time = models.DateTimeField(auto_now_add=True)
    expiration_time = models.DateTimeField()
    volume_liters = models.DecimalField(max_digits=5, decimal_places=2)
    previous_volume = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, default="Fresh")

    def __str__(self):
        return f"Raw Milk from {self.cow.name} ({self.volume_liters}L)"

class ProcessedMilk(models.Model):
    raw_milk = models.ForeignKey(RawMilk, on_delete=models.CASCADE)
    processing_time = models.DateTimeField(auto_now_add=True)
    product_type = models.CharField(max_length=50)
    new_expiration_time = models.DateTimeField()
    volume_liters = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Processed {self.product_type} from Raw Milk {self.raw_milk.id}"
   
class Cow(models.Model):
    farmer = models.ForeignKey("Farmer", on_delete=models.CASCADE, related_name="cows")  # ✅ Tambahkan ini
    name = models.CharField(max_length=50)
    breed = models.CharField(max_length=50)
    birth_date = models.DateField()
    lactation_status = models.BooleanField(default=False)
    lactation_phase = models.CharField(max_length=20, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2)
    reproductive_status = models.CharField(max_length=20)
    gender = models.CharField(max_length=10)
    entry_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)  # Hapus default
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.breed}"
    class Meta:
        db_table = "cows"
class HealthCheck(models.Model):
    cow = models.ForeignKey("Cow", on_delete=models.CASCADE, related_name="health_checks")
    checkup_date = models.DateTimeField(default=now)

    rectal_temperature = models.DecimalField(max_digits=4, decimal_places=2)
    heart_rate = models.IntegerField()
    respiration_rate = models.IntegerField()
    rumination = models.DecimalField(max_digits=3, decimal_places=1)

    needs_attention = models.BooleanField(default=False)
    is_followed_up = models.BooleanField(default=False)

    STATUS_CHOICES = (
        ('pending', 'Belum Ditangani'),
        ('handled', 'Sudah Ditangani'),
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Check - {self.cow.name} ({self.checkup_date.strftime('%Y-%m-%d')})"

    
    class Meta:
        db_table = "health_check"

class Symptom(models.Model):
    health_check = models.OneToOneField("HealthCheck", on_delete=models.CASCADE, related_name="symptom")

    eye_condition = models.CharField(max_length=50, null=True, blank=True)
    mouth_condition = models.CharField(max_length=50, null=True, blank=True)
    nose_condition = models.CharField(max_length=50, null=True, blank=True)
    anus_condition = models.CharField(max_length=50, null=True, blank=True)
    leg_condition = models.CharField(max_length=50, null=True, blank=True)
    skin_condition = models.CharField(max_length=50, null=True, blank=True)
    behavior = models.CharField(max_length=50, null=True, blank=True)
    weight_condition = models.CharField(max_length=50, null=True, blank=True)
    reproductive_condition = models.CharField(max_length=50, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Symptom for {self.health_check.cow.name}"

    class Meta:
        db_table = "symptom"
        
class DiseaseHistory(models.Model):
    health_check = models.OneToOneField("HealthCheck", on_delete=models.CASCADE, related_name="disease_history")

    disease_name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    treatment_done = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def cow(self):
        return self.health_check.cow

    @property
    def symptom(self):
        return self.health_check.symptom if hasattr(self.health_check, "symptom") else None

    def __str__(self):
        return f"{self.disease_name} - {self.health_check.cow.name}"

    
    class Meta:
        db_table = "disease_history"

class Reproduction(models.Model):
    cow = models.ForeignKey("Cow", on_delete=models.CASCADE, related_name="reproductions")

    calving_interval = models.IntegerField(
        help_text="Jarak antar kelahiran (hari)", null=True, blank=True
    )
    service_period = models.IntegerField(
        help_text="Hari sejak melahirkan hingga kawin/IB", null=True, blank=True
    )
    conception_rate = models.DecimalField(
        max_digits=5, decimal_places=2, help_text="Tingkat keberhasilan IB (%)", null=True, blank=True
    )
    # models.py
    total_insemination = models.IntegerField(null=True, blank=True, help_text="Jumlah inseminasi")
    successful_pregnancy = models.IntegerField(
    null=True, blank=True, default=1,
    help_text="Jumlah kehamilan berhasil"
)
        # 🆕 Field tanggal tambahan
    calving_date = models.DateField(null=True, blank=True, help_text="Tanggal beranak sekarang")
    previous_calving_date = models.DateField(null=True, blank=True, help_text="Tanggal beranak sebelumnya")
    insemination_date = models.DateField(null=True, blank=True, help_text="Tanggal inseminasi")


    recorded_at = models.DateTimeField(default=now)

    def __str__(self):
        return f"Repro - {self.cow.name} ({self.recorded_at.strftime('%Y-%m-%d')})"

    class Meta:
        db_table = "reproduction"
        ordering = ["-recorded_at"]
# ✅ Method untuk mengecek alert jika data keluar dari batas target
    def is_alert_needed(self):
        alerts = []
        if self.calving_interval is not None and self.calving_interval > 425:
            alerts.append("Calving interval terlalu panjang (>14 bulan)")
        if self.service_period is not None and self.service_period > 90:
            alerts.append("Service period melewati batas (>90 hari)")
        if self.conception_rate is not None and self.conception_rate < 50:
            alerts.append("Tingkat konsepsi rendah (<50%)")
        return alerts

class Notification(models.Model):
    cow = models.ForeignKey("Cow", on_delete=models.CASCADE, related_name="notifications")  # Relasi ke tabel cows
    farmer = models.ForeignKey("Farmer", on_delete=models.CASCADE, related_name="notifications", null=True, blank=True)
    date = models.DateField(default=now)  # Tanggal notifikasi (bukan datetime)
    message = models.CharField(max_length=255)  # Pesan maksimum 255 karakter
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp saat dibuat

    def __str__(self):
        return f"Notifikasi untuk {self.cow.name} - {self.date}"

    
    class Meta:
        db_table = "notifications"