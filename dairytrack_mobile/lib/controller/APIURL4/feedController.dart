import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class FeedManagementController {
  final String baseUrl = '$API_URL1/feed';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

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
      final response = await http.post(
        url,
        headers: _headers,
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
      );

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
          }
          return {
            'success': false,
            'message': message,
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to create feed',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all Feeds
  Future<Map<String, dynamic>> getAllFeeds({int? typeId, String? name}) async {
    try {
      final queryParameters = <String, String>{};
      if (typeId != null) queryParameters['typeId'] = typeId.toString();
      if (name != null) queryParameters['name'] = name;

      final url = Uri.parse('$baseUrl').replace(queryParameters: queryParameters);
      final response = await http.get(url, headers: _headers);

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
            'message': errorData['message'] ?? 'Failed to get feeds',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to get feeds',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get a Feed by ID
  Future<Map<String, dynamic>> getFeedById(int id) async {
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
            'message': errorData['message'] ?? 'Pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
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
      final response = await http.put(
        url,
        headers: _headers,
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
      );

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
          }
          return {
            'success': false,
            'message': message,
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete a Feed
  Future<Map<String, dynamic>> deleteFeed(int id) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Pakan berhasil dihapus',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}