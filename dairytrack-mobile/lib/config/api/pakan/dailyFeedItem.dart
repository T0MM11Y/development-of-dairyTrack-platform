import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';

/// Fetches all daily feed items with optional filters.
Future<List<FeedItem>> getDailyFeedItems({int? dailyFeedId, int? feedId}) async {
  final queryParams = <String, String>{};
  if (dailyFeedId != null) queryParams['daily_feed_id'] = dailyFeedId.toString();
  if (feedId != null) queryParams['feed_id'] = feedId.toString();

  final response = await fetchAPI(
    "dailyFeedItem",
    queryParams: queryParams.isEmpty ? null : queryParams,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['data'] as List<dynamic>? ?? [];
    return data.map((json) => FeedItem.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Failed to fetch daily feed items');
  }
}

/// Fetches feed items for a specific daily feed schedule.
Future<List<FeedItem>> getFeedItemsByScheduleId(int dailyFeedId) async {
  final response = await fetchAPI("dailyFeedItem/daily-feeds/$dailyFeedId");

  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['data'] as List<dynamic>? ?? [];
    return data.map((json) => FeedItem.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Failed to fetch feed items for schedule');
  }
}

/// Adds multiple feed items for a daily feed session.
Future<bool> addFeedItems(int dailyFeedId, List<FeedItem> feedItems) async {
  // Client-side validation
  if (feedItems.isEmpty) {
    throw Exception('At least one feed item is required');
  }
  if (feedItems.length > 3) {
    throw Exception('Maximum 3 feed items allowed per session');
  }

  // Check for duplicate feed_ids
  final feedIds = feedItems.map((item) => item.feedId).toList();
  final uniqueFeedIds = feedIds.toSet();
  if (feedIds.length != uniqueFeedIds.length) {
    final duplicates = feedIds
        .asMap()
        .entries
        .where((entry) => feedIds.indexOf(entry.value) != entry.key)
        .map((entry) => entry.value)
        .toSet();
    throw Exception('Duplicate feed types detected: $duplicates');
  }

  final response = await fetchAPI(
    "dailyFeedItem",
    method: "POST",
    data: {
      "daily_feed_id": dailyFeedId,
      "feed_items": feedItems.map((item) => {
        "feed_id": item.feedId,
        "quantity": item.quantity,
      }).toList(),
    },
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    if (response['errors'] != null && (response['errors'] as List).isNotEmpty) {
      // Handle partial success
      final errors = response['errors'] as List<dynamic>;
      throw Exception(
        'Some feed items failed to be added: ${errors.map((e) => e['error']).join(', ')}',
      );
    }
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to add feed items');
  }
}

/// Updates a single feed item.
Future<bool> updateFeedItem(int id, FeedItem feedItem) async {
  final response = await fetchAPI(
    "dailyFeedItem/$id",
    method: "PUT",
    data: {
      "quantity": feedItem.quantity,
    },
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to update feed item');
  }
}

/// Deletes a feed item.
Future<bool> deleteFeedItem(int id) async {
  final response = await fetchAPI(
    "dailyFeedItem/$id",
    method: "DELETE",
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to delete feed item');
  }
}

/// Bulk updates multiple feed items.
Future<bool> bulkUpdateFeedItems(List<FeedItem> feedItems) async {
  if (feedItems.isEmpty) {
    throw Exception('At least one feed item is required for bulk update');
  }

  final response = await fetchAPI(
    "dailyFeedItem/bulk-update",
    method: "POST",
    data: {
      "items": feedItems.map((item) => {
        "id": item.id,
        "quantity": item.quantity,
      }).toList(),
    },
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    final results = response['results'] as List<dynamic>? ?? [];
    final failedUpdates = results.where((r) => !(r['success'] as bool)).toList();
    if (failedUpdates.isNotEmpty) {
      throw Exception(
        'Some feed items failed to update: ${failedUpdates.map((r) => r['message']).join(', ')}',
      );
    }
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to bulk update feed items');
  }
}