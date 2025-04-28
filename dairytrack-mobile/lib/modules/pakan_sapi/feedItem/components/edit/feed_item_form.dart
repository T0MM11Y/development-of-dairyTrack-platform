import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import './feed_utils.dart';
import './submit_button.dart';

class FeedItemForm extends StatelessWidget {
  final List<Map<String, dynamic>> formList;
  final List<Feed> feeds;
  final List<FeedStock> feedStocks;
  final List<Feed> Function(int, List<Map<String, dynamic>>, List<Feed>)
      getAvailableFeedsForRow;
  final double Function(int?, List<FeedStock>) getFeedStock;
  final String Function(double) formatNumber;
  final Function(int, String, dynamic) handleFormChange;
  final Function(int) removeFeedItemRow;
  final VoidCallback addFeedItemRow;
  final bool isLoading;
  final VoidCallback handleSave;

  const FeedItemForm({
    super.key,
    required this.formList,
    required this.feeds,
    required this.feedStocks,
    required this.getAvailableFeedsForRow,
    required this.getFeedStock,
    required this.formatNumber,
    required this.handleFormChange,
    required this.removeFeedItemRow,
    required this.addFeedItemRow,
    required this.isLoading,
    required this.handleSave,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (formList.isEmpty)
          const Card(
            elevation: 2,
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Center(
                child: Text(
                  'Tidak ada item pakan. Tambahkan pakan baru.',
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ),
          )
        else
          ...formList.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;

            return Card(
              elevation: 2,
              margin: const EdgeInsets.only(bottom: 16.0),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Jenis Pakan #${index + 1}',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16.0),
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => removeFeedItemRow(index),
                          tooltip: 'Hapus Item',
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
                                items: getAvailableFeedsForRow(
                                        index, formList, feeds)
                                    .map((feed) => DropdownMenuItem(
                                          value: feed.id,
                                          child: Text(feed.name),
                                        ))
                                    .toList(),
                                onChanged: item['id'] != null
                                    ? null
                                    : (value) =>
                                        handleFormChange(index, 'feed_id', value),
                                validator: (value) =>
                                    value == null ? 'Pilih jenis pakan' : null,
                                disabledHint: const Text('Tidak dapat diubah'),
                              ),
                              if (item['feed_id'] != null) ...[
                                const SizedBox(height: 8.0),
                                Text(
                                  'Stok: ${formatNumber(getFeedStock(item['feed_id'] as int?, feedStocks))} kg',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blue),
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
                              errorMaxLines: 2,
                            ),
                            keyboardType:
                                const TextInputType.numberWithOptions(decimal: true),
                            initialValue: item['quantity']?.toString() ?? '0',
                            inputFormatters: [
                              FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
                            ],
                            onChanged: (value) {
                              final parsedValue = double.tryParse(value) ?? 0.0;
                              handleFormChange(
                                  index, 'quantity', parsedValue.toString());
                            },
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Masukkan jumlah';
                              }
                              final qty = double.tryParse(value);
                              if (qty == null || qty <= 0) {
                                return 'Jumlah harus lebih dari 0';
                              }
                              if (item['feed_id'] != null) {
                                final availableStock =
                                    getFeedStock(item['feed_id'], feedStocks);
                                if (qty > availableStock) {
                                  return 'Stok hanya ${formatNumber(availableStock)} kg';
                                }
                              }
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          }),
        if (formList.length < 3)
          Align(
            alignment: Alignment.centerRight,
            child: TextButton.icon(
              onPressed: addFeedItemRow,
              icon: const Icon(Icons.add, color: Color(0xFF17A2B8)),
              label: const Text(
                'Tambah Jenis Pakan',
                style: TextStyle(color: Color(0xFF17A2B8)),
              ),
            ),
          ),
        const SizedBox(height: 24.0),
        SubmitButton(
          isLoading: isLoading,
          onPressed: handleSave,
        ),
      ],
    );
  }
}