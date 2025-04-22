import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';

Future<List<DailyFeedSchedule>> getDailyFeedSchedules() async {
  final response = await fetchAPI("dailyFeedSchedule");
  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['data'] as List<dynamic>? ?? []; // Changed 'schedules' to 'data'
    return data.map((json) => DailyFeedSchedule.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Unexpected response format');
  }
}

// GET a single daily feed Schedule by ID
Future<DailyFeedSchedule> getDailyFeedScheduleById(int id) async {
  final response = await fetchAPI("dailyFeedSchedule/$id");
  if (response is Map<String, dynamic> && response['success'] == true) {
    return DailyFeedSchedule.fromJson(response['data']);
  } else {
    throw Exception(
        response['message'] ?? 'Failed to fetch daily feed Schedule by ID');
  }
}

// CREATE a new daily feed Schedule
Future<bool> addDailyFeedSchedule(DailyFeedSchedule dailyFeedSchedule) async {
  final response = await fetchAPI(
    "dailyFeedSchedule",
    method: "POST",
    data: dailyFeedSchedule.toJson(),
  );
  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Failed to add daily feed Schedule');
  }
}

// UPDATE a daily feed Schedule
Future<bool> updateDailyFeedSchedule(
    int id, DailyFeedSchedule dailyFeedSchedule) async {
  final response = await fetchAPI(
    "dailyFeedSchedule/$id",
    method: "PUT",
    data: dailyFeedSchedule.toJson(),
  );
  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(
        response['message'] ?? 'Failed to update daily feed Schedule');
  }
}

// DELETE a daily feed Schedule
Future<bool> deleteDailyFeedSchedule(int id) async {
  final response = await fetchAPI("dailyFeedSchedule/$id", method: "DELETE");
  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(
        response['message'] ?? 'Failed to delete daily feed Schedule');
  }
}