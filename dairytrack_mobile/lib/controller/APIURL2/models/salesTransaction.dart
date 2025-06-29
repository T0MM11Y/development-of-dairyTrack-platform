// salesTransactionModel.dart
import 'package:dairytrack_mobile/controller/APIURL2/models/order.dart';
import 'package:logger/logger.dart';

class SalesTransaction {
  final int id;
  final Order order;
  final DateTime transactionDate;
  final int quantity;
  final String totalPrice;
  final String paymentMethod;

  SalesTransaction({
    required this.id,
    required this.order,
    required this.transactionDate,
    required this.quantity,
    required this.totalPrice,
    required this.paymentMethod,
  });

  factory SalesTransaction.fromJson(Map<String, dynamic> json) {
    final logger = Logger();
    try {
      return SalesTransaction(
        id: _parseInt(json['id'], 'id') ?? 0,
        order: Order.fromJson(json['order'] ?? {}),
        transactionDate: json['transaction_date'] != null
            ? DateTime.parse(json['transaction_date'])
            : DateTime.now(),
        quantity: _parseInt(json['quantity'], 'quantity') ?? 0,
        totalPrice: json['total_price']?.toString() ?? '0.00',
        paymentMethod: json['payment_method']?.toString() ?? 'Unknown',
      );
    } catch (e) {
      logger.e('Error parsing SalesTransaction: $e, JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'order': order.toJson(),
      'transaction_date': transactionDate.toIso8601String(),
      'quantity': quantity,
      'total_price': totalPrice,
      'payment_method': paymentMethod,
    };
  }
}

// Helper function to parse int safely
int? _parseInt(dynamic value, String fieldName) {
  final logger = Logger();
  if (value == null) {
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