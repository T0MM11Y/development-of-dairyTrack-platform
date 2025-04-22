import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/peternakan/topicblog.dart';

// GET semua data TopicBlog
Future<List<TopicBlog>> getTopicBlogs() async {
  final response =
      await fetchAPI("topic_blogs"); // Memanggil endpoint Flask Anda
  if (response['status'] == '200') {
    // Pastikan response['data'] adalah List<Map<String, dynamic>>
    final List<dynamic> data = response['data'];
    return data
        .map((json) => TopicBlog.fromJson(json as Map<String, dynamic>))
        .toList();
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
    isFormData: false, // Sesuaikan dengan API Anda yang menerima JSON
  );

  if (response['status'] == 200) {
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
  try {
    final response = await fetchAPI("topic_blogs/$id", method: "DELETE");

    if (response['status'] == 200 || response['status'] == 201) {
      // Handle success
      if (response.containsKey('data') && response['data'] != null) {
        final responseData = response['data'];
        print(responseData['message'] ??
            'TopicBlog deleted successfully'); // Display success message
      } else {
        print('TopicBlog deleted successfully'); // Default message for 204
      }
    } else {
      // Handle error response
      final errorMessage = response.containsKey('error')
          ? response['error']
          : 'Unknown error occurred';
      throw Exception(errorMessage);
    }
  } catch (e) {
    throw Exception(
        'Failed to delete TopicBlog: $e'); // Ensure consistent error handling
  }
}
