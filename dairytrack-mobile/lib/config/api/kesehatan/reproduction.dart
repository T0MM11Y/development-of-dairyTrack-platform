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
  await fetchAPI(
    "reproduction/", // ✅ perbaiki typo dan tambahkan slash
    method: "POST",
    data: data,
  );
  return true; // ✅ langsung return true
}


// ✅ Update data reproduksi berdasarkan ID
Future<bool> updateReproduction(int id, Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "reproduction/$id/",
    method: "PUT",
    data: data,
  );

  if (response is Map) {
    return true; // ✅ Langsung return true kalau berhasil
  } else {
    throw Exception('Gagal memperbarui data reproduksi');
  }
}


// ✅ Hapus data reproduksi
Future<bool> deleteReproduction(int id) async {
  final response = await fetchAPI(
    "reproduction/$id/",
    method: "DELETE",
  );

  if (response == true || (response is Map && (response['status'] == 200 || response['status'] == 204))) {
    // ✅ Kalau null/true (karena 204 No Content) atau Map status 200/204
    return true;
  } else {
    throw Exception(response is Map ? response['message'] ?? 'Failed to delete reproduction' : 'Failed to delete reproduction');
  }
}

