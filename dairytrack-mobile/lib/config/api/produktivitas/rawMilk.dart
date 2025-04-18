import 'package:dairy_track/config/configApi5000.dart';

Future<Map<String, dynamic>> getRawMilk() async {
  final response = await fetchAPI("raw_milks");
  if (response['status'] == 200) {
    if (response['data'] is List && response['data'].isNotEmpty) {
      return response['data'][0]; // Return the first item as a map
    } else {
      throw Exception('No data available');
    }
  } else {
    throw Exception(response['message']);
  }
}

// GET satu raw milk by ID
Future<Map<String, dynamic>> getRawMilkById(String id) async {
  final response = await fetchAPI("raw_milks/$id");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET raw milks by cow ID
Future<List<dynamic>> getRawMilksByCowId(String cowId) async {
  final response = await fetchAPI("raw_milks/cow/$cowId");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// CHECK if raw milk is expired
Future<bool> checkRawMilkExpired(String id) async {
  final response = await fetchAPI("raw_milks/$id/is_expired", method: "GET");
  if (response['status'] == 200) {
    return response['data']['isExpired'];
  } else {
    throw Exception(response['message']);
  }
}

// GET today's last session by cow ID
Future<Map<String, dynamic>> getTodayLastSessionByCowId(String cowId) async {
  final response = await fetchAPI("raw_milks/today_last_session/$cowId");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// GET all raw milks with expired status
Future<List<dynamic>> getAllRawMilksWithExpiredStatus() async {
  final response = await fetchAPI("raw_milks/expired_status", method: "GET");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// CREATE raw milk
Future<Map<String, dynamic>> createRawMilk(Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "raw_milks",
    method: "POST",
    data: data,
    isFormData: true,
  );
  if (response['status'] == 201) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// UPDATE raw milk
Future<Map<String, dynamic>> updateRawMilk(
    String id, Map<String, dynamic> data) async {
  final response = await fetchAPI(
    "raw_milks/$id",
    method: "PUT",
    data: data,
    isFormData: true,
  );
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}

// DELETE raw milk
Future<void> deleteRawMilk(String id) async {
  final response = await fetchAPI("raw_milks/$id", method: "DELETE");
  if (response['status'] != 204) {
    throw Exception(response['message']);
  }
}

// GET freshness notifications
Future<List<dynamic>> getFreshnessNotifications() async {
  final response =
      await fetchAPI("raw_milks/freshness_notifications", method: "GET");
  if (response['status'] == 200) {
    return response['data'];
  } else {
    throw Exception(response['message']);
  }
}
