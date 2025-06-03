import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class MilkQualityControlsController {
  final String baseUrl = '$API_URL1/milk-expiry/milk-batches';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Get milk batches by status
  Future<Map<String, dynamic>> getMilkBatchesByStatus({
    required String userId,
    required String userRole,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/status').replace(queryParameters: {
        'user_id': userId,
        'user_role': userRole,
      });

      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to fetch milk batches by status');
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get milk batches by specific status
  Future<Map<String, dynamic>> getMilkBatchesBySpecificStatus({
    required String status,
    required String userId,
    required String userRole,
    int page = 1,
    int perPage = 10,
  }) async {
    try {
      final url =
          Uri.parse('$baseUrl/status/$status').replace(queryParameters: {
        'user_id': userId,
        'user_role': userRole,
        'page': page.toString(),
        'per_page': perPage.toString(),
      });

      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to fetch milk batches by specific status');
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update expired milk batches
  Future<Map<String, dynamic>> updateExpiredMilkBatches({
    required String userId,
    required String userRole,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/update-expired');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({
          'user_id': userId,
          'user_role': userRole,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to update expired milk batches');
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get expiry analysis
  Future<Map<String, dynamic>> getExpiryAnalysis({
    required String userId,
    required String userRole,
  }) async {
    try {
      final url =
          Uri.parse('$baseUrl/expiry-analysis').replace(queryParameters: {
        'user_id': userId,
        'user_role': userRole,
      });

      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to fetch expiry analysis');
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
