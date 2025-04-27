import 'package:dairy_track/model/pakan/feed.dart';

class FeedStock {
  final int? id;
  final int feedId;
  final double stock;
  final Feed? feed;
  final DateTime createdAt;
  final DateTime updatedAt;

  FeedStock({
    this.id,
    required this.feedId,
    required this.stock,
    this.feed,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory FeedStock.fromJson(Map<String, dynamic> json) {
    // Try multiple possible field names for the Feed data
    Map<String, dynamic>? feedData = json['Feed'];

    if (feedData == null) feedData = json['feed'];
    if (feedData == null && json['feed_data'] != null)
      feedData = json['feed_data'];

    return FeedStock(
      id: json['id'],
      feedId: json['feedId'] ?? json['feed_id'] ?? 0,
      stock: json['stock'] != null
          ? double.tryParse(json['stock'].toString()) ?? 0.0
          : 0.0,
      feed: feedData != null ? Feed.fromJson(feedData) : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }
  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'feedId': feedId,
      'stock': stock,
      if (feed != null) 'Feed': feed!.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}
