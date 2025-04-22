import 'package:dairy_track/config/configApi5000.dart';

// GET semua data gallery
Future<List<dynamic>> getGalleries() async {
  final response = await fetchAPI("galleries");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET satu gallery by ID
Future<Map<String, dynamic>> getGalleryById(String id) async {
  final response = await fetchAPI("galleries/$id");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// CREATE gallery baru
Future<Map<String, dynamic>> createGallery(
    Map<String, dynamic> formData) async {
  final response = await fetchAPI(
    "galleries",
    method: "POST",
    data: formData,
    isFormData: true,
  );
  if (response['status'] == 201) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// UPDATE gallery
Future<Map<String, dynamic>> updateGallery(
    String id, Map<String, dynamic> formData) async {
  final response = await fetchAPI(
    "galleries/$id",
    method: "PUT",
    data: formData,
    isFormData: true,
  );
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// DELETE gallery
Future<void> deleteGallery(String id) async {
  final response = await fetchAPI("galleries/$id", method: "DELETE");
  if (response['status'] != 204) {
    throw Exception(response['message']);
  }
}

// GET gallery photo by ID
Future<String> getGalleryPhoto(String id) async {
  final response = await fetchAPI("galleries/$id/photo");
  if (response['status'] == 200) {
    return response['data']['photoUrl'];
  } else {
    throw Exception(response['message']);
  }
}
