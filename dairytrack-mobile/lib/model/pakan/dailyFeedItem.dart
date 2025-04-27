import 'package:dairy_track/model/pakan/feed.dart';

class FeedItem {
  final int id;
  final int dailyFeedId;
  final int feedId;
  final double quantity;
  final Feed? feed;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  FeedItem({
    required this.id,
    required this.dailyFeedId,
    required this.feedId,
    required this.quantity,
    this.feed,
    this.createdAt,
    this.updatedAt,
  });

  factory FeedItem.fromJson(Map<String, dynamic> json) {
    return FeedItem(
      id: json['id'] ?? 0,
      dailyFeedId: json['daily_feed_id'] ?? 0,
      feedId: json['feed_id'] ?? 0,
      quantity: json['quantity'] != null
          ? double.tryParse(json['quantity'].toString()) ?? 0.0
          : 0.0,
      feed: json['feed'] != null ? Feed.fromJson(json['feed']) : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'daily_feed_id': dailyFeedId,
      'feed_id': feedId,
      'quantity': quantity,
      if (feed != null) 'feed': feed!.toJson(),
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }
}