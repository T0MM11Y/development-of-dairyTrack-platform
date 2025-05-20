import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart'; // Pastikan path ini benar

class CategoryManagementController {
  final String baseUrl =
      '$API_URL1/category'; // Adjust the endpoint to match your Flask route
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Add category
  Future<Map<String, dynamic>> addCategory(
      String name, String description) async {
    try {
      final url = Uri.parse('$baseUrl/add');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({'name': name, 'description': description}),
      );

      return _handleResponse(response, 'Failed to add category');
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // List categories
  Future<Map<String, dynamic>> listCategories() async {
    try {
      final url = Uri.parse('$baseUrl/list');
      final response = await http.get(url, headers: _headers);

      return _handleResponse(response, 'Failed to list categories');
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get category by ID
  Future<Map<String, dynamic>> getCategoryById(int categoryId) async {
    try {
      final url = Uri.parse('$baseUrl/$categoryId');
      final response = await http.get(url, headers: _headers);

      return _handleResponse(response, 'Failed to get category by ID');
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Update category
  Future<Map<String, dynamic>> updateCategory(
      int categoryId, String name, String description) async {
    try {
      final url = Uri.parse('$baseUrl/update/$categoryId');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode({'name': name, 'description': description}),
      );

      return _handleResponse(response, 'Failed to update category');
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete category
  Future<Map<String, dynamic>> deleteCategory(int categoryId) async {
    try {
      final url = Uri.parse('$baseUrl/delete/$categoryId');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {'success': true, 'message': responseData['message']};
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to delete category',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to delete category',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get category blogs
  Future<Map<String, dynamic>> getCategoryBlogs(int categoryId) async {
    try {
      final url = Uri.parse('$baseUrl/$categoryId/blogs');
      final response = await http.get(url, headers: _headers);

      return _handleResponse(response, 'Failed to get category blogs');
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Handle the response
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
        return {
          'success': false,
          'message': errorMessage,
        };
      }
    }
  }
}
