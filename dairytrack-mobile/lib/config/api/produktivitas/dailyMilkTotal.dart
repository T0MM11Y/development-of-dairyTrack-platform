import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/produktivitas/dairyMilkTotal.dart';
import 'package:intl/intl.dart';

// GET semua data daily milk totals
Future<List<DailyMilkTotal>> getDailyMilkTotals({
  DateTime? startDate,
  DateTime? endDate,
  cowName,
  String? cowId,
}) async {
  try {
    // Prepare query parameters for date filtering
    final Map<String, String> queryParams = {};

    if (startDate != null) {
      queryParams['start_date'] = DateFormat('yyyy-MM-dd').format(startDate);
    }

    if (endDate != null) {
      queryParams['end_date'] = DateFormat('yyyy-MM-dd').format(endDate);
    }

    if (cowId != null && cowId.isNotEmpty) {
      queryParams['cow_id'] = cowId;
    }

    // Log the request details
    print('Fetching daily milk totals with params: $queryParams');

    final response = await fetchAPI(
      "daily_milk_totals",
      queryParams: queryParams.isNotEmpty ? queryParams : null,
    );

    print('API Response Status: ${response['status']}');

    if (response['status'] == 200) {
      if (response['data'] is List) {
        final List<dynamic> responseData = response['data'];

        // Log the number of records received
        print('Received ${responseData.length} records');

        // Parse and validate each item
        final List<DailyMilkTotal> results = [];
        int invalidItems = 0;

        for (var item in responseData) {
          try {
            if (item is Map<String, dynamic>) {
              final dailyTotal = DailyMilkTotal.fromJson(item);

              // Validate required fields
              if (dailyTotal.date != null && dailyTotal.totalVolume != null) {
                results.add(dailyTotal);
              } else {
                invalidItems++;
                print('Invalid item - missing required fields: $item');
              }
            } else {
              invalidItems++;
              print('Invalid item format - expected Map: $item');
            }
          } catch (e) {
            invalidItems++;
            print('Error parsing item $item: $e');
          }
        }

        if (invalidItems > 0) {
          print('Warning: $invalidItems invalid items were skipped');
        }

        // Sort by date ascending
        results.sort((a, b) => a.date.compareTo(b.date));

        return results;
      } else {
        throw FormatException(
            'Invalid data format: Expected List but got ${response['data'].runtimeType}');
      }
    } else {
      throw Exception(response['message'] ??
          'Failed to fetch data. Status code: ${response['status']}');
    }
  } catch (e) {
    print('Error in getDailyMilkTotals: $e');
    rethrow;
  }
}

// GET satu daily milk total by ID
Future<Map<String, dynamic>> getDailyMilkTotalById(String id) async {
  final response = await fetchAPI("daily_milk_totals/$id");

  // Debugging: Log response untuk memeriksa struktur data
  print('Response: $response');

  // Validasi bahwa response adalah Map<String, dynamic>
  if (response is! Map<String, dynamic>) {
    throw FormatException(
        'Invalid response format: Expected Map<String, dynamic>');
  }

  // Validasi bahwa response memiliki kunci 'status' dan 'data'
  if (!response.containsKey('status') || !response.containsKey('data')) {
    throw FormatException(
        'Invalid response structure: Missing "status" or "data" key');
  }

  // Pastikan status adalah 200
  if (response['status'] == 200) {
    // Validasi bahwa response['data'] adalah Map<String, dynamic>
    if (response['data'] is Map<String, dynamic>) {
      return response['data'];
    } else {
      throw FormatException(
          'Invalid data format: Expected Map<String, dynamic>');
    }
  } else {
    throw Exception(response['message'] ?? 'Failed to fetch data');
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
