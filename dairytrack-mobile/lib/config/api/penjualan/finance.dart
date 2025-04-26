import 'package:http/http.dart' as http;
import 'package:dairy_track/model/penjualan/finance.dart';
import 'package:dairy_track/config/configApi5001.dart';

Future<List<Finance>> getFinances({String queryString = ''}) async {
  try {
    final response = await fetchAPI(
      'finance/finance/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
    );

    print('Response from getFinances: $response');
    if (response is List) {
      return response.map((json) => Finance.fromJson(json)).toList();
    } else {
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    print('Error in getFinances: $e');
    rethrow;
  }
}

Future<List<int>> getFinanceExportPdf({String queryString = ''}) async {
  try {
    final response = await fetchAPI(
      'finance/export/pdf/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
      isBlob: true,
    );

    print('Response from getFinanceExportPdf: Blob response');
    if (response is List<int>) {
      return response;
    } else {
      throw Exception('Expected blob response, got: $response');
    }
  } catch (e) {
    print('Error in getFinanceExportPdf: $e');
    rethrow;
  }
}

Future<List<int>> getFinanceExportExcel({String queryString = ''}) async {
  try {
    final response = await fetchAPI(
      'finance/export/excel/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
      isBlob: true,
    );

    print('Response from getFinanceExportExcel: Blob response');
    if (response is List<int>) {
      return response;
    } else {
      throw Exception('Expected blob response, got: $response');
    }
  } catch (e) {
    print('Error in getFinanceExportExcel: $e');
    rethrow;
  }
}
