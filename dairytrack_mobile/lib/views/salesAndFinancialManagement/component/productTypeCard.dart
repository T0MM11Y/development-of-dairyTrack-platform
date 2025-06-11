import 'package:dairytrack_mobile/views/GuestView/GalleryGuestsView.dart';
import 'package:flutter/material.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/infoRow.dart';
import 'package:dairytrack_mobile/views/initialAdminDashboard.dart';

class ProductTypeCard extends StatelessWidget {
  final ProdukType productType;
  final ProductTypeProvider provider;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const ProductTypeCard({
    Key? key,
    required this.productType,
    required this.provider,
    required this.onEdit,
    required this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: Colors.blue[100],
          child: productType.image != null && productType.image!.isNotEmpty
              ? ClipOval(
                  child: Image.network(
                    productType.image!,
                    fit: BoxFit.cover,
                    width: 40,
                    height: 40,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const CircularProgressIndicator(strokeWidth: 2);
                    },
                    errorBuilder: (context, error, stackTrace) => const Icon(
                      Icons.broken_image,
                      color: Colors.grey,
                      size: 20,
                    ),
                  ),
                )
              : const Icon(
                  Icons.image_not_supported,
                  color: Colors.grey,
                  size: 20,
                ),
        ),
        title: Text(
          productType.productName,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          'Rp ${productType.price}',
          style: TextStyle(color: Colors.grey[600]),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                productType.image != null && productType.image!.isNotEmpty
                    ? Center(
                        child: Image.network(
                          productType.image!,
                          height: 100,
                          fit: BoxFit.cover,
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return const CircularProgressIndicator(
                                strokeWidth: 2);
                          },
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(
                            Icons.broken_image,
                            color: Colors.grey,
                            size: 50,
                          ),
                        ),
                      )
                    : const Center(
                        child: Icon(
                          Icons.image_not_supported,
                          color: Colors.grey,
                          size: 50,
                        ),
                      ),
                const SizedBox(height: 8),
                InfoRow(label: 'Product Name', value: productType.productName),
                InfoRow(
                    label: 'Description',
                    value: productType.productDescription),
                InfoRow(label: 'Price', value: 'Rp ${productType.price}'),
                InfoRow(label: 'Unit', value: productType.unit),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ElevatedButton.icon(
                      icon: const Icon(
                        Icons.edit,
                        size: 18,
                        color: Colors.white,
                      ),
                      label: const Text(
                        "Edit",
                        style: TextStyle(fontSize: 12, color: Colors.white),
                      ),
                      onPressed: onEdit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.info,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 6),
                        shape: RoundedRectangleBorder(),
                      ),
                    ),
                    const SizedBox(width: 4),
                    ElevatedButton.icon(
                      icon: const Icon(
                        Icons.delete,
                        size: 18,
                        color: Colors.white,
                      ),
                      label: const Text(
                        "Delete",
                        style: TextStyle(fontSize: 12, color: Colors.white),
                      ),
                      onPressed: onDelete,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.error,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 6),
                        shape: RoundedRectangleBorder(),
                      ),
                    ),
                    if (provider.deletingId == productType.id)
                      const Padding(
                        padding: EdgeInsets.only(left: 8),
                        child: SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
