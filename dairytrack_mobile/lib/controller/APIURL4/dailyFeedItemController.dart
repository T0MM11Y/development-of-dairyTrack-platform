import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api/apiController.dart';

class DailyFeedItemManagementController {
  final String baseUrl = '$API_URL4/dailyFeedItem';

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('authToken') ?? '';
    print('getHeaders Token: $token'); // Debug
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Get All Feed Items
  Future<Map<String, dynamic>> getAllFeedItems({
    int? dailyFeedId,
    int? feedId,
    required int userId,
  }) async {
    try {
      final queryParameters = <String, String>{};
      if (dailyFeedId != null)
        queryParameters['daily_feed_id'] = dailyFeedId.toString();
      if (feedId != null) queryParameters['feed_id'] = feedId.toString();

      final url =
          Uri.parse('$baseUrl').replace(queryParameters: queryParameters);
      final headers = await _getHeaders();
      print('getAllFeedItems URL: $url'); // Debug
      print('getAllFeedItems Headers: $headers'); // Debug
      print('getAllFeedItems UserId: $userId'); // Debug
      print('getAllFeedItems QueryParams: $queryParameters'); // Debug

      final response = await http.get(url, headers: headers);
      print('getAllFeedItems Status: ${response.statusCode}'); // Debug
      print('getAllFeedItems Body: ${response.body}'); // Debug

      if (response.statusCode == 200) {
        try {
          if (response.body.isEmpty) {
            print('getAllFeedItems: Empty response body'); // Debug
            return {
              'success': true,
              'data': [],
            };
          }

          final decoded = jsonDecode(response.body);
          List<dynamic> responseData;

          // Handle array or object with 'data' key
          if (decoded is List<dynamic>) {
            responseData = decoded;
          } else if (decoded is Map<String, dynamic>) {
            if (decoded.containsKey('data')) {
              responseData = decoded['data'] as List<dynamic>? ?? [];
            } else if (decoded['success'] == false) {
              print(
                  'getAllFeedItems Server Error: ${decoded['message']}'); // Debug
              return {
                'success': false,
                'message': decoded['message'] ?? 'Server returned an error',
              };
            } else {
              throw FormatException('Unexpected JSON object format: $decoded');
            }
          } else {
            throw FormatException('Unexpected JSON format: $decoded');
          }

          print('getAllFeedItems Parsed Data: $responseData'); // Debug
          return {
            'success': true,
            'data': responseData,
          };
        } catch (e) {
          print('getAllFeedItems Parse Error: $e'); // Debug
          return {
            'success': false,
            'message': 'Failed to parse feed items: $e',
          };
        }
      } else {
        try {
          final errorData =
              response.body.isNotEmpty ? jsonDecode(response.body) : {};
          print('getAllFeedItems Error Data: $errorData'); // Debug
          String message;
          switch (response.statusCode) {
            case 401:
              message = errorData['message'] ??
                  'Authentication failed: Please log in again';
              break;
            case 403:
              message = errorData['message'] ??
                  'Permission denied: You do not have access';
              break;
            case 404:
              message = errorData['message'] ?? 'Feed items not found';
              break;
            default:
              message = errorData['message'] ??
                  'Failed to get feed items (Status: ${response.statusCode})';
          }
          return {
            'success': false,
            'message': message,
          };
        } catch (e) {
          print('getAllFeedItems Error Parse: $e'); // Debug
          return {
            'success': false,
            'message':
                'Failed to get feed items: Unable to parse error (Status: ${response.statusCode})',
          };
        }
      }
    } catch (e) {
      print('getAllFeedItems Error: $e'); // Debug
      return {
        'success': false,
        'message': 'An error occurred while fetching feed items: $e',
      };
    }
  }

  // Bulk Update Feed Items
  Future<Map<String, dynamic>> bulkUpdateFeedItems({
    required List<Map<String, dynamic>> items,
    required int userId,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/bulk_update');
      final headers = await _getHeaders();
      final body = jsonEncode({
        'items': items,
        'user_id': userId,
        'updated_by': userId,
      });
      print('bulkUpdateFeedItems URL: $url'); // Debug
      print('bulkUpdateFeedItems Headers: $headers'); // Debug
      print('bulkUpdateFeedItems Body: $body'); // Debug

      final response = await http.put(
        url,
        headers: headers,
        body: body,
      );

      print('bulkUpdateFeedItems Status: ${response.statusCode}'); // Debug
      print('bulkUpdateFeedItems Response Body: ${response.body}'); // Debug

      if (response.statusCode >= 200 && response.statusCode < 300) {
        try {
          final responseData =
              response.body.isEmpty ? {} : jsonDecode(response.body);
          print('bulkUpdateFeedItems Parsed Data: $responseData'); // Debug
          return {
            'success': true,
            'message':
                responseData['message'] ?? 'Item pakan berhasil di update',
            'results': responseData['results'] ?? [],
          };
        } catch (e) {
          print('bulkUpdateFeedItems Parse Error: $e'); // Debug
          return {
            'success': false,
            'message': 'Failed to parse response: $e',
          };
        }
      } else {
        try {
          final errorData =
              response.body.isEmpty ? {} : jsonDecode(response.body);
          print('bulkUpdateFeedItems Error Data: $errorData'); // Debug
          return {
            'success': false,
            'message': errorData['message'] ??
                'Failed to bulk update feed items (Status: ${response.statusCode})',
            'results': errorData['results'] ?? [],
          };
        } catch (e) {
          print('bulkUpdateFeedItems Error Parse: $e'); // Debug
          return {
            'success': false,
            'message':
                'Failed to bulk update feed items: Unable to parse error (Status: ${response.statusCode})',
          };
        }
      }
    } catch (e) {
      print('bulkUpdateFeedItems Error: $e'); // Debug
      return {
        'success': false,
        'message': 'An error occurred: $e',
      };
    }
  }

