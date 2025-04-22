import 'package:dairy_track/model/pakan/feedType.dart';

class Feed {
  final int id;
  final int? typeId; // Nullable for partial data
  final String name;
  final double? protein;
  final double? energy;
  final double? fiber;
  final int? minStock;
  final double? price;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final FeedType? feedType;

  Feed({
    required this.id,
    this.typeId,
    required this.name,
    this.protein,
    this.energy,
    this.fiber,
    this.minStock,
    this.price,
    this.createdAt,
    this.updatedAt,
    this.feedType,
  });

  factory Feed.fromJson(Map<String, dynamic> json) {
    return Feed(
      id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      typeId: json['typeId'] != null
          ? int.tryParse(json['typeId']?.toString() ?? '0') ?? 0
          : null,
      name: json['name']?.toString() ?? 'Unknown',
      protein: json['protein'] != null
          ? double.tryParse(json['protein']?.toString() ?? '0.0') ?? 0.0
          : null,
      energy: json['energy'] != null
          ? double.tryParse(json['energy']?.toString() ?? '0.0') ?? 0.0
          : null,
      fiber: json['fiber'] != null
          ? double.tryParse(json['fiber']?.toString() ?? '0.0') ?? 0.0
          : null,
      minStock: json['min_stock'] != null
          ? int.tryParse(json['min_stock']?.toString() ?? '0') ?? 0
          : null,
      price: json['price'] != null
          ? double.tryParse(json['price']?.toString() ?? '0.0') ?? 0.0
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime(1970, 1, 1)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime(1970, 1, 1)
          : null,
      feedType: json['feedType'] != null ? FeedType.fromJson(json['feedType']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'typeId': typeId,
      'name': name,
      'protein': protein,
      'energy': energy,
      'fiber': fiber,
      'min_stock': minStock,
      'price': price,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'feedType': feedType?.toJson(),
    };
  }
}