import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api/apiController.dart';

class NutrisiManagementController {
  final String baseUrl = '$API_URL4/nutrition';
  final Duration _timeoutDuration = Duration(seconds: 10);

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

  Future<Map<String, dynamic>> addNutrisi(String name, String unit, int userId) async {
    try {
      final url = Uri.parse('$baseUrl');
      final headers = await _getHeaders();
      print('Sending add request: name=$name, unit=$unit, userId=$userId');
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode({
          'name': name,
          'unit': unit,
          'user_id': userId,
          'created_by': userId,
          'updated_by': userId,
        }),
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Add Nutrisi Response: ${response.statusCode} - ${response.body}');

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
          } else if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
          }
          return {'success': false, 'message': message};
        } catch (e) {
          return {'success': false, 'message': 'Invalid response format: ${response.body}'};
        }
      }
    } catch (e) {
      print('Error adding nutrisi: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> updateNutrisi(int id, String name, String unit, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print('Sending update request: id=$id, name=$name, unit=$unit, userId=$userId');
      final response = await http.put(
        url,
        headers: headers,
        body: jsonEncode({
          'name': name,
          'unit': unit,
          'updated_by': userId,
        }),
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Update Nutrisi Response: ${response.statusCode} - ${response.body}');

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
          } else if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
          }
          return {'success': false, 'message': message};
        } catch (e) {
          return {'success': false, 'message': 'Invalid response format: ${response.body}'};
        }
      }
    } catch (e) {
      print('Error updating nutrisi: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> deleteNutrisi(int id) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print('Sending delete request: id=$id');
      final response = await http.delete(
        url,
        headers: headers,
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Delete Nutrisi Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Nutrisi berhasil dihapus',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Nutrisi tidak ditemukan';
          if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
          }
          return {'success': false, 'message': message};
        } catch (e) {
          return {'success': false, 'message': 'Invalid response format: ${response.body}'};
        }
      }
    } catch (e) {
      print('Error deleting nutrisi: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> getNutrisiById(int id) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final headers = await _getHeaders();
      print('Sending get by id request: id=$id');
      final response = await http.get(
        url,
        headers: headers,
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Get Nutrisi by ID Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Nutrisi tidak ditemukan';
          if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
          }
          return {'success': false, 'message': message};
        } catch (e) {
          return {'success': false, 'message': 'Invalid response format: ${response.body}'};
        }
      }
    } catch (e) {
      print('Error getting nutrisi by ID: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> getAllNutrisi() async {
    try {
      final url = Uri.parse('$baseUrl');
      final headers = await _getHeaders();
      print('Sending get all nutrisi request');
      final response = await http.get(
        url,
        headers: headers,
      ).timeout(_timeoutDuration, onTimeout: () {
        throw Exception('Request timed out. Please check your connection.');
      });

      print('Get All Nutrisi Response: ${response.statusCode} - ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to get nutrisi';
          if (message.contains('Token')) {
            message = 'Sesi Anda telah berakhir. Silakan login kembali.';
            await _logoutOnInvalidToken();
          }
          return {'success': false, 'message': message};
        } catch (e) {
          return {'success': false, 'message': 'Invalid response format: ${response.body}'};
        }
      }
    } catch (e) {
      print('Error getting all nutrisi: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<void> _logoutOnInvalidToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('authToken');
  }
}