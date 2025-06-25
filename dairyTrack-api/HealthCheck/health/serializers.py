from rest_framework import serializers
from .models import *
from django.utils.timezone import localtime
from pytz import timezone


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name']


# ✅ Cow Preview Serializer untuk nested
class CowSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cow
        fields = ['id', 'name', 'breed']

# ✅ HealthCheck - untuk Create (gunakan cow_id)
class HealthCheckCreateSerializer(serializers.ModelSerializer):
    cow_id = serializers.PrimaryKeyRelatedField(queryset=Cow.objects.all(), source="cow")
    checked_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = HealthCheck
        fields = [
            'cow_id', 'rectal_temperature', 'heart_rate', 'respiration_rate',
            'rumination', 'checked_by'
        ]


# ✅ HealthCheck - untuk List/Detail (tampilkan cow detail + tanggal)
class HealthCheckListSerializer(serializers.ModelSerializer):
    cow = CowSimpleSerializer()
    checked_by = UserSimpleSerializer(read_only=True)  # ✅ override di sini

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
            'created_at',
            'checked_by'
        ]
        
class HealthCheckEditSerializer(serializers.ModelSerializer):
    cow = CowSimpleSerializer(read_only=True)
    edited_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = HealthCheck
        fields = [
            'id', 'cow', 'checkup_date', 'rectal_temperature', 'heart_rate',
            'respiration_rate', 'rumination', 'status',
            'needs_attention', 'is_followed_up', 'created_at', 'edited_by'
        ]
        read_only_fields = [
            'id', 'cow', 'checkup_date', 'status',
            'needs_attention', 'is_followed_up', 'created_at'
        ]

# Read: untuk GET
class SymptomReadSerializer(serializers.ModelSerializer):
    created_by = UserSimpleSerializer(read_only=True)
    edited_by = UserSimpleSerializer(read_only=True)

    class Meta:
        model = Symptom
        fields = [
            'id',
            'health_check',
            'created_by',
            'edited_by',
            'eye_condition',
            'mouth_condition',
            'nose_condition',
            'anus_condition',
            'leg_condition',
            'skin_condition',
            'behavior',
            'weight_condition',
            'reproductive_condition',
            'created_at',
        ]

# Write: untuk POST/PUT
class SymptomWriteSerializer(serializers.ModelSerializer):
    edited_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Symptom
        fields = [
            "eye_condition",
            "mouth_condition",
            "nose_condition",
            "anus_condition",
            "leg_condition",
            "skin_condition",
            "behavior",
            "weight_condition",
            "reproductive_condition",
            "edited_by",
        ]
class SymptomCreateSerializer(serializers.ModelSerializer):
    health_check = serializers.PrimaryKeyRelatedField(queryset=HealthCheck.objects.all())
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Symptom
        fields = [
            "health_check",
            "created_by",
            "eye_condition",
            "mouth_condition",
            "nose_condition",
            "anus_condition",
            "leg_condition",
            "skin_condition",
            "behavior",
            "weight_condition",
            "reproductive_condition",
        ]



class DiseaseHistoryListSerializer(serializers.ModelSerializer):
    health_check = HealthCheckListSerializer()
    symptom = SymptomWriteSerializer()
    created_by = UserSimpleSerializer(read_only=True)
    edited_by = UserSimpleSerializer(read_only=True)


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
            'created_by',
            'edited_by'
        ]
class DiseaseHistoryCreateSerializer(serializers.ModelSerializer):
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = DiseaseHistory
        fields = ['health_check', 'disease_name', 'description', 'created_by']

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
    edited_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = DiseaseHistory
        fields = ['disease_name', 'description','edited_by']  # hanya yang bisa diedit
# ✅ Serializer untuk List dan Detail (tampilkan cow dan alert)
class ReproductionListSerializer(serializers.ModelSerializer):
    cow = CowSimpleSerializer()
    alerts = serializers.SerializerMethodField()
    created_by = UserSimpleSerializer(read_only=True)
    edited_by = UserSimpleSerializer(read_only=True)


    class Meta:
        model = Reproduction
        fields = [
            'id',
            'cow',
            'calving_interval',
            'service_period',
            'conception_rate',
            "calving_date",               
            "previous_calving_date",       
            "insemination_date",           
            "total_insemination",          
            "successful_pregnancy",        
            'recorded_at',
            'alerts',
            'created_by',
            'edited_by'
        ]

    def get_alerts(self, obj):
        return obj.is_alert_needed() if hasattr(obj, "is_alert_needed") else None


class ReproductionCreateSerializer(serializers.ModelSerializer):
    total_insemination = serializers.IntegerField(write_only=True, required=True)
    successful_pregnancy = serializers.IntegerField(write_only=True, required=False)
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Reproduction
        fields = [
            "cow",
            "calving_date",
            "previous_calving_date",
            "insemination_date",
            "total_insemination",
            "successful_pregnancy",
            "created_by",
        ]

    def create(self, validated_data):
        return self._save(validated_data)

    def _save(self, validated_data, instance=None):
        created_by = validated_data.get("created_by", None)

        calving_date = validated_data.pop("calving_date")
        previous_calving_date = validated_data.pop("previous_calving_date")
        insemination_date = validated_data.pop("insemination_date")
        total_insemination = validated_data.pop("total_insemination")
        successful_pregnancy = validated_data.pop("successful_pregnancy", 1)

        conception_rate = round((successful_pregnancy / total_insemination) * 100, 2)
        calving_interval = (calving_date - previous_calving_date).days
        service_period = (insemination_date - calving_date).days

        instance = Reproduction()
        if created_by:
            instance.created_by = created_by

        instance.cow = validated_data.get("cow")
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

class ReproductionUpdateSerializer(serializers.ModelSerializer):
    successful_pregnancy = serializers.IntegerField(write_only=True, required=False)
    edited_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Reproduction
        fields = [
            "cow",
            "calving_date",
            "previous_calving_date",
            "insemination_date",
            "total_insemination",
            "successful_pregnancy",
            "edited_by",
        ]

    def update(self, instance, validated_data):
        return self._save(validated_data, instance)

    def _save(self, validated_data, instance):
        edited_by = validated_data.get("edited_by", None)

        calving_date = validated_data.pop("calving_date")
        previous_calving_date = validated_data.pop("previous_calving_date")
        insemination_date = validated_data.pop("insemination_date")
        total_insemination = validated_data.pop("total_insemination", instance.total_insemination)
        successful_pregnancy = validated_data.pop("successful_pregnancy", instance.successful_pregnancy or 1)

        conception_rate = round((successful_pregnancy / total_insemination) * 100, 2)
        calving_interval = (calving_date - previous_calving_date).days
        service_period = (insemination_date - calving_date).days

        if edited_by:
            instance.edited_by = edited_by

        instance.cow = validated_data.get("cow", instance.cow)
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
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    created_at = serializers.DateTimeField(default_timezone=timezone('Asia/Jakarta'))

    class Meta:
        model = Notification
        fields = ['id', 'user_id', 'cow', 'name', 'message', 'is_read', 'created_at']

    def get_created_at(self, obj):
        jakarta = timezone('Asia/Jakarta')
        return obj.created_at.astimezone(jakarta).isoformat()