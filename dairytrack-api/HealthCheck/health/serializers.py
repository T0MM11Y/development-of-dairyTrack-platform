from rest_framework import serializers
from .models import *



# ✅ Cow Preview Serializer untuk nested
class CowSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cow
        fields = ['id', 'name', 'breed']

# ✅ HealthCheck - untuk Create (gunakan cow_id)
class HealthCheckCreateSerializer(serializers.ModelSerializer):
    cow_id = serializers.PrimaryKeyRelatedField(queryset=Cow.objects.all(), source="cow")

    class Meta:
        model = HealthCheck
        fields = ['cow_id', 'rectal_temperature', 'heart_rate', 'respiration_rate', 'rumination', 'status', 'needs_attention', 'is_followed_up']
        read_only_fields = ['status', 'needs_attention', 'is_followed_up']  # semua masih bisa diisi manual saat create, status diatur otomatis

# ✅ HealthCheck - untuk List/Detail (tampilkan cow detail + tanggal)
class HealthCheckListSerializer(serializers.ModelSerializer):
    cow = CowSimpleSerializer()

    class Meta:
        model = HealthCheck
        fields = [
            'id',
            'cow',
            'checkup_date',
            'rectal_temperature',
            'heart_rate',
            'respiration_rate',
            'rumination',
            'status',
            'needs_attention',
            'is_followed_up',
            'created_at'
        ]
class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = '__all__'
class HealthCheckEditSerializer(serializers.ModelSerializer):
    cow = CowSimpleSerializer(read_only=True)  # tampilkan data sapi
    status = serializers.CharField(read_only=True)  # tampilkan, tapi tidak bisa diedit

    class Meta:
        model = HealthCheck
        fields = [
            'id',
            'cow',
            'checkup_date',
            'rectal_temperature',
            'heart_rate',
            'respiration_rate',
            'rumination',
            'status',
            'needs_attention',
            'is_followed_up',
            'created_at'
        ]
        read_only_fields = ['cow', 'status', 'checkup_date', 'needs_attention', 'is_followed_up', 'created_at']

class DiseaseHistoryListSerializer(serializers.ModelSerializer):
    health_check = HealthCheckListSerializer()
    symptom = SymptomSerializer()

    class Meta:
        model = DiseaseHistory
        fields = [
            'id',
            'health_check',
            'symptom',
            'disease_name',
            'description',
            'treatment_done',
            'created_at',
        ]
class DiseaseHistoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseHistory
        fields = ['health_check', 'disease_name', 'description']

    def create(self, validated_data):
        # ✅ Set treatment_done ke True sebelum create
        validated_data['treatment_done'] = True
        # Buat instance DiseaseHistory
        disease_history = super().create(validated_data)

        # Ambil health_check-nya
        health_check = disease_history.health_check

        # Update status-nya jadi 'handled'
        health_check.status = 'handled'
        health_check.is_followed_up = True
        health_check.save()

        return disease_history
    
class DiseaseHistoryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseHistory
        fields = ['disease_name', 'description']  # hanya yang bisa diedit
# ✅ Serializer untuk List dan Detail (tampilkan cow dan alert)
class ReproductionListSerializer(serializers.ModelSerializer):
    cow = CowSimpleSerializer()
    alerts = serializers.SerializerMethodField()

    class Meta:
        model = Reproduction
        fields = [
            'id',
            'cow',
            'calving_interval',
            'service_period',
            'conception_rate',
            "calving_date",                # ✅ tambahkan ini
            "previous_calving_date",       # ✅ tambahkan ini
            "insemination_date",           # ✅ tambahkan ini
            "total_insemination",          # ✅ tambahkan ini
            "successful_pregnancy",        # ✅ tambahkan ini
            'recorded_at',
            'alerts',
        ]

    def get_alerts(self, obj):
        return obj.is_alert_needed() if hasattr(obj, "is_alert_needed") else None


class ReproductionCreateUpdateSerializer(serializers.ModelSerializer):
    total_insemination = serializers.IntegerField(write_only=True, required=True)
    successful_pregnancy = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Reproduction
        fields = [
            "cow",
            "calving_interval",
            "service_period",
            "conception_rate",
            "calving_date",
            "previous_calving_date",
            "insemination_date",
            "total_insemination",
            "successful_pregnancy",
        ]

    def create(self, validated_data):
        return self._save(validated_data)

    def update(self, instance, validated_data):
        return self._save(validated_data, instance)

    def _save(self, validated_data, instance=None):
        calving_date = validated_data.pop("calving_date")
        previous_calving_date = validated_data.pop("previous_calving_date")
        insemination_date = validated_data.pop("insemination_date")
        total_insemination = validated_data.pop("total_insemination")
        successful_pregnancy = validated_data.pop("successful_pregnancy", 1)

        conception_rate = round((successful_pregnancy / total_insemination) * 100, 2)
        calving_interval = (calving_date - previous_calving_date).days
        service_period = (insemination_date - calving_date).days

        if instance is None:
            instance = Reproduction()

        instance.cow = validated_data.get("cow")  # ✅ tambahkan ini
        instance.calving_date = calving_date
        instance.previous_calving_date = previous_calving_date
        instance.insemination_date = insemination_date
        instance.total_insemination = total_insemination
        instance.successful_pregnancy = successful_pregnancy
        instance.calving_interval = calving_interval
        instance.service_period = service_period
        instance.conception_rate = conception_rate
        instance.save()

        return instance

    


class NotificationSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="cow.name", read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'cow', 'name', 'message', 'date', 'created_at']
