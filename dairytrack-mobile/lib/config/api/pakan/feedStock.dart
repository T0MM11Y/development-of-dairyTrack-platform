import 'package:dairy_track/config/configApi5003.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:dairy_track/model/pakan/feed.dart';

Future<List<FeedStock>> getAllFeedStocks() async {
  final response = await fetchAPI("feedStock");

  if (response is Map<String, dynamic> && response['success'] == true) {
    final feeds = response['feeds'] as List<dynamic>? ?? [];
    List<FeedStock> result = [];
    
    for (var feedData in feeds) {
      // Check if this feed has associated FeedStock data
      if (feedData['FeedStock'] != null) {
        // Extract the FeedStock data
        Map<String, dynamic> feedStockData = Map<String, dynamic>.from(feedData['FeedStock']);
        
        // Create a Feed object from the feed data
        Feed feed = Feed(
          id: feedData['id'],
          typeId: feedData['typeId'] ?? 0,
          name: feedData['name'] ?? 'Unknown',
        );
        
        // Create the FeedStock with attached Feed
        FeedStock feedStock = FeedStock.fromJson(feedStockData);
        
        // Manually set the feed property since it's not in the JSON structure we expect
        result.add(FeedStock(
          id: feedStock.id,
          feedId: feed.id ?? 0,
          stock: feedStock.stock,
          feed: feed,
          createdAt: feedStock.createdAt,
          updatedAt: feedStock.updatedAt,
        ));
      }
    }
    
    return result;
  } else {
    throw Exception(response['message'] ?? 'Gagal mengambil daftar stok pakan');
  }
}
Future<FeedStock> getFeedStockById(int id) async {
  final response = await fetchAPI("feedStock/$id");

  if (response is Map<String, dynamic> && response['success'] == true) {
    return FeedStock.fromJson(response['stock']);
  } else {
    throw Exception(response['message'] ?? 'Gagal mengambil stok pakan berdasarkan ID');
  }
}

Future<FeedStock> addFeedStock({
  required int feedId,
  required double additionalStock,
}) async {
  final data = {
    'feedId': feedId,
    'additionalStock': additionalStock,
  };

  final response = await fetchAPI(
    "feedStock/add",
    method: "POST",
    data: data,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return FeedStock.fromJson(response['stock']);
  } else {
    throw Exception(response['message'] ?? 'Gagal menambah stok pakan');
  }
}

Future<FeedStock> updateFeedStock({
  required int id,
  required double stock,
}) async {
  final data = {
    'stock': stock,
  };

  final response = await fetchAPI(
    "feedStock/$id",
    method: "PUT",
    data: data,
  );

  if (response is Map<String, dynamic> && response['success'] == true) {
    return FeedStock.fromJson(response['stock']);
  } else {
    throw Exception(response['message'] ?? 'Gagal memperbarui stok pakan');
  }
}