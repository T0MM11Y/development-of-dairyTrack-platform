import 'dart:convert';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
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

      print('API URL: $url'); // Debug print
      print('Response status: ${response.statusCode}'); // Debug print
      print('Response body: ${response.body}'); // Debug print

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body) as Map<String, dynamic>;

        // Convert cow data to proper format
        List<Map<String, dynamic>> cows = [];
        if (responseData['cows'] != null) {
          cows = (responseData['cows'] as List)
              .map((cowData) => Map<String, dynamic>.from(cowData as Map))
              .toList();
        } else if (responseData['data'] != null &&
            responseData['data']['cows'] != null) {
          cows = (responseData['data']['cows'] as List)
              .map((cowData) => Map<String, dynamic>.from(cowData as Map))
              .toList();
        }

        return {'success': true, 'cows': cows, 'data': responseData};
      } else {
        return {'success': false, 'message': 'Failed to list cows by user'};
      }
    } catch (e) {
      print('Error in listCowsByUser: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get farmers with cows
  Future<Map<String, dynamic>> getFarmersWithCows() async {
    try {
      final url = Uri.parse('$baseUrl/farmers-with-cows');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body) as Map<String, dynamic>;
        return {'success': true, 'data': responseData};
      } else {
        return {'success': false, 'message': 'Failed to get farmers with cows'};
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get users with cows - formatted for analysis view
  Future<Map<String, dynamic>> getUsersWithCows() async {
    try {
      final url = Uri.parse('$baseUrl/farmers-with-cows');
      final response = await http.get(url, headers: _headers);

      print('API URL: $url');
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body) as Map<String, dynamic>;

        // Transform data to match the expected format for analysis view
        List<Map<String, dynamic>> usersWithCows = [];

        if (responseData['farmers_with_cows'] != null) {
          usersWithCows =
              (responseData['farmers_with_cows'] as List).map((farmer) {
            final farmerMap = Map<String, dynamic>.from(farmer as Map);

            // Transform user data
            Map<String, dynamic> userData = {};
            if (farmerMap['user'] != null) {
              userData = Map<String, dynamic>.from(farmerMap['user'] as Map);
            }

            // Transform cows data and add farmer information
            List<Map<String, dynamic>> cows = [];
            if (farmerMap['cows'] != null) {
              cows = (farmerMap['cows'] as List).map((cow) {
                final cowMap = Map<String, dynamic>.from(cow as Map);
                return {
                  ...cowMap,
                  'farmerName':
                      userData['name'] ?? userData['username'] ?? 'Unknown',
                  'farmerId': userData['id'],
                };
              }).toList();
            }

            return {
              'id': userData['id'],
              'name': userData['name'] ?? userData['username'],
              'username': userData['username'],
              'email': userData['email'],
              'contact': userData['contact'],
              'religion': userData['religion'],
              'role_id': userData['role_id'],
              'token': userData['token'],
              'cows': cows,
            };
          }).toList();
        }

        return {
          'success': true,
          'usersWithCows': usersWithCows,
          'data': responseData
        };
      } else {
        return {'success': false, 'message': 'Failed to get users with cows'};
      }
    } catch (e) {
      print('Error in getUsersWithCows: $e');
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all users and all cows
  Future<Map<String, dynamic>> getAllUsersAndAllCows() async {
    try {
      final url = Uri.parse('$baseUrl/all-users-and-all-cows');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body) as Map<String, dynamic>;
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

  Future<Map<String, dynamic>> getCowManagers(int cowId) async {
    try {
      final url = Uri.parse('$baseUrl/cow-managers/$cowId');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body) as Map<String, dynamic>;
        return {'success': true, 'managers': responseData['managers']};
      } else {
        return {'success': false, 'message': 'Failed to get cow managers'};
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get farmers (managers) for a specific cow
  Future<Map<String, dynamic>> getFarmersForCow(int cowId) async {
    try {
      final url = Uri.parse('$baseUrl/cow-managers/$cowId');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body) as Map<String, dynamic>;
        return {
          'success': true,
          'cow_id': responseData['cow_id'],
          'farmers': responseData['managers']
        };
      } else {
        return {'success': false, 'message': 'Failed to get farmers for cow'};
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Generic response handler
  Map<String, dynamic> _handleResponse(
      http.Response response, String errorMessage) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final responseData = jsonDecode(response.body) as Map<String, dynamic>;
      return {'success': true, 'data': responseData};
    } else {
      try {
        final errorData = jsonDecode(response.body) as Map<String, dynamic>;
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
