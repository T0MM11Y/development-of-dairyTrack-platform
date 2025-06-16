class DailyFeedItem {
  final int id;
  final int dailyFeedId;
  final int feedId;
  final String feedName;
  final double quantity;
  final int userId;
  final Map<String, dynamic> createdBy;
  final Map<String, dynamic> updatedBy;
  final String createdAt;
  final String updatedAt;
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
    try {
      return DailyFeedItem(
        id: json['id'] is String ? int.parse(json['id']) : (json['id'] as int),
        dailyFeedId: json['daily_feed_id'] is String ? int.parse(json['daily_feed_id']) : (json['daily_feed_id'] as int),
        feedId: json['feed_id'] is String ? int.parse(json['feed_id']) : (json['feed_id'] as int),
        feedName: json['feed_name'] as String? ?? 'Unknown Feed',
        quantity: json['quantity'] is String ? double.parse(json['quantity']) : (json['quantity'] as num).toDouble(),
        userId: json['user_id'] is String ? int.parse(json['user_id']) : (json['user_id'] as int),
        createdBy: json['created_by'] as Map<String, dynamic>? ?? {'id': 0, 'name': 'Unknown'},
        updatedBy: json['updated_by'] as Map<String, dynamic>? ?? {'id': 0, 'name': 'Unknown'},
        createdAt: json['created_at'] as String? ?? '',
        updatedAt: json['updated_at'] as String? ?? '',
        nutrients: (json['nutrients'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ?? [],
      );
    } catch (e) {
      print('Error parsing DailyFeedItem: $e, JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'daily_feed_id': dailyFeedId,
    'feed_id': feedId,
    'feed_name': feedName,
    'quantity': quantity,
    'user_id': userId,
    'created_by': createdBy,
    'updated_by': updatedBy,
    'created_at': createdAt,
    'updated_at': updatedAt,
    'nutrients': nutrients,
  };
}