class FeedType {
  final int id;
  final String name;
  final DateTime createdAt;
  final DateTime updatedAt;

  FeedType({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FeedType.fromJson(Map<String, dynamic> json) {
    return FeedType(
      id: int.parse(json['id'].toString()), // Convert id to int
      name: json['name'] ?? 'Unknown',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime(1970, 1, 1),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime(1970, 1, 1),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is FeedType &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          name == other.name;

  @override
  int get hashCode => id.hashCode ^ name.hashCode;
}