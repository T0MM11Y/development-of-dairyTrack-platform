import 'package:dairy_track/config/api/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:flutter/material.dart';
import 'dialog_utils.dart';
import 'feed_utils.dart';

class FeedItemFormHandler {
  final Function setState;
  final BuildContext context;
  final int dailyFeedId;
  final VoidCallback? onUpdateSuccess;
  final GlobalKey<FormState> formKey;

  bool _isEditing = false;
  List<Map<String, dynamic>> _formList = [];
  List<FeedItem> _feedItems = [];
  List<Feed> _feeds = [];
  List<FeedStock> _feedStocks = [];
  String? _errorMessage;

  FeedItemFormHandler({
    required this.setState,
    required this.context,
    required this.dailyFeedId,
    this.onUpdateSuccess,
    required this.formKey,
  });

  void toggleEditMode() {
    setState(() {
      _isEditing = !_isEditing;
      if (!_isEditing) {
        _formList = _feedItems
            .map((item) => <String, dynamic>{
                  'id': item.id,
                  'feed_id': item.feedId,
                  'quantity': item.quantity.toString(),
                  'daily_feed_id': item.dailyFeedId,
                })
            .toList();
      }
    });
  }

  void handleFormChange(int index, String key, dynamic value) {
    setState(() {
      if (key == 'quantity') {
        final trimmedValue = value?.toString().trim() ?? '0';
        print("Raw quantity input: '$value', trimmed: '$trimmedValue'");
        final parsedValue = double.tryParse(trimmedValue);
        _formList[index][key] = trimmedValue.isEmpty ? '0' : trimmedValue;
        print("Stored quantity value: ${_formList[index][key]}");
      } else {
        _formList[index][key] = value;
      }
    });
  }

  void addFeedItemRow() {
    if (_formList.length >= 3) {
      DialogUtils.showErrorDialog(
          context, 'Perhatian', 'Maksimal 3 jenis pakan untuk satu sesi');
      return;
    }

    setState(() {
      _formList.add(<String, dynamic>{
        'id': null,
        'feed_id': null,
        'quantity': '0',
        'daily_feed_id': dailyFeedId,
      });
    });
  }

  Future<void> removeFeedItemRow(int index) async {
    final item = _formList[index];

    if (item['id'] != null) {
      final confirm = await DialogUtils.showConfirmDialog(
        context: context,
        title: 'Konfirmasi',
        content: 'Apakah Anda yakin ingin menghapus item pakan ini?',
        confirmText: 'Hapus',
        confirmStyle: const TextStyle(color: Colors.red),
      );

      if (confirm != true) return;

      setState(() {
        _errorMessage = null;
      });

      try {
        final response =
            await FeedItemService.deleteFeedItem(item['id'] as int);
        if (response['success'] == true) {
          setState(() {
            _feedItems.removeWhere((feedItem) => feedItem.id == item['id']);
            _formList.removeAt(index);
          });
          DialogUtils.showSuccessDialog(
              context, 'Berhasil', 'Item pakan berhasil dihapus');
        } else {
          throw Exception(response['message'] ?? 'Gagal menghapus item pakan');
        }
      } catch (e) {
        DialogUtils.showErrorDialog(
            context, 'Gagal', 'Gagal menghapus item pakan: $e');
      } finally {
        setState(() {
          _errorMessage = null;
        });
      }
    } else {
      setState(() {
        _formList.removeAt(index);
      });
    }
  }

