import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/nutrition.dart';

/// Fetches all nutrisi.
Future<List<Nutrisi>> getAllNutrisi() async {
  final response = await fetchAPI("nutrition");

  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['nutrisi'] as List<dynamic>? ?? [];
    return data.map((json) => Nutrisi.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Gagal mengambil daftar nutrisi');
  }
}

/// Fetches a single nutrisi by ID.
Future<Nutrisi> getNutrisiById(int id) async {
  final response = await fetchAPI("nutrition/$id");

  if (response is Map<String, dynamic> && response['success'] == true) {
    return Nutrisi.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Gagal mengambil nutrisi berdasarkan ID');
  }
}

/// Creates a new nutrisi.
Future<Nutrisi> addNutrisi({
  required String name,
  String? unit,
}) async {
  final data = {
    'name': name.trim(),
    if (unit != null) 'unit': unit,
  };

  final response = await fetchAPI(
    "nutrition",
    method: "POST",
    data: data,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return Nutrisi.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Gagal membuat nutrisi baru');
  }
}

/// Updates an existing nutrisi.
Future<Nutrisi> updateNutrisi({
  required int id,
  required String name,
  String? unit,
}) async {
  final data = {
    'name': name.trim(),
    if (unit != null) 'unit': unit,
  };

  final response = await fetchAPI(
    "nutrition/$id",
    method: "PUT",
    data: data,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return Nutrisi.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Gagal memperbarui nutrisi');
  }
}

/// Deletes a nutrisi by ID.
Future<bool> deleteNutrisi(int id) async {
  final response = await fetchAPI(
    "nutrition/$id",
    method: "DELETE",
  );

  if (response is Map<String, dynamic>) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Gagal menghapus nutrisi');
  }
}