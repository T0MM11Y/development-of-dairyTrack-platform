import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:logger/logger.dart';

enum ApiErrorType {
  network,
  timeout,
  server,
  parsing,
  unknown,
}

/// Centralized API request handler
///
/// [url] - Full API URL
/// [method] - HTTP method (GET, POST, PUT, DELETE)
/// [body] - JSON request body (optional)
/// [headers] - Custom headers (optional)
/// [multipartData] - Map of fields for multipart requests (optional)
/// [fileBytes] - Raw bytes of file for multipart upload (optional)
/// [fileFieldName] - Field name for file in multipart request (default: 'file')
/// [fileName] - File name for multipart file (optional)
/// [returnRawResponse] - Return raw response for binary data (e.g., PDF/Excel)
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
    final finalHeaders = {
      'Content-Type': 'application/json',
      ...?headers,
    };
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
      final streamedResponse = await request.send();
      response = await http.Response.fromStream(streamedResponse);
    } else if (returnRawResponse) {
      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(uri, headers: finalHeaders);
          break;
        case 'POST':
          response = await http.post(uri,
              headers: finalHeaders,
              body: body != null ? jsonEncode(body) : null);
          break;
        case 'PUT':
          response = await http.put(uri,
              headers: finalHeaders,
              body: body != null ? jsonEncode(body) : null);
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: finalHeaders);
          break;
        default:
          logger.e('Unsupported HTTP method: $method');
          return {
            'success': false,
            'message': 'Unsupported HTTP method: $method',
            'errorType': ApiErrorType.unknown,
          };
      }
      return {
        'success': response.statusCode == 200,
        'statusCode': response.statusCode,
        'bodyBytes': response.bodyBytes,
        'body': response.body,
        'headers': response.headers,
      };
    } else {
      switch (method.toUpperCase()) {
        case 'GET':
          response = await http.get(uri, headers: finalHeaders);
          break;
        case 'POST':
          response = await http.post(uri,
              headers: finalHeaders,
              body: body != null ? jsonEncode(body) : null);
          break;
        case 'PUT':
          response = await http.put(uri,
              headers: finalHeaders,
              body: body != null ? jsonEncode(body) : null);
          break;
        case 'DELETE':
          response = await http.delete(uri, headers: finalHeaders);
          break;
        default:
          logger.e('Unsupported HTTP method: $method');
          return {
            'success': false,
            'message': 'Unsupported HTTP method: $method',
            'errorType': ApiErrorType.unknown,
          };
      }
    }

    logger.i('Response status: ${response.statusCode}');
    logger.i(
        'Response body: ${returnRawResponse ? '[Binary Data]' : response.body}');

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
              'message': responseData['message'] ?? 'Operation successful',
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
          return {
            'success': false,
            'message':
                errorData['detail'] ?? errorData['error'] ?? 'Request failed',
            'errorType': ApiErrorType.server,
          };
        } catch (e) {
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
