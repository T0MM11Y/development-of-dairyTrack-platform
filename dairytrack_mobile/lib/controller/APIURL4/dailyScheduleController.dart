import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class DailyFeedManagementController {
  final String baseUrl = '$API_URL1/daily_feed';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Create a new Daily Feed
  Future<Map<String, dynamic>> createDailyFeed({
    required int cowId,
    required String date,
    required String session,
    required int userId,
    List<Map<String, dynamic>>? items,
  }) async {
    try {
      final url = Uri.parse('$baseUrl');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({
          'cow_id': cowId,
          'date': date,
          'session': session,
          'items': items ?? [],
          'user_id': userId,
          'created_by': userId,
          'updated_by': userId,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jadwal pakan berhasil dibuat',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to create daily feed';
          return {
            'success': false,
            'message': message,
            'existing': errorData['existing'],
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to create daily feed',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update a Daily Feed
  Future<Map<String, dynamic>> updateDailyFeed({
    required int id,
    int? cowId,
    String? date,
    String? session,
    required int userId,
    List<Map<String, dynamic>>? items,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode({
          'cow_id': cowId,
          'date': date,
          'session': session,
          'items': items ?? [],
          'user_id': userId,
          'updated_by': userId,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jadwal pakan berhasil diperbarui',
          'data': responseData['data'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          String message = errorData['message'] ?? 'Failed to update daily feed';
          return {
            'success': false,
            'message': message,
            'existing': errorData['existing'],
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Jadwal pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all Daily Feeds
  Future<Map<String, dynamic>> getAllDailyFeeds({
    int? cowId,
    String? date,
    String? session,
    required int userId,
  }) async {
    try {
      final queryParameters = <String, String>{};
      if (cowId != null) queryParameters['cow_id'] = cowId.toString();
      if (date != null) queryParameters['date'] = date;
      if (session != null) queryParameters['session'] = session;

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
            'message': errorData['message'] ?? 'Failed to get daily feeds',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to get daily feeds',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get a Daily Feed by ID
  Future<Map<String, dynamic>> getDailyFeedById(int id, int userId) async {
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
            'message': errorData['message'] ?? 'Jadwal pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Jadwal pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete a Daily Feed
  Future<Map<String, dynamic>> deleteDailyFeed(int id, int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$id');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Jadwal pakan berhasil dihapus',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Jadwal pakan tidak ditemukan',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Jadwal pakan tidak ditemukan',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Search Daily Feeds
  Future<Map<String, dynamic>> searchDailyFeeds({
    int? cowId,
    String? startDate,
    String? endDate,
    String? session,
    required int userId,
  }) async {
    try {
      final queryParameters = <String, String>{};
      if (cowId != null) queryParameters['cow_id'] = cowId.toString();
      if (startDate != null) queryParameters['start_date'] = startDate;
      if (endDate != null) queryParameters['end_date'] = endDate;
      if (session != null) queryParameters['session'] = session;

      final url = Uri.parse('$baseUrl/search').replace(queryParameters: queryParameters);
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
            'message': errorData['message'] ?? 'Failed to search daily feeds',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to search daily feeds',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}