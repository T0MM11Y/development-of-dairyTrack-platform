import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/peternakan/cow.dart';

// GET semua data sapi
Future<List<Cow>> getCows() async {
  final response = await fetchAPI("cows");
  if (response is List<dynamic>) {
    // Jika response adalah List langsung
    return response.map((json) => Cow.fromJson(json)).toList();
  } else if (response is Map && response['status'] == 200) {
    // Jika response adalah Map dengan data di dalamnya
    final data = response['data'] as List<dynamic>;
    return data.map((json) => Cow.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Unexpected response format');
  }
}

// GET satu sapi by ID
Future<Cow> getCowById(String id) async {
  final response = await fetchAPI("cows/$id");
  if (response is Map && response['status'] == 200) {
    // Jika data ditemukan
    return Cow.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Failed to fetch cow by ID');
  }
}

// CREATE sapi baru
Future<bool> addCow(Cow cow) async {
  final response = await fetchAPI(
    "cows",
    method: "POST",
    data: cow.toJson(),
  );
  if (response is Map && response['status'] == 201) {
    // Jika data berhasil ditambahkan
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to add cow');
  }
}

// UPDATE sapi
Future<bool> updateCow(String id, Cow cow) async {
  final response = await fetchAPI(
    "cows/$id",
    method: "PUT",
    data: cow.toJson(),
  );
  if (response is Map && response['status'] == 200) {
    // Jika data berhasil diperbarui
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to update cow');
  }
}

// DELETE sapi
Future<bool> deleteCow(String id) async {
  final response = await fetchAPI("cows/$id", method: "DELETE");
  if (response is Map && response['status'] == 204) {
    // Jika data berhasil dihapus
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to delete cow');
  }
}
