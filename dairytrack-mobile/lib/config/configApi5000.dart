import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;

//ipv4CMDmu
const String BASE_URL = "http://192.168.182.47:5000/api";

Future<dynamic> fetchAPI(
  String endpoint, {
  String method = "GET",
  Map<String, dynamic>? data,
  bool isFormData = false,
}) async {
  final Uri url = Uri.parse('$BASE_URL/$endpoint');
  final Map<String, String> headers = isFormData
      ? {}
      : {
          HttpHeaders.contentTypeHeader: 'application/json',
        };

  http.Response response;

  try {
    if (method == "GET") {
      response = await http
          .get(url, headers: headers)
          .timeout(const Duration(seconds: 10));
    } else if (method == "POST") {
      if (data == null) {
        throw ArgumentError("Data cannot be null for POST requests.");
      }
      response = await http
          .post(
            url,
            headers: headers,
            body: isFormData ? data : jsonEncode(data),
          )
          .timeout(const Duration(seconds: 10));
    } else if (method == "PUT") {
      if (data == null) {
        throw ArgumentError("Data cannot be null for PUT requests.");
      }
      response = await http
          .put(
            url,
            headers: headers,
            body: isFormData ? data : jsonEncode(data),
          )
          .timeout(const Duration(seconds: 10));
    } else if (method == "DELETE") {
      response = await http
          .delete(url, headers: headers)
          .timeout(const Duration(seconds: 10));
    } else {
      throw UnsupportedError("HTTP method not supported");
    }

    final contentType = response.headers['content-type'];

    if (response.statusCode == 401) {
      return {
        'status': 401,
        'message': 'Unauthorized: Invalid email or password.',
      };
    }

    if (!response.statusCode.toString().startsWith('2')) {
      if (contentType != null && contentType.contains('application/json')) {
        final errorData = jsonDecode(response.body);
        return {
          'status': response.statusCode,
          'message': errorData['detail'] ?? 'Something went wrong.',
        };
      } else {
        return {
          'status': response.statusCode,
          'message': 'Internal Server Error',
        };
      }
    }

    if (response.statusCode == 204) {
      return {'status': 204, 'message': 'No Content'};
    }

    // Return parsed JSON (can be Map or List)
    return jsonDecode(response.body);
  } on SocketException {
    return {
      'status': 503,
      'message': 'No Internet connection. Please check your network.',
    };
  } on TimeoutException {
    return {
      'status': 408,
      'message': 'Request timed out. Please try again later.',
    };
  } catch (error) {
    return {
      'status': 500,
      'message': error.toString() ?? 'An unexpected error occurred.',
    };
  }
}
