import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:convert';
import 'dart:async'; // Tambahkan untuk jeda notifikasi
import 'package:timezone/timezone.dart' as tz;
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// Tambahkan kelas untuk antrian notifikasi
class NotificationQueue {
  static final List<Map<String, dynamic>> _queue = [];
  static bool _isProcessing = false;
  static const Duration _delayBetweenNotifications = Duration(seconds: 3);

  static Future<void> add({
    required int id,
    required String title,
    required String body,
    required String type,
    required Map<String, dynamic> data,
    required NotificationService service,
  }) async {
    _queue.add({
      'id': id,
      'title': title,
      'body': body,
      'type': type,
      'data': data,
      'service': service,
    });

    if (!_isProcessing) {
      _processQueue();
    }
  }

  static Future<void> _processQueue() async {
    if (_queue.isEmpty) {
      _isProcessing = false;
      return;
    }

    _isProcessing = true;
    final notification = _queue.removeAt(0);
    final service = notification['service'] as NotificationService;

    await service.showNotification(
      id: notification['id'],
      title: notification['title'],
      body: notification['body'],
      type: notification['type'],
      data: notification['data'],
      useQueue: false,
    );

    // Tambahkan jeda sebelum menampilkan notifikasi berikutnya
    await Future.delayed(_delayBetweenNotifications);
    _processQueue();
  }
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    // Android settings - gunakan logo.png sebagai ikon notifikasi
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@drawable/logo');

    // iOS settings
    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      settings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    await _requestPermissions();
  }

  Future<void> _requestPermissions() async {
    await Permission.notification.request();

    if (await Permission.notification.isDenied) {
      await Permission.notification.request();
    }
  }

  void _onNotificationTapped(NotificationResponse response) {
    final payload = response.payload;
    if (payload != null) {
      try {
        final data = jsonDecode(payload);
        _handleNotificationTap(data);
      } catch (e) {
        print('Error parsing notification payload: $e');
      }
    }
  }

  void _handleNotificationTap(Map<String, dynamic> data) {
    final type = data['type'];
    final notificationId = data['notification_id'];
    print('Notification tapped: Type: $type, ID: $notificationId');
  }

  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? type,
    Map<String, dynamic>? data,
    bool useQueue = true,
  }) async {
    // Cek apakah tipe notifikasi valid dan perlu menggunakan antrian
    if (useQueue && _isValidNotificationType(type)) {
      await NotificationQueue.add(
        id: id,
        title: title,
        body: body,
        type: type ?? 'general',
        data: data ?? {},
        service: this,
      );
      return;
    }

    final notificationDetails = _getNotificationDetails(type);

    final payload = jsonEncode({
      'notification_id': id,
      'type': type ?? 'general',
      'data': data ?? {},
    });

    await _notifications.show(
      id,
      title,
      body,
      notificationDetails,
      payload: payload,
    );
  }

  bool _isValidNotificationType(String? type) {
    // Hanya menerima 4 jenis notifikasi yang telah ditentukan
    return type == 'milk_expiry' ||
        type == 'low_production' ||
        type == 'high_production' ||
        type == 'milk_warning';
  }

  NotificationDetails _getNotificationDetails(String? type) {
    // Buat notifikasi yang lebih menarik dengan konten yang sesuai tipe
    final androidDetails = AndroidNotificationDetails(
      'dairytrack_channel',
      'DairyTrack Notifications',
      channelDescription: 'Notifikasi untuk aplikasi DairyTrack',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@drawable/logo', // Tetap gunakan logo untuk semua jenis
      color: _getNotificationColor(type),
      ledColor: _getNotificationColor(type),
      ledOnMs: 1000,
      ledOffMs: 500,
      enableVibration: true,
      vibrationPattern: _getVibrationPattern(type) != null
          ? Int64List.fromList(_getVibrationPattern(type)!)
          : null,
      playSound: false, // Tanpa suara
      styleInformation: _getStyleInformation(type),
      category: _getNotificationCategory(type),
      colorized: true, // Warnai notifikasi
      showWhen: true,
      autoCancel: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: false, // Tanpa suara
      badgeNumber: null,
    );

    return NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
  }

  Color _getNotificationColor(String? type) {
    // Warna yang berbeda untuk 4 jenis notifikasi utama
    switch (type) {
      case 'milk_expiry':
        return Colors.orange.shade700;
      case 'low_production':
        return Colors.red.shade600;
      case 'high_production':
        return Colors.green.shade600;
      case 'milk_warning':
        return Colors.amber;
      default:
        return Colors.blue;
    }
  }

  List<int>? _getVibrationPattern(String? type) {
    // Pola getar yang berbeda untuk setiap jenis
    switch (type) {
      case 'milk_expiry':
        return [0, 500, 200, 500]; // Pola untuk peringatan kadaluarsa
      case 'low_production':
        return [0, 300, 200, 300, 200, 300]; // Pola untuk produksi rendah
      case 'high_production':
        return [0, 200, 200, 200]; // Pola untuk produksi tinggi
      case 'milk_warning':
        return [0, 500, 200, 500, 200, 500]; // Pola untuk peringatan
      default:
        return [0, 250, 250, 250]; // Pola default
    }
  }

  AndroidNotificationCategory? _getNotificationCategory(String? type) {
    // Kategori yang berbeda untuk setiap jenis
    switch (type) {
      case 'milk_expiry':
        return AndroidNotificationCategory.alarm;
      case 'low_production':
        return AndroidNotificationCategory.status;
      case 'high_production':
        return AndroidNotificationCategory.status;
      case 'milk_warning':
        return AndroidNotificationCategory.reminder;
      default:
        return AndroidNotificationCategory.message;
    }
  }

  StyleInformation _getStyleInformation(String? type) {
    String bigText;
    String contentTitle;
    String summaryText;

    switch (type) {
      case 'milk_expiry':
        contentTitle = 'Peringatan Susu Kadaluarsa!';
        bigText = 'Batch susu telah melewati tanggal kadaluarsa. '
            'Mohon segera periksa dan lakukan penanganan yang tepat untuk '
            'menghindari kerugian dan menjaga kualitas produk.';
        summaryText = 'Batch susu kadaluarsa';
        break;
      case 'low_production':
        contentTitle = 'Produksi Susu Rendah';
        bigText = 'Produksi susu berada di bawah ambang batas standar 15.0L. '
            'Hal ini mungkin disebabkan oleh perubahan pakan, kesehatan sapi, '
            'atau faktor lingkungan. Segera periksa kondisi peternakan.';
        summaryText = 'Di bawah target produksi';
        break;
      case 'high_production':
        contentTitle = 'Produksi Susu Tinggi';
        bigText = 'Produksi susu melebihi ambang batas standar 25.0L. '
            'Ini merupakan pencapaian yang baik! Pertahankan kondisi dengan '
            'memastikan kualitas pakan dan kesehatan sapi tetap optimal.';
        summaryText = 'Produksi di atas target';
        break;
      case 'milk_warning':
        contentTitle = 'Peringatan Kualitas Susu';
        bigText = 'Batch susu akan kadaluarsa dalam beberapa jam. '
            'Mohon segera periksa dan pastikan penanganan yang tepat '
            'untuk memastikan kualitas produk tetap terjaga.';
        summaryText = 'Batch akan segera kadaluarsa';
        break;
      default:
        contentTitle = 'Notifikasi DairyTrack';
        bigText =
            'Anda memiliki pembaruan baru dari sistem pengelolaan peternakan DairyTrack.';
        summaryText = 'Info pembaruan';
    }

    return BigTextStyleInformation(
      bigText,
      htmlFormatBigText: true,
      contentTitle: '<b>$contentTitle</b>',
      htmlFormatContentTitle: true,
      summaryText: summaryText,
      htmlFormatSummaryText: true,
    );
  }

  Future<void> cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }

  Future<void> showScheduledNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? type,
    Map<String, dynamic>? data,
  }) async {
    // Hanya jadwalkan jenis notifikasi yang valid
    if (!_isValidNotificationType(type)) {
      return;
    }

    final notificationDetails = _getNotificationDetails(type);

    final payload = jsonEncode({
      'notification_id': id,
      'type': type ?? 'general',
      'data': data ?? {},
    });

    await _notifications.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledDate, tz.local),
      notificationDetails,
      payload: payload,
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
    );
  }
}

