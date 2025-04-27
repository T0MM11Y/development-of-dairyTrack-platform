import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';

/// Fetches all daily feed schedules with optional filters.
Future<List<DailyFeedSchedule>> getAllDailyFeeds({
  int? cowId,
  String? date,
  String? session,
}) async {
  final queryParams = <String, String>{};
  if (cowId != null) queryParams['cow_id'] = cowId.toString();
  if (date != null) queryParams['date'] = date;
  if (session != null) queryParams['session'] = session;

  final response = await fetchAPI(
    "dailyFeedSchedule",
    queryParams: queryParams.isEmpty ? null : queryParams,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['data'] as List<dynamic>? ?? [];
    return data.map((json) => DailyFeedSchedule.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Gagal mengambil daftar jadwal pakan harian');
  }
}

/// Fetches a single daily feed schedule by ID.
Future<DailyFeedSchedule> getDailyFeedById(int id) async {
  final response = await fetchAPI("dailyFeedSchedule/$id");

  if (response is Map<String, dynamic> && response['success'] == true) {
    return DailyFeedSchedule.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Gagal mengambil jadwal pakan harian berdasarkan ID');
  }
}

/// Creates a new daily feed schedule with optional feed items.
Future<DailyFeedSchedule> createDailyFeed({
  required int cowId,
  required String date,
  required String session,
  List<FeedItem>? items,
}) async {
  final data = {
    'cow_id': cowId,
    'date': date,
    'session': session,
    'items': items?.map((item) => {
      'feed_id': item.feedId, // Pastikan FeedItem kamu punya field feedId
      'quantity': item.quantity,
    }).toList() ?? [],
  };

  final response = await fetchAPI(
    "dailyFeedSchedule",
    method: "POST",
    data: data,
  );

  if (response is Map<String, dynamic>) {
    if (response['success'] == true) {
      return DailyFeedSchedule.fromJson(response['data']);
    } else if (response['message'] != null &&
        response['message'].toString().contains('sudah ada')) {
      // Tangani error duplikasi
      throw Exception('Jadwal pakan untuk sapi ini di tanggal dan sesi tersebut sudah ada.');
    } else {
      throw Exception(response['message'] ?? 'Gagal membuat jadwal pakan harian baru');
    }
  } else {
    throw Exception('Gagal membuat jadwal pakan harian baru');
  }
}

/// Updates an existing daily feed schedule.
Future<DailyFeedSchedule> updateDailyFeed({
  required int id,
  int? cowId,
  String? date,
  String? session,
}) async {
  final data = <String, dynamic>{};
  if (cowId != null) data['cow_id'] = cowId;
  if (date != null) data['date'] = date;
  if (session != null) data['session'] = session;

  final response = await fetchAPI(
    "dailyFeedSchedule/$id",
    method: "PUT",
    data: data,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return DailyFeedSchedule.fromJson(response['data']);
  } else {
    throw Exception(response['message'] ?? 'Gagal memperbarui jadwal pakan harian');
  }
}

/// Deletes a daily feed schedule by ID.
Future<bool> deleteDailyFeed(int id) async {
  final response = await fetchAPI(
    "dailyFeedSchedule/$id",
    method: "DELETE",
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return true;
  } else {
    throw Exception(response['message'] ?? 'Gagal menghapus jadwal pakan harian');
  }
}

/// Searches daily feed schedules with date range and optional filters.
Future<List<DailyFeedSchedule>> searchDailyFeeds({
  int? cowId,
  String? startDate,
  String? endDate,
  String? session,
}) async {
  final queryParams = <String, String>{};
  if (cowId != null) queryParams['cow_id'] = cowId.toString();
  if (startDate != null) queryParams['start_date'] = startDate;
  if (endDate != null) queryParams['end_date'] = endDate;
  if (session != null) queryParams['session'] = session;

  final response = await fetchAPI(
    "dailyFeedSchedule/search",
    queryParams: queryParams.isEmpty ? null : queryParams,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    final data = response['data'] as List<dynamic>? ?? [];
    return data.map((json) => DailyFeedSchedule.fromJson(json)).toList();
  } else {
    throw Exception(response['message'] ?? 'Gagal mencari jadwal pakan harian');
  }
}