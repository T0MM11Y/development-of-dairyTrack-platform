import 'package:dairy_track/model/pakan/feedNutrition.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:dairy_track/model/pakan/feedType.dart';

class Feed {
  int? id;
  final int typeId;
  final String name;
  final int minStock;
  final double price;
  final DateTime createdAt;
  final DateTime updatedAt;
  final FeedType? feedType;
  final List<FeedNutrisi>? feedNutrisiRecords;
  final FeedStock? feedStock;

  Feed({
    this.id,
    required this.typeId,
    required this.name,
    this.minStock = 0,
    this.price = 0.0,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.feedType,
    this.feedNutrisiRecords,
    this.feedStock,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory Feed.fromJson(Map<String, dynamic> json) {
    return Feed(
      id: json['id'],
      typeId: json['typeId'] ?? json['type_id'] ?? 0,
      name: json['name'] ?? '',
      minStock: json['min_stock'] ?? 0,
      price: json['price'] != null
          ? double.tryParse(json['price'].toString()) ?? 0.0
          : 0.0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
      feedType: json['FeedType'] != null
          ? FeedType.fromJson(json['FeedType'])
          : null,
      feedNutrisiRecords: json['FeedNutrisiRecords'] != null
          ? (json['FeedNutrisiRecords'] as List<dynamic>)
              .map((e) => FeedNutrisi.fromJson(e))
              .toList()
          : null,
      feedStock: json['FeedStock'] != null
          ? FeedStock.fromJson(json['FeedStock'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'typeId': typeId,
      'name': name,
      'min_stock': minStock,
      'price': price,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      if (feedType != null) 'FeedType': feedType!.toJson(),
      if (feedNutrisiRecords != null)
        'FeedNutrisiRecords': feedNutrisiRecords!.map((e) => e.toJson()).toList(),
      if (feedStock != null) 'FeedStock': feedStock!.toJson(),
    };
  }
}