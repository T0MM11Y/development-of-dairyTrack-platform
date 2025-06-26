from django.db import models
from django.utils.timezone import now
from django.conf import settings  # asumsi model User menggunakan AUTH_USER_MODEL

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'roles'
class User(models.Model):
    name = models.CharField(max_length=100)
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    contact = models.CharField(max_length=15, null=True, blank=True)
    religion = models.CharField(max_length=50, null=True, blank=True)
    birth = models.DateField(null=True, blank=True)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='users')
    token = models.CharField(max_length=255, null=True, blank=True)
    token_created_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.username})"

    class Meta:
        db_table = 'users'
class UserCowAssociation(models.Model):
    default_auto_field = None  # ⚠️ agar tidak ditambahkan kolom id

    user = models.ForeignKey('User', on_delete=models.CASCADE)
    cow = models.ForeignKey('Cow', on_delete=models.CASCADE)

    class Meta:
        db_table = 'user_cow_association'
        unique_together = ('user', 'cow')
        managed = False  # karena sudah ada di MySQL



class Cow(models.Model):
    name = models.CharField(max_length=50)
    birth = models.DateField()
    breed = models.CharField(max_length=50)
    lactation_phase = models.CharField(max_length=50, null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    gender = models.CharField(max_length=10)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Many-to-Many ke User (manajer sapi)
    managers = models.ManyToManyField(
    'User',
    through='UserCowAssociation',
    related_name='managed_cows'
)

    def __str__(self):
        return f"{self.name} - {self.breed}"

    class Meta:
        db_table = "cows"
class HealthCheck(models.Model):
    cow = models.ForeignKey("Cow", on_delete=models.CASCADE, related_name="health_checks")
    checked_by = models.ForeignKey("User", on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name="performed_health_checks")
    edited_by = models.ForeignKey(
    "User",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="edited_health_checks",
    help_text="User yang terakhir mengedit pemeriksaan kesehatan"
)


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
        ('healthy', 'Sehat'),
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Check - {self.cow.name} ({self.checkup_date.strftime('%Y-%m-%d')})"

    class Meta:
        db_table = "health_check"

class Symptom(models.Model):
    health_check = models.ForeignKey(
        "HealthCheck",
        on_delete=models.CASCADE,
        related_name="symptoms"
    )
    created_by = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_symptoms",
        help_text="User yang mencatat gejala"
    )
    edited_by = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="edited_symptoms",
        help_text="User yang terakhir mengedit data gejala"
    )

    eye_condition = models.CharField(max_length=100, null=True, blank=True)
    mouth_condition = models.CharField(max_length=100, null=True, blank=True)
    nose_condition = models.CharField(max_length=100, null=True, blank=True)
    anus_condition = models.CharField(max_length=100, null=True, blank=True)
    leg_condition = models.CharField(max_length=100, null=True, blank=True)
    skin_condition = models.CharField(max_length=100, null=True, blank=True)
    behavior = models.CharField(max_length=100, null=True, blank=True)
    weight_condition = models.CharField(max_length=100, null=True, blank=True)
    reproductive_condition = models.CharField(max_length=100, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Symptom for {self.health_check.cow.name}"

    class Meta:
        db_table = "symptom"

        
class DiseaseHistory(models.Model):
    health_check = models.ForeignKey(
    "HealthCheck",
    on_delete=models.CASCADE,
    related_name="disease_histories"
)
    created_by = models.ForeignKey(
        "User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recorded_disease_histories",
        help_text="User yang mencatat riwayat penyakit"
    )
    edited_by = models.ForeignKey(
    "User",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="edited_disease_histories",
    help_text="User yang terakhir mengedit riwayat penyakit"
)


    disease_name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    treatment_done = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def cow(self):
        return self.health_check.cow

    @property
    def symptom(self):
        return self.health_check.symptoms.first() if hasattr(self.health_check, "symptoms") else None

    def __str__(self):
        return f"{self.disease_name} - {self.health_check.cow.name}"

    
    class Meta:
        db_table = "disease_history"

class Reproduction(models.Model):
    cow = models.ForeignKey("Cow", on_delete=models.CASCADE, related_name="reproductions")
    created_by = models.ForeignKey("User", on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name="recorded_reproductions")
    edited_by = models.ForeignKey(
    "User",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="edited_reproductions",
    help_text="User yang terakhir mengedit data reproduksi"
)

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
            alerts.append("Calving interval is too long (>14 months)")
        if self.service_period is not None and self.service_period > 90:
            alerts.append("Service period exceeds the limit (>90 days)")
        if self.conception_rate is not None and self.conception_rate < 50:
            alerts.append("Conception rate is low (<50%)")
        return alerts

class Notification(models.Model):
    user = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=False,  # disamakan dengan nullable=False di SQLAlchemy
        blank=False
    )
    cow = models.ForeignKey(
        "Cow",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=False,
        blank=False
    )

    message = models.TextField()  # gunakan TextField agar fleksibel
    type = models.CharField(max_length=20)  # sesuai 'low_production', 'high_production'
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=now)

    def __str__(self):
        return f"Notification for {self.user.username} - {self.type} - {self.created_at.strftime('%Y-%m-%d')}"

    class Meta:
        db_table = "notifications"