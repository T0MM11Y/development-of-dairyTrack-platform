class ProductHistory {
  final String changeType;
  final int quantityChange;
  final int productStock;
  final String productName;
  final String unit;
  final double totalPrice;
  final DateTime changeDate;

  ProductHistory({
    required this.changeType,
    required this.quantityChange,
    required this.productStock,
    required this.productName,
    required this.unit,
    required this.totalPrice,
    required this.changeDate,
  });

  factory ProductHistory.fromJson(Map<String, dynamic> json) {
    return ProductHistory(
      changeType: json['change_type'] ?? 'unknown',
      quantityChange: json['quantity_change'] ?? 0,
      productStock: json['product_stock'] ?? 0,
      productName: json['product_name'] ?? '',
      unit: json['unit'] ?? '',
      totalPrice: json['total_price'] != null
          ? double.tryParse(json['total_price'].toString()) ?? 0.0
          : 0.0,
      changeDate: json['change_date'] != null
          ? DateTime.parse(json['change_date'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'change_type': changeType,
      'quantity_change': quantityChange,
      'product_stock': productStock,
      'product_name': productName,
      'unit': unit,
      'total_price': totalPrice,
      'change_date': changeDate.toIso8601String(),
    };
  }
}