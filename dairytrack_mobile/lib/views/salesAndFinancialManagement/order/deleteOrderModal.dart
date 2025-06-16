import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/order.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/orderProvider.dart';

class DeleteOrderModal extends StatelessWidget {
  final Order order;

  DeleteOrderModal({required this.order});

  Future<void> _deleteOrder(OrderProvider provider, BuildContext context) async {
    final success = await provider.deleteOrder(order.id);
    if (success) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Pesanan berhasil dihapus')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.errorMessage)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, provider, child) {
        return AlertDialog(
          title: Text('Hapus Pesanan'),
          content: Text(
              'Anda yakin ingin menghapus pesanan "${order.orderNo}" untuk "${order.customerName}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Batal'),
            ),
            ElevatedButton(
              onPressed: provider.isLoading
                  ? null
                  : () => _deleteOrder(provider, context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red[400],
              ),
              child: provider.isLoading
                  ? SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text('Hapus', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}