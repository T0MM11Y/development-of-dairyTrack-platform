class DailyFeedItem {
  final int id;
  final int dailyFeedId;
  final int feedId;
  final String feedName;
  final double quantity;
  final int userId;
  final Map<String, dynamic> createdBy;
  final Map<String, dynamic> updatedBy;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<Map<String, dynamic>> nutrients;

  DailyFeedItem({
    required this.id,
    required this.dailyFeedId,
    required this.feedId,
    required this.feedName,
    required this.quantity,
    required this.userId,
    required this.createdBy,
    required this.updatedBy,
    required this.createdAt,
    required this.updatedAt,
    required this.nutrients,
  });

  factory DailyFeedItem.fromJson(Map<String, dynamic> json) {
    print('Parsing DailyFeedItem: $json'); // Debug
    try {
      return DailyFeedItem(
        id: json['id'] as int? ?? 0,
        dailyFeedId: json['daily_feed_id'] as int? ?? 0,
        feedId: json['feed_id'] as int? ?? 0,
        feedName: json['feed_name'] as String? ?? 'Unknown Feed',
        quantity: (json['quantity'] as num?)?.toDouble() ?? 0.0,
        userId: json['user_id'] as int? ?? 0,
        createdBy: json['created_by'] as Map<String, dynamic>? ?? {'id': 0, 'name': 'Unknown'},
        updatedBy: json['updated_by'] as Map<String, dynamic>? ?? {'id': 0, 'name': 'Unknown'},
        createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
        updatedAt: DateTime.tryParse(json['updated_at'] as String? ?? '') ?? DateTime.now(),
        nutrients: (json['nutrients'] as List<dynamic>?)
                ?.map((n) => {
                      'nutrisi_id': n['nutrisi_id'] as int? ?? 0,
                      'nutrisi_name': n['nutrisi_name'] as String? ?? 'Unknown',
                      'unit': n['unit'] as String? ?? '',
                      'amount': (n['amount'] as num?)?.toDouble() ?? 0.0,
                    })
                .toList() ??
            [],
      );
    } catch (e) {
      print('DailyFeedItem Parse Error: $e for JSON: $json'); // Debug
      rethrow;
    }
  }
}