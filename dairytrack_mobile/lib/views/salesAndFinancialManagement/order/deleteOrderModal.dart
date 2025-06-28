import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/customSnackbar.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/orderProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/order.dart';

class DeleteOrderModal extends StatelessWidget {
  final Order order;

  const DeleteOrderModal({Key? key, required this.order}) : super(key: key);

  Future<void> _deleteOrder(
      OrderProvider provider, BuildContext context) async {
    int? userRoleId;
    try {
      final userData = await AuthUtils.getUser();
      userRoleId = userData['role_id'] ?? 0;
    } catch (e) {
      // Handle silently
    }

    if (userRoleId == 2) {
      CustomSnackbar.show(
        context: context,
        message: 'Supervisors cannot delete orders',
        backgroundColor: Colors.red,
        icon: Icons.error,
        iconColor: Colors.white,
      );
      return;
    }

    final success = await provider.deleteOrder(order.id);
    if (success) {
      Navigator.pop(context);
      CustomSnackbar.show(
        context: context,
        message: 'Order deleted successfully',
        backgroundColor: Colors.green,
        icon: Icons.check_circle,
        iconColor: Colors.white,
      );
      provider.fetchOrders();
    } else {
      CustomSnackbar.show(
        context: context,
        message: 'Failed to delete order: ${provider.errorMessage}',
        backgroundColor: Colors.red,
        icon: Icons.error,
        iconColor: Colors.white,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, provider, child) {
        return AlertDialog(
          title: const Text('Delete Order'),
          content: Text(
              'Are you sure you want to delete order "${order.orderNo}" for "${order.customerName}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: provider.isLoading
                  ? null
                  : () => _deleteOrder(provider, context),
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
