import 'dart:convert';
import 'dart:io';

import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/peternakan/gallery.dart';
import 'package:http/http.dart' as http;

// GET semua data gallery
Future<List<Gallery>> getGalleries() async {
  final response = await fetchAPI("galleries");
  print("API Response: $response"); // Log untuk debugging

  // Pastikan respons adalah daftar JSON
  if (response is List) {
    List<Gallery> galleries = [];
    for (var item in response) {
      galleries.add(Gallery.fromJson(item));
    }
    return galleries;
  } else {
    throw Exception("Unexpected response format");
  }
}

// GET satu gallery by ID
Future<Gallery> getGalleryById(String id) async {
  final response = await fetchAPI("galleries/$id");
  if (response['status'] == 200) {
    return Gallery.fromJson(response['data']);
  } else {
    throw Exception(response['message']);
  }
}

// CREATE gallery baru
Future<Gallery> createGallery(Gallery gallery, File? photoFile) async {
  try {
    // Buat map untuk data JSON
    final Map<String, String> fields =
        gallery.toJson().map((key, value) => MapEntry(key, value.toString()));

    // Buat MultipartRequest
    final request =
        http.MultipartRequest('POST', Uri.parse('$BASE_URL/galleries'))
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
      return Gallery.fromJson(responseData);
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
    throw Exception('Failed to create gallery: $e');
  }
}

// UPDATE gallery
Future<Gallery> updateGallery(
    String id, Gallery gallery, File? photoFile) async {
  try {
    // Buat map untuk data JSON
    final Map<String, String> fields =
        gallery.toJson().map((key, value) => MapEntry(key, value.toString()));

    // Buat MultipartRequest
    final request =
        http.MultipartRequest('PUT', Uri.parse('$BASE_URL/galleries/$id'))
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
      return Gallery.fromJson(responseData);
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
    throw Exception('Failed to update gallery: $e');
  }
}

// DELETE gallery
Future<void> deleteGallery(String id) async {
  try {
    final response = await fetchAPI("galleries/$id", method: "DELETE");

    if (response['status'] == 200 || response['status'] == 204) {
      if (response.containsKey('data') && response['data'] != null) {
        final responseData = response['data'];
        print(responseData['message'] ??
            'Gallery deleted successfully'); // Display success message
      } else {
        print('Gallery deleted successfully'); // Default message for 204
      }
    } else {
      final errorMessage = response.containsKey('error')
          ? response['error']
          : 'Unknown error occurred';
      throw Exception(errorMessage);
    }
  } catch (e) {
    throw Exception('Failed to delete gallery: $e');
  }
}

// GET gallery photo by ID
Future<String> getGalleryPhoto(String id) async {
  final response = await fetchAPI("galleries/$id/photo");
  if (response['status'] == 200) {
    return response['data']['photoUrl'];
  } else {
    throw Exception(response['message']);
  }
}
