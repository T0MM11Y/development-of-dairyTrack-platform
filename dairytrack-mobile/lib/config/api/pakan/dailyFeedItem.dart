import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedNutrition.dart';

class FeedItemService {
  /// Adds multiple feed items to a daily feed schedule
  static Future<Map<String, dynamic>> addFeedItems({
    required int dailyFeedId,
    required List<Map<String, dynamic>> feedItems,
  }) async {
    try {
      final response = await fetchAPI(
        "dailyFeedItem",
        method: "POST",
        data: {
          'daily_feed_id': dailyFeedId,
          'feed_items': feedItems,
        },
      );

      if (response is Map<String, dynamic> && response['success'] == true) {
        return {
          'success': true,
          'message': response['message'] ?? 'Feed items added successfully',
          'data': response['data'],
          'errors': response['errors'] ?? [],
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to add feed items');
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Updates a single feed item
  static Future<Map<String, dynamic>> updateFeedItem({
    required int id,
    required double quantity,
  }) async {
    try {
      final response = await fetchAPI(
        "dailyFeedItem/$id",
        method: "PUT",
        data: {
          'quantity': quantity,
        },
      );

      if (response is Map<String, dynamic> && response['success'] == true) {
        return {
          'success': true,
          'message': response['message'] ?? 'Feed item updated successfully',
          'data': response['data'],
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to update feed item');
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Deletes a feed item
  static Future<Map<String, dynamic>> deleteFeedItem(int id) async {
    try {
      final response = await fetchAPI(
        "dailyFeedItem/$id",
        method: "DELETE",
      );

      if (response is Map<String, dynamic> && response['success'] == true) {
        return {
          'success': true,
          'message': response['message'] ?? 'Feed item deleted successfully',
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to delete feed item');
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Bulk updates multiple feed items
  static Future<Map<String, dynamic>> bulkUpdateFeedItems({
    required List<Map<String, dynamic>> items,
  }) async {
    try {
      final response = await fetchAPI(
        "dailyFeedItem/bulk-update",
        method: "PUT",
        data: {
          'items': items,
        },
      );

      if (response is Map<String, dynamic> && response['success'] == true) {
        return {
          'success': true,
          'message': response['message'] ?? 'Feed items updated successfully',
          'results': response['results'] ?? [],
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to update feed items');
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Gets all feed items with optional filters
  static Future<Map<String, dynamic>> getAllFeedItems({
    int? dailyFeedId,
    int? feedId,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (dailyFeedId != null) queryParams['daily_feed_id'] = dailyFeedId.toString();
      if (feedId != null) queryParams['feed_id'] = feedId.toString();

      final response = await fetchAPI(
        "dailyFeedItem",
        queryParams: queryParams.isEmpty ? null : queryParams,
      );

      if (response is Map<String, dynamic> && response['success'] == true) {
        return {
          'success': true,
          'data': response['data'],
          'count': response['count'] ?? 0,
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch feed items');
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Gets a single feed item by ID
  static Future<Map<String, dynamic>> getFeedItemById(int id) async {
    try {
      final response = await fetchAPI("dailyFeedItem/$id");

      if (response is Map<String, dynamic> && response['success'] == true) {
        return {
          'success': true,
          'data': response['data'],
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch feed item');
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Gets all feed items for a specific daily feed schedule
  static Future<Map<String, dynamic>> getFeedItemsByDailyFeedId(int dailyFeedId) async {
    try {
      final response = await fetchAPI("dailyFeedItem/daily-feed/$dailyFeedId");

      if (response is Map<String, dynamic> && response['success'] == true) {
        return {
          'success': true,
          'data': response['data'],
          'count': response['count'] ?? 0,
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch feed items');
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Gets feed usage statistics by date range
  static Future<Map<String, dynamic>> getFeedUsageByDate({
    String? startDate,
    String? endDate,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (startDate != null) queryParams['start_date'] = startDate;
      if (endDate != null) queryParams['end_date'] = endDate;

      final response = await fetchAPI(
        "dailyFeedItem/usage",
        queryParams: queryParams.isEmpty ? null : queryParams,
      );

      if (response is Map<String, dynamic> && response['success'] == true) {
        return {
          'success': true,
          'data': response['data'],
        };
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch feed usage');
      }
    } catch (e) {
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }
}