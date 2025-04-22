// File: lib/config/api/pakan/feed.dart
import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/feed.dart';

// GET all feeds
Future<List<Feed>> getFeeds() async {
  final response = await fetchAPI("feed");
  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['feeds'] as List<dynamic>? ?? [];
    return data.map((json) => Feed.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Unexpected response format');
  }
}

// GET a single feed by ID
Future<Feed> getFeedById(int id) async {
  final response = await fetchAPI("feed/$id");
  if (response is Map<String, dynamic> && response['success'] == true) {
    return Feed.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Failed to fetch feed by ID');
  }
}

// CREATE a new feed
Future<bool> addFeed(Feed feed) async {
  final response = await fetchAPI(
    "feed",
    method: "POST",
    data: feed.toJson(),
  );
  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to add feed');
  }
}

// UPDATE a feed
Future<bool> updateFeed(int id, Feed feed) async {
  final response = await fetchAPI(
    "feed/$id",
    method: "PUT",
    data: feed.toJson(),
  );
  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to update feed');
  }
}

// DELETE a feed
Future<bool> deleteFeed(int id) async {
  final response = await fetchAPI("feed/$id", method: "DELETE");
  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to delete feed');
  }
}