import 'package:dairytrack_mobile/controller/APIURL2/controller/productStockController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart'; // Import AuthUtils
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';

class StockProvider with ChangeNotifier {
  final ProductStockController _controller = ProductStockController();
  final _logger = Logger();

  List<Stock> _stocks = [];
  String? _searchQuery;
  bool _isLoading = false;
  String _errorMessage = '';
  int? _deletingId;

  List<Stock> get stocks => _searchQuery == null || _searchQuery!.isEmpty
      ? _stocks
      : _stocks
          .where((stock) => stock.productTypeDetail.productName
              .toLowerCase()
              .contains(_searchQuery!.toLowerCase()))
          .toList();
  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;
  int? get deletingId => _deletingId;

  Future<void> fetchStocks() async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      _stocks = await _controller.getStocks();
      _isLoading = false;
      _logger.i('Successfully fetched ${_stocks.length} stock items');
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal memuat stok produk: $e';
      _logger.e('Error fetching stock items: $e');
      notifyListeners();
    }
  }

  void setSearchQuery(String? query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<bool> deleteStock(int id) async {
    _deletingId = id;
    notifyListeners();

    try {
      final success = await _controller.deleteStock(id);
      if (success) {
        await fetchStocks();
        _logger.i('Successfully deleted stock item: $id');
      }
      _deletingId = null;
      notifyListeners();
      return success;
    } catch (e) {
      _deletingId = null;
      _errorMessage = 'Gagal menghapus stok produk: $e';
      _logger.e('Error deleting stock item: $e');
      notifyListeners();
      return false;
    }
  }

  Future<bool> createStock(Map<String, dynamic> stockData) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final userId = await AuthUtils.getUserId(); // Fetch user_id
      final success = await _controller.createStock(
        productType: stockData['productType'],
        initialQuantity: stockData['initialQuantity'],
        productionAt: stockData['productionAt'],
        expiryAt: stockData['expiryAt'],
        status: stockData['status'],
        totalMilkUsed: stockData['totalMilkUsed'],
        createdBy: userId, // Use fetched user_id
      );
      if (success) {
        await fetchStocks();
        _logger.i('Successfully created stock item');
      }
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _errorMessage = 'Gagal membuat stok produk: $e';
      _logger.e('Error creating stock item: $e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateStock(int id, Map<String, dynamic> stockData) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final userId =
          await AuthUtils.getUserId(); // Fetch user_id for updated_by
      // Find existing stock to get created_by
      final existingStock =
          _stocks.firstWhere((stock) => stock.id == id, orElse: () {
        throw Exception('Stock not found');
      });
      final createdBy =
          existingStock.createdBy?.id ?? userId; // Fallback to userId if null
      final success = await _controller.updateStock(
        id: id,
        productType: stockData['productType'],
        initialQuantity: stockData['initialQuantity'],
        productionAt: stockData['productionAt'],
        expiryAt: stockData['expiryAt'],
        status: stockData['status'],
        totalMilkUsed: stockData['totalMilkUsed'],
        createdBy: createdBy, // Use original created_by
        updatedBy: userId, // Use fetched user_id
      );
      if (success) {
        await fetchStocks();
        _logger.i('Successfully updated stock item');
      }
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _errorMessage = 'Gagal memperbarui stok produk: $e';
      _logger.e('Error updating stock item: $e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
