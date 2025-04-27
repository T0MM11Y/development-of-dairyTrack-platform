import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedNutrition.dart';

/// Fetches all feeds with optional filters.
Future<List<Feed>> getAllFeeds({int? typeId, String? name}) async {
  final queryParams = <String, String>{};
  if (typeId != null) queryParams['typeId'] = typeId.toString();
  if (name != null) queryParams['name'] = name;

  final response = await fetchAPI(
    "feed",
    queryParams: queryParams.isEmpty ? null : queryParams,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['data'];
    // Handle both single object and list cases
    final feeds = data is List
        ? data.map((json) => Feed.fromJson(json)).toList()
        : [Feed.fromJson(data)]; // Wrap single object in a list
    return feeds;
  } else {
    throw Exception(response['error'] ?? 'Gagal mengambil daftar pakan');
  }
}

/// Fetches a single feed by ID.
Future<Feed> getFeedById(int id) async {
  final response = await fetchAPI("feed/$id");

  if (response is Map<String, dynamic> && response['success'] == true) {
    return Feed.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Gagal mengambil pakan berdasarkan ID');
  }
}

/// Creates a new feed with optional nutrient list.
Future<Feed> createFeed({
  required int typeId,
  required String name,
  required int minStock,
  required double price,
  List<FeedNutrisi>? nutrisiList,
}) async {
  // Prepare the data map for the API
  final data = {
    'typeId': typeId,
    'name': name.trim(),
    'min_stock': minStock,
    'price': price,
    if (nutrisiList != null && nutrisiList.isNotEmpty)
      'nutrisiList': nutrisiList
          .map((item) => {
                'nutrisi_id': item.nutrisiId,
                'amount': item.amount,
              })
          .toList(),
  };

  try {
    print('Sending data to API: $data');

    final response = await fetchAPI(
      "feed",
      method: "POST",
      data: data,
    );

    if (response is Map<String, dynamic> && response['success'] == true) {
      return Feed.fromJson(response['data']);
    } else {
      throw Exception(response['error'] ?? 'Gagal membuat pakan baru');
    }
  } catch (e) {
    print('Exception in createFeed: $e');
    rethrow;
  }
}

/// Updates an existing feed.
Future<Feed> updateFeed({
  required int id,
  int? typeId,
  String? name,
  int? minStock,
  double? price,
  List<FeedNutrisi>? nutrisiList,
}) async {
  // Prepare the data map, only including non-null fields
  final data = <String, dynamic>{};
  if (typeId != null) data['typeId'] = typeId;
  if (name != null) data['name'] = name.trim();
  if (minStock != null) data['min_stock'] = minStock;
  if (price != null) data['price'] = price;
  if (nutrisiList != null && nutrisiList.isNotEmpty) {
    data['nutrisiList'] = nutrisiList
        .map((n) => {
              'nutrisi_id': n.nutrisiId,
              'amount': n.amount,
            })
        .toList();
  }

  try {
    print('Sending update data to API: $data');

    final response = await fetchAPI(
      "feed/$id",
      method: "PUT",
      data: data,
    );

    if (response is Map<String, dynamic> && response['success'] == true) {
      return Feed.fromJson(response['data']);
    } else {
      throw Exception(response['error'] ?? 'Gagal memperbarui pakan');
    }
  } catch (e) {
    print('Exception in updateFeed: $e');
    rethrow;
  }
}

/// Deletes a feed by ID.
Future<bool> deleteFeed(int id) async {
  final response = await fetchAPI(
    "feed/$id",
    method: "DELETE",
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['error'] ?? 'Gagal menghapus pakan');
  }
}