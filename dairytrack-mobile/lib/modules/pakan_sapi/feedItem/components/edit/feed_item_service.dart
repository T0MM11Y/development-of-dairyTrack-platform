import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/pakan/dailyFeedItem.dart';
import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/config/api/pakan/feedStock.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:logging/logging.dart';

class FeedItemService {
  static final Logger _logger = Logger('FeedItemService');

  // Initialize logging
  static void initLogging() {
    Logger.root.level = Level.ALL; // Adjust log level as needed
    Logger.root.onRecord.listen((record) {
      debugPrint('${record.level.name}: ${record.time}: ${record.message}');
    });
  }

  /// Loads data for the EditFeedItemPage
  static Future<void> loadData({
    required int dailyFeedId,
    required Function(
      DailyFeedSchedule,
      List<FeedItem>,
      List<Feed>,
      List<FeedStock>,
      Map<int, Cow>,
      List<Map<String, dynamic>>,
    ) onSuccess,
    required Function(String) onError,
  }) async {
    try {
      _logger.info("Loading data for dailyFeedId: $dailyFeedId");

      final results = await Future.wait([
        getDailyFeedById(dailyFeedId),
        getFeedItemsByDailyFeedId(dailyFeedId),
        getAllFeeds(),
        getAllFeedStocks(),
        getCows(),
      ]).timeout(const Duration(seconds: 10), onTimeout: () {
        throw Exception(
            'Timeout while loading data. Check your internet connection.');
      });

      final dailyFeed = results[0] as DailyFeedSchedule;
      final feedItemsResponse = results[1] as Map<String, dynamic>;
      final feedsList = results[2] as List<Feed>;
      final feedStocksList = results[3] as List<FeedStock>;
      final cowsList = results[4] as List<Cow>;

      _logger.info("Feed items response: $feedItemsResponse");

      final feedItems = feedItemsResponse['success'] == true
          ? (feedItemsResponse['data'] as List<dynamic>? ?? []).map((item) {
              _logger.fine("Parsing feed item: $item");
              return FeedItem.fromJson(item);
            }).toList()
          : <FeedItem>[];

      if (feedItems.isEmpty) {
        _logger.warning(
            "No feed items from getFeedItemsByDailyFeedId, trying getAllFeedItems...");
        final allFeedItemsResponse = await getAllFeedItems();
        _logger.info("All feed items response: $allFeedItemsResponse");
        if (allFeedItemsResponse['success'] == true) {
          final allFeedItems =
              (allFeedItemsResponse['data'] as List<dynamic>? ?? [])
                  .map((item) => FeedItem.fromJson(item))
                  .toList();
          feedItems.addAll(
            allFeedItems.where((item) => item.dailyFeedId == dailyFeedId),
          );
        }
      }

      final cowsMap = <int, Cow>{};
      for (var cow in cowsList) {
        if (cow.id != null) {
          if (cowsMap.containsKey(cow.id)) {
            _logger.warning('Overwriting duplicate cow ID: ${cow.id}');
          }
          cowsMap[cow.id!] = cow;
        } else {
          _logger.warning('Skipping cow with null ID: ${cow.name}');
        }
      }

      final formList = feedItems
          .map((item) => <String, dynamic>{
                'id': item.id,
                'feed_id': item.feedId,
                'quantity': item.quantity.toString(),
                'daily_feed_id': item.dailyFeedId,
              })
          .toList();

      onSuccess(dailyFeed, feedItems, feedsList, feedStocksList, cowsMap, formList);
    } catch (e) {
      String errorMsg;
      if (e.toString().contains('timeout')) {
        errorMsg = 'Timeout while loading data. Check your internet connection.';
      } else if (e.toString().contains('404')) {
        errorMsg = 'Data not found. Please try again.';
      } else {
        errorMsg = 'Failed to load data: $e';
      }
      _logger.severe("Error loading data: $e");
      onError(errorMsg);
    }
  }

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
      _logger.severe("Error adding feed items: $e");
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
      _logger.severe("Error updating feed item: $e");
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
      _logger.severe("Error deleting feed item: $e");
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
      _logger.severe("Error bulk updating feed items: $e");
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
      if (dailyFeedId != null)
        queryParams['daily_feed_id'] = dailyFeedId.toString();
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
      _logger.severe("Error fetching all feed items: $e");
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
      _logger.severe("Error fetching feed item by ID: $e");
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }

  /// Gets all feed items for a specific daily feed schedule
  static Future<Map<String, dynamic>> getFeedItemsByDailyFeedId(
      int dailyFeedId) async {
    try {
      final response = await fetchAPI("dailyFeedItem/daily-feed/$dailyFeedId");
      _logger.info("API Response: $response");
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
      _logger.severe("Error in getFeedItemsByDailyFeedId: $e");
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
      _logger.severe("Error fetching feed usage: $e");
      return {
        'success': false,
        'message': e.toString(),
      };
    }
  }
}