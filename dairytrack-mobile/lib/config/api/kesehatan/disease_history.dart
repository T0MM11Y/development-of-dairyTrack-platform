import 'package:dairy_track/config/configApi5002.dart';
import 'package:dairy_track/model/kesehatan/disease_history.dart';

// Get semua riwayat penyakit
Future<List<DiseaseHistory>> getDiseaseHistories() async {
  final response = await fetchAPI("disease-history/");
  if (response is Map && response.containsKey('results')) {
    final data = response['results'] as List<dynamic>;
    return data.map((json) => DiseaseHistory.fromJson(json)).toList();
  } else if (response is List<dynamic>) {
    return response.map((json) => DiseaseHistory.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Unexpected response format');
  }
}

Future<DiseaseHistory> getDiseaseHistoryById(int id) async {
  final response = await fetchAPI('disease-history/$id/');

  if (response is Map<String, dynamic>) {
    return DiseaseHistory.fromJson(response);
  } else {
    throw Exception('Gagal mengambil data riwayat penyakit');
  }
}



// ✅ Tambah riwayat penyakit
Future<bool> createDiseaseHistory(Map<String, dynamic> data) async {
  await fetchAPI(
    "disease-history/",
    method: "POST",
    data: data,
  );
  return true; // ✅ Langsung return true, ga perlu cek manual response
}


// UPDATE riwayat penyakit berdasarkan ID
Future<bool> updateDiseaseHistory(int id, Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "disease-history/$id/",
    method: "PUT",
    data: data,
  );

  if (response is Map) {
    return true; // ✅ Langsung return true kalau sukses
  } else {
    throw Exception('Gagal memperbarui data riwayat penyakit');
  }
}


// ✅ Hapus riwayat penyakit
Future<bool> deleteDiseaseHistory(int id) async {
  final response = await fetchAPI(
    "disease-history/$id/",
    method: "DELETE",
  );

  if (response == true || (response is Map && (response['status'] == 200 || response['status'] == 204))) {
    // ✅ Kalau null/true (karena 204 No Content) atau Map status 200/204
    return true;
  } else {
    throw Exception(response is Map ? response['message'] ?? 'Failed to delete disease history' : 'Failed to delete disease history');
  }
}

