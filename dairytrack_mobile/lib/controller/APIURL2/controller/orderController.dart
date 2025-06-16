// orderController.dart
import 'package:dairytrack_mobile/controller/APIURL2/api_services/apiService.dart';
import 'package:dairytrack_mobile/api/apiController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/order.dart';
import 'package:logger/logger.dart';

class OrderController {
  final String _baseEndpoint = '$API_URL2/sales/orders/'; // Pastikan trailing slash
  final _logger = Logger();

  /// Fetch all orders
  Future<List<Order>> getOrders() async {
    _logger.d('Fetching orders from: $_baseEndpoint');
    final response = await apiRequest(
      url: _baseEndpoint,
      method: 'GET',
    );

    if (response['success']) {
      try {
        final List<dynamic> data = response['data'];
        _logger.i('Parsing ${data.length} orders');
        return data.map((json) {
          if (json is Map<String, dynamic>) {
            return Order.fromJson(json);
          } else {
            _logger.e('Invalid JSON item: $json');
            throw Exception('Invalid JSON format');
          }
        }).toList();
      } catch (e) {
        _logger.e('Error parsing orders: $e');
        throw Exception('Failed to parse orders: $e');
      }
    } else {
      _logger.e('Failed to fetch orders: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  /// Fetch a single order by ID
  Future<Order> getOrderById(int id) async {
    final url = '$_baseEndpoint$id/';
    _logger.d('Fetching order from: $url');
    final response = await apiRequest(
      url: url,
      method: 'GET',
    );

    if (response['success']) {
      try {
        final data = response['data'];
        if (data is Map<String, dynamic>) {
          _logger.i('Parsed order ID: $id');
          return Order.fromJson(data);
        } else {
          _logger.e('Invalid JSON for order ID: $id');
          throw Exception('Invalid JSON format');
        }
      } catch (e) {
        _logger.e('Error parsing order ID: $id, error: $e');
        throw Exception('Failed to parse order: $e');
      }
    } else {
      _logger.e('Failed to fetch order ID: $id, message: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  /// Create a new order
  Future<bool> createOrder(Map<String, dynamic> orderData) async {
    try {
      _logger.d('Creating order at: $_baseEndpoint, data: $orderData');
      final response = await apiRequest(
        url: _baseEndpoint,
        method: 'POST',
        body: orderData,
      );

      if (response['success']) {
        _logger.i('Created order: ${response['data']}');
        return true;
      } else {
        _logger.e('Failed to create order: ${response['message']}');
        return false;
      }
    } catch (e) {
      _logger.e('Error creating order: $e');
      throw Exception('Failed to create order: $e');
    }
  }

  /// Update an existing order
  Future<bool> updateOrder(int id, Map<String, dynamic> orderData) async {
    final url = '$_baseEndpoint$id/';
    try {
      _logger.d('Updating order at: $url, data: $orderData');
      final response = await apiRequest(
        url: url,
        method: 'PUT',
        body: orderData,
      );

      if (response['success']) {
        _logger.i('Updated order ID: $id, data: ${response['data']}');
        return true;
      } else {
        _logger.e('Failed to update order ID: $id, message: ${response['message']}');
        return false;
      }
    } catch (e) {
      _logger.e('Error updating order ID: $id, error: $e');
      throw Exception('Failed to update order: $e');
    }
  }

  /// Delete an order by ID
  Future<bool> deleteOrder(int id) async {
    final url = '$_baseEndpoint$id/';
    try {
      _logger.d('Deleting order at: $url');
      final response = await apiRequest(
        url: url,
        method: 'DELETE',
      );

      if (response['success']) {
        _logger.i('Deleted order ID: $id');
        return true;
      } else {
        _logger.e('Failed to delete order ID: $id, message: ${response['message']}');
        return false;
      }
    } catch (e) {
      _logger.e('Error deleting order ID: $id, error: $e');
      throw Exception('Failed to delete order: $e');
    }
  }
}