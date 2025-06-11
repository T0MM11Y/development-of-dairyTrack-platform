import 'package:intl/intl.dart';
import './feedType.dart';
import './nutrition.dart';

// Helper function to format numbers without trailing zeros
String formatNumber(double value) {
  final formatter = NumberFormat('#,##0', 'id_ID'); // Indonesian locale
  return formatter.format(value);
}

// Helper function to format price with "Rp" and no trailing zeros
String formatPrice(double price) {
  return 'Rp ${formatNumber(price)}';
}

class Feed {
  final int id;
  final int typeId;
  final String typeName;
  final String name;
  final String unit;
  final double minStock;
  final double price;
  final String createdAt;
  final String updatedAt;
  final List<Map<String, dynamic>> nutrisiList;

  Feed({
    required this.id,
    required this.typeId,
    required this.typeName,
    required this.name,
    required this.unit,
    required this.minStock,
    required this.price,
    required this.createdAt,
    required this.updatedAt,
    required this.nutrisiList,
  });

  factory Feed.fromJson(Map<String, dynamic> json) {
    return Feed(
      id: json['id'],
      typeId: json['type_id'],
      typeName: json['type_name'] ?? 'Unknown Type',
      name: json['name'],
      unit: json['unit'],
      minStock: json['min_stock'] is num
          ? (json['min_stock'] as num).toDouble()
          : double.tryParse(json['min_stock']?.toString() ?? '') ?? 0.0,
      price: json['price'] is num
          ? (json['price'] as num).toDouble()
          : double.tryParse(json['price']?.toString() ?? '') ?? 0.0,
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      nutrisiList: (json['nutrisi_records'] as List<dynamic>?)
              ?.map((e) => {
                    'id': e['nutrisi_id'],
                    'name': e['nutrisi_name'],
                    'unit': e['unit'],
                    'amount': double.tryParse(e['amount']?.toString() ?? '') ?? 0.0,
                  })
              .toList() ??
          [],
    );
  }
}