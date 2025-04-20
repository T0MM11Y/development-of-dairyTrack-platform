import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/feedType.dart';

// GET semua data jenis pakan
Future<List<FeedType>> getFeedTypes() async {
  try {
    final response = await fetchAPI("feedType");
    print('getFeedTypes response: $response'); // Debugging

    if (response is Map<String, dynamic>) {
      if (response['success'] == true) {
        final data = response['feedTypes'] as List<dynamic>? ?? [];
        print('Feed types data: $data'); // Debugging
        return data.map((json) {
          try {
            return FeedType.fromJson(json);
          } catch (e) {
            print('Error parsing FeedType: $e, JSON: $json'); // Debugging
            throw Exception('Failed to parse feed type: $e');
          }
        }).toList();
      } else {
        final message = response['message'] ?? 'Unknown error';
        print('API error: $message'); // Debugging
        throw Exception('API error: $message');
      }
    } else {
      print('Invalid response format: $response'); // Debugging
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    print('Error in getFeedTypes: $e'); // Debugging
    throw Exception('Failed to fetch feed types: $e');
  }
}

// GET satu jenis pakan by ID
Future<FeedType> getFeedTypeById(int id) async {
  final response = await fetchAPI("feedType/$id");
  if (response is Map && response['status'] == 200) {
    // Jika data ditemukan
    return FeedType.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Failed to fetch feed type by ID');
  }
}

// CREATE jenis pakan baru
Future<bool> addFeedType(FeedType feedType) async {
  final response = await fetchAPI(
    "feedType",
    method: "POST",
    data: feedType.toJson(),
  );
  if (response is Map && response['status'] == 201) {
    // Jika data berhasil ditambahkan
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to add feed type');
  }
}

// UPDATE jenis pakan
Future<bool> updateFeedType(int id, FeedType feedType) async {
  final response = await fetchAPI(
    "feedType/$id",
    method: "PUT",
    data: feedType.toJson(),
  );
  if (response is Map && response['status'] == 200) {
    // Jika data berhasil diperbarui
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to update feed type');
  }
}

// DELETE jenis pakan
Future<bool> deleteFeedType(int id) async {
  final response = await fetchAPI("feedType/$id", method: "DELETE");
  if (response is Map && response['status'] == 204) {
    // Jika data berhasil dihapus
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to delete feed type');
  }
}