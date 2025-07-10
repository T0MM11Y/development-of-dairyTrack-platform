// // dairytrack_mobile/lib/controller/APIURL2/api_services/apiService.dart
// import 'dart:convert';
// import 'dart:io';
// import 'package:http/http.dart' as http;
// import 'package:logger/logger.dart';

// enum ApiErrorType {
//   network,
//   timeout,
//   server,
//   parsing,
//   unknown,
// }

// /// Centralized API request handler
// ///
// /// [url] - Full API URL
// /// [method] - HTTP method (GET, POST, PUT, DELETE)
// /// [body] - JSON request body (optional)
// /// [headers] - Custom headers (optional)
// /// [multipartData] - Map of fields for multipart requests (optional)
// /// [fileBytes] - Raw bytes of file for multipart upload (optional)
// /// [fileFieldName] - Field name for file in multipart request (default: 'file')
// /// [fileName] - File name for multipart file (optional)
// /// [returnRawResponse] - Return raw response for binary data (e.g., PDF/Excel)
// Future<Map<String, dynamic>> apiRequest({
//   required String url,
//   required String method,
//   Map<String, dynamic>? body,
//   Map<String, String>? headers,
//   Map<String, String>? multipartData,
//   List<int>? fileBytes,
//   String fileFieldName = 'file',
//   String? fileName,
//   bool returnRawResponse = false,
// }) async {
//   final logger = Logger();
//   try {
//     final uri = Uri.parse(url);
//     final finalHeaders = {
//       'Content-Type': 'application/json',
//       ...?headers,
//     };
//     http.Response response;

//     logger.i('Sending $method request to $url with headers: $finalHeaders');
//     if (body != null) logger.i('Request body: $body');
//     if (multipartData != null) logger.i('Multipart data: $multipartData');

//     if (multipartData != null || fileBytes != null) {
//       final request = http.MultipartRequest(method, uri);
//       request.headers.addAll(finalHeaders);
//       if (multipartData != null) {
//         request.fields.addAll(multipartData);
//       }
//       if (fileBytes != null) {
//         request.files.add(http.MultipartFile.fromBytes(
//           fileFieldName,
//           fileBytes,
//           filename: fileName ?? 'file.jpg',
//         ));
//       }
//       final streamedResponse = await request.send();
//       response = await http.Response.fromStream(streamedResponse);
//     } else if (returnRawResponse) {
//       switch (method.toUpperCase()) {
//         case 'GET':
//           response = await http.get(uri, headers: finalHeaders);
//           break;
//         case 'POST':
//           response = await http.post(uri,
//               headers: finalHeaders,
//               body: body != null ? jsonEncode(body) : null);
//           break;
//         case 'PUT':
//           response = await http.put(uri,
//               headers: finalHeaders,
//               body: body != null ? jsonEncode(body) : null);
//           break;
//         case 'DELETE':
//           response = await http.delete(uri, headers: finalHeaders);
//           break;
//         default:
//           logger.e('Unsupported HTTP method: $method');
//           return {
//             'success': false,
//             'message': 'Unsupported HTTP method: $method',
//             'errorType': ApiErrorType.unknown,
//           };
//       }
//       return {
//         'success': response.statusCode == 200,
//         'statusCode': response.statusCode,
//         'bodyBytes': response.bodyBytes,
//         'body': response.body,
//         'headers': response.headers,
//       };
//     } else {
//       switch (method.toUpperCase()) {
//         case 'GET':
//           response = await http.get(uri, headers: finalHeaders);
//           break;
//         case 'POST':
//           response = await http.post(uri,
//               headers: finalHeaders,
//               body: body != null ? jsonEncode(body) : null);
//           break;
//         case 'PUT':
//           response = await http.put(uri,
//               headers: finalHeaders,
//               body: body != null ? jsonEncode(body) : null);
//           break;
//         case 'DELETE':
//           response = await http.delete(uri, headers: finalHeaders);
//           break;
//         default:
//           logger.e('Unsupported HTTP method: $method');
//           return {
//             'success': false,
//             'message': 'Unsupported HTTP method: $method',
//             'errorType': ApiErrorType.unknown,
//           };
//       }
//     }

//     logger.i('Response status: ${response.statusCode}');
//     logger.i(
//         'Response body: ${returnRawResponse ? '[Binary Data]' : response.body}');

