import 'package:dairy_track/config/configApi5001.dart';
import 'package:dairy_track/model/penjualan/productType.dart';

// GET semua data jenis produk
Future<List<ProdukType>> getProductTypes() async {
  try {
    final response = await fetchAPI("product-type");
    print('Raw response: $response'); // Log respons mentah

    List<dynamic> data;
    if (response is Map<String, dynamic>) {
      print('Response is Map: $response');
      if (response['success'] == true) {
        data = response['productTypes'] as List<dynamic>? ?? [];
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

    print('Product types data: $data');
    return data.map((json) {
      try {
        return ProdukType.fromJson(json as Map<String, dynamic>);
      } catch (e) {
        print('Error parsing ProdukType: $e, JSON: $json');
        throw Exception('Failed to parse product type: $e');
      }
    }).toList();
  } catch (e) {
    print('Error in getProductTypes: $e');
    throw Exception('Failed to fetch product types: $e');
  }
}

// GET satu jenis produk by ID
Future<ProdukType> getProductTypeById(int id) async {
  try {
    final response = await fetchAPI("product-type/$id");
    if (response is Map<String, dynamic> && response['status'] == 200) {
      return ProdukType.fromJson(response['data']);
    } else {
      throw Exception(
          response['message'] ?? 'Failed to fetch product type by ID');
    }
  } catch (e) {
    print('Error in getProductTypeById: $e'); // Debugging
    throw Exception('Failed to fetch product type: $e');
  }
}

// CREATE jenis produk baru
Future<bool> createProductType({
  required String productName,
  required String productDescription,
  required String price,
  required String unit,
  List<int>? imageBytes,
  String? imageFileName,
}) async {
  try {
    final response = await fetchAPI(
      "product-type",
      method: "POST",
      multipartData: {
        'product_name': productName,
        'product_description': productDescription,
        'price': price,
        'unit': unit,
      },
      fileBytes: imageBytes,
      fileFieldName: 'image',
      fileName: imageFileName,
    );

    // Log respons untuk debugging
    print('Response from createProductType: $response');

    // Cek apakah respons adalah Map (JSON) dan memiliki data yang diharapkan
    if (response is Map<String, dynamic>) {
      // Respons sukses, tidak perlu cek 'status' karena fetchAPI sudah memastikan status HTTP 2xx
      return true;
    } else {
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    // Log error secara rinci
    print('Error in createProductType: $e');
    rethrow; // Lempar ulang error agar ditangkap oleh caller
  }
}

// UPDATE jenis produk
Future<bool> updateProductType({
  required int id,
  required String productName,
  required String productDescription,
  required String price,
  required String unit,
  List<int>? imageBytes,
  String? imageFileName,
}) async {
  try {
    final response = await fetchAPI(
      "product-type/$id/",
      method: "PUT",
      multipartData: {
        'product_name': productName,
        'product_description': productDescription,
        'price': price,
        'unit': unit,
      },
      fileBytes: imageBytes,
      fileFieldName: 'image',
      fileName: imageFileName,
    );

    print('Response from updateProductType: $response');
    if (response is Map<String, dynamic>) {
      return true;
    } else {
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    print('Error in updateProductType: $e');
    rethrow;
  }
}

// DELETE jenis produk
Future<bool> deleteProductType(int id) async {
  try {
    final response = await fetchAPI("product-type/$id/", method: "DELETE");
    // Jika fetchAPI mengembalikan true (untuk status 204), anggap sukses
    if (response == true) {
      return true;
    }
    // Jika respons adalah Map (JSON), cek apakah ada indikasi sukses
    if (response is Map<String, dynamic>) {
      return true; // Anggap sukses untuk respons JSON (misalnya, status 200)
    }
    throw Exception('Unexpected response format: $response');
  } catch (e) {
    print('Error in deleteProductType: $e'); // Debugging
    rethrow; // Lempar ulang error agar ditangkap oleh caller
  }
}
