import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class HealthCheckController {
  final String baseUrl = '$API_URL3/health-checks'; // Tanpa trailing slash
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Get all health checks
  Future<Map<String, dynamic>> getHealthChecks() async {
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

  // Get health check by ID
  Future<Map<String, dynamic>> getHealthCheckById(int id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/$id/'), headers: _headers);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false,
          'message': 'Gagal mengambil detail pemeriksaan (${response.statusCode})'
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Create health check
  Future<Map<String, dynamic>> createHealthCheck(Map<String, dynamic> data) async {
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
          'message': result['message'] ?? 'Data berhasil ditambahkan',
          'data': result,
        };
      } else {
        return {
          'success': false,
          'message': result['message'] ?? 'Gagal menambahkan data',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Update health check
  Future<Map<String, dynamic>> updateHealthCheck(int id, Map<String, dynamic> data) async {
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
          'message': result['message'] ?? 'Data berhasil diperbarui',
          'data': result,
        };
      } else {
        return {
          'success': false,
          'message': result['message'] ?? 'Gagal memperbarui data',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }

  // Delete health check
  Future<Map<String, dynamic>> deleteHealthCheck(int id) async {
    try {
      final response = await http.delete(Uri.parse('$baseUrl/$id/'), headers: _headers);

      if (response.statusCode == 204) {
        return {'success': true, 'message': 'Data berhasil dihapus'};
      }

      final result = jsonDecode(response.body);
      return {
        'success': false,
        'message': result['message'] ?? 'Gagal menghapus data'
      };
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan: $e'};
    }
  }
}
