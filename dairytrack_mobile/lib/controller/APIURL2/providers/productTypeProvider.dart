// providers/productTypeProvider.dart
import 'package:flutter/material.dart';
import 'package:dairytrack_mobile/controller/APIURL2/controller/productTypeController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
import 'package:logger/logger.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart'; // Import AuthUtils

class ProductTypeProvider with ChangeNotifier {
  final ProductTypeController _controller = ProductTypeController();
  final _logger = Logger();

  List<ProdukType> _productTypes = [];
  String? _searchQuery;
  bool _isLoading = false;
  String _errorMessage = '';
  int? _deletingId;

  List<ProdukType> get productTypes => _searchQuery == null ||
          _searchQuery!.isEmpty
      ? _productTypes
      : _productTypes
          .where((product) => product.productName
              .toLowerCase()
              .contains(_searchQuery!.toLowerCase()))
          .toList();
  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;
  int? get deletingId => _deletingId;

  Future<void> fetchProductTypes() async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      _productTypes = await _controller.getProductTypes();
      _isLoading = false;
      _logger.i('Successfully fetched ${_productTypes.length} product types');
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal memuat jenis produk: $e';
      _logger.e('Error fetching product types: $e');
      notifyListeners();
    }
  }

  void setSearchQuery(String? query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<bool> deleteProductType(int id) async {
    _deletingId = id;
    notifyListeners();

    try {
      final success = await _controller.deleteProductType(id);
      if (success) {
        await fetchProductTypes();
        _logger.i('Successfully deleted product type: $id');
      }
      _deletingId = null;
      notifyListeners();
      return success;
    } catch (e) {
      _deletingId = null;
      _errorMessage = 'Gagal menghapus jenis produk: $e';
      _logger.e('Error deleting product type: $e');
      notifyListeners();
      return false;
    }
  }

  Future<bool> createProductType(Map<String, dynamic> productData) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final userId = await AuthUtils.getUserId(); // Fetch user_id
      final success = await _controller.createProductType(
        productName: productData['productName'] ?? '',
        productDescription: productData['productDescription'] ?? '',
        price: productData['price']?.toString() ?? '0',
        unit: productData['unit'] ?? '',
        createdBy: userId, // Pass user_id
        imageBytes: productData['imageBytes'],
        imageFileName: productData['imageFileName'],
      );
      if (success) {
        await fetchProductTypes();
        _logger.i(
            'Successfully created product type: ${productData['productName']}');
      }
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _errorMessage = 'Gagal membuat jenis produk: $e';
      _logger.e('Error creating product type: $e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // providers/productTypeProvider.dart
  Future<bool> updateProductType(
      int id, Map<String, dynamic> productData) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final userId =
          await AuthUtils.getUserId(); // Fetch user_id for updated_by
      // Fetch the existing product to get created_by
      final existingProduct = await _controller.getProductTypeById(id);
      final createdBy =
          existingProduct.createdBy?.id ?? 0; // Fallback to 0 if null
      final success = await _controller.updateProductType(
        id: id,
        productName: productData['productName'] ?? '',
        productDescription: productData['productDescription'] ?? '',
        price: productData['price']?.toString() ?? '0',
        unit: productData['unit'] ?? '',
        createdBy: createdBy, // Pass original created_by
        updatedBy: userId, // Pass user_id for updated_by
        imageBytes: productData['imageBytes'],
        imageFileName: productData['imageFileName'],
      );
      if (success) {
        await fetchProductTypes();
        _logger.i(
            'Successfully updated product type: ${productData['productName']}');
      }
      _isLoading = false;
      notifyListeners();
      return success;
    } catch (e) {
      _errorMessage = 'Gagal memperbarui jenis produk: $e';
      _logger.e('Error updating product type: $e');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
