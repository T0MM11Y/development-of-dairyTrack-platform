import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class CattleDistributionController {
  final String baseUrl = '$API_URL1/user-cow'; // Adjust base URL as needed
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Assign a cow to a user
  Future<Map<String, dynamic>> assignCowToUser(int userId, int cowId) async {
    try {
      final url = Uri.parse('$baseUrl/assign');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({'user_id': userId, 'cow_id': cowId}),
      );

      return _handleResponse(response, 'Failed to assign cow to user');
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Unassign a cow from a user
  Future<Map<String, dynamic>> unassignCowFromUser(
      int userId, int cowId) async {
    try {
      final url = Uri.parse('$baseUrl/unassign');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({'user_id': userId, 'cow_id': cowId}),
      );

      return _handleResponse(response, 'Failed to unassign cow from user');
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // List cows managed by a user
  Future<Map<String, dynamic>> listCowsByUser(int userId) async {
    try {
      final url = Uri.parse('$baseUrl/list/$userId');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {'success': true, 'data': responseData};
      } else {
        return {'success': false, 'message': 'Failed to list cows by user'};
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get farmers with cows
  Future<Map<String, dynamic>> getFarmersWithCows() async {
    try {
      final url = Uri.parse('$baseUrl/farmers-with-cows');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {'success': true, 'data': responseData};
      } else {
        return {'success': false, 'message': 'Failed to get farmers with cows'};
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all users and all cows
  Future<Map<String, dynamic>> getAllUsersAndAllCows() async {
    try {
      final url = Uri.parse('$baseUrl/all-users-and-all-cows');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {'success': true, 'data': responseData};
      } else {
        return {
          'success': false,
          'message': 'Failed to get all users and all cows'
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Generic response handler
  Map<String, dynamic> _handleResponse(
      http.Response response, String errorMessage) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final responseData = jsonDecode(response.body);
      return {'success': true, 'data': responseData};
    } else {
      try {
        final errorData = jsonDecode(response.body);
        return {
          'success': false,
          'message': errorData['error'] ?? errorMessage,
        };
      } catch (e) {
        return {'success': false, 'message': errorMessage};
      }
    }
  }
}
