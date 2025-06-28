// lib/utils/auth_utils.dart
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:logger/logger.dart';

class AuthUtils {
  static final Logger _logger = Logger();

  static Future<Map<String, dynamic>> getUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userString = prefs.getString('user');
      if (userString != null) {
        return jsonDecode(userString) as Map<String, dynamic>;
      } else {
        _logger.e('User not found in SharedPreferences');
        throw Exception('User not found in SharedPreferences');
      }
    } catch (e) {
      _logger.e('Error fetching user from SharedPreferences: $e');
      throw Exception('Failed to fetch user: $e');
    }
  }

  static Future<int> getUserId() async {
    final userData = await getUser();
    final userId = userData['id'];
    if (userId == null) {
      _logger.e('User ID not found in user data');
      throw Exception('User ID not found');
    }
    return userId;
  }

  static Future<bool> isSupervisor() async {
    final userData = await getUser();
    return userData['role_id'] == 2;
  }
}
