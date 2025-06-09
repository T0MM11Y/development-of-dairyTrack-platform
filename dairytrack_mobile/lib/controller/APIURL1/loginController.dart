import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api/apiController.dart';

class LoginController {
  Future<Map<String, dynamic>> login(String username, String password) async {
    final url = Uri.parse('$API_URL1/auth/login');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);

        // Simpan token dan data user ke local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('authToken', responseData['token']);

        // ✅ Simpan juga data user ke SharedPreferences
        await prefs.setString('user', jsonEncode({
          'id': responseData['user_id'],
          'username': responseData['username'],
          'name': responseData['name'],
          'email': responseData['email'],
          'role': responseData['role'],
          'role_id': responseData['role_id'],
          'token': responseData['token'],
        }));

        return responseData;
      } else {
        return {
          'success': false,
          'message': jsonDecode(response.body)['message'] ?? 'Login failed',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> logout() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('authToken');

    if (token == null) {
      return {'success': false, 'message': 'No token found'};
    }

    final url = Uri.parse('$API_URL1/auth/logout');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'token': token}),
      );

      if (response.statusCode == 200) {
        // Hapus token dari local storage
        await prefs.remove('authToken');
        return jsonDecode(response.body);
      } else {
        return {
          'success': false,
          'message': jsonDecode(response.body)['message'] ?? 'Logout failed',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
