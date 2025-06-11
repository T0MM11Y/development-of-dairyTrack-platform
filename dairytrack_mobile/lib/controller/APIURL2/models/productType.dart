// models/productType.dart
import 'package:logger/logger.dart';

class User {
  final int id;
  final String username;
  final String name;
  final int roleId;

  User({
    required this.id,
    required this.username,
    required this.name,
    required this.roleId,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final logger = Logger();
    try {
      return User(
        id: _parseInt(json['id'], 'id') ?? 0,
        username: json['username'] ?? 'Unknown',
        name: json['name'] ?? 'Unknown',
        roleId: _parseInt(json['role_id'], 'role_id') ?? 0,
      );
    } catch (e) {
      logger.e('Error parsing User: $e, JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'name': name,
      'role_id': roleId,
    };
  }
}

class ProdukType {
  final int id;
  final String productName;
  final String productDescription;
  final String? image;
  final String price;
  final String unit;
  final DateTime createdAt;
  final DateTime updatedAt;
  final User? createdBy;
  final User? updatedBy;

  ProdukType({
    required this.id,
    required this.productName,
    required this.productDescription,
    this.image,
    required this.price,
    required this.unit,
    required this.createdAt,
    required this.updatedAt,
    this.createdBy,
    this.updatedBy,
  });

  factory ProdukType.fromJson(Map<String, dynamic> json) {
    final logger = Logger();
    try {
      return ProdukType(
        id: _parseInt(json['id'], 'id') ?? 0,
        productName: json['product_name'] ?? 'Unknown',
        productDescription: json['product_description'] ?? '',
        image: json['image'],
        price: json['price']?.toString() ?? '0.0',
        unit: json['unit'] ?? 'Unknown',
        createdAt: json['created_at'] != null
            ? DateTime.parse(json['created_at'])
            : DateTime(1970, 1, 1),
        updatedAt: json['updated_at'] != null
            ? DateTime.parse(json['updated_at'])
            : DateTime(1970, 1, 1),
        createdBy: json['created_by'] != null
            ? User.fromJson(json['created_by'])
            : null,
        updatedBy: json['updated_by'] != null
            ? User.fromJson(json['updated_by'])
            : null,
      );
    } catch (e) {
      logger.e('Error parsing ProdukType: $e, JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_name': productName,
      'product_description': productDescription,
      'image': image,
      'price': price,
      'unit': unit,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'created_by': createdBy?.toJson(),
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
