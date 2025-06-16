class DailyFeed {
  final int id;
  final int cowId;
  final String cowName;
  final String date;
  final String session;
  final String weather;
  final Map<String, dynamic> totalNutrients;
  final int userId;
  final String userName;
  final Map<String, dynamic> createdBy;
  final Map<String, dynamic> updatedBy;
  final String createdAt;
  final String updatedAt;

  DailyFeed({
    required this.id,
    required this.cowId,
    required this.cowName,
    required this.date,
    required this.session,
    required this.weather,
    required this.totalNutrients,
    required this.userId,
    required this.userName,
    required this.createdBy,
    required this.updatedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DailyFeed.fromJson(Map<String, dynamic> json) {
    try {
      return DailyFeed(
        id: json['id'] is int
            ? json['id']
            : int.tryParse(json['id'].toString()) ?? 0,
        cowId: json['cow_id'] is int
            ? json['cow_id']
            : int.tryParse(json['cow_id'].toString()) ?? 0,
        cowName: json['cow_name'] ?? 'Unknown Cow',
        date: json['date'] ?? '',
        session: json['session'] ?? '',
        weather: json['weather'] ?? 'Tidak ada data',
        totalNutrients: json['total_nutrients'] is Map
            ? json['total_nutrients']
            : (json['total_nutrients'] is List
                ? {}
                : json['total_nutrients'] ?? {}),
        userId: json['user_id'] is int
            ? json['user_id']
            : int.tryParse(json['user_id'].toString()) ?? 0,
        userName: json['user_name'] ?? 'Unknown User',
        createdBy: json['created_by'] ?? {'id': 0, 'name': 'Unknown'},
        updatedBy: json['updated_by'] ?? {'id': 0, 'name': 'Unknown'},
        createdAt: json['created_at'] ?? '',
        updatedAt: json['updated_at'] ?? '',
      );
    } catch (e) {
      print('Error parsing DailyFeed: $e, JSON: $json');
      rethrow;
    }
  }
}