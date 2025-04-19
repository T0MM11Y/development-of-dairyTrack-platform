import 'package:dairy_track/config/configApi5002.dart';
import 'package:dairy_track/model/kesehatan/reproduction.dart';

// ✅ Get semua data reproduksi
Future<List<Reproduction>> getReproductions() async {
  final response = await fetchAPI("reproduction");
  if (response is List) {
    return response.map((json) => Reproduction.fromJson(json)).toList();
  } else if (response is Map && response['status'] == 200) {
    final data = response['data'] as List;
    return data.map((json) => Reproduction.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Unexpected response format');
  }
}

// ✅ Get reproduksi berdasarkan ID
Future<Reproduction> getReproductionById(int id) async {
  final response = await fetchAPI("reproduction/$id/"); // ✅ slash belakang sudah betul

  if (response is Map<String, dynamic>) {
    return Reproduction.fromJson(response); // langsung parse
  } else {
    throw Exception('Failed to fetch reproduction by ID');
  }
}


// ✅ Tambah data reproduksi
Future<bool> createReproduction(Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "rreproduction",
    method: "POST",
    data: data,
  );
  if (response is Map && response['status'] == 201) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to create reproduction');
  }
}

// ✅ Update data reproduksi
Future<bool> updateReproduction(int id, Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "reproduction/$id",
    method: "PUT",
    data: data,
  );
  if (response is Map && response['status'] == 200) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to update reproduction');
  }
}

// ✅ Hapus data reproduksi
Future<bool> deleteReproduction(int id) async {
  final response = await fetchAPI(
    "reproduction/$id",
    method: "DELETE",
  );
  if (response is Map && response['status'] == 200) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to delete reproduction');
  }
}
