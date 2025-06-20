import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api/apiController.dart';

class NotificationController {
  final String baseUrl = '$API_URL1/notification';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Get notifications for current user
  Future<Map<String, dynamic>> getNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');

      if (userId == null) {
        return {'success': false, 'message': 'User not authenticated'};
      }

      // Fix: Use query parameter instead of path parameter
      final url = Uri.parse('$baseUrl/?user_id=$userId');
      final response = await http.get(url, headers: _headers);

      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to get notifications',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Mark notification as read
  Future<Map<String, dynamic>> markAsRead(int notificationId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');

      if (userId == null) {
        return {'success': false, 'message': 'User not authenticated'};
      }

      final url = Uri.parse('$baseUrl/$notificationId/read');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode({'user_id': userId}),
      );

      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to mark notification as read',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete notification
  Future<Map<String, dynamic>> deleteNotification(int notificationId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');

      if (userId == null) {
        return {'success': false, 'message': 'User not authenticated'};
      }

      final url = Uri.parse('$baseUrl/$notificationId');
      final response = await http.delete(
        url,
        headers: _headers,
        body: jsonEncode({'user_id': userId}),
      );

      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to delete notification',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Mark all notifications as read
  Future<Map<String, dynamic>> markAllAsRead() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');

      if (userId == null) {
        return {'success': false, 'message': 'User not authenticated'};
      }

      // First get all unread notifications
      final notifications = await getNotifications();
      if (!notifications['success']) {
        return notifications;
      }

      final unreadNotifications =
          (notifications['data']['notifications'] as List)
              .where((notif) => !(notif['is_read'] ?? false))
              .toList();

      // Mark each unread notification as read
      for (var notification in unreadNotifications) {
        await markAsRead(notification['id']);
      }

      return {'success': true, 'message': 'All notifications marked as read'};
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Clear all notifications
  Future<Map<String, dynamic>> clearAllNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');

      if (userId == null) {
        return {'success': false, 'message': 'User not authenticated'};
      }

      final url = Uri.parse('$baseUrl/clear-all');
      final response = await http.delete(
        url,
        headers: _headers,
        body: jsonEncode({'user_id': userId}),
      );

      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to clear all notifications',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get unread notification count
  Future<Map<String, dynamic>> getUnreadCount() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');

      if (userId == null) {
        return {
          'success': false,
          'message': 'User not authenticated',
          'count': 0
        };
      }

      // Fix: Use query parameter instead of path parameter
      final url = Uri.parse('$baseUrl/unread-count?user_id=$userId');
      final response = await http.get(url, headers: _headers);

      final result = _handleResponse(
        response,
        defaultErrorMsg: 'Failed to get unread count',
      );

      if (result['success']) {
        return {
          'success': true,
          'count': result['data']['unread_count'] ?? 0,
        };
      }

      return {'success': false, 'message': result['message'], 'count': 0};
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e', 'count': 0};
    }
  }

  // Create notification (for testing or admin purposes)
  Future<Map<String, dynamic>> createNotification({
    required int userId,
    required String title,
    required String message,
    String? type,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/create');
      final body = {
        'user_id': userId,
        'title': title,
        'message': message,
        'type': type ?? 'general',
        'metadata': metadata ?? {},
      };

      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode(body),
      );

      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to create notification',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Handle HTTP response consistently
  Map<String, dynamic> _handleResponse(
    http.Response response, {
    required String defaultErrorMsg,
  }) {
    try {
      final responseData = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'data': responseData};
      } else {
        return {
          'success': false,
          'message': responseData['error'] ??
              responseData['message'] ??
              defaultErrorMsg,
        };
      }
    } catch (e) {
      print('Error parsing response: $e');
      print('Response body: ${response.body}');
      print('Response status: ${response.statusCode}');
      return {
        'success': false,
        'message': 'Failed to parse response: $defaultErrorMsg',
      };
    }
  }
}
