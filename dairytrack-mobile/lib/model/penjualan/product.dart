import 'productType.dart';

class ProductStock {
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

  ProductStock({
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
  });

  factory ProductStock.fromJson(Map<String, dynamic> json) {
    return ProductStock(
      id: json['id'] ?? 0,
      productType: json['product_type'] ?? 0,
      productTypeDetail: json['product_type_detail'] != null
          ? ProdukType.fromJson(json['product_type_detail'])
          : ProdukType(
              id: 0,
              productName: 'Unknown',
              productDescription: '',
              image: '',
              price: '0.0',
              unit: 'Unknown',
              createdAt: DateTime.now(),
              updatedAt: DateTime.now(),
            ),
      initialQuantity: json['initial_quantity'] ?? 0,
      quantity: json['quantity'] ?? 0,
      productionAt: json['production_at'] != null
          ? DateTime.parse(json['production_at'])
          : DateTime.now(),
      expiryAt: json['expiry_at'] != null
          ? DateTime.parse(json['expiry_at'])
          : DateTime.now().add(const Duration(days: 30)),
      status: json['status'] ?? 'unknown',
      // Fix: Properly parse total_milk_used from String to double
      totalMilkUsed: json['total_milk_used'] != null
          ? double.tryParse(json['total_milk_used'].toString()) ?? 0.0
          : 0.0,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
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
      'total_milk_used': totalMilkUsed,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
