import 'dart:io';

import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';

// GET semua data sapi
Future<List<Cow>> getCows() async {
  final response = await fetchAPI("cows");

  if (response is List) {
    // Jika response adalah List langsung
    return response.isNotEmpty
        ? response.map((json) => Cow.fromJson(json)).toList()
        : <Cow>[];
  } else if (response is Map && response['status'] == 200) {
    // Jika response adalah Map dengan data di dalamnya
    final data = response['data'];
    if (data is List && data.isNotEmpty) {
      return data.map((json) => Cow.fromJson(json)).toList();
    }
    return <Cow>[];
  } else {
    throw Exception(response is Map && response.containsKey('message')
        ? response['message']
        : 'Unexpected response format');
  }
}

// GET satu sapi by ID
Future<Cow> getCowById(String id) async {
  final response = await fetchAPI("cows/$id");
  if (response is Map && response['status'] == 200) {
    // Jika data ditemukan
    return Cow.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Failed to fetch cow by ID');
  }
}

// CREATE sapi baru
Future<bool> addCow(Cow cow) async {
  final response = await fetchAPI(
    "cows",
    method: "POST",
    data: cow.toJson(),
  );
  if (response is Map ||
      response['status'] == 201 ||
      response['status'] == 200) {
    // Jika data berhasil ditambahkan
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to add cow');
  }
}

// UPDATE sapi
Future<bool> updateCow(String id, Cow cow) async {
  final response = await fetchAPI(
    "cows/$id",
    method: "PUT",
    data: cow.toJson(),
  );
  if (response is Map ||
      response['status'] == 200 ||
      response['status'] == 201) {
    // Jika data berhasil diperbarui
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to update cow');
  }
}

// DELETE sapi
Future<bool> deleteCow(int id) async {
  final response = await fetchAPI("cows/$id", method: "DELETE");
  if (response is Map ||
      response['status'] == 200 ||
      response['status'] == 204) {
    // Jika data berhasil dihapus
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to delete cow');
  }
}

Future<File?> exportCowsPDF(BuildContext context) async {
  final url = Uri.parse("$BASE_URL/cows/biekenpedeedf");

  try {
    final response = await http.get(url);

    if (response.statusCode == 200) {
      // Dapatkan direktori dokumen
      final directory = await getApplicationDocumentsDirectory();
      final outputFilePath = '${directory.path}/cows_export.pdf';

      final file = File(outputFilePath);
      await file.writeAsBytes(response.bodyBytes);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('PDF berhasil disimpan di: $outputFilePath'),
          backgroundColor: Colors.green,
        ),
      );

      // Tampilkan dialog konfirmasi
      final shouldOpen = await showDialog<bool>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('Buka File'),
            content: Text('Apakah Anda ingin membuka file yang telah diunduh?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: Text('No'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: Text('Yes'),
              ),
            ],
          );
        },
      );

      if (shouldOpen == true) {
        OpenFile.open(outputFilePath);
      }

      return file;
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal mendapatkan data PDF'),
          backgroundColor: Colors.red,
        ),
      );
      return null;
    }
  } catch (error) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Terjadi kesalahan: $error'),
        backgroundColor: Colors.red,
      ),
    );
    return null;
  }
}

Future<File?> exportCowsExcel(BuildContext context) async {
  final url = Uri.parse("$BASE_URL/cows/exc");

  try {
    final response = await http.get(url);

    if (response.statusCode == 200) {
      // Dapatkan direktori dokumen
      final directory = await getApplicationDocumentsDirectory();
      final outputFilePath = '${directory.path}/cows_export.xlsx';

      final file = File(outputFilePath);
      await file.writeAsBytes(response.bodyBytes);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Excel berhasil disimpan di: $outputFilePath'),
          backgroundColor: Colors.green,
        ),
      );

      // Tampilkan dialog konfirmasi
      final shouldOpen = await showDialog<bool>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('Buka File'),
            content: Text('Apakah Anda ingin membuka file yang telah diunduh?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: Text('No'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: Text('Yes'),
              ),
            ],
          );
        },
      );

      if (shouldOpen == true) {
        OpenFile.open(outputFilePath);
      }

      return file;
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal mendapatkan data Excel'),
          backgroundColor: Colors.red,
        ),
      );
      return null;
    }
  } catch (error) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Terjadi kesalahan: $error'),
        backgroundColor: Colors.red,
      ),
    );
    return null;
  }
}
