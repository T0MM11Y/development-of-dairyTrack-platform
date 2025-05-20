import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class MilkingSessionController {
  final String baseUrl = '$API_URL1/milk-production';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Add milking session
  Future<Map<String, dynamic>> addMilkingSession(
      Map<String, dynamic> sessionData) async {
    try {
      final url = Uri.parse('$baseUrl/milking-sessions');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode(sessionData),
      );

      final responseData = jsonDecode(response.body);
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'message':
              responseData['message'] ?? 'Milking session added successfully',
          'id': responseData['id'],
          'batch_id': responseData['batch_id'],
        };
      } else {
        return {
          'success': false,
          'message': responseData['error'] ?? 'Failed to add milking session',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get milking sessions
  Future<List<dynamic>> getMilkingSessions() async {
    try {
      final url = Uri.parse('$baseUrl/milking-sessions');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to fetch milking sessions');
      }
    } catch (e) {
      throw Exception('An error occurred: $e');
    }
  }

  // Get milk batches
  Future<List<dynamic>> getMilkBatches() async {
    try {
      final url = Uri.parse('$baseUrl/milk-batches');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to fetch milk batches');
      }
    } catch (e) {
      throw Exception('An error occurred: $e');
    }
  }

  // Get daily summaries
  Future<Map<String, dynamic>> getDailySummaries({
    String? cowId,
    String? startDate,
    String? endDate,
  }) async {
    try {
      final url =
          Uri.parse('$baseUrl/daily-summaries').replace(queryParameters: {
        if (cowId != null) 'cow_id': cowId,
        if (startDate != null) 'start_date': startDate,
        if (endDate != null) 'end_date': endDate,
      });

      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to fetch daily summaries');
      }
    } catch (e) {
      throw Exception('An error occurred: $e');
    }
  }

  // Delete milking session
  Future<Map<String, dynamic>> deleteMilkingSession(int sessionId) async {
    try {
      final url = Uri.parse('$baseUrl/milking-sessions/$sessionId');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'message': 'Milking session deleted successfully'
        };
      } else {
        final responseData = jsonDecode(response.body);
        return {
          'success': false,
          'message':
              responseData['error'] ?? 'Failed to delete milking session',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update milking session
  Future<Map<String, dynamic>> updateMilkingSession(
      int sessionId, Map<String, dynamic> sessionData) async {
    try {
      final url = Uri.parse('$baseUrl/milking-sessions/$sessionId');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode(sessionData),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message':
              responseData['message'] ?? 'Milking session updated successfully',
          'id': responseData['id'],
        };
      } else {
        final responseData = jsonDecode(response.body);
        return {
          'success': false,
          'message':
              responseData['error'] ?? 'Failed to update milking session',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Export daily summaries to PDF
  Future<Map<String, dynamic>> exportDailySummariesToPDF({
    String? cowId,
    String? startDate,
    String? endDate,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/export/daily-summaries/pdf')
          .replace(queryParameters: {
        if (cowId != null) 'cow_id': cowId,
        if (startDate != null) 'start_date': startDate,
        if (endDate != null) 'end_date': endDate,
      });

      final response = await http.get(
        url,
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': response.bodyBytes,
          'mimeType': 'application/pdf'
        };
      } else {
        final responseData = jsonDecode(response.body);
        return {
          'success': false,
          'message': responseData['error'] ??
              'Failed to export daily summaries to PDF',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Export daily summaries to Excel
  Future<Map<String, dynamic>> exportDailySummariesToExcel({
    String? cowId,
    String? startDate,
    String? endDate,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/export/daily-summaries/excel')
          .replace(queryParameters: {
        if (cowId != null) 'cow_id': cowId,
        if (startDate != null) 'start_date': startDate,
        if (endDate != null) 'end_date': endDate,
      });

      final response = await http.get(
        url,
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': response.bodyBytes,
          'mimeType':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
      } else {
        final responseData = jsonDecode(response.body);
        return {
          'success': false,
          'message': responseData['error'] ??
              'Failed to export daily summaries to Excel',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Export milking sessions to PDF
  Future<Map<String, dynamic>> exportMilkingSessionsToPDF() async {
    try {
      final url = Uri.parse('$baseUrl/export/pdf');
      final response = await http.get(
        url,
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': response.bodyBytes,
          'mimeType': 'application/pdf'
        };
      } else {
        final responseData = jsonDecode(response.body);
        return {
          'success': false,
          'message': responseData['error'] ??
              'Failed to export milking sessions to PDF',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Export milking sessions to Excel
  Future<Map<String, dynamic>> exportMilkingSessionsToExcel() async {
    try {
      final url = Uri.parse('$baseUrl/export/excel');
      final response = await http.get(
        url,
        headers: _headers,
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': response.bodyBytes,
          'mimeType':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
      } else {
        final responseData = jsonDecode(response.body);
        return {
          'success': false,
          'message': responseData['error'] ??
              'Failed to export milking sessions to Excel',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
