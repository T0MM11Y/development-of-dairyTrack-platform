import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class FeedStockManagementController {
  final String baseUrl = '$API_URL1/feed_stock';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Get all Feed Stocks
  Future<Map<String, dynamic>> getAllFeedStocks() async {
    try {
      final url = Uri.parse('$baseUrl');
      final response = await http.get(url, headers: _headers);

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
            'message': 'Failed to get feed stocks',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get Feed Stock by ID
  Future<Map<String, dynamic>> getFeedStockById(int id) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.get(url, headers: _headers);

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
            'message': 'Stok pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
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
      final url = Uri.parse('$baseUrl');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({
          'feedId': feedId,
          'additionalStock': additionalStock,
          'user_id': userId,
          'created_by': userId,
          'updated_by': userId,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Stok pakan berhasil ditambahkan atau diperbarui',
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
            'message': 'Failed to add or update feed stock',
          };
        }
      }
    } catch (e) {
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
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode({
          'stock': stock,
          'updated_by': userId,
        }),
      );

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
            'message': 'Stok pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}