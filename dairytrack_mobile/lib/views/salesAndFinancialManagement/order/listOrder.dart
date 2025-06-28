import 'package:dairytrack_mobile/controller/APIURL2/models/order.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/orderProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:dairytrack_mobile/views/GuestView/AboutGuestsView.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/infoRow.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/statisticCard.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/order/createOrderModal.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/order/deleteOrderModal.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/order/editOrderModal.dart';
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'package:provider/provider.dart';

class ListOrderView extends StatefulWidget {
  const ListOrderView({Key? key}) : super(key: key);

  @override
  _ListOrderViewState createState() => _ListOrderViewState();
}

class _ListOrderViewState extends State<ListOrderView> {
  final TextEditingController _searchController = TextEditingController();
  String? _selectedStatus;
  final Logger _logger = Logger();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<OrderProvider>(context, listen: false).fetchOrders();
      Provider.of<ProductTypeProvider>(context, listen: false)
          .fetchProductTypes();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<OrderProvider, ProductTypeProvider>(
      builder: (context, orderProvider, productTypeProvider, child) {
        final filteredOrders = orderProvider.orders.where((order) {
          final matchesSearch = orderProvider.searchQuery.isEmpty ||
              order.customerName
                  .toLowerCase()
                  .contains(orderProvider.searchQuery.toLowerCase()) ||
              order.orderNo
                  .toLowerCase()
                  .contains(orderProvider.searchQuery.toLowerCase());
          final matchesStatus =
              _selectedStatus == null || order.status == _selectedStatus;
          return matchesSearch && matchesStatus;
        }).toList();

        void showCreateOrderModal() async {
          await showDialog(
            context: context,
            builder: (dialogContext) => CreateOrderModal(),
          );
          orderProvider.fetchOrders();
        }

        void showEditOrderModal(Order order) async {
          await showDialog(
            context: context,
            builder: (dialogContext) => EditOrderModal(order: order),
          );
          orderProvider.fetchOrders();
        }

        void showDeleteOrderModal(Order order) {
          showDialog(
            context: context,
            builder: (dialogContext) => DeleteOrderModal(order: order),
          );
        }

        return Scaffold(
          backgroundColor: Colors.grey[50],
          appBar: AppBar(
            title: const Text(
              'Order Management',
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
            ),
            backgroundColor: Colors.blueGrey[800],
            elevation: 0,
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: orderProvider.fetchOrders,
                tooltip: 'Refresh',
              ),
            ],
          ),
          body: Stack(
            children: [
              if (orderProvider.isLoading)
                Center(
                    child:
                        CircularProgressIndicator(color: Colors.blueGrey[800]))
              else if (orderProvider.errorMessage.isNotEmpty)
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        orderProvider.errorMessage,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.red),
                      ),
                      TextButton(
                        onPressed: orderProvider.fetchOrders,
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                )
              else
                RefreshIndicator(
                  onRefresh: orderProvider.fetchOrders,
                  child: Column(
                    children: [
                      Card(
                        margin: const EdgeInsets.all(16),
                        elevation: 6,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Text(
                                'Filter Pesanan',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF2C3E50),
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 16),
                              TextField(
                                controller: _searchController,
                                decoration: InputDecoration(
                                  hintText:
                                      'Cari berdasarkan nama pelanggan atau nomor pesanan...',
                                  prefixIcon: const Icon(Icons.search,
                                      color: Color(0xFF2C3E50)),
                                  suffixIcon: _searchController.text.isNotEmpty
                                      ? IconButton(
                                          icon: const Icon(Icons.clear,
                                              color: Color(0xFF2C3E50)),
                                          onPressed: () {
                                            _searchController.clear();
                                            orderProvider.setSearchQuery('');
                                          },
                                        )
                                      : null,
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50), width: 2),
                                  ),
                                  filled: true,
                                  fillColor: Colors.white,
                                  contentPadding: const EdgeInsets.symmetric(
                                      vertical: 12, horizontal: 16),
                                ),
                                onChanged: orderProvider.setSearchQuery,
                              ),
                              const SizedBox(height: 12),
                              DropdownButtonFormField<String?>(
                                value: _selectedStatus,
                                decoration: InputDecoration(
                                  labelText: 'Filter Status',
                                  labelStyle:
                                      const TextStyle(color: Color(0xFF2C3E50)),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50), width: 2),
                                  ),
                                  filled: true,
                                  fillColor: Colors.white,
                                  prefixIcon: const Icon(Icons.filter_list,
                                      color: Color(0xFF2C3E50)),
                                  contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 12),
                                ),
                                items: [
                                  const DropdownMenuItem<String?>(
                                    value: null,
                                    child: Text('Semua',
                                        style: TextStyle(
                                            color: Color(0xFF2C3E50))),
                                  ),
                                  ...filteredOrders
                                      .map((order) => order.status)
                                      .toSet()
                                      .map((status) => DropdownMenuItem<String>(
                                            value: status,
                                            child: Text(status,
                                                style: const TextStyle(
                                                    color: Color(0xFF2C3E50))),
                                          ))
                                      .toList(),
                                ],
                                onChanged: (value) {
                                  setState(() => _selectedStatus = value);
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                      StatisticsCard(
                          totalCount:
                              orderProvider.availableProductTypes.length,
                          label: 'Sum of Orders'),
                      Expanded(
                        child: filteredOrders.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.shopping_cart_outlined,
                                      size: 64,
                                      color: Colors.grey[400],
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Tidak ada pesanan ditemukan',
                                      style: TextStyle(
                                        fontSize: 18,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Klik tombol + untuk menambah pesanan',
                                      style: TextStyle(color: Colors.grey[500]),
                                    ),
                                  ],
                                ),
                              )
                            : ListView(
                                children: [
                                  ...filteredOrders
                                      .map((order) => OrderCard(
                                            order: order,
                                            provider: orderProvider,
                                            onEdit: () =>
                                                showEditOrderModal(order),
                                            onDelete: () =>
                                                showDeleteOrderModal(order),
                                          ))
                                      .toList(),
                                  const SizedBox(height: 80),
                                ],
                              ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: showCreateOrderModal,
            backgroundColor: const Color(0xFFE74C3C),
            child: const Icon(Icons.add, color: Colors.white),
          ),
        );
      },
    );
  }
}

