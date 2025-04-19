import 'package:dairy_track/config/configApi5002.dart';
import 'package:dairy_track/model/kesehatan/health_check.dart';

// GET semua data pemeriksaan penyakit sapi
Future<List<HealthCheck>> getHealthChecks() async {
  final response = await fetchAPI("health-checks");
  if (response is List<dynamic>) {
    // Jika response langsung list
    return response.map((json) => HealthCheck.fromJson(json)).toList();
  } else if (response is Map && response['status'] == 200) {
    // Jika response model object
    final data = response['data'] as List<dynamic>;
    return data.map((json) => HealthCheck.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Unexpected response format');
  }
}

// POST untuk menambahkan data pemeriksaan penyakit sapi
Future<bool> createHealthCheck(Map<String, dynamic> healthCheckData) async {
  final response = await fetchAPI(
    "health-checks",
    method: "POST",
    data: healthCheckData,
  );
  if (response is Map && response['status'] == 201) {
    // Jika sukses create
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to create health check');
  }
}

// PUT untuk update data pemeriksaan penyakit sapi
Future<bool> updateHealthCheck(int id, Map<String, dynamic> healthCheckData) async {
  final response = await fetchAPI(
    "health-checks/$id",
    method: "PUT",
    data: healthCheckData,
  );
  if (response is Map && response['status'] == 200) {
    // Jika sukses update
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to update health check');
  }
}

// DELETE untuk menghapus data pemeriksaan penyakit sapi
Future<bool> deleteHealthCheck(int id) async {
  final response = await fetchAPI(
    "health-checks/$id",
    method: "DELETE",
  );
  if (response is Map && response['status'] == 200) {
    // Jika sukses delete
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to delete health check');
  }
}
Future<HealthCheck> getHealthCheckById(int id) async {
  final response = await fetchAPI('health-checks/$id/'); // ✅ Slash di belakang sudah betul

  if (response is Map<String, dynamic>) {
    return HealthCheck.fromJson(response); // langsung parse
  } else {
    throw Exception('Gagal mengambil data health check');
  }
}

