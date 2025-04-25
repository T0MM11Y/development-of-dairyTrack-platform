// File: lib/model/pakan/dailyFeedItem.dart

import 'package:dairy_track/model/pakan/feed.dart';

class FeedItem {
  final int id;
  final int dailyFeedId;
  final int feedId;
  final double quantity;
  final Feed? feed; // Reference to the Feed model, made nullable

  FeedItem({
    required this.id,
    required this.dailyFeedId,
    required this.feedId,
    required this.quantity,
    this.feed,
  });

  // Create a FeedItem from a JSON object
  factory FeedItem.fromJson(Map<String, dynamic> json) {
    return FeedItem(
      id: json['id'] is int
          ? json['id']
          : int.tryParse(json['id'].toString()) ?? 0,
      dailyFeedId: json['daily_feed_id'] is int
          ? json['daily_feed_id']
          : int.tryParse(json['daily_feed_id'].toString()) ?? 0,
      feedId: json['feed_id'] is int
          ? json['feed_id']
          : int.tryParse(json['feed_id'].toString()) ?? 0,
      quantity: json['quantity'] is double
          ? json['quantity']
          : double.tryParse(json['quantity'].toString()) ?? 0.0,
      feed: json['feed'] != null && json['feed'] is Map<String, dynamic>
          ? Feed.fromJson(json['feed'])
          : null,
    );
  }

  // Convert a FeedItem to a JSON object
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'daily_feed_id': dailyFeedId,
      'feed_id': feedId,
      'quantity': quantity,
      // We typically don't include nested objects when sending to API
      // but you can uncomment the line below if needed
      // 'feed': feed?.toJson(),
    };
  }

  // Create a copy of this FeedItem with given fields replaced with new values
  FeedItem copyWith({
    int? id,
    int? dailyFeedId,
    int? feedId,
    double? quantity,
    Feed? feed,
  }) {
    return FeedItem(
      id: id ?? this.id,
      dailyFeedId: dailyFeedId ?? this.dailyFeedId,
      feedId: feedId ?? this.feedId,
      quantity: quantity ?? this.quantity,
      feed: feed ?? this.feed,
    );
  }
}
