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
  final response = await fetchAPI(
    "symptoms",
    method: "POST",
    data: symptomData,
  );
  if (response is Map && response['status'] == 201) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to create symptom');
  }
}

// DELETE untuk hapus gejala
Future<bool> deleteSymptom(int id) async {
  final response = await fetchAPI(
    "symptoms/$id",
    method: "DELETE",
  );
  if (response is Map && response['status'] == 200) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to delete symptom');
  }
}

// ✅ GET detail gejala berdasarkan ID
Future<Symptom> getSymptomById(int id) async {
  final response = await fetchAPI("symptoms/$id/"); // <-- tambahkan slash di akhir

  if (response is Map && response['status'] == 200) {
    return Symptom.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Failed to fetch symptom');
  }
}


// UPDATE gejala berdasarkan ID
Future<bool> updateSymptom(int id, Map<String, dynamic> symptomData) async {
  final response = await fetchAPI(
    "symptoms/$id",
    method: "PUT",
    data: symptomData,
  );
  if (response is Map && response['status'] == 200) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to update symptom');
  }
}
