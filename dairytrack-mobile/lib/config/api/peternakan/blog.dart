import 'package:dairy_track/config/configApi5000.dart';

// GET semua data blog
Future<List<dynamic>> getBlogs() async {
  final response = await fetchAPI("blogs");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET satu blog by ID
Future<Map<String, dynamic>> getBlogById(String id) async {
  final response = await fetchAPI("blogs/$id");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// CREATE blog baru
Future<Map<String, dynamic>> createBlog(Map<String, dynamic> formData) async {
  final response = await fetchAPI(
    "blogs",
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

// UPDATE blog
Future<Map<String, dynamic>> updateBlog(
    String id, Map<String, dynamic> formData) async {
  final response = await fetchAPI(
    "blogs/$id",
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

// DELETE blog
Future<void> deleteBlog(String id) async {
  final response = await fetchAPI("blogs/$id", method: "DELETE");
  if (response['status'] != 204) {
    throw Exception(response['message']);
  }
}

// GET blog photo by ID
Future<String> getBlogPhoto(String id) async {
  final response = await fetchAPI("blogs/$id/photo");
  if (response['status'] == 200) {
    return response['data']['photoUrl'];
  } else {
    throw Exception(response['message']);
  }
}
