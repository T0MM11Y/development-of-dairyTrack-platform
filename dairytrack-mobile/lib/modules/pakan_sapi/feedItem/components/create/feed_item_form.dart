import 'package:flutter/material.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';

class FeedItemForm extends StatelessWidget {
  final List<Map<String, dynamic>> formList;
  final List<Feed> feeds;
  final List<FeedStock> feedStocks;
  final Function(int, String, dynamic) onFormChange;
  final Function(int) onRemoveRow;
  final VoidCallback onAddRow;
  final bool canAddMore;

  const FeedItemForm({
    super.key,
    required this.formList,
    required this.feeds,
    required this.feedStocks,
    required this.onFormChange,
    required this.onRemoveRow,
    required this.onAddRow,
    required this.canAddMore,
  });

  List<Feed> _getAvailableFeedsForRow(int currentIndex) {
    final selectedFeedIds = formList
        .asMap()
        .entries
        .where((entry) => entry.key != currentIndex && entry.value['feed_id'] != null)
        .map((entry) => entry.value['feed_id'] as int)
        .toList();

    return feeds.where((feed) => !selectedFeedIds.contains(feed.id)).toList();
  }

  double _getFeedStock(int? feedId) {
    if (feedId == null) return 0.0;

    final matchingStocks = feedStocks.where((stock) => stock.feedId == feedId).toList();
    if (matchingStocks.isEmpty) return 0.0;

    matchingStocks.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return matchingStocks.first.stock ?? 0.0;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...formList.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    'Jenis Pakan #${index + 1}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0),
                  ),
                  if (formList.length > 1)
                    TextButton.icon(
                      onPressed: () => onRemoveRow(index),
                      icon: const Icon(Icons.delete, color: Colors.red),
                      label: const Text('Hapus', style: TextStyle(color: Colors.red)),
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(0, 0),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8.0),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 3,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        DropdownButtonFormField<int>(
                          decoration: InputDecoration(
                            labelText: 'Jenis Pakan',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                          value: item['feed_id'] as int?,
                          hint: const Text('Pilih pakan'),
                          isExpanded: true,
                          validator: (value) => value == null ? 'Harap pilih jenis pakan' : null,
                          items: _getAvailableFeedsForRow(index).map((feed) {
                            return DropdownMenuItem(
                              value: feed.id,
                              child: Text(feed.name),
                            );
                          }).toList(),
                          onChanged: (value) => onFormChange(index, 'feed_id', value),
                        ),
                        if (item['feed_id'] != null) ...[
                          const SizedBox(height: 8.0),
                          Text(
                            'Stok tersedia: ${_getFeedStock(item['feed_id'])} kg',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 12.0),
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      decoration: InputDecoration(
                        labelText: 'Jumlah (kg)',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                      ),
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      initialValue: item['quantity'].toString(),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Masukkan jumlah';
                        }
                        final qty = double.tryParse(value);
                        if (qty == null || qty <= 0) {
                          return 'Jumlah harus lebih dari 0';
                        }
                        if (item['feed_id'] != null) {
                          final availableStock = _getFeedStock(item['feed_id']);
                          if (qty > availableStock) {
                            return 'Stok hanya $availableStock kg';
                          }
                        }
                        return null;
                      },
                      onChanged: (value) => onFormChange(index, 'quantity', value),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16.0),
            ],
          );
        }).toList(),
        if (canAddMore)
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: onAddRow,
              icon: const Icon(Icons.add, color: Color(0xFF17A2B8)),
              label: const Text(
                'Tambah Jenis Pakan',
                style: TextStyle(color: Color(0xFF17A2B8)),
              ),
            ),
          ),
      ],
    );
  }
}