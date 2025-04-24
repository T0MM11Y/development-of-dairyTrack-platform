import 'dart:io';

import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/produktivitas/rawMilk.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';

Future<Map<String, dynamic>> getRawMilkData() async {
  try {
    // Panggil endpoint API
    final response = await fetchAPI('raw_milks/raw_milk_data');

    if (response['status'] == 200) {
      print('Response: ${response['data']}');
      // Ubah data menjadi daftar objek RawMilk
      final List<RawMilk> rawMilkList = (response['data'] as List)
          .map((item) => RawMilk.fromJson(item))
          .toList();

      // Kembalikan data yang berhasil diproses
      return {'status': 'success', 'data': rawMilkList};
    } else {
      // Tangani respons yang tidak berhasil
      return {
        'status': 'error',
        'message': response['message'] ?? 'Failed to fetch raw milk data.'
      };
    }
  } catch (e) {
    // Tangani pengecualian
    return {
      'status': 'error',
      'message': 'An error occurred while fetching raw milk data: $e'
    };
  }
}

Future<Map<String, dynamic>> submitRawMilkData(RawMilk rawMilk) async {
  try {
    // Konversi objek RawMilk menjadi JSON
    final Map<String, dynamic> rawMilkData = rawMilk.toJson();

    // Panggil endpoint API untuk submit data
    final response = await fetchAPI(
      'raw_milks',
      method: 'POST',
      data: rawMilkData,
    );
    print('Response: $response');

    if (response['message'] == 'Data berhasil diproses') {
      // Jika berhasil, kembalikan respons sukses
      return {'status': 'success', 'message': 'Data submitted successfully.'};
    } else {
      // Jika gagal, kembalikan pesan error dari API
      return {
        'status': 'error',
        'message': response['message'] ?? 'Failed to submit raw milk data.'
      };
    }
  } catch (e) {
    // Tangani pengecualian
    return {
      'status': 'error',
      'message': 'An error occurred while submitting raw milk data: $e'
    };
  }
}

Future<File?> exportRawMilkPDF(BuildContext context) async {
  final url = Uri.parse("$BASE_URL/raw_milks/biekenpedeedf");

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

Future<File?> exportRawMilkExcel(BuildContext context) async {
  final url = Uri.parse("$BASE_URL/raw_milks/exc");

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

Future<Map<String, dynamic>> updateRawMilkData(RawMilk rawMilk) async {
  try {
    // Konversi objek RawMilk menjadi JSON
    final Map<String, dynamic> rawMilkData = rawMilk.toJson();
    print('Updating RawMilk Data: $rawMilkData'); // Log data yang dikirim

    // Panggil endpoint API untuk update data
    final response = await fetchAPI(
      'raw_milks/${rawMilk.id}', // Endpoint dengan ID data
      method: 'PUT', // Gunakan metode PUT untuk update
      data: rawMilkData,
    );
    print('Response: $response');

    if (response['message'] == 'Data berhasil diperbarui') {
      // Jika berhasil, kembalikan respons sukses
      return {'status': 'success', 'message': 'Data updated successfully.'};
    } else {
      // Jika gagal, kembalikan pesan error dari API
      return {
        'status': 'error',
        'message': response['message'] ?? 'Failed to update raw milk data.'
      };
    }
  } catch (e) {
    // Tangani pengecualian
    return {
      'status': 'error',
      'message': 'An error occurred while updating raw milk data: $e'
    };
  }
}

Future<Map<String, dynamic>> deleteRawMilkData(int id) async {
  const int maxRetries = 3; // Jumlah maksimum percobaan
  const Duration retryDelay =
      Duration(seconds: 2); // Waktu tunggu antar percobaan

  for (int attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Panggil endpoint API untuk menghapus data
      final response = await fetchAPI(
        'raw_milks/$id', // Endpoint dengan ID data
        method: 'DELETE', // Gunakan metode DELETE
      );
      print('Response: $response'); // Log respons dari API

      if (response['status'] == 200 || response['status'] == 404) {
        // Jika berhasil, kembalikan respons sukses
        return {'status': 'success', 'message': 'Data deleted successfully.'};
      } else {
        // Jika gagal, kembalikan pesan error dari API
        return {
          'status': 'error',
          'message': response['message'] ?? 'Failed to delete raw milk data.'
        };
      }
    } catch (e) {
      // Tangani pengecualian
      if (attempt == maxRetries) {
        return {
          'status': 'error',
          'message': 'An error occurred while deleting raw milk data: $e'
        };
      }
      // Tunggu sebelum mencoba lagi
      await Future.delayed(retryDelay);
    }
  }

  // Jika semua percobaan gagal
  return {
    'status': 'error',
    'message': 'Failed to delete raw milk data after $maxRetries attempts.'
  };
}
