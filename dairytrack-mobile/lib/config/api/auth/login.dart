import 'package:dairy_track/config/configApi5000.dart';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

// Fungsi login
Future<Map<String, dynamic>> login(Map<String, dynamic> data) async {
  if (data.isEmpty ||
      !data.containsKey('email') ||
      !data.containsKey('password')) {
    return {
      'status': 400,
      'message': 'Email and password are required.',
    };
  }

  try {
    final response = await fetchAPI(
      "auth/login",
      method: "POST",
      data: data,
    );

    if (response['status'] == 200) {
      final userData = response['user'];
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString("user", jsonEncode(userData));
      return {
        'status': 200,
        'message': 'Login successful.',
        'user': userData,
      };
    }

    return {
      'status': response['status'],
      'message': response['message'] ?? 'Login failed.',
    };
  } catch (error) {
    return {
      'status': 500,
      'message': error.toString() ?? 'An unexpected error occurred.',
    };
  }
}
