// orderModel.dart
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
import 'package:logger/logger.dart';

class Order {
  final int id;
  final String orderNo;
  final String customerName;
  final String email;
  final String phoneNumber;
  final String location;
  final String? shippingCost;
  final String totalPrice;
  final String status;
  final String? paymentMethod;
  final DateTime createdAt;
  final List<OrderItem> orderItems;
  final String? notes;

  Order({
    required this.id,
    required this.orderNo,
    required this.customerName,
    required this.email,
    required this.phoneNumber,
    required this.location,
    this.shippingCost,
    required this.totalPrice,
    required this.status,
    this.paymentMethod,
    required this.createdAt,
    required this.orderItems,
    this.notes,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    final logger = Logger();
    try {
      return Order(
        id: _parseInt(json['id'], 'id') ?? 0,
        orderNo: json['order_no']?.toString() ?? 'Unknown',
        customerName: json['customer_name']?.toString() ?? 'Unknown',
        email: json['email']?.toString() ?? '',
        phoneNumber: json['phone_number']?.toString() ?? '',
        location: json['location']?.toString() ?? '',
        shippingCost: json['shipping_cost']?.toString(),
        totalPrice: json['total_price']?.toString() ?? '0.00',
        status: json['status']?.toString() ?? 'Unknown',
        paymentMethod: json['payment_method']?.toString(),
        createdAt: json['created_at'] != null
            ? DateTime.parse(json['created_at'])
            : DateTime.now(),
        orderItems: (json['order_items'] as List<dynamic>?)
                ?.map((item) => OrderItem.fromJson(item))
                .toList() ??
            [],
        notes: json['notes']?.toString(),
      );
    } catch (e) {
      logger.e('Error parsing Order: $e, JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order_no': orderNo,
      'customer_name': customerName,
      'email': email,
      'phone_number': phoneNumber,
      'location': location,
      'shipping_cost': shippingCost,
      'total_price': totalPrice,
      'status': status,
      'payment_method': paymentMethod,
      'created_at': createdAt.toIso8601String(),
      'order_items': orderItems.map((item) => item.toJson()).toList(),
      'notes': notes,
    };
  }
}

class OrderItem {
  final int? id;
  final int? productType;
  final ProdukType? productTypeDetail;
  final int quantity;
  final String? totalPrice;

  OrderItem({
    this.id,
    this.productType,
    this.productTypeDetail,
    required this.quantity,
    this.totalPrice,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    final logger = Logger();
    try {
      return OrderItem(
        id: _parseInt(json['id'], 'id'),
        // Tidak log warning jika product_type null
        productType: json['product_type'] != null
            ? _parseInt(json['product_type'], 'product_type')
            : null,
        productTypeDetail: json['product_type_detail'] != null
            ? ProdukType.fromJson(json['product_type_detail'])
            : null,
        quantity: _parseInt(json['quantity'], 'quantity') ?? 0,
        totalPrice: json['total_price']?.toString(),
      );
    } catch (e) {
      logger.e('Error parsing OrderItem: $e, JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_type': productType,
      'product_type_detail': productTypeDetail?.toJson(),
      'quantity': quantity,
      'total_price': totalPrice,
    };
  }
}

// Helper function to parse int safely
int? _parseInt(dynamic value, String fieldName) {
  final logger = Logger();
  if (value == null) {
    // Tidak log warning untuk null
    return null;
  }
  if (value is int) {
    return value;
  }
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