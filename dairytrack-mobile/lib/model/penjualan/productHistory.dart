class StockHistory {
  final String changeType;
  final int quantityChange;
  final int productStock;
  final String productName;
  final String unit;
  final double totalPrice;
  final DateTime changeDate;

  StockHistory({
    required this.changeType,
    required this.quantityChange,
    required this.productStock,
    required this.productName,
    required this.unit,
    required this.totalPrice,
    required this.changeDate,
  });

  factory StockHistory.fromJson(Map<String, dynamic> json) {
    return StockHistory(
      changeType: json['change_type'] ?? 'Unknown', // Default to 'Unknown' if null
      quantityChange: json['quantity_change'] ?? 0, // Default to 0 if null
      productStock: json['product_stock'] ?? 0, // Default to 0 if null
      productName: json['product_name'] ?? 'Unknown', // Default to 'Unknown' if null
      unit: json['unit'] ?? 'Unknown', // Default to 'Unknown' if null
      totalPrice: json['total_price'] != null
          ? double.tryParse(json['total_price'].toString()) ?? 0.0
          : 0.0, // Default to 0.0 if null or invalid
      changeDate: json['change_date'] != null
          ? DateTime.parse(json['change_date'])
          : DateTime(1970, 1, 1), // Default to epoch if null
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