class TopicBlog {
  int? id;
  final String topic;
  final DateTime createdAt;
  final DateTime updatedAt;

  TopicBlog({
    this.id,
    required this.topic,
    required this.createdAt,
    required this.updatedAt,
  });

  // Factory method untuk membuat instance dari JSON
  factory TopicBlog.fromJson(Map<String, dynamic> json) {
    return TopicBlog(
      id: json['id'] != null ? int.tryParse(json['id'].toString()) : null,
      topic: json['topic'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  // Metode untuk mengubah instance menjadi JSON
  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'topic': topic,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
