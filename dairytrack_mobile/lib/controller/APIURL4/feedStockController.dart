import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api/apiController.dart';

class FeedStockManagementController {
  final String baseUrl = '$API_URL4/feedStock';
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

  // Get all Feed Stocks
  Future<Map<String, dynamic>> getAllFeedStocks() async {
    try {
      final url = Uri.parse(baseUrl);
      final headers = await _getHeaders();
      print('Sending get all feed stocks request');
      final response = await http
          .get(url, headers: headers)
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Get All Feed Stocks Response: ${response.statusCode} - ${response.body}');

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
            'message': errorData['message'] ?? 'Failed to get feed stocks',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error getting all feed stocks: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get Feed Stock by ID
  Future<Map<String, dynamic>> getFeedStockById(int id) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print('Sending get feed stock by id request: id=$id');
      final response = await http
          .get(url, headers: headers)
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Get Feed Stock by ID Response: ${response.statusCode} - ${response.body}');

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
            'message': errorData['message'] ?? 'Stok pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error getting feed stock by ID: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Add or update Feed Stock
  Future<Map<String, dynamic>> addFeedStock({
    required int feedId,
    required double additionalStock,
    required int userId,
  }) async {
    try {
      final url = Uri.parse(baseUrl);
      final headers = await _getHeaders();
      print('Sending add feed stock request: feedId=$feedId, additionalStock=$additionalStock, userId=$userId');
      final response = await http
          .post(
            url,
            headers: headers,
            body: jsonEncode({
              'feedId': feedId,
              'additionalStock': additionalStock,
              'user_id': userId,
              'created_by': userId,
              'updated_by': userId,
            }),
          )
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Add Feed Stock Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message':
              responseData['message'] ?? 'Stok pakan berhasil ditambahkan atau diperbarui',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to add or update feed stock';
          if (message.contains('feed') || message.contains('Feed ID')) {
            message = 'Pakan tidak ditemukan';
          } else if (message.contains('user')) {
            message = 'User dengan ID $userId tidak ditemukan';
          } else if (message.contains('negative')) {
            message = 'Stok tidak boleh negatif';
          }
          return {
            'success': false,
            'message': message,
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error adding feed stock: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update Feed Stock manually
  Future<Map<String, dynamic>> updateFeedStock({
    required int id,
    required double stock,
    required int userId,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print('Sending update feed stock request: id=$id, stock=$stock, userId=$userId');
      final response = await http
          .put(
            url,
            headers: headers,
            body: jsonEncode({
              'stock': stock,
              'updated_by': userId,
            }),
          )
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Update Feed Stock Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Stok pakan berhasil diperbarui',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to update feed stock';
          if (message.contains('not found')) {
            message = 'Stok pakan tidak ditemukan';
          } else if (message.contains('negative')) {
            message = 'Stok tidak boleh negatif';
          } else if (message.contains('user')) {
            message = 'User dengan ID $userId tidak ditemukan';
          }
          return {
            'success': false,
            'message': message,
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Invalid response format: ${response.body}',
          };
        }
      }
    } catch (e) {
      print('Error updating feed stock: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