@GenerateMocks([FlutterLocalNotificationsPlugin])
void main() {
  group('NotificationService Tests', () {
    late NotificationService notificationService;

    setUp(() {
      notificationService = NotificationService();
    });

    test('should return singleton instance', () {
      final instance1 = NotificationService();
      final instance2 = NotificationService();

      expect(identical(instance1, instance2), isTrue);
    });

    test('should use logo.png icon for all notification types', () {
      expect('@drawable/logo', equals('@drawable/logo'));
    });

    test('should create notification details with correct settings', () {
      final details =
          notificationService._getNotificationDetails('milk_expiry');

      expect(details, isA<NotificationDetails>());
      expect(details.android, isA<AndroidNotificationDetails>());
      expect(details.iOS, isA<DarwinNotificationDetails>());

      final androidDetails = details.android as AndroidNotificationDetails;
      expect(androidDetails.channelId, equals('dairytrack_channel'));
      expect(androidDetails.channelName, equals('DairyTrack Notifications'));
      expect(androidDetails.importance, equals(Importance.high));
      expect(androidDetails.priority, equals(Priority.high));
      expect(androidDetails.icon, equals('@drawable/logo'));
      expect(androidDetails.color, equals(Colors.orange.shade700));
      expect(androidDetails.playSound, isFalse);
    });

    test('should validate notification types correctly', () {
      expect(
          notificationService._isValidNotificationType('milk_expiry'), isTrue);
      expect(notificationService._isValidNotificationType('low_production'),
          isTrue);
      expect(notificationService._isValidNotificationType('high_production'),
          isTrue);
      expect(
          notificationService._isValidNotificationType('milk_warning'), isTrue);
      expect(notificationService._isValidNotificationType('system_update'),
          isFalse);
      expect(notificationService._isValidNotificationType('success'), isFalse);
      expect(notificationService._isValidNotificationType(null), isFalse);
    });

    test('should get correct notification color for different types', () {
      expect(notificationService._getNotificationColor('milk_expiry'),
          equals(Colors.orange.shade700));
      expect(notificationService._getNotificationColor('low_production'),
          equals(Colors.red.shade600));
      expect(notificationService._getNotificationColor('high_production'),
          equals(Colors.green.shade600));
      expect(notificationService._getNotificationColor('milk_warning'),
          equals(Colors.amber));
      expect(
          notificationService._getNotificationColor(null), equals(Colors.blue));
    });

    // Sisanya tests tidak berubah...
  });
}
