import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
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
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Jenis produk berhasil dihapus')),
      );
      provider.fetchProductTypes();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.errorMessage)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProductTypeProvider>(
      builder: (context, provider, child) {
        return AlertDialog(
          title: const Text('Hapus Jenis Produk'),
          content: Text('Anda yakin ingin menghapus "${product.productName}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal'),
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
                  : const Text('Hapus', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
