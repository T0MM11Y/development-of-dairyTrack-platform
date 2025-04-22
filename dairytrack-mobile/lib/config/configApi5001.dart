import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

//ipv4CMDmu
const String BASE_URL = "http://127.0.0.1:5001";
const String CONTENT_TYPE_JSON = 'application/json';

/// Fetch API Helper Function
///
/// [endpoint] - API endpoint (relative to BASE_URL)
/// [method] - HTTP method (default: GET)
/// [data] - Request body (optional)
/// [isBlob] - If true, returns raw byte array (default: false)
Future<dynamic> fetchAPI(
  String endpoint, {
  String method = "GET",
  dynamic data,
  bool isBlob = false,
}) async {
  if (endpoint.isEmpty) {
    throw ArgumentError("Endpoint cannot be empty.");
  }

  final Uri url = Uri.parse('$BASE_URL/$endpoint');
  final Map<String, String> headers = {};

  http.Response response;

  try {
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
  } catch (error) {
    print("Error: $error");
    throw Exception("Failed to fetch API: $error");
  }
}
