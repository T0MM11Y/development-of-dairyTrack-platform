// controller/produtTypeController.dart
import 'package:dairytrack_mobile/controller/APIURL2/api_services/apiService.dart';
import 'package:dairytrack_mobile/api/apiController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
import 'package:logger/logger.dart';

class ProductTypeController {
  final String _baseEndpoint = '$API_URL2/product-type';
  final _logger = Logger();

  /// Fetch all product types
  Future<List<ProdukType>> getProductTypes() async {
    final response = await apiRequest(
      url: _baseEndpoint,
      method: 'GET',
    );

    if (response['success']) {
      try {
        final List<dynamic> data = response['data'];
        _logger.i('Parsing ${data.length} product types');
        return data.map((json) {
          if (json is Map<String, dynamic>) {
            return ProdukType.fromJson(json);
          } else {
            _logger.e('Invalid JSON item: $json');
            throw Exception('Invalid JSON format');
          }
        }).toList();
      } catch (e) {
        _logger.e('Error parsing product types: $e');
        throw Exception('Failed to parse product types: $e');
      }
    } else {
      _logger.e('Failed to fetch product types: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  /// Fetch a single product type by ID
  Future<ProdukType> getProductTypeById(int id) async {
    final response = await apiRequest(
      url: '$_baseEndpoint/$id',
      method: 'GET',
    );

    if (response['success']) {
      try {
        return ProdukType.fromJson(response['data']);
      } catch (e) {
        _logger.e('Error parsing product type: $e');
        throw Exception('Failed to parse product type: $e');
      }
    } else {
      _logger.e('Failed to fetch product type: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  /// Create a new product type
  Future<bool> createProductType({
    required String productName,
    required String productDescription,
    required String price,
    required String unit,
    required int createdBy, // Add createdBy parameter
    List<int>? imageBytes,
    String? imageFileName,
  }) async {
    try {
      Map<String, dynamic> response;

      // Prepare the JSON body
      final jsonBody = {
        'product_name': productName,
        'product_description': productDescription,
        'price': price,
        'unit': unit,
        'created_by': createdBy.toString(), // Convert to string for API
        'updated_by': null,
      };

      if (imageBytes != null && imageFileName != null) {
        // Use multipart request if an image is provided
        response = await apiRequest(
          url: _baseEndpoint,
          method: 'POST',
          multipartData: {
            'product_name': productName,
            'product_description': productDescription,
            'price': price,
            'unit': unit,
            'created_by': createdBy.toString(),
            'updated_by': '',
          },
          fileBytes: imageBytes,
          fileFieldName: 'image',
          fileName: imageFileName,
        );
      } else {
        // Use JSON request if no image is provided
        response = await apiRequest(
          url: _baseEndpoint,
          method: 'POST',
          body: jsonBody,
        );
      }

      if (response['success']) {
        _logger.i('Created product type: ${response['data']}');
        return true;
      } else {
        _logger.e('Failed to create product type: ${response['message']}');
        return false;
      }
    } catch (e) {
      _logger.e('Error creating product type: $e');
      return false;
    }
  }

  /// Update an existing product type
  // controller/productTypeController.dart
  Future<bool> updateProductType({
    required int id,
    required String productName,
    required String productDescription,
    required String price,
    required String unit,
    required int createdBy, // Add createdBy parameter
    required int updatedBy,
    List<int>? imageBytes,
    String? imageFileName,
  }) async {
    final response = await apiRequest(
      url: '$_baseEndpoint/$id/',
      method: 'PUT',
      multipartData: {
        'product_name': productName,
        'product_description': productDescription,
        'price': price,
        'unit': unit,
        'created_by': createdBy.toString(), // Use original created_by
        'updated_by': updatedBy.toString(),
      },
      fileBytes: imageBytes,
      fileFieldName: 'image',
      fileName: imageFileName,
    );

    if (response['success']) {
      _logger.i('Updated product type: ${response['data']}');
    } else {
      _logger.e('Failed to update product type: ${response['message']}');
    }
    return response['success'];
  }

  /// Delete a product type by ID
  Future<bool> deleteProductType(int id) async {
    final response = await apiRequest(
      url: '$_baseEndpoint/$id/',
      method: 'DELETE',
    );

    if (response['success']) {
      _logger.i('Deleted product type: $id');
    } else {
      _logger.e('Failed to delete product type: ${response['message']}');
    }
    return response['success'];
  }
}
