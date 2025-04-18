import 'package:dairy_track/config/configApi5000.dart';

// GET semua data peternak
Future<List<dynamic>> getFarmers() async {
  final response = await fetchAPI("farmers");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET satu peternak by ID
Future<Map<String, dynamic>> getFarmerById(String id) async {
  final response = await fetchAPI("farmers/$id");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// CREATE peternak baru
Future<Map<String, dynamic>> createFarmer(Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "farmers",
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

// UPDATE peternak
Future<Map<String, dynamic>> updateFarmer(
    String id, Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "farmers/$id",
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

// DELETE peternak
Future<void> deleteFarmer(String id) async {
  final response = await fetchAPI("farmers/$id", method: "DELETE");
  if (response['status'] != 204) {
    throw Exception(response['message']);
  }
}
