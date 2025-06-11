import 'package:dairytrack_mobile/services/notificationService.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../controller/APIURL1/notificationController.dart';

class NotificationWidget extends StatefulWidget {
  @override
  _NotificationWidgetState createState() => _NotificationWidgetState();
}

class _NotificationWidgetState extends State<NotificationWidget>
    with TickerProviderStateMixin {
  final NotificationController _notificationController =
      NotificationController();
  final NotificationService _notificationService = NotificationService();

  List<dynamic> notifications = [];
  bool isLoading = true;
  int unreadCount = 0;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  // Add user role variable
  String userRole = 'Farmer';

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _getUserRole();
    _loadNotifications();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  // Get user role from SharedPreferences
  Future<void> _getUserRole() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final role = prefs.getString('userRole') ?? 'Farmer';
      setState(() {
        userRole = role;
      });
    } catch (e) {
      print('Error getting user role: $e');
    }
  }

  // Get theme colors based on user role
  Color get _primaryColor {
    switch (userRole) {
      case 'Administrator':
      case 'Admin':
        return Colors.blueGrey[800]!;
      case 'Supervisor':
        return Colors.deepOrange[400]!;
      default: // Farmer
        return Colors.teal[400]!;
    }
  }

  Color get _primaryAccentColor {
    switch (userRole) {
      case 'Administrator':
      case 'Admin':
        return Colors.blueGrey[700]!;
      case 'Supervisor':
        return Colors.deepOrange[700]!;
      default: // Farmer
        return Colors.teal[600]!;
    }
  }

  // Get background gradient based on user role
  List<Color> get _backgroundGradient {
    switch (userRole) {
      case 'Administrator':
      case 'Admin':
        return [Color(0xFFe0eafc), Color(0xFFcfdef3)]; // Blue gradient
      case 'Supervisor':
        return [Color(0xFFe0eafc), Color(0xFFcfdef3)]; // Blue gradient
      default: // Farmer
        return [Color(0xFFe0eafc), Color(0xFFcfdef3)]; // Blue gradient
    }
  }

  Future<void> _loadNotifications() async {
    setState(() {
      isLoading = true;
    });

    try {
      final notifResult = await _notificationController.getNotifications();

      setState(() {
        if (notifResult['success']) {
          notifications = notifResult['data']['notifications'] ?? [];
          // Update badge count
          unreadCount = notifications
              .where((notif) => !(notif['is_read'] ?? false))
              .length;
        } else {
          notifications = [];
          unreadCount = 0;
          _showErrorSnackBar(notifResult['message']);
        }

        isLoading = false;
      });

      _animationController.forward();
    } catch (e) {
      setState(() {
        isLoading = false;
        notifications = [];
        unreadCount = 0;
      });
      _showErrorSnackBar('Terjadi kesalahan saat memuat notifikasi');
      print('Error loading notifications: $e');
    }
  }

  Future<void> _markAsRead(int notificationId, int index) async {
    final result = await _notificationController.markAsRead(notificationId);

    if (result['success']) {
      setState(() {
        notifications[index]['is_read'] = true;
        unreadCount = notifications.where((notif) => !notif['is_read']).length;
      });

      // Cancel the local notification
      await _notificationService.cancelNotification(notificationId);

      _showSuccessSnackBar('Notifikasi ditandai sebagai dibaca');
    } else {
      _showErrorSnackBar(result['message']);
    }
  }

  Future<void> _markAllAsRead() async {
    final result = await _notificationController.markAllAsRead();

    if (result['success']) {
      setState(() {
        for (var notification in notifications) {
          notification['is_read'] = true;
        }
        unreadCount = 0;
      });

      // Cancel all local notifications
      await _notificationService.cancelAllNotifications();

      _showSuccessSnackBar('Semua notifikasi ditandai sebagai dibaca');
    } else {
      _showErrorSnackBar(result['message']);
    }
  }

  Future<void> _deleteNotification(int notificationId, int index) async {
    try {
      final result =
          await _notificationController.deleteNotification(notificationId);

      if (result['success']) {
        setState(() {
          notifications.removeAt(index);
          unreadCount =
              notifications.where((notif) => !notif['is_read']).length;
        });

        // Cancel the local notification
        await _notificationService.cancelNotification(notificationId);

        _showSuccessSnackBar('Notifikasi berhasil dihapus');
      } else {
        _showErrorSnackBar(result['message']);
      }
    } catch (e) {
      _showErrorSnackBar('Terjadi kesalahan saat menghapus notifikasi');
      print('Error deleting notification: $e');
    }
  }