//     if (response.statusCode >= 200 && response.statusCode < 300) {
//       if (response.statusCode == 204) {
//         return {
//           'success': true,
//           'message': 'Operation successful',
//           'data': null,
//         };
//       }
//       final contentType = response.headers['content-type'];
//       if (returnRawResponse) {
//         return {
//           'success': true,
//           'statusCode': response.statusCode,
//           'bodyBytes': response.bodyBytes,
//           'body': response.body,
//           'headers': response.headers,
//         };
//       }
//       if (contentType != null && contentType.contains('application/json')) {
//         try {
//           final responseData = jsonDecode(response.body);
//           if (responseData is Map<String, dynamic>) {
//             return {
//               'success': true,
//               'message': responseData['message'] ?? 'Operation successful',
//               'data': responseData['data'] ?? responseData,
//             };
//           } else if (responseData is List) {
//             return {
//               'success': true,
//               'message': 'Operation successful',
//               'data': responseData,
//             };
//           } else {
//             logger.e('Unexpected response format: $responseData');
//             return {
//               'success': false,
//               'message': 'Unexpected response format',
//               'errorType': ApiErrorType.parsing,
//             };
//           }
//         } catch (e) {
//           logger.e('JSON parsing error: $e, Response: ${response.body}');
//           return {
//             'success': false,
//             'message': 'Failed to parse JSON: $e',
//             'errorType': ApiErrorType.parsing,
//           };
//         }
//       }
//       return {
//         'success': true,
//         'message': 'Operation successful',
//         'data': response.body,
//       };
//     } else {
//       final contentType = response.headers['content-type'];
//       logger.e('Server error: ${response.statusCode}, Body: ${response.body}');
//       if (contentType != null && contentType.contains('application/json')) {
//         try {
//           final errorData = jsonDecode(response.body);
//           String errorMessage;
//           if (errorData is Map<String, dynamic>) {
//             if (errorData['detail'] != null) {
//               errorMessage = errorData['detail'].toString();
//             } else if (errorData['error'] != null) {
//               // Tangani kasus error adalah array atau string
//               errorMessage = errorData['error'] is List
//                   ? errorData['error']
//                       .join(', ') // Gabungkan array menjadi string
//                   : errorData['error'].toString();
//             } else {
//               // Tangani format error lain, seperti {"product_name": "pesan"}
//               errorMessage = errorData.values.first is List
//                   ? errorData.values.first.join(', ')
//                   : errorData.values.first.toString();
//             }
//           } else {
//             errorMessage = errorData.toString();
//           }
//           return {
//             'success': false,
//             'message': errorMessage,
//             'errorType': ApiErrorType.server,
//           };
//         } catch (e) {
//           return {
//             'success': false,
//             'message': 'Failed to parse error response: ${response.body}',
//             'errorType': ApiErrorType.parsing,
//           };
//         }
//       }
//       return {
//         'success': false,
//         'message': 'Server error: ${response.statusCode}',
//         'errorType': ApiErrorType.server,
//       };
//     }
//   } on SocketException {
//     logger.e('Network error: No internet connection');
//     return {
//       'success': false,
//       'message': 'No internet connection',
//       'errorType': ApiErrorType.network,
//     };
//   } on FormatException {
//     logger.e('Parsing error: Invalid response format');
//     return {
//       'success': false,
//       'message': 'Invalid response format',
//       'errorType': ApiErrorType.parsing,
//     };
//   } catch (e) {
//     logger.e('Unexpected error: $e, URL: $url');
//     return {
//       'success': false,
//       'message': 'An error occurred: $e',
//       'errorType': ApiErrorType.unknown,
//     };
//   }
// }

import 'dart:convert';
import 'dart:io';
import 'dart:async'; // Tambahkan ini untuk TimeoutException
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';

enum ApiErrorType {
  network,
  timeout,
  server,
  parsing,
  unknown,
}

