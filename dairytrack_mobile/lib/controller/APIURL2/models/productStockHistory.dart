import 'package:logger/logger.dart';

class ProductType {
  final int id;
  final String productName;
  final String productDescription;
  final String price;
  final String unit;
  final DateTime createdAt;
  final DateTime updatedAt;

  ProductType({
    required this.id,
    required this.productName,
    required this.productDescription,
    required this.price,
    required this.unit,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ProductType.fromJson(Map<String, dynamic> json) {
    final logger = Logger();
    try {
      return ProductType(
        id: _parseInt(json['id'], 'id') ?? 0,
        productName: json['product_name']?.toString() ?? 'Unknown',
        productDescription: json['product_description']?.toString() ?? '',
        price: json['price']?.toString() ?? '0.0',
        unit: json['unit']?.toString() ?? 'Unknown',
        createdAt: json['created_at'] != null
            ? DateTime.parse(json['created_at'])
            : DateTime.now(),
        updatedAt: json['updated_at'] != null
            ? DateTime.parse(json['updated_at'])
            : DateTime.now(),
      );
    } catch (e) {
      logger.e('Error parsing ProductType: $e, JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_name': productName,
      'product_description': productDescription,
      'price': price,
      'unit': unit,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class ProductStockHistory {
  final int? id; // Changed to nullable
  final String changeType;
  final int quantityChange;
  final int productStock;
  final ProductType productType;
  final String unit;
  final String totalPrice;
  final DateTime changeDate;

  ProductStockHistory({
    this.id, // Nullable
    required this.changeType,
    required this.quantityChange,
    required this.productStock,
    required this.productType,
    required this.unit,
    required this.totalPrice,
    required this.changeDate,
  });

  factory ProductStockHistory.fromJson(Map<String, dynamic> json) {
    final logger = Logger();
    try {
      return ProductStockHistory(
        id: _parseInt(json['id'], 'id'), // Allow null
        changeType: json['change_type']?.toString() ?? 'unknown',
        quantityChange:
            _parseInt(json['quantity_change'], 'quantity_change') ?? 0,
        productStock: _parseInt(json['product_stock'], 'product_stock') ?? 0,
        productType: ProductType.fromJson({
          'id': json['product_id'] ?? 0,
          'product_name': json['product_name'] ?? 'Unknown',
          'product_description': '',
          'price': '0.0',
          'unit': json['unit'] ?? 'Unknown',
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        }),
        unit: json['unit']?.toString() ?? 'Unknown',
        totalPrice: json['total_price']?.toString() ?? '0.00',
        changeDate: json['change_date'] != null
            ? DateTime.parse(json['change_date'])
            : DateTime.now(),
      );
    } catch (e) {
      logger.e('Error parsing ProductStockHistory: $e, JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'change_type': changeType,
      'quantity_change': quantityChange,
      'product_stock': productStock,
      'product_type': productType.toJson(),
      'unit': unit,
      'total_price': totalPrice,
      'change_date': changeDate.toIso8601String(),
    };
  }
}

int? _parseInt(dynamic value, String fieldName) {
  final logger = Logger();
  if (value == null) {
    logger.i('$fieldName is null, returning null');
    return null;
  }
  if (value is int) return value;
  if (value is String) {
    final result = int.tryParse(value);
    if (result == null) {
      logger.w('Failed to parse $fieldName: $value is not a valid integer');
    }
    return result;
  }
  logger.w('Invalid type for $fieldName: $value (${value.runtimeType})');
  return null;
}
