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
      final url = Uri.parse('$baseUrl');
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
          'data': responseData['data'] ?? responseData,
        };
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Gagal mengambil data stok pakan',
        };
      }
    } catch (e) {
      print('Error getting all feed stocks: $e');
      return {
        'success': false,
        'message': 'Terjadi kesalahan saat mengambil data stok pakan: $e',
      };
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
          'data': responseData['data'] ?? responseData,
        };
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Gagal mengambil stok pakan',
        };
      }
    } catch (e) {
      print('Error getting feed stock by ID: $e');
      return {
        'success': false,
        'message': 'Terjadi kesalahan saat mengambil stok pakan: $e',
      };
    }
  }

  // Add Feed Stock
  // In FeedStockManagementController.dart
Future<Map<String, dynamic>> addFeedStock({
  required int feedId,
  required double additionalStock,
  required int userId,
}) async {
  try {
    final url = Uri.parse('$baseUrl/add');
    final headers = await _getHeaders();
    final payload = {
      'feedId': feedId, // Changed to 'feedId' to match backend
      'additionalStock': additionalStock,
      'userId': userId,
    };
    print('Sending add feed stock request: $payload');
    final response = await http
        .post(
          url,
          headers: headers,
          body: jsonEncode(payload),
        )
        .timeout(_timeoutDuration, onTimeout: () {
      throw Exception('Request timed out. Please check your connection.');
    });

    print('Add Feed Stock Response: ${response.statusCode} - ${response.body}');

    if (response.statusCode == 200 || response.statusCode == 201) {
      final responseData = jsonDecode(response.body);
      return {
        'success': true,
        'message': responseData['message'] ?? 'Stok pakan berhasil ditambahkan',
        'data': responseData['data'],
      };
    } else {
      final errorData = jsonDecode(response.body);
      String message = errorData['message'] ?? 'Gagal menambah stok pakan';
      return {
        'success': false,
        'message': message,
      };
    }
  } catch (e) {
    print('Error adding feed stock: $e');
    return {
      'success': false,
      'message': 'Terjadi kesalahan saat menambah stok pakan: $e',
    };
  }
}

  // Update Feed Stock
  Future<Map<String, dynamic>> updateFeedStock({
    required int id,
    required double stock,
    required int userId,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      final payload = {
        'stock': stock,
        'user_id': userId,
      };
      print('Sending update feed stock request: id=$id, $payload');
      final response = await http
          .put(
            url,
            headers: headers,
            body: jsonEncode(payload),
          )
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Update Feed Stock Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Stok pakan berhasil diperbarui',
          'data': responseData['data'],
        };
      } else {
        final errorData = jsonDecode(response.body);
        String message = errorData['message'] ?? 'Gagal memperbarui stok pakan';
        return {
          'success': false,
          'message': message,
        };
      }
    } catch (e) {
      print('Error updating feed stock: $e');
      return {
        'success': false,
        'message': 'Terjadi kesalahan saat memperbarui stok pakan: $e',
      };
    }
  }

  // Get all Feed Stock History
  Future<Map<String, dynamic>> getAllFeedStockHistory() async {
    try {
      final url = Uri.parse('$baseUrl/history');
      final headers = await _getHeaders();
      print('Sending get all feed stock history request');
      final response = await http
          .get(url, headers: headers)
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Get All Feed Stock History Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData['data'] ?? responseData,
        };
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Gagal mengambil riwayat stok pakan',
        };
      }
    } catch (e) {
      print('Error getting all feed stock history: $e');
      return {
        'success': false,
        'message': 'Terjadi kesalahan saat mengambil riwayat stok pakan: $e',
      };
    }
  }

  // Delete Feed Stock History
  Future<Map<String, dynamic>> deleteFeedStockHistory(int id) async {
    try {
      final url = Uri.parse('$baseUrl/history/$id');
      final headers = await _getHeaders();
      print('Sending delete feed stock history request: id=$id');
      final response = await http
          .delete(url, headers: headers)
          .timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Delete Feed Stock History Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Riwayat stok pakan berhasil dihapus',
          'data': responseData['data'],
        };
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['message'] ?? 'Gagal menghapus riwayat stok pakan',
        };
      }
    } catch (e) {
      print('Error deleting feed stock history: $e');
      return {
        'success': false,
        'message': 'Terjadi kesalahan saat menghapus riwayat stok pakan: $e',
      };
    }
  }
}