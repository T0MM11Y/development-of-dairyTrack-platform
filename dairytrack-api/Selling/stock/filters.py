# stock/filters.py

import django_filters # pylint: disable=import-error
from .models import StockHistory

class StockHistoryFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name='change_date', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='change_date', lookup_expr='lte')
    change_type = django_filters.CharFilter(lookup_expr='iexact')  # "sold", "expired", dll
    product_stock = django_filters.NumberFilter()  # filter by product_stock ID

    class Meta:
        model = StockHistory
        fields = ['change_type', 'product_stock', 'start_date', 'end_date']
