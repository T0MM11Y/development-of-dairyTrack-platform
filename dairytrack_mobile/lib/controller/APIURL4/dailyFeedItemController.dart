import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class DailyFeedItemManagementController {
  final String baseUrl = '$API_URL1/daily_feed_item';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Add Feed Item
  Future<Map<String, dynamic>> addFeedItem({
  required int dailyFeedId,
  required List<Map<String, dynamic>> feedItems,
  required int userId,
}) async {
  try {
    final url = Uri.parse('$baseUrl');
    final response = await http.post(
      url,
      headers: _headers,
      body: jsonEncode({
        'daily_feed_id': dailyFeedId,
        'feed_items': feedItems,
        'user_id': userId,
        'created_by': userId,
        'updated_by': userId,
      }),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final responseData = jsonDecode(response.body);
      return {
        'success': true,
        'message': responseData['message'] ?? 'Item pakan berhasil ditambahkan',
        'data': responseData['data'],
        'errors': responseData['errors'],
      };
    } else {
      try {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Failed to add feed item',
          'errors': errorData['errors'],
          'duplicates': errorData['duplicates'],
        };
      } catch (e) {
        return {
          'success': false,
          'message': 'Failed to add feed item',
        };
      }
    }
  } catch (e) {
    return {'success': false, 'message': 'An error occurred: $e'};
  }
}

  // Update Feed Item
  Future<Map<String, dynamic>> updateFeedItem({
    required int id,
    required double quantity,
    required int userId,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode({
          'quantity': quantity,
          'updated_by': userId,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Item pakan berhasil diperbarui',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Item pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Item pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete Feed Item
  Future<Map<String, dynamic>> deleteFeedItem(int id, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Item pakan berhasil dihapus',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Item pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Item pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Bulk Update Feed Items
  Future<Map<String, dynamic>> bulkUpdateFeedItems({
    required List<Map<String, dynamic>> items,
    required int userId,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/bulk_update');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode({
          'items': items,
          'user_id': userId,
          'updated_by': userId,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Item pakan berhasil diperbarui',
          'results': responseData['results'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Failed to bulk update feed items',
            'results': errorData['results'],
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to bulk update feed items',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get All Feed Items
  Future<Map<String, dynamic>> getAllFeedItems({
    int? dailyFeedId,
    int? feedId,
    required int userId,
  }) async {
    try {
      final queryParameters = <String, String>{};
      if (dailyFeedId != null) queryParameters['daily_feed_id'] = dailyFeedId.toString();
      if (feedId != null) queryParameters['feed_id'] = feedId.toString();

      final url = Uri.parse('$baseUrl').replace(queryParameters: queryParameters);
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData,
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Failed to get feed items',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to get feed items',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get Feed Item by ID
  Future<Map<String, dynamic>> getFeedItemById(int id, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData,
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Item pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Item pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get Feed Items by Daily Feed ID
  Future<Map<String, dynamic>> getFeedItemsByDailyFeedId(int dailyFeedId, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/daily_feed/$dailyFeedId');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData,
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Item pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Item pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get Feed Usage by Date
  Future<Map<String, dynamic>> getFeedUsageByDate({
    String? startDate,
    String? endDate,
    required int userId,
  }) async {
    try {
      final queryParameters = <String, String>{};
      if (startDate != null) queryParameters['start_date'] = startDate;
      if (endDate != null) queryParameters['end_date'] = endDate;

      final url = Uri.parse('$baseUrl/feed_usage').replace(queryParameters: queryParameters);
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Berhasil mengambil data penggunaan pakan per tanggal',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Failed to get feed usage',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to get feed usage',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}