// Get notification color based on type
  Color _getNotificationColor(String? type) {
    switch (type) {
      case 'low_production':
        return Colors.orange;
      case 'high_production':
        return Colors.green;
      case 'milk_expiry':
        return Colors.red;
      case 'milk_warning':
        return Colors.amber;
      case 'missing_milking':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

// Get notification icon based on type
  IconData _getNotificationIcon(String? type) {
    switch (type) {
      case 'low_production':
        return Icons.trending_down_rounded;
      case 'high_production':
        return Icons.trending_up_rounded;
      case 'milk_expiry':
        return Icons.warning_amber_rounded;
      case 'milk_warning':
        return Icons.timer_rounded;
      case 'missing_milking':
        return Icons.calendar_today_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  // Get relative time
 /// Fungsi untuk menampilkan waktu relatif seperti "2 jam lalu"
String _getRelativeTime(String? timestamp) {
  if (timestamp == null) return 'Tidak diketahui';

  try {
    final now = DateTime.now();
    final utcDate = DateTime.parse(timestamp);
    final wibDate = utcDate.add(Duration(hours: 7)); // Geser ke WIB
    final difference = now.difference(wibDate);

    if (difference.inMinutes < 1) {
      return 'Baru saja';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} menit lalu';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} jam lalu';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} hari lalu';
    } else {
      return DateFormat('dd MMM yyyy', 'id_ID').format(wibDate);
    }
  } catch (e) {
    return 'Tidak diketahui';
  }
}

/// Fungsi untuk menampilkan waktu lengkap dalam WIB
String _formatDateTime(String? timestamp) {
  if (timestamp == null) return 'Tidak diketahui';

  try {
    // Parsing manual dengan timezone awareness
    final date = DateFormat("yyyy-MM-ddTHH:mm:ssZ").parseUTC(timestamp).toLocal();

    return DateFormat('dd MMMM yyyy, HH:mm', 'id_ID').format(date);
  } catch (e) {
    print('DEBUG - Error parsing date: $e');
    return 'Tidak diketahui';
  }
}


  // Show error snackbar
  void _showErrorSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.error_rounded, color: Colors.white, size: 20),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
          backgroundColor: Colors.red.shade600,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: EdgeInsets.all(16),
          duration: Duration(seconds: 4),
        ),
      );
    }
  }

  // Show success snackbar
  void _showSuccessSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
          backgroundColor: Colors.green.shade600,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          margin: EdgeInsets.all(16),
          duration: Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _backgroundGradient, // Use dynamic gradient based on role
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent, // Transparan agar gradien terlihat
        appBar: AppBar(
          title: Row(
            children: [
              Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Stack(
                  children: [
                    Icon(Icons.notifications, color: Colors.white, size: 20),
                    if (unreadCount > 0)
                      Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          padding: EdgeInsets.all(2),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          constraints: BoxConstraints(
                            minWidth: 12,
                            minHeight: 12,
                          ),
                          child: Text(
                            unreadCount > 99 ? '99+' : unreadCount.toString(),
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Notifikasi',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      fontSize: 18,
                    ),
                  ),
                  if (unreadCount > 0)
                    Text(
                      '$unreadCount belum dibaca',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 12,
                      ),
                    ),
                ],
              ),
            ],
          ),
          backgroundColor: _primaryColor, // Use dynamic color based on role
          elevation: 0,
          leading: IconButton(
            icon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.arrow_back, color: Colors.white, size: 20),
            ),
            onPressed: () => Navigator.pop(context),
          ),
          actions: [
            if (unreadCount > 0)
              Container(
                margin: EdgeInsets.only(right: 12),
                child: TextButton.icon(
                  onPressed: _markAllAsRead,
                  icon: Icon(Icons.done_all, color: Colors.white, size: 16),
                  label: Text(
                    'Tandai Semua',
                    style: TextStyle(color: Colors.white, fontSize: 11),
                  ),
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.white.withOpacity(0.2),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
              ),
          ],
        ),
        body: RefreshIndicator(
          color: _primaryColor, // Use dynamic color based on role
          backgroundColor: Colors.white,
          onRefresh: () async {
            _animationController.reset();
            await _loadNotifications();
          },
          child: isLoading
              ? _buildLoadingState()
              : notifications.isEmpty
                  ? _buildEmptyState()
                  : _buildNotificationList(),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: CircularProgressIndicator(
              color: _primaryColor, // Use dynamic color based on role
              strokeWidth: 3,
            ),
          ),
          SizedBox(height: 24),
          Text(
            'Memuat notifikasi...',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: ListView(
        children: [
          SizedBox(height: MediaQuery.of(context).size.height * 0.15),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        _primaryColor.withOpacity(0.1), // Use dynamic color
                        _primaryColor.withOpacity(0.2), // Use dynamic color
                      ],
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: _primaryColor.withOpacity(0.1),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.notifications_none_rounded,
                    size: 80,
                    color: _primaryColor.withOpacity(0.7), // Use dynamic color
                  ),
                ),
                SizedBox(height: 32),
                Text(
                  'Tidak ada notifikasi',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[800],
                  ),
                ),
                SizedBox(height: 12),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    'Semua notifikasi akan muncul di sini.\nAnda akan mendapat pemberitahuan untuk hal-hal penting.',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: () async {
                    _animationController.reset();
                    await _loadNotifications();
                  },
                  icon: Icon(Icons.refresh_rounded, size: 20),
                  label: Text('Muat Ulang', style: TextStyle(fontSize: 16)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primaryColor, // Use dynamic color
                    foregroundColor: Colors.white,
                    padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                    elevation: 4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationList() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: ListView.builder(
        padding: EdgeInsets.all(16),
        itemCount: notifications.length,
        itemBuilder: (context, index) {
          final notification = notifications[index];
          final isUnread = !(notification['is_read'] ?? false);
          final type = notification['type'];
          final color = _getNotificationColor(type);

          return Container(
            margin: EdgeInsets.only(bottom: 16),
            child: Material(
              elevation: isUnread ? 2 : 1,
              borderRadius: BorderRadius.circular(12),
              color: Colors.white,
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () async {
                  if (isUnread) {
                    await _markAsRead(notification['id'], index);
                  }
                  _showNotificationDetail(notification);
                },
                child: Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color:
                          isUnread ? color.withOpacity(0.3) : Colors.grey[100]!,
                      width: isUnread ? 1 : 0.5,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              _getNotificationIcon(type),
                              color: color,
                              size: 20,
                            ),
                          ),
                          SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        notification['title'] ?? 'Notifikasi',
                                        style: TextStyle(
                                          fontWeight: isUnread
                                              ? FontWeight.bold
                                              : FontWeight.w600,
                                          fontSize: 15,
                                          color: Colors.grey[800],
                                        ),
                                      ),
                                    ),
                                    if (isUnread)
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: BoxDecoration(
                                          color: color,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                  ],
                                ),
                                SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(Icons.access_time_rounded,
                                        size: 12, color: Colors.grey[400]),
                                    SizedBox(width: 4),
                                    Text(
                                      _getRelativeTime(
                                          notification['created_at']),
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[500],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          PopupMenuButton<String>(
                            icon: Icon(Icons.more_horiz_rounded,
                                color: Colors.grey[400], size: 20),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            onSelected: (value) async {
                              switch (value) {
                                case 'mark_read':
                                  if (isUnread) {
                                    await _markAsRead(
                                        notification['id'], index);
                                  }
                                  break;
                                case 'delete':
                                  _showDeleteConfirmation(
                                      notification['id'], index);
                                  break;
                                case 'details':
                                  _showNotificationDetail(notification);
                                  break;
                              }
                            },
                            itemBuilder: (context) => [
                              if (isUnread)
                                PopupMenuItem(
                                  value: 'mark_read',
                                  child: Row(
                                    children: [
                                      Icon(Icons.mark_email_read_rounded,
                                          size: 18,
                                          color:
                                              _primaryAccentColor), // Use dynamic color
                                      SizedBox(width: 12),
                                      Text('Tandai Dibaca'),
                                    ],
                                  ),
                                ),
                              PopupMenuItem(
                                value: 'details',
                                child: Row(
                                  children: [
                                    Icon(Icons.info_rounded,
                                        size: 18, color: Colors.blue),
                                    SizedBox(width: 12),
                                    Text('Detail'),
                                  ],
                                ),
                              ),
                              PopupMenuItem(
                                value: 'delete',
                                child: Row(
                                  children: [
                                    Icon(Icons.delete_rounded,
                                        size: 18, color: Colors.red),
                                    SizedBox(width: 12),
                                    Text('Hapus'),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      SizedBox(height: 12),
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey[50],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          notification['message'] ?? '',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[700],
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  void _showDeleteConfirmation(int notificationId, int index) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(Icons.delete_rounded, color: Colors.red, size: 20),
            ),
            SizedBox(width: 12),
            Text(
              'Hapus Notifikasi',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        content: Text(
          'Apakah Anda yakin ingin menghapus notifikasi ini? Tindakan ini tidak dapat dibatalkan.',
          style: TextStyle(fontSize: 14, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Batal', style: TextStyle(color: Colors.grey[600])),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteNotification(notificationId, index);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            child: Text('Hapus'),
          ),
        ],
      ),
    );
  }

  void _showNotificationDetail(Map<String, dynamic> notification) {
    final type = notification['type'];
    final color = _getNotificationColor(type);

    showDialog(
      context: context,
      builder: (context) => Dialog(
        insetPadding: EdgeInsets.symmetric(horizontal: 20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 0,
        backgroundColor: Colors.transparent,
        child: Container(
          padding: EdgeInsets.all(0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 20,
                spreadRadius: 5,
                offset: Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with dynamic color based on role
              Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: _primaryColor, // Use dynamic color based on role
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        _getNotificationIcon(type),
                        color: Colors.white,
                        size: 22,
                      ),
                    ),
                    SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        notification['title'] ?? 'Notifikasi',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Content
              Container(
                padding: EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Message box
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Text(
                        notification['message'] ?? '',
                        style: TextStyle(
                            fontSize: 15, height: 1.5, color: Colors.grey[800]),
                      ),
                    ),
                    SizedBox(height: 16),
                    // Time container with type color indicator
                    Container(
                      padding:
                          EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 4,
                            height: 36,
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                          SizedBox(width: 12),
                          Icon(Icons.schedule_rounded,
                              size: 18, color: Colors.grey[500]),
                          SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Waktu Diterima',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.grey[600],
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  _formatDateTime(notification['created_at']),
                                  style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey[800]),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Metadata section if available
                    if (notification['metadata'] != null &&
                        notification['metadata'].toString().isNotEmpty)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(height: 16),
                          Row(
                            children: [
                              Icon(Icons.code,
                                  size: 16, color: Colors.grey[600]),
                              SizedBox(width: 8),
                              Text(
                                'Detail Tambahan',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.grey[700],
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 8),
                          Container(
                            width: double.infinity,
                            padding: EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.grey[50],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.grey[200]!),
                            ),
                            child: Text(
                              notification['metadata'].toString(),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[700],
                                fontFamily: 'monospace',
                                height: 1.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                    SizedBox(height: 24),
                    // Close button with dynamic color based on role
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _primaryColor, // Use dynamic color
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          'Tutup',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
