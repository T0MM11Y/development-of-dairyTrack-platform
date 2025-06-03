import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api/apiController.dart';

class BlogCategoryManagementController {
  final String baseUrl = '$API_URL1/blog-category';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Assign category to blog
  Future<Map<String, dynamic>> assignCategoryToBlog(
      int blogId, int categoryId) async {
    try {
      final url = Uri.parse('$baseUrl/assign');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({'blog_id': blogId, 'category_id': categoryId}),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'],
          'data': responseData,
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message':
                errorData['error'] ?? 'Failed to assign category to blog',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to assign category to blog',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Remove category from blog
  Future<Map<String, dynamic>> removeCategoryFromBlog(
      int blogId, int categoryId) async {
    try {
      final url = Uri.parse('$baseUrl/remove');
      final response = await http.delete(
        url,
        headers: _headers,
        body: jsonEncode({'blog_id': blogId, 'category_id': categoryId}),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'],
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message':
                errorData['error'] ?? 'Failed to remove category from blog',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to remove category from blog',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get blog categories
  Future<Map<String, dynamic>> getBlogCategories(int blogId) async {
    try {
      final url = Uri.parse('$baseUrl/blog/$blogId/categories');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {'success': true, 'data': responseData};
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to get blog categories',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to get blog categories',
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
      final url = Uri.parse('$baseUrl/category/$categoryId/blogs');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {'success': true, 'data': responseData};
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to get category blogs',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to get category blogs',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Bulk assign categories to a blog
  Future<Map<String, dynamic>> bulkAssignCategories(
      int blogId, List<int> categoryIds,
      {bool replace = false}) async {
    try {
      final url = Uri.parse('$baseUrl/bulk-assign');
      final response = await http.post(url,
          headers: _headers,
          body: jsonEncode({
            'blog_id': blogId,
            'category_ids': categoryIds,
            'replace': replace,
          }));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'message': responseData['message'],
          'data': responseData,
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to bulk assign categories',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to bulk assign categories',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // List all blog-category relationships
  Future<Map<String, dynamic>> listBlogCategories() async {
    try {
      final url = Uri.parse('$baseUrl/list');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return {'success': true, 'data': responseData};
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ??
                'Failed to list blog-category relationships',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to list blog-category relationships',
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
