import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/customSnackbar.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';

class DeleteProductTypeModal extends StatelessWidget {
  final ProdukType product;

  const DeleteProductTypeModal({Key? key, required this.product})
      : super(key: key);

  Future<void> _deleteProduct(
      ProductTypeProvider provider, BuildContext context) async {
    final success = await provider.deleteProductType(product.id);
    if (success) {
      Navigator.pop(context);
      CustomSnackbar.show(
        context: context,
        message: 'Product type deleted successfully',
        backgroundColor: Colors.green,
        icon: Icons.check_circle,
        iconColor: Colors.white,
      );
      provider.fetchProductTypes();
    } else {
      CustomSnackbar.show(
        context: context,
        message: 'Failed to delete product type: ${provider.errorMessage}',
        backgroundColor: Colors.red,
        icon: Icons.error,
        iconColor: Colors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProductTypeProvider>(
      builder: (context, provider, child) {
        return AlertDialog(
          title: const Text('Delete Product Type'),
          content:
              Text('Are you sure you want to delete "${product.productName}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: provider.isLoading
                  ? null
                  : () => _deleteProduct(provider, context),
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
