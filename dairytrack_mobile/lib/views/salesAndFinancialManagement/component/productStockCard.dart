import 'package:flutter/material.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productStockProvider.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart';

class StockCard extends StatefulWidget {
  final Stock stock;
  final StockProvider provider;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const StockCard({
    Key? key,
    required this.stock,
    required this.provider,
    this.onEdit,
    this.onDelete,
  }) : super(key: key);

  @override
  _StockCardState createState() => _StockCardState();
}

class _StockCardState extends State<StockCard> {
  int? _userRoleId;

  @override
  void initState() {
    super.initState();
    _fetchUserRole();
  }

  Future<void> _fetchUserRole() async {
    try {
      final userData = await AuthUtils.getUser();
      setState(() {
        _userRoleId = userData['role_id'] ?? 0;
      });
    } catch (e) {
      // Handle error silently
    }
  }

  Widget _buildStatusBadge(String status) {
    Color color;
    String displayStatus;
    switch (status) {
      case 'available':
        color = Colors.green;
        displayStatus = 'Available';
        break;
      case 'expired':
        color = Colors.red;
        displayStatus = 'Expired';
        break;
      case 'contamination':
        color = Colors.orange;
        displayStatus = 'Contaminated';
        break;
      default:
        color = Colors.grey;
        displayStatus = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            status == 'available' ? Icons.check_circle : Icons.cancel,
            color: color,
            size: 14,
          ),
          const SizedBox(width: 6),
          Text(
            displayStatus,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: const Color(0xFF7F8C8D)),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF7F8C8D),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF2C3E50),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final isSupervisor = _userRoleId == 2;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      widget.stock.productTypeDetail.productName,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Color(0xFF2C3E50),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (!isSupervisor)
                    PopupMenuButton<String>(
                      onSelected: (value) {
                        if (value == 'edit') {
                          widget.onEdit?.call();
                        } else if (value == 'delete') {
                          widget.onDelete?.call();
                        }
                      },
                      itemBuilder: (context) => [
                        PopupMenuItem(
                          value: 'edit',
                          child: Row(
                            children: [
                              Icon(Icons.edit, color: Colors.blue[600]),
                              const SizedBox(width: 8),
                              const Text('Edit'),
                            ],
                          ),
                        ),
                        PopupMenuItem(
                          value: 'delete',
                          enabled:
                              widget.provider.deletingId != widget.stock.id,
                          child: Row(
                            children: [
                              widget.provider.deletingId == widget.stock.id
                                  ? const SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2),
                                    )
                                  : Icon(Icons.delete, color: Colors.red[600]),
                              const SizedBox(width: 8),
                              const Text('Delete'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  _buildStatusBadge(widget.stock.status),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 100,
                    height: 100,
                    child: Center(
                      child: widget.stock.productTypeDetail.image != null &&
                              widget.stock.productTypeDetail.image!.isNotEmpty
                          ? Image.network(
                              widget.stock.productTypeDetail.image!,
                              fit: BoxFit.cover,
                              loadingBuilder:
                                  (context, child, loadingProgress) {
                                if (loadingProgress == null) return child;
                                return const CircularProgressIndicator();
                              },
                              errorBuilder: (context, error, stackTrace) {
                                return const Icon(
                                  Icons.broken_image,
                                  size: 50,
                                  color: Colors.grey,
                                );
                              },
                            )
                          : const Icon(
                              Icons.image_not_supported,
                              size: 50,
                              color: Colors.grey,
                            ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildInfoRow(
                          icon: Icons.water_drop,
                          label: 'Available Stock',
                          value:
                              '${widget.stock.quantity}/${widget.stock.initialQuantity} ${widget.stock.productTypeDetail.unit}',
                        ),
                        const SizedBox(height: 8),
                        _buildInfoRow(
                          icon: Icons.calendar_today,
                          label: 'Production Date',
                          value: DateFormat('dd MMM yyyy').format(
                              widget.stock.productionAt ??
                                  widget.stock.expiryAt),
                        ),
                        const SizedBox(height: 8),
                        _buildInfoRow(
                          icon: Icons.event_busy,
                          label: 'Expiry Date',
                          value: DateFormat('dd MMM yyyy')
                              .format(widget.stock.expiryAt),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
