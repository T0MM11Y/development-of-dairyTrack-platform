from rest_framework import serializers
from .models import Expense, Income, Finance
from sales.models import SalesTransaction

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'

    # def create(self, validated_data):
    #     """ Saat Expense dibuat, otomatis catat ke Finance dengan transaction_date yang sama """
    #     expense = Expense.objects.create(**validated_data)
    #     Finance.objects.create(
    #         transaction_type='expense',
    #         description=expense.description,
    #         amount=expense.amount,
    #         transaction_date=expense.transaction_date
    #     )
    #     return expense

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'

    # def create(self, validated_data):
    #     """ Saat Income dibuat, otomatis catat ke Finance """
    #     income = Income.objects.create(**validated_data)
    #     Finance.objects.create(
    #         transaction_type='income',
    #         description=income.description,
    #         amount=income.amount,
    #         transaction_date=income.transaction_date
    #     )
    #     return income

class SalesTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesTransaction
        fields = '__all__'

    def create(self, validated_data):
        """ Saat SalesTransaction dibuat, otomatis catat ke Income dan Finance """
        sales_transaction = SalesTransaction.objects.create(**validated_data)
        
        # Buat Income otomatis
        income = Income.objects.create(
            income_type='sales',
            amount=sales_transaction.total_price,
            description=f"Sales Transaction {sales_transaction.pk}"
        )

        # Catat ke Finance
        Finance.objects.create(
            transaction_type='income',
            description=income.description,
            amount=income.amount
        )

        return sales_transaction

class FinanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finance
        fields = '__all__'
