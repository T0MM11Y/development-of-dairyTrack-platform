import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/model/produktivitas/rawMilk.dart';

Future<Map<String, dynamic>> getRawMilkData() async {
  try {
    // Panggil endpoint API
    final response = await fetchAPI('raw_milks/raw_milk_data');

    if (response['status'] == 200) {
      // Ubah data menjadi daftar objek RawMilk
      final List<RawMilk> rawMilkList = (response['data'] as List)
          .map((item) => RawMilk.fromJson(item))
          .toList();

      // Kembalikan data yang berhasil diproses
      return {'status': 'success', 'data': rawMilkList};
    } else {
      // Tangani respons yang tidak berhasil
      return {
        'status': 'error',
        'message': response['message'] ?? 'Failed to fetch raw milk data.'
      };
    }
  } catch (e) {
    // Tangani pengecualian
    return {
      'status': 'error',
      'message': 'An error occurred while fetching raw milk data: $e'
    };
  }
}
