import 'package:dairy_track/config/configApi5002.dart';
import 'package:dairy_track/model/kesehatan/symptom.dart';

// GET semua data gejala
Future<List<Symptom>> getSymptoms() async {
  final response = await fetchAPI("symptoms/");
  if (response is List<dynamic>) {
    return response.map((json) => Symptom.fromJson(json)).toList();
  } else if (response is Map && response['status'] == 200) {
    final data = response['data'] as List<dynamic>;
    return data.map((json) => Symptom.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Unexpected response format');
  }
}

// POST untuk tambah gejala
Future<bool> createSymptom(Map<String, dynamic> symptomData) async {
  await fetchAPI(
    "symptoms/",
    method: "POST",
    data: symptomData,
  );
  return true;
}



// DELETE untuk hapus gejala
Future<bool> deleteSymptom(int id) async {
  final response = await fetchAPI(
    "symptoms/$id/",
    method: "DELETE",
  );

  // ✅ Kalau DELETE berhasil (response == true dari fetchAPI)
  if (response == true) {
    return true;
  }

  // ✅ Kalau API malah kasih JSON, cek status
  if (response is Map<String, dynamic> &&
      (response['status'] == 200 || response['status'] == 204)) {
    return true;
  }

  // ❌ Kalau tidak berhasil
  throw Exception(response is Map
      ? response['message'] ?? 'Failed to delete symptom'
      : 'Failed to delete symptom');
}



// ✅ GET detail gejala berdasarkan ID
Future<Symptom> getSymptomById(int id) async {
  final response = await fetchAPI('symptoms/$id/'); // ✅ Slash di belakang

  if (response is Map<String, dynamic>) {
    return Symptom.fromJson(response); // ✅ langsung parse tanpa cek 'data'
  } else {
    throw Exception('Gagal mengambil data symptom');
  }
}



// UPDATE gejala berdasarkan ID
Future<bool> updateSymptom(int id, Map<String, dynamic> symptomData) async {
  final response = await fetchAPI(
    "symptoms/$id/",
    method: "PUT",
    data: symptomData,
  );

  if (response is Map) {
    return true; // ✅ Langsung return true karena 200 sudah pasti OK
  } else {
    throw Exception('Gagal memperbarui data gejala');
  }
}

