// orderProvider.dart
import 'package:dairytrack_mobile/controller/APIURL2/controller/orderController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/controller/productStockController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/order.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';

class OrderProvider with ChangeNotifier {
  final OrderController _controller = OrderController();
  final ProductStockController _stockController = ProductStockController();
  List<Order> _orders = [];
  List<Stock> _productStocks = [];
  String _searchQuery = '';
  bool _isLoading = false;
  String _errorMessage = '';
  int? _deletingId;
  final Logger _logger = Logger();

  /// Daftar pesanan yang difilter berdasarkan searchQuery
  List<Order> get orders => _orders.where((order) {
        if (_searchQuery.isEmpty) return true;
        final query = _searchQuery.toLowerCase();
        return order.customerName.toLowerCase().contains(query) ||
            order.orderNo.toLowerCase().contains(query);
      }).toList();

  /// Daftar product types yang available
  List<int> get availableProductTypes => _productStocks
      .where((stock) => stock.status.toLowerCase() == 'available')
      .map((stock) => stock.productType)
      .toSet()
      .toList();

  /// Query pencarian saat ini
  String get searchQuery => _searchQuery;

  /// Status loading untuk operasi async
  bool get isLoading => _isLoading;

  /// Pesan error jika operasi gagal
  String get errorMessage => _errorMessage;

  /// ID pesanan yang sedang dihapus
  int? get deletingId => _deletingId;

  /// Mengambil daftar pesanan dan product stock dari API
  Future<void> fetchOrders() async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      _orders = await _controller.getOrders();
      _productStocks = await _stockController.getStocks();
      _isLoading = false;
      _logger.i(
          'Successfully fetched ${_orders.length} orders and ${_productStocks.length} product stocks');
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal memuat data: ${e.toString()}';
      _logger.e('Error fetching data: $e');
      notifyListeners();
    }
  }

  /// Mengatur query pencarian dan memperbarui UI
  void setSearchQuery(String query) {
    _searchQuery = query;
    _logger.d('Search query updated: $_searchQuery');
    notifyListeners();
  }

  /// Validasi order items
  bool _validateOrderItems(List<dynamic> orderItems) {
    final validProductTypes = availableProductTypes;
    for (var item in orderItems) {
      if (item is Map<String, dynamic>) {
        final productType = item['product_type'] as int?;
        if (productType == null || !validProductTypes.contains(productType)) {
          _logger.e('Invalid product_type: $productType');
          return false;
        }
      } else {
        _logger.e('Invalid order item format: $item');
        return false;
      }
    }
    return true;
  }

  /// Membuat pesanan baru
  Future<bool> createOrder(Map<String, dynamic> orderData) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final orderItems = orderData['order_items'] as List<dynamic>?;
      if (orderItems == null || !_validateOrderItems(orderItems)) {
        _isLoading = false;
        _errorMessage = 'Item pesanan tidak valid atau produk tidak tersedia';
        _logger.e(_errorMessage);
        notifyListeners();
        return false;
      }

      final success = await _controller.createOrder(orderData);
      if (success) {
        await fetchOrders();
        _logger.i('Successfully created order');
      }
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal membuat pesanan: ${e.toString()}';
      _logger.e('Error creating order: $e');
      notifyListeners();
      return false;
    }
  }

  /// Memperbarui pesanan yang ada
  Future<bool> updateOrder(int id, Map<String, dynamic> orderData) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final orderItems = orderData['order_items'] as List<dynamic>?;
      if (orderItems == null || !_validateOrderItems(orderItems)) {
        _isLoading = false;
        _errorMessage = 'Item pesanan tidak valid atau produk tidak tersedia';
        _logger.e(_errorMessage);
        notifyListeners();
        return false;
      }

      final success = await _controller.updateOrder(id, orderData);
      if (success) {
        await fetchOrders();
        _logger.i('Successfully updated order ID: $id');
      }
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal memperbarui pesanan: ${e.toString()}';
      _logger.e('Error updating order ID: $id, error: $e');
      notifyListeners();
      return false;
    }
  }

  /// Menghapus pesanan berdasarkan ID
  Future<bool> deleteOrder(int id) async {
    _deletingId = id;
    _errorMessage = '';
    notifyListeners();

    try {
      final success = await _controller.deleteOrder(id);
      if (success) {
        await fetchOrders();
        _logger.i('Successfully deleted order: $id');
      }
      _deletingId = null;
      notifyListeners();
      return success;
    } catch (e) {
      _deletingId = null;
      _errorMessage = 'Gagal menghapus pesanan: ${e.toString()}';
      _logger.e('Error deleting order: $e');
      notifyListeners();
      return false;
    }
  }
}
