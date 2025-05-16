from django.core.management.base import BaseCommand
from stock.models import User
from finance.models import ExpenseType, IncomeType, Expense
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Seeds ExpenseType, IncomeType, and Expense tables with predefined and dummy data'

    # Predefined expense and income types
    EXPENSE_TYPES = [
        ('material_purchase', 'Material Purchase', 'Purchase of raw materials for production'),
        ('feed_purchase', 'Feed Purchase', 'Purchase of feed for livestock or farming'),
        ('medicine_purchase', 'Medicine Purchase', 'Purchase of medical supplies or medications'),
        ('employee_salary', 'Employee Salary', 'Salaries paid to employees'),
        ('operational', 'Operational', 'Operational expenses like utilities and rent'),
        ('equipment_purchase', 'Equipment Purchase', 'Purchase of equipment or machinery'),
        ('marketing', 'Marketing', 'Expenses related to marketing and advertising'),
    ]

    INCOME_TYPES = [
        ('sales', 'Sales', 'Revenue from product or service sales'),
        ('investment', 'Investment', 'Income from investments or dividends'),
    ]

    def handle(self, *args, **kwargs):
        # Get user with ID 12
        try:
            user = User.objects.get(id=12)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('User with ID 12 does not exist. Please create the user first.'))
            return

        # Seed ExpenseType
        for name, display_name, description in self.EXPENSE_TYPES:
            ExpenseType.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'created_by': user,
                    'updated_by': user,
                }
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully seeded ExpenseType: {display_name}'))

        # Seed IncomeType
        for name, display_name, description in self.INCOME_TYPES:
            IncomeType.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'created_by': user,
                    'updated_by': user,
                }
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully seeded IncomeType: {display_name}'))

        # Seed dummy Expense data
        expense_types = ExpenseType.objects.all()
        if not expense_types:
            self.stdout.write(self.style.ERROR('No ExpenseTypes found. Cannot seed Expenses.'))
            return

        for _ in range(10):  # Create 10 dummy expenses
            expense_type = random.choice(expense_types)
            amount = random.randint(1000, 100000)
            transaction_date = datetime.now() - timedelta(days=random.randint(1, 30))
            description = f"Dummy expense for {expense_type.name} on {transaction_date.strftime('%Y-%m-%d')}"

            Expense.objects.get_or_create(
                expense_type=expense_type,
                amount=amount,
                transaction_date=transaction_date,
                defaults={
                    'description': description,
                    'created_by': user,
                    'updated_by': user,
                }
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully seeded Expense: {description}'))