Future<Map<String, dynamic>> apiRequest({
  required String url,
  required String method,
  Map<String, dynamic>? body,
  Map<String, String>? headers,
  Map<String, String>? multipartData,
  List<int>? fileBytes,
  String fileFieldName = 'file',
  String? fileName,
  bool returnRawResponse = false,
}) async {
  final logger = Logger();
  try {
    final uri = Uri.parse(url);
    final finalHeaders = {...?headers}; // Remove default Content-Type
    http.Response response;

    logger.i('Sending $method request to $url with headers: $finalHeaders');
    if (body != null) logger.i('Request body: $body');
    if (multipartData != null) logger.i('Multipart data: $multipartData');

    if (multipartData != null || fileBytes != null) {
      final request = http.MultipartRequest(method, uri);
      request.headers.addAll(finalHeaders);
      if (multipartData != null) {
        request.fields.addAll(multipartData);
      }
      if (fileBytes != null) {
        request.files.add(http.MultipartFile.fromBytes(
          fileFieldName,
          fileBytes,
          filename: fileName ?? 'file.jpg',
        ));
      }
      final streamedResponse = await request.send().timeout(Duration(seconds: 10));
      response = await http.Response.fromStream(streamedResponse);
    } else {
      final client = http.Client();
      try {
        switch (method.toUpperCase()) {
          case 'GET':
            response = await client.get(uri, headers: {
              'Content-Type': 'application/json',
              ...finalHeaders,
            }).timeout(Duration(seconds: 10));
            break;
          case 'POST':
            response = await client.post(uri,
                headers: {
                  'Content-Type': 'application/json',
                  ...finalHeaders,
                },
                body: body != null ? jsonEncode(body) : null).timeout(Duration(seconds: 10));
            break;
          case 'PUT':
            response = await client.put(uri,
                headers: {
                  'Content-Type': 'application/json',
                  ...finalHeaders,
                },
                body: body != null ? jsonEncode(body) : null).timeout(Duration(seconds: 10));
            break;
          case 'DELETE':
            response = await client.delete(uri, headers: {
              'Content-Type': 'application/json',
              ...finalHeaders,
            }).timeout(Duration(seconds: 10));
            break;
          default:
            logger.e('Unsupported HTTP method: $method');
            return {
              'success': false,
              'message': 'Unsupported HTTP method: $method',
              'errorType': ApiErrorType.unknown,
            };
        }
      } finally {
        client.close();
      }
    }

    logger.i('Response status: ${response.statusCode}');
    logger.i('Response body: ${returnRawResponse ? '[Binary Data]' : response.body}');

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.statusCode == 204) {
        return {
          'success': true,
          'message': 'Operation successful',
          'data': null,
        };
      }
      final contentType = response.headers['content-type'];
      if (returnRawResponse) {
        return {
          'success': true,
          'statusCode': response.statusCode,
          'bodyBytes': response.bodyBytes,
          'body': response.body,
          'headers': response.headers,
        };
      }
      if (contentType != null && contentType.contains('application/json')) {
        try {
          final responseData = jsonDecode(response.body);
          if (responseData is Map<String, dynamic>) {
            return {
              'success': true,
              'message': responseData['message']?.toString() ?? 'Operation successful',
              'data': responseData['data'] ?? responseData,
            };
          } else if (responseData is List) {
            return {
              'success': true,
              'message': 'Operation successful',
              'data': responseData,
            };
          } else {
            logger.e('Unexpected response format: $responseData');
            return {
              'success': false,
              'message': 'Unexpected response format',
              'errorType': ApiErrorType.parsing,
            };
          }
        } catch (e) {
          logger.e('JSON parsing error: $e, Response: ${response.body}');
          return {
            'success': false,
            'message': 'Failed to parse JSON: $e',
            'errorType': ApiErrorType.parsing,
          };
        }
      }
      return {
        'success': true,
        'message': 'Operation successful',
        'data': response.body,
      };
    } else {
      final contentType = response.headers['content-type'];
      logger.e('Server error: ${response.statusCode}, Body: ${response.body}');
      if (contentType != null && contentType.contains('application/json')) {
        try {
          final errorData = jsonDecode(response.body);
          String errorMessage;
          if (errorData is Map<String, dynamic>) {
            if (errorData['detail'] != null) {
              errorMessage = errorData['detail'].toString();
            } else if (errorData['error'] != null) {
              errorMessage = errorData['error'] is List
                  ? errorData['error'].join(', ')
                  : errorData['error'].toString();
            } else if (errorData['non_field_errors'] != null) {
              errorMessage = errorData['non_field_errors'] is List
                  ? errorData['non_field_errors'].join(', ')
                  : errorData['non_field_errors'].toString();
            } else {
              errorMessage = errorData.values.isNotEmpty
                  ? errorData.values.first is List
                      ? errorData.values.first.join(', ')
                      : errorData.values.first.toString()
                  : 'Request failed';
            }
          } else {
            errorMessage = errorData.toString();
          }
          return {
            'success': false,
            'message': errorMessage,
            'errorType': ApiErrorType.server,
          };
        } catch (e) {
          logger.e('Failed to parse error response: ${response.body}');
          return {
            'success': false,
            'message': 'Failed to parse error response: ${response.body}',
            'errorType': ApiErrorType.parsing,
          };
        }
      }
      return {
        'success': false,
        'message': 'Server error: ${response.statusCode}',
        'errorType': ApiErrorType.server,
      };
    }
  } on TimeoutException {
    logger.e('Request timeout');
    return {
      'success': false,
      'message': 'Request timed out, please try again later',
      'errorType': ApiErrorType.timeout,
    };
  } on SocketException {
    logger.e('Network error: No internet connection');
    return {
      'success': false,
      'message': 'No internet connection',
      'errorType': ApiErrorType.network,
    };
  } on FormatException {
    logger.e('Parsing error: Invalid response format');
    return {
      'success': false,
      'message': 'Invalid response format',
      'errorType': ApiErrorType.parsing,
    };
  } catch (e) {
    logger.e('Unexpected error: $e, URL: $url');
    return {
      'success': false,
      'message': 'An error occurred: $e',
      'errorType': ApiErrorType.unknown,
    };
  }
}