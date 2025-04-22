import 'dart:convert';
import 'dart:io';

import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/peternakan/blog.dart';
import 'package:http/http.dart' as http;

// GET semua data blog
Future<List<Blog>> getBlogs() async {
  final response = await fetchAPI("blogs");
  print("API Response: $response"); // Log untuk debugging

  // Pastikan respons adalah daftar JSON
  if (response is List) {
    List<Blog> blogs = [];
    for (var item in response) {
      blogs.add(Blog.fromJson(item));
    }
    return blogs;
  } else {
    throw Exception("Unexpected response format");
  }
}

// GET satu blog by ID
Future<Blog> getBlogById(String id) async {
  final response = await fetchAPI("blogs/$id");
  if (response['status'] == 200) {
    return Blog.fromJson(response['data']);
  } else {
    throw Exception(response['message']);
  }
}

Future<Blog> createBlog(Blog blog, File? photoFile) async {
  try {
    // Buat map untuk data JSON
    final Map<String, String> fields =
        blog.toJson().map((key, value) => MapEntry(key, value.toString()));

    // Buat MultipartRequest
    final request = http.MultipartRequest('POST', Uri.parse('$BASE_URL/blogs'))
      ..fields.addAll(fields);

    // Tambahkan file jika ada
    if (photoFile != null) {
      request.files
          .add(await http.MultipartFile.fromPath('photo', photoFile.path));
    }

    // Kirim request
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    // Periksa status response
    if (response.statusCode == 201) {
      final responseData = jsonDecode(response.body);

      // Pastikan respons sesuai dengan struktur Flask
      return Blog.fromJson(responseData);
    } else if (response.statusCode == 400) {
      final responseData = jsonDecode(response.body);
      throw Exception(responseData['error'] ?? 'Invalid input data');
    } else if (response.statusCode == 500) {
      final responseData = jsonDecode(response.body);
      throw Exception(responseData['error'] ?? 'Server error occurred');
    } else {
      throw Exception('Unexpected error: ${response.statusCode}');
    }
  } catch (e) {
    throw Exception('Failed to create blog: $e');
  }
}

Future<Blog> updateBlog(String id, Blog blog, File? photoFile) async {
  try {
    // Buat map untuk data JSON
    final Map<String, String> fields =
        blog.toJson().map((key, value) => MapEntry(key, value.toString()));

    // Buat MultipartRequest
    final request =
        http.MultipartRequest('PUT', Uri.parse('$BASE_URL/blogs/$id'))
          ..fields.addAll(fields);

    // Tambahkan file jika ada
    if (photoFile != null) {
      request.files
          .add(await http.MultipartFile.fromPath('photo', photoFile.path));
    }

    // Kirim request
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    // Periksa status response
    if (response.statusCode == 200) {
      final responseData = jsonDecode(response.body);

      // Pastikan respons sesuai dengan struktur Flask
      return Blog.fromJson(responseData);
    } else if (response.statusCode == 400) {
      final responseData = jsonDecode(response.body);
      throw Exception(responseData['error'] ?? 'Invalid input data');
    } else if (response.statusCode == 500) {
      final responseData = jsonDecode(response.body);
      throw Exception(responseData['error'] ?? 'Server error occurred');
    } else {
      throw Exception('Unexpected error: ${response.statusCode}');
    }
  } catch (e) {
    throw Exception('Failed to update blog: $e');
  }
}

Future<void> deleteBlog(String id) async {
  try {
    final response = await fetchAPI("blogs/$id", method: "DELETE");

    if (response['status'] == 200 || response['status'] == 204) {
      // Handle success
      if (response.containsKey('data') && response['data'] != null) {
        final responseData = response['data'];
        print(responseData['message'] ??
            'Blog deleted successfully'); // Display success message
      } else {
        print('Blog deleted successfully'); // Default message for 204
      }
    } else {
      // Handle error response
      final errorMessage = response.containsKey('error')
          ? response['error']
          : 'Unknown error occurred';
      throw Exception(errorMessage);
    }
  } catch (e) {
    throw Exception(
        'Failed to delete blog: $e'); // Ensure consistent error handling
  }
}

// GET blog photo by ID
Future<String> getBlogPhoto(String id) async {
  final response = await fetchAPI("blogs/$id/photo");
  if (response['status'] == 200) {
    return response['data']['photoUrl'];
  } else {
    throw Exception(response['message']);
  }
}
