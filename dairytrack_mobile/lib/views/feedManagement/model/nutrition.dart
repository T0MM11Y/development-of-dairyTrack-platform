import 'package:flutter/material.dart';

class Nutrisi {
  final int id;
  final String name;
  final String unit;
  final String createdAt;
  final String updatedAt;

  Nutrisi({
    required this.id,
    required this.name,
    required this.unit,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Nutrisi.fromJson(Map<String, dynamic> json) {
    return Nutrisi(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      unit: json['unit'] ?? '',
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
    );
  }
}