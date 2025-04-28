import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';

class FeedUtils {
  static String formatNumber(double number) {
    if (number == number.toInt()) {
      return number.toInt().toString();
    }
    return number.toString();
  }

  static double getFeedStock(int? feedId, List<FeedStock> feedStocks) {
    if (feedId == null) return 0.0;
    final matchingStocks =
        feedStocks.where((stock) => stock.feedId == feedId).toList();
    if (matchingStocks.isEmpty) return 0.0;
    matchingStocks.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return matchingStocks.first.stock ?? 0.0;
  }

  static List<Feed> getAvailableFeedsForRow(
    int currentIndex,
    List<Map<String, dynamic>> formList,
    List<Feed> feeds,
  ) {
    final selectedFeedIds = formList
        .asMap()
        .entries
        .where((entry) =>
            entry.key != currentIndex && entry.value['feed_id'] != null)
        .map((entry) => entry.value['feed_id'] as int)
        .toSet();

    return feeds.where((feed) => !selectedFeedIds.contains(feed.id)).toList();
  }
}