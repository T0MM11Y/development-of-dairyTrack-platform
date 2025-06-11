import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api/apiController.dart';

class FeedManagementController {
  final String baseUrl = '$API_URL4/feed';
  final String feedTypeUrl = '$API_URL4/feed-type'; // Untuk getAllFeedTypes
  final Duration _timeoutDuration = Duration(seconds: 10);

  // Fungsi untuk mengambil header dengan token
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

  // Create a new Feed
  Future<Map<String, dynamic>> createFeed({
    required int typeId,
    required String name,
    required String unit,
    required double minStock,
    required double price,
    required int userId,
    List<Map<String, dynamic>>? nutrisiList,
  }) async {
    try {
      final url = Uri.parse('$baseUrl');
      final headers = await _getHeaders();
      print('Sending create feed request: name=$name, typeId=$typeId, userId=$userId');
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'typeId': typeId,
          'name': name.trim(),
          'unit': unit,
          'min_stock': minStock,
          'price': price,
          'user_id': userId,
          'created_by': userId,
          'updated_by': userId,
          'nutrisiList': nutrisiList ?? [],
        }),
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Create Feed Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Pakan "${name}" berhasil ditambahkan',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to create feed';
          if (message.contains('already exists') || message.contains('duplicate')) {
            message = 'Pakan dengan nama "$name" sudah terdaftar. Gunakan nama lain.';
          } else if (message.contains('user')) {
            message = 'User dengan ID $userId tidak ditemukan';
          } else if (message.contains('feed type') || message.contains('typeId')) {
            message = 'Jenis pakan tidak ditemukan. Pastikan typeId valid.';
          } else if (message.contains('nutrisi')) {
            message = 'Satu atau lebih nutrisi tidak ditemukan. Periksa nutrisi_id.';
          } else if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
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
      print('Error creating feed: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all Feeds
  Future<Map<String, dynamic>> getAllFeeds({int? typeId, String? name}) async {
    try {
      final url = Uri.parse('$baseUrl');
      final queryParameters = <String, String>{};
      if (typeId != null) queryParameters['typeId'] = typeId.toString();
      if (name != null) queryParameters['name'] = name;

      final headers = await _getHeaders();
      final uri = Uri.parse('$baseUrl').replace(queryParameters: queryParameters);
      print('Sending get all feeds request: typeId=$typeId, name=$name');
      final response = await http.get(
        uri,
        headers: headers,
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Get All Feeds Response: ${response.statusCode} - ${response.body}');

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
          String message = errorData['message'] ?? 'Failed to get feeds';
          if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
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
      print('Error getting all feeds: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get a Feed by ID
  Future<Map<String, dynamic>> getFeedById(int id) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print('Sending get feed by id request: id=$id');
      final response = await http.get(
        url,
        headers: headers,
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Get Feed by ID Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Pakan tidak ditemukan';
          if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
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
      print('Error getting feed by ID: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update a Feed
  Future<Map<String, dynamic>> updateFeed({
    required int id,
    int? typeId,
    String? name,
    String? unit,
    double? minStock,
    double? price,
    required int userId,
    List<Map<String, dynamic>>? nutrisiList,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print('Sending update feed request: id=$id, name=$name, userId=$userId');
      final response = await http.put(
        url,
        headers: headers,
        body: jsonEncode({
          'typeId': typeId,
          'name': name?.trim(),
          'unit': unit,
          'min_stock': minStock,
          'price': price,
          'user_id': userId,
          'updated_by': userId,
          'nutrisiList': nutrisiList ?? [],
        }),
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Update Feed Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Pakan berhasil diperbarui',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to update feed';
          if (message.contains('already exists') || message.contains('duplicate')) {
            message = 'Pakan dengan nama "$name" sudah terdaftar. Gunakan nama lain.';
          } else if (message.contains('user')) {
            message = 'User dengan ID $userId tidak ditemukan';
          } else if (message.contains('feed type') || message.contains('typeId')) {
            message = 'Jenis pakan tidak ditemukan. Pastikan typeId valid.';
          } else if (message.contains('nutrisi')) {
            message = 'Satu atau lebih nutrisi tidak ditemukan. Periksa nutrisi_id.';
          } else if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
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
      print('Error updating feed: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete a Feed
  Future<Map<String, dynamic>> deleteFeed(int id) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print('Sending delete feed request: id=$id');
      final response = await http.delete(
        url,
        headers: headers,
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Delete Feed Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Pakan berhasil dihapus',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Pakan tidak ditemukan';
          if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
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
      print('Error deleting feed: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all Feed Types
  Future<Map<String, dynamic>> getAllFeedTypes() async {
    try {
      final url = Uri.parse(feedTypeUrl);
      final headers = await _getHeaders();
      print('Sending get all feed types request');
      final response = await http.get(
        url,
        headers: headers,
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Get All Feed Types Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to get feed types';
          if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
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
      print('Error getting all feed types: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Fungsi untuk logout jika token tidak valid
  Future<void> _logoutOnInvalidToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('authToken');
  }
}