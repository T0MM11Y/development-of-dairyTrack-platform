import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';

// GET all feed stocks
Future<List<FeedStock>> getFeedStocks() async {
  final response = await fetchAPI("feedStock");
  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['stocks'] as List<dynamic>? ?? [];
    return data.map((json) => FeedStock.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Unexpected response format');
  }
}

// GET a single feed stock by ID
Future<FeedStock> getFeedStockById(int id) async {
  final response = await fetchAPI("feedStock/$id");
  if (response is Map<String, dynamic> && response['success'] == true) {
    return FeedStock.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Failed to fetch feed stock by ID');
  }
}

// CREATE a new feed stock
Future<bool> addFeedStock(Map<String, dynamic> payload) async {
  final response = await fetchAPI(
    "feedStock/add",
    method: "POST",
    data: payload,
  );
  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to add feed stock');
  }
}

// UPDATE a feed stock
Future<bool> updateFeedStock(int id, FeedStock feedStock) async {
  final response = await fetchAPI(
    "feedStock/$id",
    method: "PUT",
    data: feedStock.toJson(),
  );
  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to update feed stock');
  }
}

// DELETE a feed stock
Future<bool> deleteFeedStock(int id) async {
  final response = await fetchAPI("feedStock/$id", method: "DELETE");
  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to delete feed stock');
  }
}