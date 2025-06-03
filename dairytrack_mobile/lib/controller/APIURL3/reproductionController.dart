import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class ReproductionController {
  final String baseUrl = '$API_URL3/reproduction'; // Tanpa trailing slash
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Get all reproduction data
  Future<Map<String, dynamic>> getReproductions() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/'), headers: _headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false,
          'message': 'Gagal mengambil data pemeriksaan (${response.statusCode})'
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Get reproduction by ID
  Future<Map<String, dynamic>> getReproductionById(int id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/$id/'), headers: _headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': 'Gagal mengambil detail reproduksi'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Create new reproduction data
  Future<Map<String, dynamic>> createReproduction(Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/'),
        headers: _headers,
        body: jsonEncode(data),
      );

      final result = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'message': result['message'] ?? 'Data reproduksi berhasil ditambahkan',
          'data': result,
        };
      } else {
        return {
          'success': false,
          'message': result['message'] ?? 'Gagal menambahkan data reproduksi',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Update reproduction data
  Future<Map<String, dynamic>> updateReproduction(int id, Map<String, dynamic> data) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/$id/'),
        headers: _headers,
        body: jsonEncode(data),
      );

      final result = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'message': result['message'] ?? 'Data reproduksi berhasil diperbarui',
          'data': result,
        };
      } else {
        return {
          'success': false,
          'message': result['message'] ?? 'Gagal memperbarui data reproduksi',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Delete reproduction data
  Future<Map<String, dynamic>> deleteReproduction(int id) async {
    try {
      final response = await http.delete(Uri.parse('$baseUrl/$id/'), headers: _headers);

      if (response.statusCode == 204) {
        return {'success': true, 'message': 'Data reproduksi berhasil dihapus'};
      }

      final result = jsonDecode(response.body);
      return {
        'success': response.statusCode >= 200 && response.statusCode < 300,
        'message': result['message'] ?? 'Gagal menghapus data reproduksi',
      };
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }
}
