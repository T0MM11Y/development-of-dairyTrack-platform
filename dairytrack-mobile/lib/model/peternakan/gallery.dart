import 'dart:convert';
import 'dart:io';
import 'package:dairy_track/config/configApi5000.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class Gallery {
  int? id;
  final String photo; // URL atau path file ke foto
  final String tittle; // Judul foto
  DateTime createdAt;
  DateTime updatedAt;

  Gallery({
    this.id,
    required this.photo,
    required this.tittle,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Gallery.fromJson(Map<String, dynamic> json) {
    DateTime parseDate(String? dateStr) {
      if (dateStr == null || dateStr.isEmpty) {
        return DateTime(1970, 1, 1); // Tanggal default
      }
      try {
        // Coba parsing dengan DateTime.parse
        return DateTime.parse(dateStr);
      } catch (e) {
        try {
          // Jika gagal, coba parsing dengan format lain (contoh: Sat, 12 Apr 2025 05:04:54 GMT)
          return DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'")
              .parse(dateStr, true)
              .toUtc();
        } catch (e) {
          print('Error parsing date: $e');
          return DateTime(1970, 1, 1); // Tanggal default jika semua gagal
        }
      }
    }

    return Gallery(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'] ?? '0'),
      photo: json['photo'] ?? '',
      tittle: json['tittle'] ?? 'Untitled',
      createdAt: parseDate(json['created_at']),
      updatedAt: parseDate(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'photo': photo,
      'tittle': tittle,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Tambahkan metode untuk mengunggah foto
  Future<void> uploadPhoto(File photoFile) async {
    try {
      final photoUrl = await _uploadPhoto(photoFile);
      if (photoUrl != null) {
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
    final uri = await fetchAPI("/galleries", method: "POST");

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
