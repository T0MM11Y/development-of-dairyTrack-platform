import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class SymptomController {
  final String baseUrl = '$API_URL3/symptoms'; // tanpa trailing slash
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Get all symptoms
  Future<Map<String, dynamic>> getSymptoms() async {
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

  // Get symptom by ID
  Future<Map<String, dynamic>> getSymptomById(int id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/$id/'), headers: _headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': 'Gagal mengambil detail gejala'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Create new symptom
  Future<Map<String, dynamic>> createSymptom(Map<String, dynamic> data) async {
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
          'message': result['message'] ?? 'Gejala berhasil ditambahkan',
          'data': result
        };
      } else {
        return {
          'success': false,
          'message': result['message'] ?? 'Gagal menambahkan gejala'
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Update symptom
  Future<Map<String, dynamic>> updateSymptom(int id, Map<String, dynamic> data) async {
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
          'message': result['message'] ?? 'Gejala berhasil diperbarui',
          'data': result
        };
      } else {
        return {
          'success': false,
          'message': result['message'] ?? 'Gagal memperbarui gejala'
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Delete symptom
  Future<Map<String, dynamic>> deleteSymptom(int id) async {
    try {
      final response = await http.delete(Uri.parse('$baseUrl/$id/'), headers: _headers);

      if (response.statusCode == 204) {
        return {'success': true, 'message': 'Gejala berhasil dihapus'};
      }

      final result = jsonDecode(response.body);
      return {
        'success': response.statusCode >= 200 && response.statusCode < 300,
        'message': result['message'] ?? 'Gagal menghapus gejala'
      };
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }
}
