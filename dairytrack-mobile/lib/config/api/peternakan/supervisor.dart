import 'package:dairy_track/config/configApi5000.dart';

// GET semua data supervisor
Future<List<dynamic>> getSupervisors() async {
  final response = await fetchAPI("supervisors");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET satu supervisor by ID
Future<Map<String, dynamic>> getSupervisorById(String id) async {
  final response = await fetchAPI("supervisors/$id");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// CREATE supervisor baru
Future<Map<String, dynamic>> createSupervisor(Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "supervisors",
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

// UPDATE supervisor
Future<Map<String, dynamic>> updateSupervisor(
    String id, Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "supervisors/$id",
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

// DELETE supervisor
Future<void> deleteSupervisor(String id) async {
  final response = await fetchAPI("supervisors/$id", method: "DELETE");
  if (response['status'] != 204) {
    throw Exception(response['message']);
  }
}
