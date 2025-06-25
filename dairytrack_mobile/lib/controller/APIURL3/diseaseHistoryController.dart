import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class DiseaseHistoryController {
  final String baseUrl = '$API_URL3/disease-history'; // Tanpa trailing slash
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Get all disease histories
  Future<Map<String, dynamic>> getDiseaseHistories() async {
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
  // Get disease history by ID
  Future<Map<String, dynamic>> getDiseaseHistoryById(int id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/$id/'), headers: _headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
      } else {
        return {'success': false, 'message': 'Gagal mengambil detail penyakit'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Create new disease history
  Future<Map<String, dynamic>> createDiseaseHistory(Map<String, dynamic> data) async {
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
          'message': result['message'] ?? 'Disease history added successfully',
          'data': result,
        };
      } else {
        return {
          'success': false,
          'message': result['message'] ?? 'Failed to add disease history',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update disease history
  Future<Map<String, dynamic>> updateDiseaseHistory(int id, Map<String, dynamic> data) async {
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
          'message': result['message'] ?? 'Riwayat penyakit berhasil diperbarui',
          'data': result,
        };
      } else {
        return {
          'success': false,
          'message': result['message'] ?? 'Gagal memperbarui riwayat penyakit',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Delete disease history
  Future<Map<String, dynamic>> deleteDiseaseHistory(int id) async {
    try {
      final response = await http.delete(Uri.parse('$baseUrl/$id/'), headers: _headers);

      if (response.statusCode == 204) {
        return {'success': true, 'message': 'Riwayat penyakit berhasil dihapus'};
      }

      final result = jsonDecode(response.body);
      return {
        'success': response.statusCode >= 200 && response.statusCode < 300,
        'message': result['message'] ?? 'Gagal menghapus riwayat penyakit',
      };
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }
}
