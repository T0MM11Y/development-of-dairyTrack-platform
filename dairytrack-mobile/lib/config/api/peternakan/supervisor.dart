import 'dart:io';

import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/peternakan/supervisor.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';

// GET semua data supervisor
Future<List<Supervisor>> getSupervisors() async {
  final response = await fetchAPI("supervisors");

  if (response == null) {
    throw Exception('Response is null');
  }

  if (response is List<dynamic>) {
    // Jika respons adalah List langsung
    final supervisors =
        response.map((json) => Supervisor.fromJson(json)).toList();
    // Urutkan berdasarkan created_at (paling baru di atas)
    supervisors.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return supervisors;
  } else if (response is Map && response['status'] == 200) {
    // Jika respons adalah Map dengan data di dalamnya
    final data = response['data'];
    if (data is List<dynamic>) {
      final supervisors =
          data.map((json) => Supervisor.fromJson(json)).toList();
      // Urutkan berdasarkan created_at (paling baru di atas)
      supervisors.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return supervisors;
    } else {
      throw Exception('Data is not a valid List');
    }
  } else {
    throw Exception(
        response['message']?.toString() ?? 'Unexpected response format');
  }
}

// POST untuk menambahkan data supervisor baru
Future<bool> addSupervisor(Supervisor supervisor) async {
  // Log data yang akan dikirim
  print('Sending data to API: ${supervisor.toJson()}');

  // Kirim permintaan POST ke API
  final response = await fetchAPI(
    "supervisors", // Endpoint API
    method: "POST", // Metode HTTP
    data: supervisor.toJson(), // Data supervisor dalam format JSON
  );
  print('Response from API: $response');

  // Periksa apakah respons adalah Map
  if (response is Map && response['status'] == 201) {
    // Jika respons adalah Map dengan status sukses
    return true;
  } else {
    // Jika respons bukan Map, anggap gagal
    return false;
  }
}

Future<File?> exportSupervisorsPDF(BuildContext context) async {
  final url = Uri.parse("$BASE_URL/supervisors/biekenpedeedf");

  try {
    final response = await http.get(url);

    if (response.statusCode == 200) {
      // Dapatkan direktori dokumen
      final directory = await getApplicationDocumentsDirectory();
      final outputFilePath = '${directory.path}/supervisors_export.pdf';

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

Future<File?> exportSupervisorsExcel(BuildContext context) async {
  final url = Uri.parse("$BASE_URL/supervisors/exc");

  try {
    final response = await http.get(url);

    if (response.statusCode == 200) {
      // Dapatkan direktori dokumen
      final directory = await getApplicationDocumentsDirectory();
      final outputFilePath = '${directory.path}/supervisors_export.xlsx';

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

// PUT untuk memperbarui data supervisor
Future<bool> updateSupervisor(Supervisor supervisor, int id) async {
  // Validasi parameter
  if (supervisor == null || id == null || id <= 0) {
    return false;
  }

  try {
    // Log data yang akan dikirim
    print('Updating data to API: ${supervisor.toJson()}');

    // Kirim permintaan PUT ke API
    final response = await fetchAPI(
      "supervisors/$id", // Endpoint API dengan ID supervisor
      method: "PUT", // Metode HTTP
      data: supervisor.toJson(), // Data supervisor dalam format JSON
    );
    print('Response from API: $response');

    // Periksa apakah respons adalah Map dan status sukses
    if (response is Map && response['status'] == 200) {
      return true;
    } else {
      print('Failed to update supervisor. Response: $response');
      return false;
    }
  } catch (e) {
    // Tangani error
    print('Error occurred while updating supervisor: $e');
    return false;
  }
}

// DELETE untuk menghapus data supervisor
Future<bool> deleteSupervisor(BuildContext context, int id) async {
  // Validasi parameter ID
  if (id <= 0) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('ID supervisor tidak valid'),
        backgroundColor: Colors.red,
      ),
    );
    return false;
  }

  try {
    // Kirim permintaan DELETE ke API
    final response = await fetchAPI(
      "supervisors/$id", // Endpoint API dengan ID supervisor
      method: "DELETE", // Metode HTTP
    );
    print('Response from API: $response');

    // Periksa apakah respons adalah Map dan status sukses
    if (response is Map && response['status'] == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Supervisor berhasil dihapus'),
          backgroundColor: Colors.green,
        ),
      );
      return true;
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal menghapus supervisor'),
          backgroundColor: Colors.red,
        ),
      );
      return false;
    }
  } catch (e) {
    // Tangani error
    print('Error occurred while deleting supervisor: $e');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Terjadi kesalahan: $e'),
        backgroundColor: Colors.red,
      ),
    );
    return false;
  }
}
