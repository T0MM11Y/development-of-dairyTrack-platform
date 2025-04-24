import 'package:dairy_track/config/configApi5001.dart';
import 'package:dairy_track/model/penjualan/product.dart';

// GET semua data stok produk
Future<List<ProductStock>> getProductStocks() async {
  try {
    final response = await fetchAPI("product-stock");
    print('Raw response: $response'); // Log respons mentah

    List<dynamic> data;
    if (response is Map<String, dynamic>) {
      print('Response is Map: $response');
      if (response['success'] == true) {
        data = response['productStocks'] as List<dynamic>? ?? [];
      } else {
        final message = response['message'] ?? 'Unknown error';
        print('API error: $message');
        throw Exception('API error: $message');
      }
    } else if (response is List<dynamic>) {
      print('Response is List: $response');
      data = response;
    } else {
      print('Invalid response format: $response');
      throw Exception('Unexpected response format: $response');
    }

    print('Product stocks data: $data');
    return data.map((json) {
      try {
        return ProductStock.fromJson(json as Map<String, dynamic>);
      } catch (e) {
        print('Error parsing ProductStock: $e, JSON: $json');
        throw Exception('Failed to parse product stock: $e');
      }
    }).toList();
  } catch (e) {
    print('Error in getProductStocks: $e');
    throw Exception('Failed to fetch product stocks: $e');
  }
}

// GET satu stok produk by ID
Future<ProductStock> getProductStockById(int id) async {
  try {
    final response = await fetchAPI("product-stock/$id");
    print('Raw response: $response'); // Log respons mentah
    if (response is Map<String, dynamic> && response['status'] == 200) {
      return ProductStock.fromJson(response['data']);
    } else {
      final message =
          response['message'] ?? 'Failed to fetch product stock by ID';
      print('API error: $message');
      throw Exception(message);
    }
  } catch (e) {
    print('Error in getProductStockById: $e');
    throw Exception('Failed to fetch product stock: $e');
  }
}

// CREATE stok produk baru
Future<bool> createProductStock({
  required int productType,
  required int initialQuantity,
  required int quantity,
  required String productionAt,
  required String expiryAt,
  required String status,
  required double totalMilkUsed,
}) async {
  try {
    final response = await fetchAPI(
      "product-stock",
      method: "POST",
      multipartData: {
        'product_type': productType.toString(),
        'initial_quantity': initialQuantity.toString(),
        'quantity': quantity.toString(),
        'production_at': productionAt,
        'expiry_at': expiryAt,
        'status': status,
        'total_milk_used': totalMilkUsed.toString(),
      },
    );

    print('Response from createProductStock: $response');
    if (response is Map<String, dynamic>) {
      return true;
    } else {
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    print('Error in createProductStock: $e');
    rethrow;
  }
}

// UPDATE stok produk
Future<bool> updateProductStock({
  required int id,
  required int productType,
  required int initialQuantity,
  required int quantity,
  required String productionAt,
  required String expiryAt,
  required String status,
  required double totalMilkUsed,
}) async {
  try {
    final response = await fetchAPI(
      "product-stock/$id",
      method: "PUT",
      multipartData: {
        'product_type': productType.toString(),
        'initial_quantity': initialQuantity.toString(),
        'quantity': quantity.toString(),
        'production_at': productionAt,
        'expiry_at': expiryAt,
        'status': status,
        'total_milk_used': totalMilkUsed.toString(),
      },
    );

    print('Response from updateProductStock: $response');
    if (response is Map<String, dynamic>) {
      return true;
    } else {
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    print('Error in updateProductStock: $e');
    rethrow;
  }
}

// DELETE stok produk
Future<bool> deleteProductStock(int id) async {
  try {
    final response = await fetchAPI("product-stock/$id", method: "DELETE");
    print('Response from deleteProductStock: $response');
    if (response == true || response is Map<String, dynamic>) {
      return true;
    }
    throw Exception('Unexpected response format: $response');
  } catch (e) {
    print('Error in deleteProductStock: $e');
    rethrow;
  }
}
