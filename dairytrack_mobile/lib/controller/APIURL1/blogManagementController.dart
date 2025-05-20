import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../../api/apiController.dart';

class Blog {
  final int id;
  final String title;
  final String content;
  final String photoUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<Category> categories;

  Blog({
    required this.id,
    required this.title,
    required this.content,
    required this.photoUrl,
    required this.createdAt,
    required this.updatedAt,
    required this.categories,
  });

  factory Blog.fromJson(Map<String, dynamic> json) {
    final dateFormat = DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'");

    return Blog(
      id: json['id'] as int,
      title: json['title'] as String,
      content: json['content'] as String,
      photoUrl: json['photo_url'] as String,
      createdAt: dateFormat.parse(json['created_at']),
      updatedAt: dateFormat.parse(json['updated_at']),
      categories: (json['categories'] as List)
          .map((categoryJson) => Category.fromJson(categoryJson))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'content': content,
        'photo_url': photoUrl,
        'created_at': createdAt.toIso8601String(),
        'updated_at': updatedAt.toIso8601String(),
        'categories': categories.map((cat) => cat.toJson()).toList(),
      };
}

class Category {
  final int id;
  final String name;
  final String description;

  Category({
    required this.id,
    required this.name,
    required this.description,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
      };
}

class BlogManagementController {
  final String baseUrl = '$API_URL1/blog';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Add new blog
  Future<Map<String, dynamic>> addBlog(
    String title,
    String content,
    String photoPath,
    List<int> categoryIds,
  ) async {
    try {
      final url = Uri.parse('$baseUrl/add');
      var request = http.MultipartRequest('POST', url);
      request.fields['title'] = title;
      request.fields['content'] = content;
      request.files.add(await http.MultipartFile.fromPath('photo', photoPath));
      request.fields['category_ids'] = categoryIds
          .map((id) => id.toString())
          .toList()
          .join(','); // Send category IDs as comma-separated string

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'blog': responseData['blog'],
          'message': 'Blog added successfully',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to add blog',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to add blog'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all blogs
  Future<List<Blog>> listBlogs({String? categoryId}) async {
    try {
      Uri url;
      if (categoryId != null) {
        url = Uri.parse('$baseUrl/list?category_id=$categoryId');
      } else {
        url = Uri.parse('$baseUrl/list');
      }

      final response = await http.get(
        url,
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        final List<dynamic> blogsJson = responseData['blogs'];
        return blogsJson.map((json) => Blog.fromJson(json)).toList();
      } else {
        throw Exception(
          jsonDecode(response.body)['error'] ?? 'Failed to fetch blogs',
        );
      }
    } catch (e) {
      throw Exception('An error occurred: $e');
    }
  }

  // Get blog by ID
  Future<Blog> getBlogById(int blogId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/$blogId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        return Blog.fromJson(responseData['blog']);
      } else {
        throw Exception(
          jsonDecode(response.body)['error'] ?? 'Failed to fetch blog',
        );
      }
    } catch (e) {
      throw Exception('An error occurred: $e');
    }
  }

  // Update blog by ID
  Future<Map<String, dynamic>> updateBlog(
    int blogId, {
    String? title,
    String? content,
    String? photoPath,
    List<int>? categoryIds,
  }) async {
    try {
      final url = Uri.parse('$baseUrl/update/$blogId');
      var request = http.MultipartRequest('PUT', url);
      if (title != null) {
        request.fields['title'] = title;
      }
      if (content != null) {
        request.fields['content'] = content;
      }
      if (photoPath != null) {
        request.files
            .add(await http.MultipartFile.fromPath('photo', photoPath));
      }
      if (categoryIds != null) {
        request.fields['category_ids'] =
            categoryIds.map((id) => id.toString()).toList().join(',');
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'blog': responseData['blog'],
          'message': 'Blog updated successfully'
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to update blog',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to update blog'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete blog by ID
  Future<Map<String, dynamic>> deleteBlog(int blogId) async {
    try {
      final url = Uri.parse('$baseUrl/delete/$blogId');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'message': 'Blog deleted successfully'};
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to delete blog',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to delete blog'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get blog categories
  Future<List<Category>> getBlogCategories(int blogId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/$blogId/categories'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = jsonDecode(response.body);
        final List<dynamic> categoriesJson = responseData['categories'];
        return categoriesJson.map((json) => Category.fromJson(json)).toList();
      } else {
        throw Exception(
          jsonDecode(response.body)['error'] ??
              'Failed to fetch blog categories',
        );
      }
    } catch (e) {
      throw Exception('An error occurred: $e');
    }
  }

  // Add category to blog
  Future<Map<String, dynamic>> addCategoryToBlog(
      int blogId, int categoryId) async {
    try {
      final url = Uri.parse('$baseUrl/$blogId/categories');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode({'category_id': categoryId}),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'message': 'Category added to blog successfully'
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to add category to blog',
          };
        } catch (e) {
          return {
            'success': false,
            'message': 'Failed to add category to blog'
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
      final url = Uri.parse('$baseUrl/$blogId/categories/$categoryId');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'message': 'Category removed from blog successfully'
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
            'message': 'Failed to remove category from blog'
          };
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
