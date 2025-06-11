import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api/apiController.dart';

class DailyFeedManagementController {
  final String baseUrl = '$API_URL4/dailyFeedSchedule';
  final Duration _timeoutDuration = Duration(seconds: 10);

  // Helper method to get headers with token
  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('authToken');

    if (token == null) {
      throw Exception('No auth token found. Please login first.');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Create a new Daily Feed
  Future<Map<String, dynamic>> createDailyFeed({
    required int cowId,
    required String date,
    required String session,
    required int userId,
    List<Map<String, dynamic>>? items,
  }) async {
    try {
      final url = Uri.parse('$baseUrl');
      final headers = await _getHeaders();
      print('Creating daily feed: cowId=$cowId, date=$date, session=$session');
      final response = await http
          .post(
        url,
        headers: headers,
        body: jsonEncode({
          'cow_id': cowId,
          'date': date,
          'session': session,
          'items': items ?? [],
          'user_id': userId,
          'created_by': userId,
          'updated_by': userId,
        }),
      )
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print(
          'Create Daily Feed Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jadwal pakan berhasil dibuat',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message =
              errorData['message'] ?? 'Failed to create daily feed';
          return {
            'success': false,
            'message': message,
            'existing': errorData['existing'],
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error creating daily feed: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update a Daily Feed
  Future<Map<String, dynamic>> updateDailyFeed({
    required int id,
    int? cowId,
    String? date,
    String? session,
    required int userId,
    List<Map<String, dynamic>>? items,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print(
          'Updating daily feed: id=$id, cowId=$cowId, date=$date, session=$session');
      final response = await http
          .put(
        url,
        headers: headers,
        body: jsonEncode({
          'cow_id': cowId,
          'date': date,
          'session': session,
          'items': items ?? [],
          'user_id': userId,
          'updated_by': userId,
        }),
      )
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print(
          'Update Daily Feed Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message':
              responseData['message'] ?? 'Jadwal pakan berhasil diperbarui',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message =
              errorData['message'] ?? 'Failed to update daily feed';
          return {
            'success': false,
            'message': message,
            'existing': errorData['existing'],
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error updating daily feed: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all Daily Feeds
  Future<Map<String, dynamic>> getAllDailyFeeds({
    String? date,
    required int userId,
  }) async {
    try {
      final queryParameters = <String, String>{};
      if (date != null) queryParameters['date'] = date;

      final url =
          Uri.parse('$baseUrl').replace(queryParameters: queryParameters);
      final headers = await _getHeaders();
      print('getAllDailyFeeds URL: $url'); // Debug
      print('getAllDailyFeeds Headers: $headers'); // Debug
      print('getAllDailyFeeds UserId: $userId'); // Debug
      print('getAllDailyFeeds Date: $date'); // Debug

      final response = await http.get(url, headers: headers);
      print('getAllDailyFeeds Status: ${response.statusCode}'); // Debug
      print('getAllDailyFeeds Body: ${response.body}'); // Debug

      if (response.statusCode == 200) {
        try {
          if (response.body.isEmpty) {
            print('getAllDailyFeeds: Empty response body'); // Debug
            return {
              'success': true,
              'data': [],
            };
          }

          final decoded = jsonDecode(response.body);
          List<dynamic> responseData;

          if (decoded is List<dynamic>) {
            responseData = decoded;
          } else if (decoded is Map<String, dynamic> &&
              decoded.containsKey('data')) {
            responseData = decoded['data'] as List<dynamic>? ?? [];
          } else if (decoded is Map<String, dynamic> &&
              decoded['success'] == false) {
            print(
                'getAllDailyFeeds Server Error: ${decoded['message']}'); // Debug
            return {
              'success': false,
              'message': decoded['message'] ?? 'Server returned an error',
            };
          } else {
            throw FormatException('Unexpected JSON format: $decoded');
          }

          print('getAllDailyFeeds Parsed Data: $responseData'); // Debug
          return {
            'success': true,
            'data': responseData,
          };
        } catch (e) {
          print('getAllDailyFeeds Parse Error: $e'); // Debug
          return {
            'success': false,
            'message': 'Failed to parse daily feeds: $e',
          };
        }
      } else {
        try {
          final errorData =
              response.body.isNotEmpty ? jsonDecode(response.body) : {};
          print('getAllDailyFeeds Error Data: $errorData'); // Debug
          String message;
          switch (response.statusCode) {
            case 401:
              message = errorData['message'] ??
                  'Authentication failed: Please log in again (Status: 401)';
              break;
            case 403:
              message = errorData['message'] ??
                  'Permission denied: You do not have access to this resource (Status: 403)';
              break;
            case 404:
              message = errorData['message'] ??
                  'Daily feeds not found: Resource may not exist for the given date or user (Status: 404)';
              break;
            default:
              message = errorData['message'] ??
                  'Failed to get daily feeds (Status: ${response.statusCode})';
          }
          return {
            'success': false,
            'message': message,
          };
        } catch (e) {
          print('getAllDailyFeeds Error Parse: $e'); // Debug
          return {
            'success': false,
            'message':
                'Failed to get daily feeds: Unable to parse error response (Status: ${response.statusCode})',
          };
        }
      }
    } catch (e) {
      print('getAllDailyFeeds Error: $e'); // Debug
      return {
        'success': false,
        'message': 'An error occurred while fetching daily feeds: $e',
      };
    }
  }

  Future<Map<String, dynamic>> deleteDailyFeed(int id, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      final response = await http.delete(url, headers: headers);

      print('deleteDailyFeed Status: ${response.statusCode}'); // Debug
      print('deleteDailyFeed Body: ${response.body}'); // Debug

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jadwal pakan berhasil dihapus',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Jadwal pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message':
                'Jadwal pakan tidak ditemukan: Unable to parse error response (Status: ${response.statusCode})',
          };
        }
      }
    } catch (e) {
      print('deleteDailyFeed Error: $e'); // Debug
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get a Daily Feed by ID
  Future<Map<String, dynamic>> getDailyFeedById(int id, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print('Fetching daily feed by id: id=$id');
      final response = await http
          .get(url, headers: headers)
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print(
          'Get Daily Feed by ID Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Jadwal pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error getting daily feed by ID: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete a Daily Feed

  // Search Daily Feeds
  Future<Map<String, dynamic>> searchDailyFeeds({
    int? cowId,
    String? startDate,
    String? endDate,
    String? session,
    required int userId,
  }) async {
    try {
      final queryParameters = <String, String>{};
      if (cowId != null) queryParameters['cow_id'] = cowId.toString();
      if (startDate != null) queryParameters['start_date'] = startDate;
      if (endDate != null) queryParameters['end_date'] = endDate;
      if (session != null) queryParameters['session'] = session;

      final url = Uri.parse('$baseUrl/search')
          .replace(queryParameters: queryParameters);
      final headers = await _getHeaders();
      print(
          'Searching daily feeds: cowId=$cowId, startDate=$startDate, endDate=$endDate, session=$session');
      final response = await http
          .get(url, headers: headers)
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print(
          'Search Daily Feeds Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'count': responseData['count'] ?? 0,
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Failed to search daily feeds',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error searching daily feeds: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
