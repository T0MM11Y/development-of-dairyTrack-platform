from django.db import models
from django.utils.timezone import now

class Farmer(models.Model):
    user = models.OneToOneField("auth.User", on_delete=models.CASCADE)  # Hubungkan dengan user
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    birth_date = models.DateField()
    contact = models.CharField(max_length=15)
    religion = models.CharField(max_length=50, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=10)
    total_cattle = models.IntegerField(default=0)
    join_date = models.DateField()
    status = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
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
    farmer = models.ForeignKey("Farmer", on_delete=models.CASCADE)
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
    cow = models.ForeignKey("Cow", on_delete=models.CASCADE)  # Relasi ke tabel cows
    checkup_date = models.DateTimeField(default=now)
    rectal_temperature = models.DecimalField(max_digits=4, decimal_places=2)
    heart_rate = models.IntegerField()
    respiration_rate = models.IntegerField()
    rumination = models.DecimalField(max_digits=3, decimal_places=1)
    treatment_status = models.CharField(max_length=20, default="Not Treated")  # 'Not Treated' or 'Treated'

    def __str__(self):
        return f"Checkup for {self.cow.name} on {self.checkup_date}"
    
    class Meta:
        db_table = "health_check"

class Symptom(models.Model):
    health_check = models.ForeignKey("HealthCheck", on_delete=models.CASCADE)
    eye_condition = models.CharField(max_length=50, null=True, blank=True)  # 'Normal', 'Red', etc.
    mouth_condition = models.CharField(max_length=50, null=True, blank=True)
    nose_condition = models.CharField(max_length=50, null=True, blank=True)
    anus_condition = models.CharField(max_length=50, null=True, blank=True)
    leg_condition = models.CharField(max_length=50, null=True, blank=True)
    skin_condition = models.CharField(max_length=50, null=True, blank=True)
    behavior = models.CharField(max_length=50, null=True, blank=True)
    weight_condition = models.CharField(max_length=50, null=True, blank=True)
    reproductive_condition = models.CharField(max_length=50, null=True, blank=True)
    treatment_status = models.CharField(max_length=20, default="Not Treated")  # 'Not Treated' or 'Treated'

    def __str__(self):
        return f"Symptoms for {self.health_check.cow.name} on {self.health_check.checkup_date}"
    class Meta:
        db_table = "symptom"
        
class DiseaseHistory(models.Model):
    cow = models.ForeignKey("Cow", on_delete=models.CASCADE)  # Relasi ke tabel cows
    disease_name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)  # Bisa kosong jika tidak ada deskripsi
    symptom = models.ForeignKey("Symptom", on_delete=models.SET_NULL, null=True, blank=True)
    health_check = models.ForeignKey("HealthCheck", on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.disease_name} - {self.cow.name}"
    
    class Meta:
        db_table = "disease_history"

class Reproduction(models.Model):
    cow = models.ForeignKey(Cow, on_delete=models.CASCADE)
    birth_interval = models.IntegerField()
    service_period = models.IntegerField()
    conception_rate = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"Reproduction Data for {self.cow.name}"
    
    class Meta:
        db_table = "reproduction"

class Notification(models.Model):
    cow = models.ForeignKey("Cow", on_delete=models.CASCADE)  # Relasi ke tabel cows
    raw_milk = models.ForeignKey("RawMilk", null=True, blank=True, on_delete=models.CASCADE)  # Bisa kosong
    processed_milk = models.ForeignKey("ProcessedMilk", null=True, blank=True, on_delete=models.CASCADE)  # Bisa kosong
    notification_date = models.DateTimeField(auto_now_add=True)  # Default CURRENT_TIMESTAMP
    message = models.TextField()
    type = models.CharField(max_length=50)  # Tipe notifikasi

    def __str__(self):
        return f"Notification for {self.cow.name} - {self.type}"
    
    class Meta:
        db_table = "notifications"