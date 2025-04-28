import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/pakan/dailyFeedItem.dart';
import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/config/api/pakan/feedStock.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import './components/create/daily_feed_selector.dart';
import './components/create/session_details.dart';
import './components/create/feed_item_form.dart';
import './components/create/error_message_display.dart';
import './components/create/submit_button.dart';

class AddFeedItemPage extends StatefulWidget {
  const AddFeedItemPage({super.key});

  @override
  _AddFeedItemPageState createState() => _AddFeedItemPageState();
}

class _AddFeedItemPageState extends State<AddFeedItemPage> {
  final DateFormat _dateFormat = DateFormat('dd MMM yyyy');
  final _formKey = GlobalKey<FormState>();

  bool _isLoading = true;
  String _errorMessage = '';

  List<DailyFeedSchedule> _dailyFeeds = [];
  List<Feed> _feeds = [];
  List<FeedItem> _feedItems = [];
  List<FeedStock> _feedStocks = [];
  Map<int, Cow> _cowsMap = {};

  int? _selectedDailyFeedId;
  DailyFeedSchedule? _selectedDailyFeedDetails;

  List<Map<String, dynamic>> _formList = [
    {'feed_id': null, 'quantity': ''},
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (mounted) {
      setState(() {
        _isLoading = true;
        _errorMessage = '';
      });
    }

    try {
      final results = await Future.wait([
        getAllDailyFeeds(),
        getCows(),
        getAllFeeds(),
        FeedItemService.getAllFeedItems(),
        getAllFeedStocks(),
      ]);

      final List<DailyFeedSchedule> schedules = results[0] as List<DailyFeedSchedule>;
      final List<Cow> cowsList = results[1] as List<Cow>;
      final List<Feed> feedsList = results[2] as List<Feed>;
      final Map<String, dynamic> feedItemsResponse = results[3] as Map<String, dynamic>;
      final List<FeedStock> feedStocksList = results[4] as List<FeedStock>;

      final List<FeedItem> feedItemsList = feedItemsResponse['success'] == true
          ? (feedItemsResponse['data'] as List)
              .map((item) => FeedItem.fromJson(item))
              .toList()
          : [];

      final Map<int, Cow> cowsMap = {};
      for (var cow in cowsList) {
        if (cow.id != null) {
          cowsMap[cow.id!] = cow;
        } else {
          print('Warning: Cow with null ID found: ${cow.name}');
        }
      }

      if (mounted) {
        setState(() {
          _dailyFeeds = schedules;
          _feeds = feedsList;
          _feedItems = feedItemsList;
          _feedStocks = feedStocksList;
          _cowsMap = cowsMap;
          _isLoading = false;
        });
      }

      _filterAvailableDailyFeeds();
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error loading data: $e';
          _isLoading = false;
        });
        SchedulerBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _showErrorDialog('Error', 'Gagal memuat data: $e');
          }
        });
      }
    }
  }

  void _filterAvailableDailyFeeds() {
    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);

    final Map<int, int> feedItemCounts = {};
    for (var item in _feedItems) {
      feedItemCounts[item.dailyFeedId] = (feedItemCounts[item.dailyFeedId] ?? 0) + 1;
    }

    final validDailyFeeds = _dailyFeeds.where((feed) {
      final feedDate = DateTime.parse(feed.date);
      final isValidDate = !feedDate.isBefore(todayStart);
      final itemCount = feedItemCounts[feed.id] ?? 0;
      return isValidDate && itemCount < 3;
    }).toList();

    if (mounted) {
      setState(() {
        _dailyFeeds = validDailyFeeds;
      });
    }
  }

  void _updateSelectedSchedule(String? idString) {
    final id = idString != null ? int.tryParse(idString) : null;

    if (mounted) {
      setState(() {
        _selectedDailyFeedId = id;
        _selectedDailyFeedDetails = id != null
            ? _dailyFeeds.firstWhere(
                (feed) => feed.id == id,
                orElse: () => null as DailyFeedSchedule,
              )
            : null;
      });
    }
  }

  void _handleFormChange(int index, String field, dynamic value) {
    if (mounted) {
      setState(() {
        if (field == 'feed_id') {
          final selectedFeedIds = _formList
              .asMap()
              .entries
              .where((entry) => entry.key != index && entry.value['feed_id'] != null)
              .map((entry) => entry.value['feed_id'] as int)
              .toSet();
          if (selectedFeedIds.contains(value)) {
            _showErrorDialog('Perhatian',
                'Jenis pakan ini sudah dipilih. Silakan pilih jenis pakan lain.');
            return;
          }
        }
        _formList[index][field] = value;
      });
    }
  }

  void _addFeedItemRow() {
    if (_formList.length >= 3) {
      _showErrorDialog('Perhatian', 'Maksimal 3 jenis pakan untuk satu sesi');
      return;
    }

    if (mounted) {
      setState(() {
        _formList.add({'feed_id': null, 'quantity': ''});
      });
    }
  }

  void _removeFeedItemRow(int index) {
    if (_formList.length > 1) {
      if (mounted) {
        setState(() {
          _formList.removeAt(index);
        });
      }
    }
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedDailyFeedId == null) {
      if (mounted) {
        _showErrorDialog('Error', 'Silakan pilih sesi pakan harian terlebih dahulu.');
      }
      return;
    }

    final List<Map<String, dynamic>> newItems = [];
    for (var item in _formList) {
      final feedId = item['feed_id'] as int?;
      final quantityStr = item['quantity']?.toString();
      if (feedId == null || quantityStr == null || quantityStr.trim().isEmpty) {
        if (mounted) {
          _showErrorDialog('Error', 'Semua field harus diisi.');
        }
        return;
      }

      final requestedQuantity = double.tryParse(quantityStr) ?? 0.0;
      final availableStock = _getFeedStock(feedId);

      if (requestedQuantity <= 0) {
        if (mounted) {
          _showErrorDialog('Error', 'Jumlah harus lebih dari 0.');
        }
        return;
      }

      if (requestedQuantity > availableStock) {
        final feedName = _feeds.firstWhere((feed) => feed.id == feedId).name;
        if (mounted) {
          _showErrorDialog(
            'Stok Tidak Mencukupi',
            '$feedName: Tersedia $availableStock kg, diminta $requestedQuantity kg',
          );
        }
        return;
      }

      newItems.add({
        'feed_id': feedId,
        'quantity': requestedQuantity,
        'feed_name': _feeds.firstWhere((feed) => feed.id == feedId).name,
      });
    }

    final sessionInfo = _selectedDailyFeedDetails != null
        ? 'Sesi: ${_formatSession(_selectedDailyFeedDetails!.session)}, '
            'Tanggal: ${_dateFormat.format(DateTime.parse(_selectedDailyFeedDetails!.date))}, '
            'Sapi: ${_cowsMap[_selectedDailyFeedDetails!.cowId]?.name ?? "Sapi #${_selectedDailyFeedDetails!.cowId}"}'
        : 'Sesi ID: $_selectedDailyFeedId';
    final itemDescriptions = newItems
        .map((item) => '${item['feed_name']}: ${item['quantity']} kg')
        .toList();
    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Konfirmasi'),
          content: Text(
            'Apakah Anda yakin ingin menambahkan pakan berikut untuk $sessionInfo?\n'
            '${itemDescriptions.join('\n')}',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Batal'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Ya, Tambah'),
            ),
          ],
        );
      },
    );

    if (confirm != true) {
      return;
    }

    if (mounted) {
      setState(() {
        _isLoading = true;
        _errorMessage = '';
      });
    }

    try {
      final List<Map<String, dynamic>> feedItems = newItems
          .map((item) => {
                'feed_id': item['feed_id'],
                'quantity': item['quantity'],
              })
          .toList();

      final response = await FeedItemService.addFeedItems(
        dailyFeedId: _selectedDailyFeedId!,
        feedItems: feedItems,
      );

      if (response['success'] == true) {
        if (mounted) {
          _showSuccessDialog(
            'Berhasil!',
            'Berhasil menambahkan pakan untuk $sessionInfo:\n${itemDescriptions.join('\n')}',
          );
          await Future.delayed(const Duration(seconds: 2));
          if (mounted) {
            Navigator.pop(context, true);
          }
        }
      } else {
        throw Exception(response['message'] ?? 'Gagal menambahkan item pakan');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error: $e';
        });
        _showErrorDialog('Error', 'Gagal menyimpan data pakan: $e');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              if (mounted) {
                Navigator.pop(context, true);
              }
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  String _formatSession(String session) {
    return session.isNotEmpty ? session[0].toUpperCase() + session.substring(1) : session;
  }

  double _getFeedStock(int? feedId) {
    if (feedId == null) return 0.0;

    final matchingStocks = _feedStocks.where((stock) => stock.feedId == feedId).toList();
    if (matchingStocks.isEmpty) return 0.0;

    matchingStocks.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return matchingStocks.first.stock ?? 0.0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Item Pakan'),
        backgroundColor: const Color(0xFF17A2B8),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF17A2B8)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ErrorMessageDisplay(errorMessage: _errorMessage),
                    DailyFeedSelector(
                      dailyFeeds: _dailyFeeds,
                      cowsMap: _cowsMap,
                      feedItems: _feedItems,
                      selectedDailyFeedId: _selectedDailyFeedId?.toString(),
                      dateFormat: _dateFormat,
                      onChanged: _updateSelectedSchedule,
                    ),
                    const SizedBox(height: 24.0),
                    SessionDetails(
                      selectedDailyFeedDetails: _selectedDailyFeedDetails,
                      cowsMap: _cowsMap,
                      dateFormat: _dateFormat,
                    ),
                    FeedItemForm(
                      formList: _formList,
                      feeds: _feeds,
                      feedStocks: _feedStocks,
                      onFormChange: _handleFormChange,
                      onRemoveRow: _removeFeedItemRow,
                      onAddRow: _addFeedItemRow,
                      canAddMore: _formList.length < 3,
                    ),
                    const SizedBox(height: 24.0),
                    SubmitButton(
                      isLoading: _isLoading,
                      onPressed: _submitForm,
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}