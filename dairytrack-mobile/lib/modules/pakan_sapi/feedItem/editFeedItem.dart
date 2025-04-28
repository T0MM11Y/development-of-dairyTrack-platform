import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import './components/edit/feed_item_service.dart';
import './components/edit/feed_item_form_handler.dart';
import './components/edit/session_details.dart';
import './components/edit/error_message_display.dart';
import './components/edit/feed_item_table.dart';
import './components/edit/feed_item_form.dart';
import './components/edit/submit_button.dart';
import './components/edit/feed_utils.dart';

class EditFeedItemPage extends StatefulWidget {
  final int dailyFeedId;
  final VoidCallback? onUpdateSuccess;

  const EditFeedItemPage({
    super.key,
    required this.dailyFeedId,
    this.onUpdateSuccess,
  });

  @override
  _EditFeedItemPageState createState() => _EditFeedItemPageState();
}

class _EditFeedItemPageState extends State<EditFeedItemPage> {
  final DateFormat _dateFormat = DateFormat('dd MMM yyyy');
  final _formKey = GlobalKey<FormState>();

  bool _isLoading = true;
  bool _isEditing = false;
  String? _errorMessage;

  DailyFeedSchedule? _dailyFeed;
  List<FeedItem> _feedItems = [];
  List<Feed> _feeds = [];
  List<FeedStock> _feedStocks = [];
  Map<int, Cow> _cowsMap = {};
  List<Map<String, dynamic>> _formList = [];

  late FeedItemFormHandler _formHandler;

  @override
  void initState() {
    super.initState();
    FeedItemService.initLogging(); // Initialize logging
    _formHandler = FeedItemFormHandler(
      setState: setState,
      context: context,
      dailyFeedId: widget.dailyFeedId,
      onUpdateSuccess: widget.onUpdateSuccess,
      formKey: _formKey,
    );
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    await FeedItemService.loadData(
      dailyFeedId: widget.dailyFeedId,
      onSuccess: (dailyFeed, feedItems, feeds, feedStocks, cowsMap, formList) {
        setState(() {
          _dailyFeed = dailyFeed;
          _feedItems = feedItems;
          _feeds = feeds;
          _feedStocks = feedStocks;
          _cowsMap = cowsMap;
          _formList = formList;
          _isLoading = false;
          if (feedItems.isEmpty) {
            _errorMessage = 'Tidak ada item pakan untuk sesi ini.';
          }
        });
      },
      onError: (error) {
        setState(() {
          _errorMessage = error;
          _isLoading = false;
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Item Pakan Harian'),
        backgroundColor: const Color(0xFF17A2B8),
        actions: [
          if (!_isEditing && _feedItems.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: _isLoading ? null : _formHandler.toggleEditMode,
              tooltip: 'Edit',
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ErrorMessageDisplay(errorMessage: _errorMessage),
                    SessionDetails(
                      dailyFeed: _dailyFeed,
                      cowsMap: _cowsMap,
                      dateFormat: _dateFormat,
                    ),
                    const SizedBox(height: 24.0),
                    if (_isEditing)
                      FeedItemForm(
                        formList: _formList,
                        feeds: _feeds,
                        feedStocks: _feedStocks,
                        getAvailableFeedsForRow: FeedUtils.getAvailableFeedsForRow,
                        getFeedStock: FeedUtils.getFeedStock,
                        formatNumber: FeedUtils.formatNumber,
                        handleFormChange: _formHandler.handleFormChange,
                        removeFeedItemRow: _formHandler.removeFeedItemRow,
                        addFeedItemRow: _formHandler.addFeedItemRow,
                        isLoading: _isLoading,
                        handleSave: _formHandler.handleSave,
                      )
                    else
                      FeedItemTable(
                        feedItems: _feedItems,
                        feeds: _feeds,
                        formatNumber: FeedUtils.formatNumber,
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}