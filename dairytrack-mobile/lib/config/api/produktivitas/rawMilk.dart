import 'package:dairy_track/config/configApi5000.dart';

Future<Map<String, dynamic>> getRawMilk() async {
  try {
    // Use fetchAPI to call the endpoint
    final response = await fetchAPI('raw_milks');

    if (response['status'] == 200) {
      // Return the data if the status is successful
      return {'status': 'success', 'data': response['data']};
    } else {
      // Handle non-successful responses
      return {
        'status': 'error',
        'message': response['message'] ?? 'Failed to fetch raw milk data.'
      };
    }
  } catch (e) {
    // Handle exceptions
    return {
      'status': 'error',
      'message': 'An error occurred while fetching raw milk data: $e'
    };
  }
}
