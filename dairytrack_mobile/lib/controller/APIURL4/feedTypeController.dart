import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class FeedTypeManagementController {
  final String baseUrl = '$API_URL4/feedType';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Add a new FeedType
  Future<Map<String, dynamic>> addFeedType(String name, int userId) async {
    try {
      final url = Uri.parse('$baseUrl');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({
          'name': name,
          'user_id': userId,
          'created_by': userId,
          'updated_by': userId,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jenis pakan berhasil ditambahkan',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to add feed type';
          if (message.contains('already exists') || message.contains('duplicate')) {
            message = 'Jenis pakan dengan nama "$name" sudah ada. Silakan gunakan nama yang berbeda.';
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
            'message': 'Failed to add feed type',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete a FeedType
  Future<Map<String, dynamic>> deleteFeedType(int id) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jenis pakan berhasil dihapus',
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
            'message': 'Jenis pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update a FeedType
  Future<Map<String, dynamic>> updateFeedType(int id, String name, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode({
          'name': name,
          'updated_by': userId,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jenis pakan berhasil diperbarui',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to update feed type';
          if (message.contains('already exists') || message.contains('duplicate')) {
            message = 'Jenis pakan dengan nama "$name" sudah ada. Silakan gunakan nama yang berbeda.';
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
            'message': 'Failed to update feed type',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get a FeedType by ID
  Future<Map<String, dynamic>> getFeedTypeById(int id) async {
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
            'message': errorData['message'] ?? 'Jenis pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Jenis pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all FeedTypes
  Future<Map<String, dynamic>> getAllFeedTypes() async {
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
            'message': errorData['message'] ?? 'Failed to get feed types',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to get feed types',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}