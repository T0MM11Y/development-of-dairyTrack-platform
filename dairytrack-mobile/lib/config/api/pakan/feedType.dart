import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/feedType.dart';

/// Fetches all feed types.
Future<List<FeedType>> getAllFeedTypes() async {
  final response = await fetchAPI("feedType");

  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['feedTypes'] as List<dynamic>? ?? [];
    return data.map((json) => FeedType.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Gagal mengambil daftar jenis pakan');
  }
}

/// Fetches a single feed type by ID.
Future<FeedType> getFeedTypeById(int id) async {
  final response = await fetchAPI("feedType/$id");

  if (response is Map<String, dynamic>) {
    return FeedType.fromJson(response['feedType']);
  } else {
    throw Exception(response['message'] ?? 'Gagal mengambil jenis pakan berdasarkan ID');
  }
}

/// Creates a new feed type.
Future<FeedType> addFeedType({
  required String name,
}) async {
  final data = {
    'name': name.trim(),
  };

  final response = await fetchAPI(
    "feedType",
    method: "POST",
    data: data,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return FeedType.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Gagal membuat jenis pakan baru');
  }
}

/// Updates an existing feed type.
Future<FeedType> updateFeedType({
  required int id,
  required String name,
}) async {
  final data = {
    'name': name.trim(),
  };

  final response = await fetchAPI(
    "feedType/$id",
    method: "PUT",
    data: data,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return FeedType.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Gagal memperbarui jenis pakan');
  }
}

/// Deletes a feed type by ID.
Future<bool> deleteFeedType(int id) async {
  final response = await fetchAPI(
    "feedType/$id",
    method: "DELETE",
  );

  if (response is Map<String, dynamic>) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Gagal menghapus jenis pakan');
  }
}