import 'package:dairytrack_mobile/controller/APIURL2/controller/productStockController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart'; // Import AuthUtils
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';

class StockProvider with ChangeNotifier {
  final ProductStockController _controller = ProductStockController();
  final _logger = Logger();

  List<Stock> _stocks = [];
  String _searchQuery = '';
  String? _selectedStatus;
  bool _isLoading = false;
  String _errorMessage = '';
  int? _deletingId;

  List<Stock> get stocks => _searchQuery.isEmpty && _selectedStatus == null
      ? _stocks
      : _stocks.where((stock) {
          final matchesSearch = _searchQuery.isEmpty ||
              stock.productTypeDetail.productName
                  .toLowerCase()
                  .contains(_searchQuery.toLowerCase());
          final matchesStatus =
              _selectedStatus == null || stock.status == _selectedStatus;
          return matchesSearch && matchesStatus;
        }).toList();

  String get searchQuery => _searchQuery;
  String? get selectedStatus => _selectedStatus;
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

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setSelectedStatus(String? status) {
    _selectedStatus = status;
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
      final userId = await AuthUtils.getUserId();
      final success = await _controller.createStock(
        productType: stockData['productType'],
        initialQuantity: stockData['initialQuantity'],
        productionAt: stockData['productionAt'],
        expiryAt: stockData['expiryAt'],
        status: stockData['status'],
        totalMilkUsed: stockData['totalMilkUsed'],
        createdBy: userId,
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
      final userId = await AuthUtils.getUserId();
      if (_stocks.isEmpty) {
        await fetchStocks();
      }
      final existingStock = _stocks.firstWhere(
        (stock) => stock.id == id,
        orElse: () {
          _logger.w('Stock with ID $id not found in local cache');
          return Stock(
            id: id,
            productType: stockData['productType'],
            productTypeDetail: stockData['productTypeDetail'] ??
                ProdukType(id: 0, productName: 'Unknown', productDescription: stockData['productDescription'] ?? '', price: '0', unit: 'Unknown', createdAt: DateTime.now(), updatedAt: DateTime.now(), createdBy: User(id: 0, name: 'Unknown', username: AutofillHints.username, roleId: 2), updatedBy: User(id: 0, name: 'Unknown', username: AutofillHints.username, roleId: 2)),
            initialQuantity: stockData['initialQuantity'],
            quantity: stockData['quantity'] ?? stockData['initialQuantity'],
            productionAt: DateTime.parse(stockData['productionAt']),
            expiryAt: DateTime.parse(stockData['expiryAt']),
            status: stockData['status'],
            totalMilkUsed: stockData['totalMilkUsed'],
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
            createdBy: User(
                id: userId,
                name: 'Unknown',
                username: AutofillHints.username,
                roleId: 2), // Fallback
            updatedBy: User(
                id: userId,
                name: 'Unknown',
                username: AutofillHints.username,
                roleId: 2),
          );
        },
      );
      final createdBy = existingStock.createdBy.id;
      final success = await _controller.updateStock(
        id: id,
        productType: stockData['productType'],
        initialQuantity: stockData['initialQuantity'],
        productionAt: stockData['productionAt'],
        expiryAt: stockData['expiryAt'],
        status: stockData['status'],
        totalMilkUsed: stockData['totalMilkUsed'],
        createdBy: createdBy,
        updatedBy: userId,
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
