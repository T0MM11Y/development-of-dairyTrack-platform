import 'dart:io';

import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/peternakan/farmer.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';

// GET semua data peternak
Future<List<Peternak>> getFarmers() async {
  final response = await fetchAPI("farmers");

  if (response == null) {
    throw Exception('Response is null');
  }

  if (response is List<dynamic>) {
    // Jika respons adalah List langsung
    return response.map((json) => Peternak.fromJson(json)).toList();
  } else if (response is Map && response['status'] == 200) {
    // Jika respons adalah Map dengan data di dalamnya
    final data = response['data'];
    if (data is List<dynamic>) {
      return data.map((json) => Peternak.fromJson(json)).toList();
    } else {
      throw Exception('Data is not a valid List');
    }
  } else {
    throw Exception(
        response['message']?.toString() ?? 'Unexpected response format');
  }
}

Future<bool> addFarmers(Peternak peternak) async {
  // Log data being sent
  print('Sending data to API: ${peternak.toJson()}');

  // Send request to API
  final response = await fetchAPI(
    "farmers",
    method: "POST",
    data: peternak.toJson(),
  );
  print('Response from API: $response');

  // Check if response is a Map
  if (response is Map) {
    // Check for success status

    return true;
  } else {
    // If response is not a Map, assume failure
    return false;
  }
}

Future<bool> updateFarmers(Peternak peternak, int id) async {
  print('Updating data to API: ${peternak.toJson()}');

  // Gunakan ID dalam endpoint API
  final response = await fetchAPI(
    "farmers/$id", // Gunakan ID di sini
    method: "PUT",
    data: peternak.toJson(),
  );
  print('Response from API: $response');

  if (response is Map) {
    return true;
  } else {
    return false;
  }
}

Future<bool> deleteFarmer(int id) async {
  print('Deleting farmer with ID: $id');

  // Panggil API untuk menghapus data berdasarkan ID
  final response = await fetchAPI(
    "farmers/$id", // Gunakan ID di endpoint API
    method: "DELETE",
  );
  print('Response from API: $response');

  if (response is Map) {
    return true;
  } else {
    return false;
  }
}

Future<File?> exportFarmersPDF(BuildContext context) async {
  final url = Uri.parse("$BASE_URL/farmers/biekenpedeedf");

  try {
    final response = await http.get(url);

    if (response.statusCode == 200) {
      // Dapatkan direktori dokumen
      final directory = await getApplicationDocumentsDirectory();
      final outputFilePath = '${directory.path}/farmers_export.pdf';

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

Future<File?> exportFarmersExcel(BuildContext context) async {
  final url = Uri.parse("$BASE_URL/farmers/export/exc");

  try {
    final response = await http.get(url);

    if (response.statusCode == 200) {
      // Dapatkan direktori dokumen
      final directory = await getApplicationDocumentsDirectory();
      final outputFilePath = '${directory.path}/farmers_export.xlsx';

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
