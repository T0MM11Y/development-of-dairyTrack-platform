import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
import 'package:logger/logger.dart';

class Stock {
  final int id;
  final int productType;
  final ProdukType productTypeDetail;
  final int initialQuantity;
  final int quantity;
  final DateTime productionAt;
  final DateTime expiryAt;
  final String status;
  final double totalMilkUsed;
  final DateTime createdAt;
  final DateTime updatedAt;
  final User createdBy;
  final User? updatedBy;

  Stock({
    required this.id,
    required this.productType,
    required this.productTypeDetail,
    required this.initialQuantity,
    required this.quantity,
    required this.productionAt,
    required this.expiryAt,
    required this.status,
    required this.totalMilkUsed,
    required this.createdAt,
    required this.updatedAt,
    required this.createdBy,
    this.updatedBy,
  });

  factory Stock.fromJson(Map<String, dynamic> json) {
    final logger = Logger();
    try {
      return Stock(
        id: _parseInt(json['id'], 'id') ?? 0,
        productType: _parseInt(json['product_type'], 'product_type') ?? 0,
        productTypeDetail: ProdukType.fromJson(json['product_type_detail']),
        initialQuantity: _parseInt(json['initial_quantity'], 'initial_quantity') ?? 0,
        quantity: _parseInt(json['quantity'], 'quantity') ?? 0,
        productionAt: DateTime.parse(json['production_at']),
        expiryAt: DateTime.parse(json['expiry_at']),
        status: json['status'] ?? 'unknown',
        totalMilkUsed: double.parse(json['total_milk_used'].toString()),
        createdAt: DateTime.parse(json['created_at']),
        updatedAt: DateTime.parse(json['updated_at']),
        createdBy: User.fromJson(json['created_by']),
        updatedBy: json['updated_by'] != null ? User.fromJson(json['updated_by']) : null,
      );
    } catch (e) {
      logger.e('Error parsing Stock: $e, JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_type': productType,
      'product_type_detail': productTypeDetail.toJson(),
      'initial_quantity': initialQuantity,
      'quantity': quantity,
      'production_at': productionAt.toIso8601String(),
      'expiry_at': expiryAt.toIso8601String(),
      'status': status,
      'total_milk_used': totalMilkUsed.toString(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'created_by': createdBy.toJson(),
      'updated_by': updatedBy?.toJson(),
    };
  }
}

// Helper function to parse int safely
int? _parseInt(dynamic value, String fieldName) {
  final logger = Logger();
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