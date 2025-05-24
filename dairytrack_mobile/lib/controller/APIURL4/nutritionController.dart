import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class NutrisiManagementController {
  final String baseUrl = '$API_URL1/nutrisi';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Add a new Nutrisi
  Future<Map<String, dynamic>> addNutrisi(String name, String unit, int userId) async {
    try {
      final url = Uri.parse('$baseUrl');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({
          'name': name,
          'unit': unit,
          'user_id': userId,
          'created_by': userId,
          'updated_by': userId,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Nutrisi berhasil ditambahkan',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to add nutrisi';
          if (message.contains('already exists') || message.contains('duplicate')) {
            message = 'Nutrisi dengan nama "$name" sudah ada. Silakan gunakan nama yang berbeda.';
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
            'message': 'Failed to add nutrisi',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update a Nutrisi
  Future<Map<String, dynamic>> updateNutrisi(int id, String name, String unit, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode({
          'name': name,
          'unit': unit,
          'updated_by': userId,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Nutrisi berhasil diperbarui',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to update nutrisi';
          if (message.contains('already exists') || message.contains('duplicate')) {
            message = 'Nutrisi dengan nama "$name" sudah ada. Silakan gunakan nama yang berbeda.';
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
            'message': 'Nutrisi tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete a Nutrisi
  Future<Map<String, dynamic>> deleteNutrisi(int id) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Nutrisi berhasil dihapus',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Nutrisi tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Nutrisi tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get a Nutrisi by ID
  Future<Map<String, dynamic>> getNutrisiById(int id) async {
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
            'message': errorData['message'] ?? 'Nutrisi tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Nutrisi tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all Nutrisi
  Future<Map<String, dynamic>> getAllNutrisi() async {
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
            'message': errorData['message'] ?? 'Failed to get nutrisi',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to get nutrisi',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}