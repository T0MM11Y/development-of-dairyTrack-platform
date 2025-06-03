from rest_framework import serializers
from .models import Expense, Income, Finance, ExpenseType, IncomeType
from sales.models import SalesTransaction
from stock.serializers import UserSerializer
from stock.models import User

class StringToIntPrimaryKeyField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        # Convert string to integer if possible
        try:
            if isinstance(data, str) and data.isdigit():
                data = int(data)
            return super().to_internal_value(data)
        except (ValueError, TypeError):
            raise serializers.ValidationError("Invalid user ID format. Expected a number.")


class ExpenseTypeSerializer(serializers.ModelSerializer):
    created_by = StringToIntPrimaryKeyField(queryset=User.objects.all(), required=False, allow_null=True)
    updated_by = StringToIntPrimaryKeyField(queryset=User.objects.all(), required=False, allow_null=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    updated_by_detail = UserSerializer(source='updated_by', read_only=True)

    class Meta:
        model = ExpenseType
        fields = [
            'id', 'name', 'description',
            'created_by', 'updated_by', 'created_by_detail', 'updated_by_detail',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['created_by'] = representation.pop('created_by_detail')
        representation['updated_by'] = representation.pop('updated_by_detail')
        return representation

class IncomeTypeSerializer(serializers.ModelSerializer):
    created_by = StringToIntPrimaryKeyField(queryset=User.objects.all(), required=False, allow_null=True)
    updated_by = StringToIntPrimaryKeyField(queryset=User.objects.all(), required=False, allow_null=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    updated_by_detail = UserSerializer(source='updated_by', read_only=True)

    class Meta:
        model = IncomeType
        fields = [
            'id', 'name', 'description',
            'created_by', 'updated_by', 'created_by_detail', 'updated_by_detail',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['created_by'] = representation.pop('created_by_detail')
        representation['updated_by'] = representation.pop('updated_by_detail')
        return representation

class ExpenseSerializer(serializers.ModelSerializer):
    expense_type = serializers.PrimaryKeyRelatedField(queryset=ExpenseType.objects.all())
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    updated_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    expense_type_detail = serializers.SerializerMethodField()
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    updated_by_detail = UserSerializer(source='updated_by', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'expense_type', 'expense_type_detail', 'amount', 'description', 'transaction_date',
            'created_by', 'updated_by', 'created_by_detail', 'updated_by_detail',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_expense_type_detail(self, obj):
        expense_type = obj.expense_type
        return {
            'id': expense_type.id,
            'name': expense_type.name,
            'description': expense_type.description
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['created_by'] = representation.pop('created_by_detail')
        representation['updated_by'] = representation.pop('updated_by_detail')
        return representation

class IncomeSerializer(serializers.ModelSerializer):
    income_type = serializers.PrimaryKeyRelatedField(queryset=IncomeType.objects.all())
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    updated_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    income_type_detail = serializers.SerializerMethodField()
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    updated_by_detail = UserSerializer(source='updated_by', read_only=True)

    class Meta:
        model = Income
        fields = [
            'id', 'income_type', 'income_type_detail', 'amount', 'description', 'transaction_date',
            'created_by', 'updated_by', 'created_by_detail', 'updated_by_detail',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_income_type_detail(self, obj):
        income_type = obj.income_type
        return {
            'id': income_type.id,
            'name': income_type.name,
            'description': income_type.description
        }

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['created_by'] = representation.pop('created_by_detail')
        representation['updated_by'] = representation.pop('updated_by_detail')
        return representation

class SalesTransactionSerializer(serializers.ModelSerializer):
    created_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    updated_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    updated_by_detail = UserSerializer(source='updated_by', read_only=True)

    class Meta:
        model = SalesTransaction
        fields = [
            'id', 'order', 'quantity', 'total_price', 'payment_method', 'transaction_date',
            'created_by', 'updated_by', 'created_by_detail', 'updated_by_detail',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        sales_transaction = SalesTransaction.objects.create(**validated_data)
        # Buat Income otomatis
        sales_type, _ = IncomeType.objects.get_or_create(
            name="Sales",
            defaults={"description": "Revenue from product sales"}
        )
        Income.objects.create(
            income_type=sales_type,
            amount=sales_transaction.total_price,
            description=f"Sales Transaction {sales_transaction.pk}",
            transaction_date=sales_transaction.transaction_date,
            created_by=sales_transaction.created_by,
            updated_by=sales_transaction.updated_by
        )
        # Finance akan dibuat otomatis oleh metode save di Income
        return sales_transaction

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['created_by'] = representation.pop('created_by_detail')
        representation['updated_by'] = representation.pop('updated_by_detail')
        return representation

class FinanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finance
        fields = [
            'id', 'transaction_date', 'transaction_type', 'description', 'amount',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']