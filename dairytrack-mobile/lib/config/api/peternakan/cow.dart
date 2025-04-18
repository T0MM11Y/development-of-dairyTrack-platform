import 'package:dairy_track/config/configApi5000.dart';

// GET semua data sapi
Future<List<dynamic>> getCows() async {
  final response = await fetchAPI("cows");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET semua data sapi betina
Future<List<dynamic>> getCowsFemale() async {
  final response = await fetchAPI("cows/female");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET satu sapi by ID
Future<Map<String, dynamic>> getCowById(String id) async {
  final response = await fetchAPI("cows/$id");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// CREATE sapi baru
Future<Map<String, dynamic>> createCow(Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "cows",
    method: "POST",
    data: data,
    isFormData: true,
  );
  if (response['status'] == 201) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// UPDATE sapi
Future<Map<String, dynamic>> updateCow(
    String id, Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "cows/$id",
    method: "PUT",
    data: data,
    isFormData: true,
  );
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// DELETE sapi
Future<void> deleteCow(String id) async {
  final response = await fetchAPI("cows/$id", method: "DELETE");
  if (response['status'] != 204) {
    throw Exception(response['message']);
  }
}
