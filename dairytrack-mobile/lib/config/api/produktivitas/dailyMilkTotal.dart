import 'package:dairy_track/config/configApi5000.dart';

// GET semua data daily milk totals
Future<List<dynamic>> getDailyMilkTotals() async {
  final response = await fetchAPI("daily_milk_totals");
  if (response['status'] == 200 || response['data'] is Map) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET satu daily milk total by ID
Future<Map<String, dynamic>> getDailyMilkTotalById(String id) async {
  final response = await fetchAPI("daily_milk_totals/$id");
  if (response['status'] == 200 || response['data'] is Map) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET semua data daily milk totals berdasarkan cow_id
Future<List<dynamic>> getDailyMilkTotalsByCowId(String cowId) async {
  final response = await fetchAPI("daily_milk_totals/cow/$cowId");
  if (response['status'] == 200 || response['data'] is Map) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// CREATE daily milk total baru
Future<Map<String, dynamic>> createDailyMilkTotal(
    Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "daily_milk_totals",
    method: "POST",
    data: data,
    isFormData: true,
  );
  if (response['status'] == 201 || response['data'] is Map) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// UPDATE daily milk total
Future<Map<String, dynamic>> updateDailyMilkTotal(
    String id, Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "daily_milk_totals/$id",
    method: "PUT",
    data: data,
    isFormData: true,
  );
  if (response['status'] == 200 || response['data'] is Map) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// DELETE daily milk total
Future<void> deleteDailyMilkTotal(String id) async {
  final response = await fetchAPI("daily_milk_totals/$id", method: "DELETE");
  if (response['status'] != 204) {
    throw Exception(response['message']);
  }
}

// GET low production notifications
Future<List<dynamic>> getLowProductionNotifications() async {
  final response = await fetchAPI("daily_milk_totals/notifications");
  if (response['status'] == 200 || response['data'] is Map) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}
