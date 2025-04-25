import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:dairy_track/model/penjualan/productHistory.dart';
import 'package:dairy_track/config/configApi5001.dart';

Future<List<ProductHistory>> getProductStockHistorys(
    {String queryString = ''}) async {
  try {
    final response = await fetchAPI(
      'product-history/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
    );

    print('Response from getProductStockHistorys: $response');
    if (response is List) {
      return response.map((json) => ProductHistory.fromJson(json)).toList();
    } else {
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    print('Error in getProductStockHistorys: $e');
    rethrow;
  }
}

Future<List<int>> getProductStockHistoryExportPdf(
    {String queryString = ''}) async {
  try {
    final response = await fetchAPI(
      'product-history/export/pdf/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
      isBlob: true,
    );

    print('Response from getProductStockHistoryExportPdf: Blob response');
    if (response is List<int>) {
      return response;
    } else {
      throw Exception('Expected blob response, got: $response');
    }
  } catch (e) {
    print('Error in getProductStockHistoryExportPdf: $e');
    rethrow;
  }
}

Future<List<int>> getProductStockHistoryExportExcel(
    {String queryString = ''}) async {
  try {
    final response = await fetchAPI(
      'product-history/export/excel/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
      isBlob: true,
    );

    print('Response from getProductStockHistoryExportExcel: Blob response');
    if (response is List<int>) {
      return response;
    } else {
      throw Exception('Expected blob response, got: $response');
    }
  } catch (e) {
    print('Error in getProductStockHistoryExportExcel: $e');
    rethrow;
  }
}
