import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api/apiController.dart';

final class FeedTypeManagementController {
  final String baseUrl = '$API_URL4/feedType';
  final Duration _timeoutDuration = Duration(seconds: 6);

  // Helper method to get headers with token
  Future<Map<String, String>?> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('authToken');
    print('Retrieved token in FeedTypeManagementController: $token'); // Debug log

    if (token == null) {
      print('No auth token found in SharedPreferences'); // Debug log
      return null;
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Add a new FeedType
  Future<Map<String, dynamic>> addFeedType(String name, int userId) async {
    try {
      final headers = await _getHeaders();
      if (headers == null) {
        return {
          'success': false,
          'message': 'Session expired. Please login again.',
        };
      }

      final url = Uri.parse('$baseUrl');
      print('Sending add feed type request: name=$name, userId=$userId');
      final response = await http
          .post(
            url,
            headers: headers,
            body: jsonEncode({
              'name': name,
              'user_id': userId,
              'created_by': userId,
              'updated_by': userId,
            }),
          )
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Add Feed Type Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jenis pakan berhasil ditambahkan',
          'data': responseData['data'],
        };
      } else if (response.statusCode == 401) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('authToken');
        return {
          'success': false,
          'message': 'Session expired. Please login again.',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to add feed type';
          if (message.contains('already exists') || message.contains('duplicate')) {
            message =
                'Jenis pakan dengan nama "$name" sudah ada. Silakan gunakan nama yang berbeda.';
          } else if (message.contains('user')) {
            message = 'User dengan ID $userId tidak ditemukan';
          }
          return {'success': false, 'message': message};
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error adding feed type: $e');
      print('Stack trace: ${StackTrace.current}');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete a FeedType
  Future<Map<String, dynamic>> deleteFeedType(int id) async {
    try {
      final headers = await _getHeaders();
      if (headers == null) {
        return {
          'success': false,
          'message': 'Session expired. Please login again.',
        };
      }

      final url = Uri.parse('$baseUrl/$id');
      print('Sending delete feed type request: id=$id');
      final response = await http
          .delete(url, headers: headers)
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Delete Feed Type Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jenis pakan berhasil dihapus',
        };
      } else if (response.statusCode == 401) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('authToken');
        return {
          'success': false,
          'message': 'Session expired. Please login again.',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Jenis pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error deleting feed type: $e');
      print('Stack trace: ${StackTrace.current}');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update a FeedType
  Future<Map<String, dynamic>> updateFeedType(int id, String name, int userId) async {
    try {
      final headers = await _getHeaders();
      if (headers == null) {
        return {
          'success': false,
          'message': 'Session expired. Please login again.',
        };
      }

      final url = Uri.parse('$baseUrl/$id');
      print('Sending update feed type request: id=$id, name=$name, userId=$userId');
      final response = await http
          .put(
            url,
            headers: headers,
            body: jsonEncode({
              'name': name,
              'updated_by': userId,
            }),
          )
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Update Feed Type Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jenis pakan berhasil diperbarui',
          'data': responseData['data'],
        };
      } else if (response.statusCode == 401) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('authToken');
        return {
          'success': false,
          'message': 'Session expired. Please login again.',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to update feed type';
          if (message.contains('already exists') || message.contains('duplicate')) {
            message =
                'Jenis pakan dengan nama "$name" sudah ada. Silakan gunakan nama yang berbeda.';
          } else if (message.contains('user')) {
            message = 'User dengan ID $userId tidak ditemukan';
          }
          return {'success': false, 'message': message};
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error updating feed type: $e');
      print('Stack trace: ${StackTrace.current}');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get a FeedType by ID
  Future<Map<String, dynamic>> getFeedTypeById(int id) async {
    try {
      final headers = await _getHeaders();
      if (headers == null) {
        return {
          'success': false,
          'message': 'Session expired. Please login again.',
        };
      }

      final url = Uri.parse('$baseUrl/$id');
      print('Sending get feed type by id request: id=$id');
      final response = await http
          .get(url, headers: headers)
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Get Feed Type by ID Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData['data'],
        };
      } else if (response.statusCode == 401) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove('authToken');
          return {
            'success': null,
            'message': 'Session expired. Please login again.',
          };
        } else {
          try {
            final errorData = jsonDecode(response.body);
            return {
              'success': false,
              'message': errorData['message'] ?? 'Jenis pakan tidak ditemukan',
            };
          } catch (e) {
            return {
              'success': false,
              'message': 'Invalid response format: ${response.body}',
            };
          }
        }
      } catch (e) {
      print('Error getting feed type by id: $e');
      print('Stack trace: ${StackTrace.current}');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all FeedTypes
  Future<Map<String, dynamic>> getAllFeedTypes() async {
    const int maxRetries = 3;
    for (int i = 0; i < maxRetries; i++) {
      try {
        final headers = await _getHeaders();
        if (headers == null) {
          return {
            'success': false,
            'message': 'Session expired. Please login again.',
          };
        }

        final url = Uri.parse('$baseUrl');
        print('Sending get all feed types request with headers: $headers');
        final response = await http
            .get(url, headers: headers)
            .timeout(_timeoutDuration, onTimeout: () {
          throw Exception('Request timed out. Please check your connection.');
        });

        print('Get All Feed Types Response: ${response.statusCode} - ${response.body}');

        if (response.statusCode == 200) {
          final responseData = jsonDecode(response.body);
          return {
            'success': true,
            'data': responseData['data'],
          };
        } else if (response.statusCode == 401) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove('authToken');
          return {
            'success': false,
            'message': 'Session expired. Please login again.',
          };
        } else {
          try {
            final errorData = jsonDecode(response.body);
            print('Error response data: $errorData');
            return {
              'success': false,
              'message': errorData['message'] ?? 'Failed to get feed types',
            };
          } catch (e) {
            return {
              'success': false,
              'message': 'Invalid response format: ${response.body}',
            };
          }
        }
      } catch (e) {
        print('Error during attempt ${i + 1}: $e');
        print('Stack trace: ${StackTrace.current}');
        if (i == maxRetries - 1) {
          return {'success': false, 'message': 'An error occurred: $e'};
        }
        await Future.delayed(Duration(seconds: 1));
      }
    }
    return {'success': false, 'message': 'Retry limit reached'};
  }
}