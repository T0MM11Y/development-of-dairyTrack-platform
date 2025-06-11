// In feedStockHistoryModel.dart
import 'package:intl/intl.dart'; // For formatNumber

class FeedStockHistoryModel {
  final int id;
  final int feedStockId;
  final int feedId;
  final int userId;
  final String action;
  final double stock;
  final double? previousStock;
  final String createdAt;
  final String feedName;
  final String unit;
  final String keterangan;

  FeedStockHistoryModel({
    required this.id,
    required this.feedStockId,
    required this.feedId,
    required this.userId,
    required this.action,
    required this.stock,
    this.previousStock,
    required this.createdAt,
    required this.feedName,
    required this.unit,
    required this.keterangan,
  });

  factory FeedStockHistoryModel.fromJson(Map<String, dynamic> json, String feedName, String unit) {
    final stock = json['stock'] is num
        ? (json['stock'] as num).toDouble()
        : double.tryParse(json['stock']?.toString() ?? '') ?? 0.0;
    final previousStock = json['previous_stock'] is num
        ? (json['previous_stock'] as num).toDouble()
        : double.tryParse(json['previous_stock']?.toString() ?? '');
    final action = json['action']?.toString().toUpperCase() ?? 'UNKNOWN';
    final userId = json['user_id'] is num ? (json['user_id'] as num).toInt() : 0;
    final createdAt = json['created_at']?.toString() ?? '';

    String keterangan;
    final userDisplay = 'User $userId'; // Placeholder for userName
    if (action == 'CREATE') {
      keterangan = '$userDisplay added ${formatNumber(stock)}$unit of $feedName';
    } else if (action == 'UPDATE' && previousStock != null) {
      keterangan = '$userDisplay updated $feedName from ${formatNumber(previousStock)}$unit to ${formatNumber(stock)}$unit';
    } else {
      keterangan = '$userDisplay performed $action on $feedName';
    }

    return FeedStockHistoryModel(
      id: json['id'] is num ? (json['id'] as num).toInt() : 0,
      feedStockId: json['feed_stock_id'] is num ? (json['feed_stock_id'] as num).toInt() : 0,
      feedId: json['feed_id'] is num ? (json['feed_id'] as num).toInt() : 0,
      userId: userId,
      action: action,
      stock: stock,
      previousStock: previousStock,
      createdAt: createdAt,
      feedName: feedName,
      unit: unit,
      keterangan: keterangan,
    );
  }
}

String formatNumber(double value) {
  final String formatted = value.toStringAsFixed(2).replaceAll(RegExp(r'\.0+$'), '');
  final formatter = NumberFormat('#,##0', 'id_ID');
  return formatter.format(double.parse(formatted));
}