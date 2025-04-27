import 'package:dairy_track/model/pakan/nutrition.dart';

class FeedNutrisi {
  int? id;
  final int feedId;
  final int nutrisiId;
  final double amount;
  final Nutrisi? nutrisi;
  final DateTime createdAt;
  final DateTime updatedAt;

  FeedNutrisi({
    this.id,
    required this.feedId,
    required this.nutrisiId,
    this.amount = 0.0,
    this.nutrisi,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory FeedNutrisi.fromJson(Map<String, dynamic> json) {
    return FeedNutrisi(
      id: json['id'],
      feedId: json['feed_id'] ?? 0,
      nutrisiId: json['nutrisi_id'] ?? 0,
      amount: json['amount'] != null
          ? double.tryParse(json['amount'].toString()) ?? 0.0
          : 0.0,
      nutrisi: json['Nutrisi'] != null
          ? Nutrisi.fromJson(json['Nutrisi'])
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'feed_id': feedId,
      'nutrisi_id': nutrisiId,
      'amount': amount,
      if (nutrisi != null) 'Nutrisi': nutrisi!.toJson(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}