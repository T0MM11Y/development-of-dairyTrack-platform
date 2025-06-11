import 'package:flutter/material.dart';

class FeedType {
  final int id;
  final String name;
  final String createdAt;
  final String updatedAt;

  FeedType({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FeedType.fromJson(Map<String, dynamic> json) {
    return FeedType(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
    );
  }
}