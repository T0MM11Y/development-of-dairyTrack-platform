import 'package:dairy_track/config/configApi5000.dart';

// GET semua data TopicBlog
Future<List<dynamic>> getTopicBlogs() async {
  final response = await fetchAPI("topic_blogs");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET satu TopicBlog by ID
Future<Map<String, dynamic>> getTopicBlogById(String id) async {
  final response = await fetchAPI("topic_blogs/$id");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// CREATE TopicBlog baru
Future<Map<String, dynamic>> createTopicBlog(Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "topic_blogs",
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

// UPDATE TopicBlog
Future<Map<String, dynamic>> updateTopicBlog(
    String id, Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "topic_blogs/$id",
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

// DELETE TopicBlog
Future<void> deleteTopicBlog(String id) async {
  final response = await fetchAPI("topic_blogs/$id", method: "DELETE");
  if (response['status'] != 204) {
    throw Exception(response['message']);
  }
}
