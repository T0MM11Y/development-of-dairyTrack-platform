import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/peternakan/farmer.dart';

// GET semua data peternak
Future<List<Peternak>> getFarmers() async {
  final response = await fetchAPI("farmers");
  if (response is List<dynamic>) {
    // Jika response adalah List langsung
    return response.map((json) => Peternak.fromJson(json)).toList();
  } else if (response is Map && response['status'] == 200) {
    // Jika response adalah Map dengan data di dalamnya
    final data = response['data'] as List<dynamic>;
    return data.map((json) => Peternak.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Unexpected response format');
  }
}

Future<bool> addFarmers(Peternak peternak) async {
  final response = await fetchAPI(
    "farmers",
    method: "POST",
    data: peternak.toJson(),
  );
  if (response is Map && response['status'] == 201) {
    // Jika data berhasil ditambahkan
    return true;
  } else {
    // Jika terjadi kesalahan
    throw Exception(response['message'] ?? 'Failed to add farmer');
  }
}
