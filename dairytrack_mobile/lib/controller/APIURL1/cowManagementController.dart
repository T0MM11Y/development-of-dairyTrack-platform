import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import '../../api/apiController.dart';
import 'package:intl/intl.dart'; // Import intl package

class Cow {
  final int id;
  final String name;
  final String birth;
  final String breed;
  final String lactationPhase;
  final double weight;
  final String gender;
  // Calculate age property
  int get age {
    try {
      // Parse the birth date using DateFormat
      final birthDate = DateFormat(
        "EEE, dd MMM yyyy HH:mm:ss 'GMT'",
      ).parse(birth);
      final now = DateTime.now();
      return now.year -
          birthDate.year -
          (now.month > birthDate.month ||
                  (now.month == birthDate.month && now.day >= birthDate.day)
              ? 0
              : 1);
    } catch (e) {
      print('Error parsing date: $e');
      return 0; // Return 0 if unable to parse date
    }
  }

  Cow({
    required this.id,
    required this.name,
    required this.birth,
    required this.breed,
    required this.lactationPhase,
    required this.weight,
    required this.gender,
  });

  factory Cow.fromJson(Map<String, dynamic> json) {
    return Cow(
      id: json['id'] as int,
      name: json['name'] as String,
      birth: json['birth'] as String,
      breed: json['breed'] as String,
      lactationPhase: json['lactation_phase'] as String,
      weight: (json['weight'] is int)
          ? (json['weight'] as int).toDouble()
          : json['weight'] as double,
      gender: json['gender'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'birth': birth,
        'breed': breed,
        'lactation_phase': lactationPhase,
        'weight': weight,
        'gender': gender,
      };
}

class CowManagementController {
  final String baseUrl = '$API_URL1/cow';
  final _headers = {'Content-Type': 'application/json'};

  // Add new cow
  Future<Map<String, dynamic>> addCow(Map<String, dynamic> cowData) async {
    try {
      final url = Uri.parse('$baseUrl/add');
      final response = await http.post(
        url,
        headers: _headers,
        body: jsonEncode(cowData),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {
          'success': true,
          'cow': responseData,
          'message': 'Cow added successfully',
        };
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to add cow',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to add cow'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Get cow by ID
  Future<Map<String, dynamic>> getCowById(int cowId) async {
    try {
      final url = Uri.parse('$baseUrl/$cowId');
      final response = await http.get(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {'success': true, 'cow': responseData};
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Cow not found',
          };
        } catch (e) {
          return {'success': false, 'message': 'Cow not found'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  Future<List<Cow>> listCows({String? sortBy, String? sortOrder}) async {
    final url = Uri.parse('$baseURL/cows/list');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      final Map<String, dynamic> jsonResponse = json.decode(response.body);
      if (jsonResponse.containsKey('cows')) {
        final List<dynamic> cowList = jsonResponse['cows'];
        return cowList.map((cowJson) => Cow.fromJson(cowJson)).toList();
      } else {
        throw Exception('Response does not contain "cows" key');
      }
    } else {
      throw Exception('Failed to load cows: ${response.statusCode}');
    }
  }

  // Update cow by ID
  Future<Map<String, dynamic>> updateCow(
    int cowId,
    Map<String, dynamic> cowData,
  ) async {
    try {
      final url = Uri.parse('$baseUrl/update/$cowId');
      final response = await http.put(
        url,
        headers: _headers,
        body: jsonEncode(cowData),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final responseData = jsonDecode(response.body);
        return {'success': true, 'data': responseData};
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to update cow',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to update cow'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Delete cow by ID
  Future<Map<String, dynamic>> deleteCow(int cowId) async {
    try {
      final url = Uri.parse('$baseUrl/delete/$cowId');
      final response = await http.delete(url, headers: _headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'message': 'Cow deleted successfully'};
      } else {
        try {
          final errorData = jsonDecode(response.body);
          return {
            'success': false,
            'message': errorData['error'] ?? 'Failed to delete cow',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to delete cow'};
        }
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Export cows to PDF
  Future<Map<String, dynamic>> exportCowsToPDF() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/export/pdf'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        // Get the directory to save the file
        final directory = await getApplicationDocumentsDirectory();
        final filePath =
            '${directory.path}/cows_export_${DateTime.now().millisecondsSinceEpoch}.pdf';
        final file = File(filePath);

        // Write the PDF data to the file
        await file.writeAsBytes(response.bodyBytes);

        return {
          'success': true,
          'filePath': filePath,
          'message': 'PDF exported successfully to $filePath',
        };
      } else {
        return {
          'success': false,
          'message':
              jsonDecode(response.body)['error'] ?? 'Failed to export to PDF',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }

  // Export cows to Excel
  Future<Map<String, dynamic>> exportCowsToExcel() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/export/excel'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        // Get the directory to save the file
        final directory = await getApplicationDocumentsDirectory();
        // Using .xlsx extension for Excel files
        final filePath =
            '${directory.path}/cows_export_${DateTime.now().millisecondsSinceEpoch}.xlsx';
        final file = File(filePath);

        // Write the Excel data to the file
        await file.writeAsBytes(response.bodyBytes);

        return {
          'success': true,
          'filePath': filePath,
          'message': 'Excel exported successfully to $filePath',
        };
      } else {
        return {
          'success': false,
          'message':
              jsonDecode(response.body)['error'] ?? 'Failed to export to Excel',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'An error occurred: $e'};
    }
  }
}
