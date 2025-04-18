import 'dart:convert';
import 'package:http/http.dart' as http;
//ipv4CMDmu

const String BASE_URL = "http://127.0.0.1:5002/api";

Future<dynamic> fetchAPI(String endpoint,
    {String method = "GET", Map<String, dynamic>? data}) async {
  final Uri url = Uri.parse('$BASE_URL/$endpoint');
  final Map<String, String> headers = {
    "Content-Type": "application/json",
  };

  http.Response response;

  try {
    if (method == "GET") {
      response = await http.get(url, headers: headers);
    } else if (method == "POST") {
      response = await http.post(url, headers: headers, body: jsonEncode(data));
    } else if (method == "PUT") {
      response = await http.put(url, headers: headers, body: jsonEncode(data));
    } else if (method == "DELETE") {
      response = await http.delete(url, headers: headers);
    } else {
      throw Exception("Unsupported HTTP method: $method");
    }

    final contentType = response.headers['content-type'];

    if (response.statusCode < 200 || response.statusCode >= 300) {
      if (contentType != null && contentType.contains("application/json")) {
        final errorData = jsonDecode(response.body);
        // Gunakan properti 'detail' jika tersedia
        throw Exception(errorData['detail'] ?? "Something went wrong.");
      } else {
        final errorText = response.body; // Tangani error non-JSON (HTML)
        print("Server Error: $errorText");
        throw Exception("Internal Server Error");
      }
    }

    // DELETE biasanya status 204, tidak ada body
    if (response.statusCode == 204) {
      return true;
    }

    // Kembalikan response JSON
    return jsonDecode(response.body);
  } catch (e) {
    rethrow; // Propagasi error
  }
}