  // Add Feed Item
  Future<Map<String, dynamic>> addFeedItem({
    required int dailyFeedId,
    required List<Map<String, dynamic>> feedItems,
    required int userId,
  }) async {
    try {
      final url = Uri.parse('$baseUrl');
      final headers = await _getHeaders();
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'daily_feed_id': dailyFeedId,
          'feed_items': feedItems,
          'user_id': userId,
          'created_by': userId,
          'updated_by': userId,
        }),
      );

      print('addFeedItem Status: ${response.statusCode}'); // Debug
      print('addFeedItem Body: ${response.body}'); // Debug

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message':
              responseData['message'] ?? 'Item pakan berhasil ditambahkan',
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
            'message':
                'Failed to add feed item: Unable to parse error (Status: ${response.statusCode})',
          };
        }
      }
    } catch (e) {
      print('addFeedItem Error: $e'); // Debug
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
      final headers = await _getHeaders();
      final response = await http.put(
        url,
        headers: headers,
        body: jsonEncode({
          'quantity': quantity,
          'updated_by': userId,
        }),
      );

      print('updateFeedItem Status: ${response.statusCode}'); // Debug
      print('updateFeedItem Body: ${response.body}'); // Debug

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message':
              responseData['message'] ?? 'Item pakan berhasil diperbarui',
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
            'message':
                'Item pakan tidak ditemukan: Unable to parse error (Status: ${response.statusCode})',
          };
        }
      }
    } catch (e) {
      print('updateFeedItem Error: $e'); // Debug
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete Feed Item
  Future<Map<String, dynamic>> deleteFeedItem(int id, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      final response = await http.delete(
        url,
        headers: headers,
      );

      print('deleteFeedItem Status: ${response.statusCode}'); // Debug
      print('deleteFeedItem Body: ${response.body}'); // Debug

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
            'message':
                'Item pakan tidak ditemukan: Unable to parse error (Status: ${response.statusCode})',
          };
        }
      }
    } catch (e) {
      print('deleteFeedItem Error: $e'); // Debug
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get Feed Item by ID
  Future<Map<String, dynamic>> getFeedItemById(int id, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      final response = await http.get(url, headers: headers);

      print('getFeedItemById Status: ${response.statusCode}'); // Debug
      print('getFeedItemById Body: ${response.body}'); // Debug

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
            'message':
                'Item pakan tidak ditemukan: Unable to parse error (Status: ${response.statusCode})',
          };
        }
      }
    } catch (e) {
      print('getFeedItemById Error: $e'); // Debug
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get Feed Items by Daily Feed ID
  Future<Map<String, dynamic>> getFeedItemsByDailyFeedId(
      int dailyFeedId, int userId) async {
    try {
      // Pastikan baseUrl didefinisikan (misalnya, 'http://localhost:5003')
      final url =
          Uri.parse('$baseUrl/daily_feed/$dailyFeedId/'); // Add trailing slash
      final headers =
          await _getHeaders(); // Pastikan async ditangani dengan await
      print('getFeedItemsByDailyFeedId URL: $url');
      print('getFeedItemsByDailyFeedId Headers: $headers');

      final response = await http.get(url, headers: headers);

      print('getFeedItemsByDailyFeedId Status: ${response.statusCode}');
      print('getFeedItemsByDailyFeedId Body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        // Validasi bahwa responseData adalah list atau map
        if (responseData is List || responseData is Map) {
          return {
            'success': true,
            'data': responseData,
          };
        } else {
          return {
            'success': false,
            'message': 'Invalid response format',
          };
        }
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ??
                'Item pakan tidak ditemukan (Status: ${response.statusCode})',
          };
        } catch (e) {
          return {
            'success': false,
            'message':
                'Gagal memproses respons: Unable to parse error (Status: ${response.statusCode}) - ${response.body}',
          };
        }
      }
    } catch (e) {
      print('getFeedItemsByDailyFeedId Error: $e');
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
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

      final url = Uri.parse('$baseUrl/feedUsage')
          .replace(queryParameters: queryParameters);
      final headers = await _getHeaders();
      final response = await http.get(url, headers: headers);

      print('getFeedUsageByDate Status: ${response.statusCode}'); // Debug
      print('getFeedUsageByDate Body: ${response.body}'); // Debug

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ??
              'Berhasil mengambil data penggunaan pakan',
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
            'message':
                'Failed to get feed usage: Unable to parse error (Status: ${response.statusCode})',
          };
        }
      }
    } catch (e) {
      print('getFeedUsageByDate Error: $e'); // Debug
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
