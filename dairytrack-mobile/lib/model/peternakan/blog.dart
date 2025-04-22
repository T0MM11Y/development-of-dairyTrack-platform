import 'dart:convert';
import 'dart:io';
import 'package:dairy_track/config/configApi5000.dart';
import 'package:html/parser.dart';
import 'package:http/http.dart' as http;

class Blog {
  int? id;
  final String title;
  final String description;
  String? photo;
  final int? topicId;
  final String? topicName;
  final DateTime createdAt;

  final DateTime updatedAt;

  Blog({
    this.id,
    required this.title,
    required this.description,
    this.photo,
    this.topicId,
    this.topicName,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Blog.fromJson(Map<String, dynamic> json) {
    print("Parsing Blog JSON: $json");
    return Blog(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'] ?? '0'),
      title: json['title'] ?? 'Untitled',
      description: _removeHtmlTags(json['description'] ?? 'No description'),
      photo: json['photo'],
      topicId: json['topic_id'] is int
          ? json['topic_id']
          : int.tryParse(json['topic_id'] ?? '0'),
      topicName: json['topic_name'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime(1970, 1, 1),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime(1970, 1, 1),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'title': title,
      'description': description,
      'photo': photo,
      if (topicId != null) 'topic_id': topicId,
      'topic_name': topicName,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  static String _removeHtmlTags(String input) {
    final document = parse(input);
    return document.body?.text ?? input;
  }

  // Tambahkan metode untuk mengunggah foto
  Future<void> uploadPhoto(File photoFile) async {
    try {
      final photoUrl = await _uploadPhoto(photoFile);
      if (photoUrl != null) {
        photo = photoUrl; // Perbarui properti photo
        print('Photo uploaded successfully: $photoUrl');
      } else {
        print('Failed to upload photo.');
      }
    } catch (e) {
      print('Error in uploadPhoto: $e');
    }
  }

  // Fungsi untuk mengunggah foto
  Future<String?> _uploadPhoto(File photoFile) async {
    final uri = await fetchAPI("blogs/photo", method: "POST");

    final request = http.MultipartRequest('POST', uri);

    // Tambahkan file foto ke request
    request.files
        .add(await http.MultipartFile.fromPath('photo', photoFile.path));

    try {
      final response = await request.send();

      if (response.statusCode == 201) {
        final responseBody = await response.stream.bytesToString();
        final responseData = jsonDecode(responseBody);
        return responseData[
            'photo_url']; // Pastikan ini sesuai dengan respons API Anda
      } else {
        throw Exception(
            'Failed to upload photo. Status code: ${response.statusCode}');
      }
    } catch (e) {
      print('Error uploading photo: $e');
      return null;
    }
  }
}