class OrderCard extends StatelessWidget {
  final Order order;
  final OrderProvider provider;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const OrderCard({
    Key? key,
    required this.order,
    required this.provider,
    required this.onEdit,
    required this.onDelete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final iconColor = _getIconColor(order.status);
    final isEditable =
        !['completed', 'cancelled'].contains(order.status.toLowerCase());

    return Card(
      elevation: 4,
      shadowColor: Colors.black.withOpacity(0.1),
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ExpansionTile(
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        childrenPadding: EdgeInsets.zero,
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: iconColor.withOpacity(0.3), width: 1),
          ),
          child: Icon(
            Icons.receipt_long,
            color: iconColor,
            size: 20,
          ),
        ),
        title: Text(
          order.orderNo,
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              order.customerName,
              style: TextStyle(
                color: Colors.grey[700],
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 2),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: iconColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: iconColor.withOpacity(0.3)),
                  ),
                  child: Text(
                    order.status.toUpperCase(),
                    style: TextStyle(
                      color: iconColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Text(
                  'Rp ${order.totalPrice}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
          ],
        ),
        children: [
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(12),
                bottomRight: Radius.circular(12),
              ),
            ),
            child: Column(
              children: [
                // Header Struk
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.store,
                        size: 32,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'STRUK PESANAN',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[800],
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),

                // Detail Pelanggan
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'DETAIL PELANGGAN',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[700],
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      _buildReceiptRow('No. Pesanan', order.orderNo),
                      _buildReceiptRow('Nama', order.customerName),
                      _buildReceiptRow('Email', order.email),
                      _buildReceiptRow('Telepon', order.phoneNumber),
                      _buildReceiptRow('Lokasi', order.location),
                      if (order.notes != null && order.notes!.isNotEmpty)
                        _buildReceiptRow('Catatan', order.notes!),
                    ],
                  ),
                ),

                // Daftar Item
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(
                      bottom: BorderSide(color: Colors.grey[300]!, width: 1),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'DAFTAR ITEM',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[700],
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Header tabel
                      Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: Text(
                              'ITEM',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[600],
                              ),
                            ),
                          ),
                          Expanded(
                            flex: 1,
                            child: Text(
                              'QTY',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[600],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          Expanded(
                            flex: 2,
                            child: Text(
                              'HARGA',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[600],
                              ),
                              textAlign: TextAlign.right,
                            ),
                          ),
                        ],
                      ),
                      Divider(color: Colors.grey[300], height: 16),
                      // Items
                      ...order.orderItems.map((item) => Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  flex: 3,
                                  child: Text(
                                    item.productTypeDetail?.productName ??
                                        'Unknown',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  flex: 1,
                                  child: Text(
                                    '${item.quantity}x',
                                    style: const TextStyle(fontSize: 12),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                                Expanded(
                                  flex: 2,
                                  child: Text(
                                    'Rp ${item.totalPrice ?? '0'}',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                    textAlign: TextAlign.right,
                                  ),
                                ),
                              ],
                            ),
                          )),
                    ],
                  ),
                ),

                // Total
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'TOTAL PEMBAYARAN',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey[800],
                            ),
                          ),
                          Text(
                            'Rp ${order.totalPrice}',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.green[700],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        height: 1,
                        decoration: BoxDecoration(
                          border: Border(
                            top: BorderSide(
                              color: Colors.grey[400]!,
                              width: 1,
                              style: BorderStyle.solid,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Action Buttons
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          ElevatedButton.icon(
                            icon: const Icon(
                              Icons.edit,
                              size: 16,
                              color: Colors.white,
                            ),
                            label: const Text(
                              'Edit',
                              style:
                                  TextStyle(fontSize: 12, color: Colors.white),
                            ),
                            onPressed: isEditable ? onEdit : null,
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  isEditable ? AppColors.info : Colors.grey,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                              elevation: 0,
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton.icon(
                            icon: const Icon(
                              Icons.delete,
                              size: 16,
                              color: Colors.white,
                            ),
                            label: const Text(
                              'Delete',
                              style:
                                  TextStyle(fontSize: 12, color: Colors.white),
                            ),
                            onPressed: onDelete,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.error,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                              elevation: 0,
                            ),
                          ),
                          if (provider.deletingId == order.id)
                            const Padding(
                              padding: EdgeInsets.only(left: 12),
                              child: SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.grey),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey[600],
              ),
            ),
          ),
          const Text(
            ': ',
            style: TextStyle(fontSize: 11),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getIconColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Colors.green[600]!;
      case 'requested':
        return Colors.orange[600]!;
      case 'processed':
        return Colors.blue[600]!;
      case 'cancelled':
        return Colors.red[600]!;
      default:
        return Colors.blueGrey[600]!;
    }
  }
}
