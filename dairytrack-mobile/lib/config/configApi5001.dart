// import 'dart:convert';
// import 'dart:io';
// import 'package:http/http.dart' as http;

// //ipv4CMDmu
// const String BASE_URL = "http://172.20.10.3:5001";
// const String CONTENT_TYPE_JSON = 'application/json';

// /// Fetch API Helper Function
// ///
// /// [endpoint] - API endpoint (relative to BASE_URL)
// /// [method] - HTTP method (default: GET)
// /// [data] - Request body (optional)
// /// [isBlob] - If true, returns raw byte array (default: false)
// Future<dynamic> fetchAPI(
//   String endpoint, {
//   String method = "GET",
//   dynamic data,
//   bool isBlob = false,
// }) async {
//   if (endpoint.isEmpty) {
//     throw ArgumentError("Endpoint cannot be empty.");
//   }

//   final Uri url = Uri.parse('$BASE_URL/$endpoint');
//   final Map<String, String> headers = {};

//   http.Response response;

//   try {
//     // Add Content-Type header if data is provided
//     if (data != null) {
//       headers[HttpHeaders.contentTypeHeader] = CONTENT_TYPE_JSON;
//     }

//     // Handle HTTP methods
//     switch (method.toUpperCase()) {
//       case "GET":
//         response = await http.get(url, headers: headers);
//         break;
//       case "POST":
//         response = await http.post(
//           url,
//           headers: headers,
//           body: jsonEncode(data),
//         );
//         break;
//       case "PUT":
//         response = await http.put(
//           url,
//           headers: headers,
//           body: jsonEncode(data),
//         );
//         break;
//       case "DELETE":
//         response = await http.delete(url, headers: headers);
//         break;
//       default:
//         throw UnsupportedError("HTTP method '$method' is not supported.");
//     }

//     // Check response status
//     final contentType = response.headers['content-type'];
//     if (!response.statusCode.toString().startsWith('2')) {
//       if (contentType != null && contentType.contains(CONTENT_TYPE_JSON)) {
//         final errorData = jsonDecode(response.body);
//         throw Exception(errorData['detail'] ?? "Something went wrong.");
//       } else {
//         throw Exception("Server Error: ${response.body}");
//       }
//     }

//     // Handle no content response
//     if (response.statusCode == 204) return true;

//     // Handle blob response
//     if (isBlob) {
//       return response.bodyBytes;
//     }

//     // Parse JSON response
//     return jsonDecode(response.body);
//   } catch (error) {
//     print("Error: $error");
//     throw Exception("Failed to fetch API: $error");
//   }
// }
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

const String BASE_URL = "http://172.20.10.3:5001";
const String CONTENT_TYPE_JSON = 'application/json';

/// Fetch API Helper Function
///
/// [endpoint] - API endpoint (relative to BASE_URL)
/// [method] - HTTP method (default: GET)
/// [data] - Request body for JSON requests (optional)
/// [multipartData] - Map of fields for multipart requests (optional)
/// [fileBytes] - Raw bytes of file for multipart upload (optional)
/// [fileFieldName] - Field name for file in multipart request (default: 'file')
/// [fileName] - File name for multipart file (optional)
/// [isBlob] - If true, returns raw byte array (default: false)
Future<dynamic> fetchAPI(
  String endpoint, {
  String method = "GET",
  dynamic data,
  Map<String, String>? multipartData,
  List<int>? fileBytes,
  String fileFieldName = 'file',
  String? fileName,
  bool isBlob = false,
}) async {
  if (endpoint.isEmpty) {
    throw ArgumentError("Endpoint cannot be empty.");
  }

  final Uri url = Uri.parse('$BASE_URL/$endpoint');
  final Map<String, String> headers = {};

  try {
    if (multipartData != null || fileBytes != null) {
      // Handle multipart request
      final request = http.MultipartRequest(method, url);

      // Add fields to multipart request
      if (multipartData != null) {
        request.fields.addAll(multipartData);
      }

      // Add file to multipart request
      if (fileBytes != null) {
        final file = http.MultipartFile.fromBytes(
          fileFieldName,
          fileBytes,
          filename: fileName ?? 'image.jpg', // Default filename if not provided
        );
        request.files.add(file);
      }

      // Send multipart request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      // Check response status
      final contentType = response.headers['content-type'];
      if (!response.statusCode.toString().startsWith('2')) {
        if (contentType != null && contentType.contains(CONTENT_TYPE_JSON)) {
          final errorData = jsonDecode(response.body);
          throw Exception(errorData['detail'] ?? "Something went wrong.");
        } else {
          throw Exception("Server Error: ${response.body}");
        }
      }

      // Handle no content response
      if (response.statusCode == 204) return true;

      // Handle blob response
      if (isBlob) {
        return response.bodyBytes;
      }

      // Parse JSON response
      return jsonDecode(response.body);
    } else {
      // Existing JSON request logic
      http.Response response;

      // Add Content-Type header if data is provided
      if (data != null) {
        headers[HttpHeaders.contentTypeHeader] = CONTENT_TYPE_JSON;
      }

      // Handle HTTP methods
      switch (method.toUpperCase()) {
        case "GET":
          response = await http.get(url, headers: headers);
          break;
        case "POST":
          response = await http.post(
            url,
            headers: headers,
            body: jsonEncode(data),
          );
          break;
        case "PUT":
          response = await http.put(
            url,
            headers: headers,
            body: jsonEncode(data),
          );
          break;
        case "DELETE":
          response = await http.delete(url, headers: headers);
          break;
        default:
          throw UnsupportedError("HTTP method '$method' is not supported.");
      }

      // Check response status
      final contentType = response.headers['content-type'];
      if (!response.statusCode.toString().startsWith('2')) {
        if (contentType != null && contentType.contains(CONTENT_TYPE_JSON)) {
          final errorData = jsonDecode(response.body);
          throw Exception(errorData['detail'] ?? "Something went wrong.");
        } else {
          throw Exception("Server Error: ${response.body}");
        }
      }

      // Handle no content response
      if (response.statusCode == 204) return true;

      // Handle blob response
      if (isBlob) {
        return response.bodyBytes;
      }

      // Parse JSON response
      return jsonDecode(response.body);
    }
  } catch (error) {
    print("Error: $error");
    throw Exception("Failed to fetch API: $error");
  }
}
