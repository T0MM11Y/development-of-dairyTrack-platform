import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart'; // Import intl package
import '../../api/apiController.dart';

class Gallery {
  final int id;
  final String title;
  final String imageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;

  Gallery({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Gallery.fromJson(Map<String, dynamic> json) {
    // Use the correct date format here
    final dateFormat = DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'");

    return Gallery(
      id: json['id'] as int,
      title: json['title'] as String,
      imageUrl: json['image_url'] as String,
      createdAt: dateFormat.parse(json['created_at']),
      updatedAt: dateFormat.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'image_url': imageUrl,
        'created_at': createdAt.toIso8601String(),
        'updated_at': updatedAt.toIso8601String(),
      };
}

class GalleryManagementController {
  final String baseUrl = '$API_URL1/gallery';
  final Map<String, String> _headers = {'Content-Type': 'application/json'};

  // Add new gallery
  Future<Map<String, dynamic>> addGallery(
      String title, String imagePath) async {
    try {
      final url = Uri.parse('$baseUrl/add');
      var request = http.MultipartRequest('POST', url);
      request.fields['title'] = title;
      request.files.add(await http.MultipartFile.fromPath('image', imagePath));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'gallery': responseData['gallery'],
          'message': 'Gallery added successfully',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to add gallery',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to add gallery'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get all galleries
  Future<List<Gallery>> listGalleries() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/list'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> responseData = jsonDecode(response.body);
        return responseData.map((json) => Gallery.fromJson(json)).toList();
      } else {
        throw Exception(
          jsonDecode(response.body)['error'] ?? 'Failed to fetch galleries',
        );
      }
    } catch (e) {
      throw Exception('An error occurred: $e');
    }
  }

  // Update gallery by ID
  Future<Map<String, dynamic>> updateGallery(
      int galleryId, String? title, String? imagePath) async {
    try {
      final url = Uri.parse('$baseUrl/update/$galleryId');
      var request = http.MultipartRequest('PUT', url);
      if (title != null) {
        request.fields['title'] = title;
      }
      if (imagePath != null) {
        request.files
            .add(await http.MultipartFile.fromPath('image', imagePath));
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'gallery': responseData['gallery'],
          'message': 'Gallery updated successfully'
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to update gallery',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to update gallery'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete gallery by ID
  Future<Map<String, dynamic>> deleteGallery(int galleryId) async {
    try {
      final url = Uri.parse('$baseUrl/delete/$galleryId');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'message': 'Gallery deleted successfully'};
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to delete gallery',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to delete gallery'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