  Future<void> handleSave() async {
    if (!formKey.currentState!.validate()) return;

    final newItems = _formList.where((item) => item['id'] == null).toList();
    final updatedItems = _formList.where((item) => item['id'] != null).toList();
    final removedItems = _feedItems
        .where((feedItem) =>
            !_formList.any((formItem) => formItem['id'] == feedItem.id))
        .toList();

    final List<String> changes = [];

    if (newItems.isNotEmpty) {
      changes.add('Ditambahkan:');
      for (var item in newItems) {
        final feedId = item['feed_id'] as int;
        final quantity = item['quantity'] as String;
        final feedName = _feeds
            .firstWhere(
              (feed) => feed.id == feedId,
              orElse: () => Feed(id: feedId, name: 'Pakan #$feedId', typeId: 0),
            )
            .name;
        changes.add('- $feedName: ${FeedUtils.formatNumber(double.parse(quantity))} kg');
      }
    }

    if (updatedItems.isNotEmpty) {
      changes.add('Diperbarui:');
      for (var item in updatedItems) {
        final feedId = item['feed_id'] as int;
        final newQuantity = double.parse(item['quantity'] as String);
        final feedItem = _feedItems.firstWhere((fi) => fi.id == item['id']);
        if (newQuantity != feedItem.quantity) {
          final feedName = _feeds
              .firstWhere(
                (feed) => feed.id == feedId,
                orElse: () =>
                    Feed(id: feedId, name: 'Pakan #$feedId', typeId: 0),
              )
              .name;
          changes.add(
              '- $feedName: ${FeedUtils.formatNumber(feedItem.quantity)} kg → ${FeedUtils.formatNumber(newQuantity)} kg');
        }
      }
    }

    if (removedItems.isNotEmpty) {
      changes.add('Dihapus:');
      for (var item in removedItems) {
        final feedName = _feeds
            .firstWhere(
              (feed) => feed.id == item.feedId,
              orElse: () => Feed(
                  id: item.feedId, name: 'Pakan #${item.feedId}', typeId: 0),
            )
            .name;
        changes.add('- $feedName: ${FeedUtils.formatNumber(item.quantity)} kg');
      }
    }

    final confirm = await DialogUtils.showConfirmDialog(
      context: context,
      title: 'Konfirmasi Perubahan',
      contentWidget: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Berikut adalah perubahan yang akan disimpan:'),
            const SizedBox(height: 10),
            if (changes.isEmpty)
              const Text('Tidak ada perubahan.')
            else
              ...changes.map((change) => Text(change)),
          ],
        ),
      ),
      confirmText: 'Simpan',
    );

    if (confirm != true) return;

    setState(() {
      _errorMessage = null;
    });

    try {
      print("Form list before saving: $_formList");

      for (var item in _formList) {
        print("Processing item: $item");
        final feedId = item['feed_id'] as int?;
        final quantityStr = item['quantity']?.toString().trim();
        if (feedId == null || quantityStr == null || quantityStr.isEmpty) {
          throw Exception(
              'Data pakan tidak lengkap. Pastikan semua field terisi. Item: $item');
        }
        final quantity = double.tryParse(quantityStr);
        if (quantity == null) {
          throw Exception(
              'Jumlah pakan tidak valid: "$quantityStr". Pastikan hanya berisi angka.');
        }
        final stock = FeedUtils.getFeedStock(feedId, _feedStocks);
        if (quantity > stock) {
          final feedName = _feeds
              .firstWhere(
                (feed) => feed.id == feedId,
                orElse: () =>
                    Feed(id: feedId, name: 'Pakan #$feedId', typeId: 0),
              )
              .name;
          throw Exception(
              'Stok $feedName tidak cukup. Tersedia hanya ${FeedUtils.formatNumber(stock)} kg.');
        }
      }

      if (newItems.isNotEmpty) {
        final feedItemsPayload = newItems
            .map((item) => {
                  'feed_id': item['feed_id'] as int,
                  'quantity': double.parse(item['quantity'] as String),
                })
            .toList();

        final response = await FeedItemService.addFeedItems(
          dailyFeedId: dailyFeedId,
          feedItems: feedItemsPayload,
        );

        if (!response['success']) {
          throw Exception(response['message'] ?? 'Gagal menambah item pakan');
        }

        print("addFeedItems response: $response");

        List<dynamic> rawFeedItems = [];
        if (response['data'] != null) {
          if (response['data']['DailyFeedItems'] != null) {
            rawFeedItems = response['data']['DailyFeedItems'] as List<dynamic>;
          } else if (response['data']['feedItems'] != null) {
            rawFeedItems = response['data']['feedItems'] as List<dynamic>;
          } else if (response['data']['feed_items'] != null) {
            rawFeedItems = response['data']['feed_items'] as List<dynamic>;
          } else {
            print(
                "No feed items found in response. Available keys in data: ${response['data'].keys}");
          }
        } else {
          print("No 'data' key in response: $response");
        }

        final addedFeedItems = rawFeedItems.map((item) {
          print("Parsing feed item: $item");
          return FeedItem.fromJson(item);
        }).toList();

        print("Added feed items: $addedFeedItems");
        _feedItems.addAll(addedFeedItems);
      }

      if (updatedItems.isNotEmpty) {
        final updatedFeedItems = updatedItems
            .map((item) => {
                  'id': item['id'] as int,
                  'quantity': double.parse(item['quantity'] as String),
                })
            .toList();
        final response =
            await FeedItemService.bulkUpdateFeedItems(items: updatedFeedItems);
        if (!response['success']) {
          throw Exception(
              response['message'] ?? 'Gagal memperbarui item pakan');
        }

        for (var updatedItem in updatedItems) {
          final index =
              _feedItems.indexWhere((item) => item.id == updatedItem['id']);
          if (index != -1) {
            _feedItems[index] = FeedItem(
              id: _feedItems[index].id,
              dailyFeedId: _feedItems[index].dailyFeedId,
              feedId: _feedItems[index].feedId,
              quantity: double.parse(updatedItem['quantity'] as String),
              feed: _feedItems[index].feed,
              createdAt: _feedItems[index].createdAt,
              updatedAt: _feedItems[index].updatedAt,
            );
          }
        }
      }

      if (removedItems.isNotEmpty) {
        for (var item in removedItems) {
          final response = await FeedItemService.deleteFeedItem(item.id);
          if (!response['success']) {
            throw Exception(
                response['message'] ?? 'Gagal menghapus item pakan');
          }
        }
        _feedItems.removeWhere((item) => removedItems.contains(item));
      }

      setState(() {
        _isEditing = false;
        _formList = _feedItems
            .map((item) => <String, dynamic>{
                  'id': item.id,
                  'feed_id': item.feedId,
                  'quantity': item.quantity.toString(),
                  'daily_feed_id': item.dailyFeedId,
                })
            .toList();
        _errorMessage = null;
      });

      DialogUtils.showSuccessDialog(
          context, 'Berhasil', 'Data pakan harian berhasil diperbarui');
      onUpdateSuccess?.call();
    } catch (e) {
      if (!context.mounted) return;

      setState(() {
        _errorMessage = e.toString().contains('Stok tidak cukup')
            ? e.toString()
            : 'Gagal menyimpan data: $e';
      });

      if (context.mounted) {
        DialogUtils.showErrorDialog(context, 'Gagal', _errorMessage!);
      }
    } finally {
      setState(() {
        _errorMessage = null;
      });
    }
  }

  void updateState({
    List<Map<String, dynamic>>? formList,
    List<FeedItem>? feedItems,
    List<Feed>? feeds,
    List<FeedStock>? feedStocks,
  }) {
    setState(() {
      if (formList != null) _formList = formList;
      if (feedItems != null) _feedItems = feedItems;
      if (feeds != null) _feeds = feeds;
      if (feedStocks != null) _feedStocks = feedStocks;
    });
  }
}