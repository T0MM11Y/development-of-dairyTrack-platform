class FeedStockModel {
  final int id;
  final int feedId;
  final String feedName;
  final double stock;
  final String unit;
  final String updatedAt;

  FeedStockModel({
    required this.id,
    required this.feedId,
    required this.feedName,
    required this.stock,
    required this.unit,
    required this.updatedAt,
  });

  factory FeedStockModel.fromJson(Map<String, dynamic> json, String feedName, String unit) {
    final stockData = json['stock'] ?? {};
    return FeedStockModel(
      id: stockData['id'] is num ? (stockData['id'] as num).toInt() : 0,
      feedId: stockData['feed_id'] is num ? (stockData['feed_id'] as num).toInt() : 0,
      feedName: feedName,
      stock: stockData['stock'] is num
          ? (stockData['stock'] as num).toDouble()
          : double.tryParse(stockData['stock']?.toString() ?? '0') ?? 0.0,
      unit: unit,
      updatedAt: stockData['updated_at']?.toString() ?? '',
    );
  }
}