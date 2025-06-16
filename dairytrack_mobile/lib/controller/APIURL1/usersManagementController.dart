import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';
import 'package:path_provider/path_provider.dart';

class User {
  final int id;
  final String name;
  final String username;
  final String email;
  final String contact;
  final String religion;
  final int roleId;
  final String? birth;
  final String? token;

  User({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.contact,
    required this.religion,
    required this.roleId,
    this.birth,
    this.token,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      name: json['name'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      contact: json['contact'] as String,
      religion: json['religion'] as String,
      roleId: json['role_id'] as int,
      birth: json['birth'] as String?,
      token: json['token'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'username': username,
        'email': email,
        'contact': contact,
        'religion': religion,
        'role_id': roleId,
        'birth': birth,
        'token': token,
      };
}

class UsersManagementController {
  final String baseUrl = '$API_URL1/user';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  Map<String, dynamic> _handleResponse(
    http.Response response, {
    String defaultErrorMsg = 'An error occurred',
  }) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final responseData = jsonDecode(response.body);
      return {'success': true, 'data': responseData};
    } else {
      try {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['error'] ?? defaultErrorMsg,
        };
      } catch (e) {
        return {'success': false, 'message': defaultErrorMsg};
      }
    }
  }

  Future<Map<String, dynamic>> getAllUsers() async {
    try {
      final response =
          await http.get(Uri.parse('$baseUrl/list'), headers: _headers);
      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to fetch users',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> addUser(Map<String, dynamic> userData) async {
    try {
      final url = Uri.parse('$baseUrl/add');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode(userData),
      );
      final result = _handleResponse(
        response,
        defaultErrorMsg: 'Failed to add user',
      );

      if (result['success']) {
        return {
          'success': true,
          'user': result['data'],
          'message': 'User added successfully',
        };
      }
      return result;
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> getUserById(int userId) async {
    try {
      final url = Uri.parse('$baseUrl/$userId');
      final response = await http.get(url, headers: _headers);
      final result = _handleResponse(
        response,
        defaultErrorMsg: 'User not found',
      );

      if (result['success']) {
        return {'success': true, 'user': result['data']};
      }
      return result;
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<List<User>> listUsers() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/list'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);

        if (responseData.containsKey('users') &&
            responseData['users'] is List) {
          final List<dynamic> usersList = responseData['users'];
          return usersList.map((json) => User.fromJson(json)).toList();
        } else {
          throw Exception('Unexpected response format from API');
        }
      } else {
        throw Exception(
          jsonDecode(response.body)['error'] ?? 'Failed to fetch users',
        );
      }
    } catch (e) {
      throw Exception('An error occurred: $e');
    }
  }

  Future<Map<String, dynamic>> updateUser(
    int userId,
    Map<String, dynamic> userData,
  ) async {
    try {
      final url = Uri.parse('$baseUrl/edit/$userId');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode(userData),
      );
      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to update user',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> deleteUser(int userId) async {
    try {
      final url = Uri.parse('$baseUrl/delete/$userId');
      final response = await http.delete(url, headers: _headers);
      final result = _handleResponse(
        response,
        defaultErrorMsg: 'Failed to delete user',
      );

      if (result['success']) {
        return {'success': true, 'message': 'User deleted successfully'};
      }
      return result;
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // filepath: c:\Users\t0mm11y\Documents\TA\dairytrack_mobile\lib\controller\APIURL1\usersManagementController.dart
  Future<Map<String, dynamic>> exportUsersToPDF() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/export/pdf'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/users_export.pdf';
        final file = File(filePath);
        await file.writeAsBytes(response.bodyBytes); // Save the file

        return {
          'success': true,
          'filePath': filePath,
        };
      } else {
        return {
          'success': false,
          'message':
              jsonDecode(response.body)['error'] ?? 'Failed to export to PDF',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> exportUsersToExcel() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/export/excel'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/users_export.xlsx';
        final file = File(filePath);
        await file.writeAsBytes(response.bodyBytes); // Save the file
        return {
          'success': true,
          'filePath': filePath,
        };
      } else {
        return {
          'success': false,
          'message':
              jsonDecode(response.body)['error'] ?? 'Failed to export to Excel',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> getAllFarmers() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/farmers'),
        headers: _headers,
      );
      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to fetch farmers',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> resetPassword(int userId) async {
    try {
      final url = Uri.parse('$baseUrl/reset-password/$userId');
      final response = await http.post(url, headers: _headers);
      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to reset password',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<Map<String, dynamic>> changePassword(
    int userId,
    String oldPassword,
    String newPassword,
  ) async {
    try {
      final url = Uri.parse('$baseUrl/change-password/$userId');
      final body = {'old_password': oldPassword, 'new_password': newPassword};
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode(body),
      );
      return _handleResponse(
        response,
        defaultErrorMsg: 'Failed to change password',
      );
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
