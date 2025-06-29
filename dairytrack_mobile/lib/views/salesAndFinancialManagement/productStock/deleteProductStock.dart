import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productStockProvider.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/customSnackbar.dart';

class DeleteStockModal extends StatelessWidget {
  final Stock stock;

  const DeleteStockModal({Key? key, required this.stock}) : super(key: key);

  Future<void> _deleteStock(
      StockProvider provider, BuildContext context) async {
    final success = await provider.deleteStock(stock.id);
    if (success) {
      Navigator.pop(context);
      CustomSnackbar.show(
        context: context,
        message: 'Product stock deleted successfully',
        backgroundColor: Colors.green,
        icon: Icons.check_circle,
        iconColor: Colors.white,
      );
      provider.fetchStocks();
    } else {
      CustomSnackbar.show(
        context: context,
        message: 'Failed to delete stock: ${provider.errorMessage}',
        backgroundColor: Colors.red,
        icon: Icons.error,
        iconColor: Colors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<StockProvider>(
      builder: (context, provider, child) {
        return AlertDialog(
          title: const Text('Delete Product Stock'),
          content: Text(
              'Are you sure you want to delete stock "${stock.productTypeDetail.productName}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: provider.isLoading
                  ? null
                  : () => _deleteStock(provider, context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[400],
              ),
              child: provider.isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Delete', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
