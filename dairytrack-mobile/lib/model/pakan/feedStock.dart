// File: lib/model/pakan/feed_stock.dart
import 'package:dairy_track/model/pakan/feed.dart';

class FeedStock {
  final int id;
  final int feedId;
  final double stock;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Feed? feed;

  FeedStock({
    required this.id,
    required this.feedId,
    required this.stock,
    required this.createdAt,
    required this.updatedAt,
    this.feed,
  });

  factory FeedStock.fromJson(Map<String, dynamic> json) {
    return FeedStock(
      id: int.parse(json['id'].toString()),
      feedId: int.parse(json['feedId'].toString()),
      stock: double.parse(json['stock'].toString()),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime(1970, 1, 1),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime(1970, 1, 1),
      feed: json['feed'] != null ? Feed.fromJson(json['feed']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'feedId': feedId,
      'stock': stock,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'feed': feed?.toJson(),
    };
  }
}