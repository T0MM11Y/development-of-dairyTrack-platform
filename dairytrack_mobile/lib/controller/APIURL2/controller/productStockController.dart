import 'package:dairytrack_mobile/controller/APIURL2/api_services/apiService.dart';
import 'package:dairytrack_mobile/api/apiController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:logger/logger.dart';

class ProductStockController {
  final String _baseEndpoint = '$API_URL2/product-stock';
  final _logger = Logger();

  /// Fetch all stock items
  Future<List<Stock>> getStocks() async {
    final response = await apiRequest(
      url: _baseEndpoint,
      method: 'GET',
    );

    if (response['success']) {
      try {
        final List<dynamic> data = response['data'];
        _logger.i('Parsing ${data.length} stock items');
        return data.map((json) {
          if (json is Map<String, dynamic>) {
            return Stock.fromJson(json);
          } else {
            _logger.e('Invalid JSON item: $json');
            throw Exception('Invalid JSON format');
          }
        }).toList();
      } catch (e) {
        _logger.e('Error parsing stock items: $e');
        throw Exception('Failed to parse stock items: $e');
      }
    } else {
      _logger.e('Failed to fetch stock items: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  /// Create a new stock item
  Future<bool> createStock({
    required int productType,
    required int initialQuantity,
    required String productionAt,
    required String expiryAt,
    required String status,
    required double totalMilkUsed,
    required int createdBy,
  }) async {
    try {
      final jsonBody = {
        'product_type': productType,
        'initial_quantity': initialQuantity,
        'production_at': productionAt,
        'expiry_at': expiryAt,
        'status': status,
        'total_milk_used': totalMilkUsed.toString(),
        'created_by': createdBy.toString(), // Convert to string for API
        'updated_by': null,
      };

      final response = await apiRequest(
        url: _baseEndpoint,
        method: 'POST',
        body: jsonBody,
      );

      if (response['success']) {
        _logger.i('Created stock item: ${response['data']}');
        return true;
      } else {
        _logger.e('Failed to create stock item: ${response['message']}');
        return false;
      }
    } catch (e) {
      _logger.e('Error creating stock item: $e');
      return false;
    }
  }

  /// Update an existing stock item
  Future<bool> updateStock({
    required int id,
    required int productType,
    required int initialQuantity,
    required String productionAt,
    required String expiryAt,
    required String status,
    required double totalMilkUsed,
    required int createdBy, // Add createdBy to maintain original value
    required int updatedBy,
  }) async {
    final jsonBody = {
      'product_type': productType,
      'initial_quantity': initialQuantity,
      'production_at': productionAt,
      'expiry_at': expiryAt,
      'status': status,
      'total_milk_used': totalMilkUsed.toString(),
      'created_by': createdBy.toString(), // Use original created_by
      'updated_by': updatedBy.toString(), // Convert to string for API
    };

    final response = await apiRequest(
      url: '$_baseEndpoint/$id/',
      method: 'PUT',
      body: jsonBody,
    );

    if (response['success']) {
      _logger.i('Updated stock item: ${response['data']}');
      return true;
    } else {
      _logger.e('Failed to update stock item: ${response['message']}');
      return false;
    }
  }

  /// Delete a stock item by ID
  Future<bool> deleteStock(int id) async {
    final response = await apiRequest(
      url: '$_baseEndpoint/$id/',
      method: 'DELETE',
    );

    if (response['success']) {
      _logger.i('Deleted stock item: $id');
      return true;
    } else {
      _logger.e('Failed to delete stock item: ${response['message']}');
      return false;
    }
  }
}