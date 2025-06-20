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
  late Animation<Offset> _slideAnimation;

  // Search variables
  String _searchQuery = '';
  List<dynamic> _filteredNotifications = [];
  final TextEditingController _searchController = TextEditingController();

  // Loading states
  bool _isClearingAll = false;
  bool _isMarkingAllRead = false;

  // User role variable
  String userRole = 'Farmer';

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _getUserRole();
    _loadNotifications();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
          parent: _animationController,
          curve: Interval(0.0, 0.6, curve: Curves.easeOut)),
    );

    _slideAnimation = Tween<Offset>(
      begin: Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Interval(0.2, 1.0, curve: Curves.easeOutCubic),
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    _searchController.dispose();
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
        return Color(0xFF2C3E50);
      case 'Supervisor':
        return Color(0xFFE67E22);
      default: // Farmer
        return Color(0xFF27AE60);
    }
  }

  Color get _primaryAccentColor {
    switch (userRole) {
      case 'Administrator':
      case 'Admin':
        return Color(0xFF34495E);
      case 'Supervisor':
        return Color(0xFFD68910);
      default: // Farmer
        return Color(0xFF229954);
    }
  }

  // Get background gradient based on user role
  List<Color> get _backgroundGradient {
    switch (userRole) {
      case 'Administrator':
      case 'Admin':
        return [Color(0xFFF8F9FA), Color(0xFFE9ECEF)];
      case 'Supervisor':
        return [Color(0xFFFDF2E9), Color(0xFFFAE5D3)];
      default: // Farmer
        return [Color(0xFFE8F8F5), Color(0xFFD5F4E6)];
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
          unreadCount = notifications
              .where((notif) => !(notif['is_read'] ?? false))
              .length;
          _applySearchFilter();
        } else {
          notifications = [];
          unreadCount = 0;
          _filteredNotifications = [];
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
        _filteredNotifications = [];
      });
      _showErrorSnackBar('Terjadi kesalahan saat memuat notifikasi');
      print('Error loading notifications: $e');
    }
  }

  void _applySearchFilter() {
    if (_searchQuery.isEmpty) {
      _filteredNotifications = List.from(notifications);
    } else {
      final query = _searchQuery.toLowerCase();
      _filteredNotifications = notifications.where((notif) {
        final title = (notif['title'] ?? '').toString().toLowerCase();
        final message = (notif['message'] ?? '').toString().toLowerCase();
        return title.contains(query) || message.contains(query);
      }).toList();
    }
  }

  Future<void> _markAsRead(int notificationId, int index) async {
    final result = await _notificationController.markAsRead(notificationId);

    if (result['success']) {
      setState(() {
        notifications[index]['is_read'] = true;
        unreadCount = notifications.where((notif) => !notif['is_read']).length;
        _applySearchFilter();
      });

      await _notificationService.cancelNotification(notificationId);
      _showSuccessSnackBar('Notifikasi ditandai sebagai dibaca');
    } else {
      _showErrorSnackBar(result['message']);
    }
  }

  Future<void> _markAllAsRead() async {
    setState(() {
      _isMarkingAllRead = true;
    });

    try {
      final result = await _notificationController.markAllAsRead();

      if (result['success']) {
        setState(() {
          for (var notification in notifications) {
            notification['is_read'] = true;
          }
          unreadCount = 0;
          _applySearchFilter();
        });

        await _notificationService.cancelAllNotifications();
        _showSuccessSnackBar('Semua notifikasi ditandai sebagai dibaca');
      } else {
        _showErrorSnackBar(result['message']);
      }
    } finally {
      setState(() {
        _isMarkingAllRead = false;
      });
    }
  }

  Future<void> _clearAllNotifications() async {
    final bool? confirmed = await _showConfirmationDialog(
      title: 'Hapus Semua Notifikasi',
      content:
          'Apakah Anda yakin ingin menghapus semua notifikasi? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Hapus Semua',
      isDestructive: true,
    );

    if (confirmed == true) {
      setState(() {
        _isClearingAll = true;
      });

      try {
        final result = await _notificationController.clearAllNotifications();

        if (result['success']) {
          setState(() {
            notifications.clear();
            _filteredNotifications.clear();
            unreadCount = 0;
          });

          await _notificationService.cancelAllNotifications();
          _showSuccessSnackBar('Semua notifikasi berhasil dihapus');
        } else {
          _showErrorSnackBar(result['message']);
        }
      } catch (e) {
        _showErrorSnackBar('Terjadi kesalahan saat menghapus semua notifikasi');
        print('Error clearing all notifications: $e');
      } finally {
        setState(() {
          _isClearingAll = false;
        });
      }
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
          _applySearchFilter();
        });

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
        return Color(0xFFFF8C00);
      case 'high_production':
        return Color(0xFF28A745);
      case 'milk_expiry':
        return Color(0xFFDC3545);
      case 'milk_warning':
        return Color(0xFFFFC107);
      case 'missing_milking':
        return Color(0xFF007BFF);
      default:
        return Color(0xFF6C757D);
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
        return Icons.access_time_rounded;
      case 'missing_milking':
        return Icons.event_busy_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  String _getRelativeTime(String? timestamp) {
    if (timestamp == null) return 'Tidak diketahui';

    try {
      final now = DateTime.now();
      final utcDate = DateTime.parse(timestamp);
      final wibDate = utcDate.add(Duration(hours: 7));
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

  String _formatDateTime(String? timestamp) {
    if (timestamp == null) return 'Tidak diketahui';

    try {
      final date =
          DateFormat("yyyy-MM-ddTHH:mm:ssZ").parseUTC(timestamp).toLocal();
      return DateFormat('dd MMMM yyyy, HH:mm', 'id_ID').format(date);
    } catch (e) {
      print('DEBUG - Error parsing date: $e');
      return 'Tidak diketahui';
    }
  }

  void _showErrorSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(Icons.error_outline, color: Colors.white, size: 16),
              ),
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
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: EdgeInsets.all(16),
          duration: Duration(seconds: 4),
          elevation: 8,
        ),
      );
    }
  }

  void _showSuccessSnackBar(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(Icons.check_circle_outline,
                    color: Colors.white, size: 16),
              ),
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
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          margin: EdgeInsets.all(16),
          duration: Duration(seconds: 3),
          elevation: 8,
        ),
      );
    }
  }

  Future<bool?> _showConfirmationDialog({
    required String title,
    required String content,
    required String confirmText,
    bool isDestructive = false,
  }) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        elevation: 10,
        title: Row(
          children: [
            Container(
              padding: EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: (isDestructive ? Colors.red : _primaryColor)
                    .withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                isDestructive
                    ? Icons.warning_rounded
                    : Icons.help_outline_rounded,
                color: isDestructive ? Colors.red : _primaryColor,
                size: 24,
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                  color: Colors.grey[800],
                ),
              ),
            ),
          ],
        ),
        content: Text(
          content,
          style: TextStyle(
            fontSize: 14,
            height: 1.5,
            color: Colors.grey[700],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            style: TextButton.styleFrom(
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            child: Text(
              'Batal',
              style: TextStyle(
                  color: Colors.grey[600], fontWeight: FontWeight.w500),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: isDestructive ? Colors.red : _primaryColor,
              foregroundColor: Colors.white,
              padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              elevation: 2,
            ),
            child: Text(
              confirmText,
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      margin: EdgeInsets.fromLTRB(20, 16, 20, 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Cari notifikasi...',
          hintStyle: TextStyle(color: Colors.grey[500], fontSize: 14),
          prefixIcon: Container(
            padding: EdgeInsets.all(12),
            child: Icon(Icons.search_rounded, color: _primaryColor, size: 22),
          ),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear_rounded,
                      color: Colors.grey[400], size: 20),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {
                      _searchQuery = '';
                      _applySearchFilter();
                    });
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.white,
          contentPadding: EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: Colors.grey[200]!, width: 1),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: _primaryColor, width: 2),
          ),
        ),
        onChanged: (value) {
          setState(() {
            _searchQuery = value;
            _applySearchFilter();
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _backgroundGradient,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: _buildAppBar(),
        body: _buildBody(),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      elevation: 0,
      backgroundColor: _primaryColor,
      toolbarHeight: 80,
      leading: Container(
        margin: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: IconButton(
          icon:
              Icon(Icons.arrow_back_ios_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      title: Row(
        children: [
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Stack(
              children: [
                Icon(Icons.notifications_rounded,
                    color: Colors.white, size: 24),
                if (unreadCount > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.red.shade400,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      constraints: BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        unreadCount > 99 ? '99+' : unreadCount.toString(),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Notifikasi',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontSize: 20,
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
          ),
        ],
      ),
      actions: _buildAppBarActions(),
    );
  }

  // ...existing code...

  List<Widget> _buildAppBarActions() {
    List<Widget> actions = [];

    // Jika ada notifikasi dan juga ada unread, gabungkan dalam satu dropdown menu
    if (notifications.isNotEmpty && unreadCount > 0) {
      actions.add(
        Container(
          margin: EdgeInsets.only(right: 8),
          child: PopupMenuButton<String>(
            icon: Container(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.more_horiz_rounded, color: Colors.white, size: 16),
                  SizedBox(width: 4),
                  Text(
                    'Menu',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            elevation: 8,
            onSelected: (value) async {
              switch (value) {
                case 'mark_all':
                  if (!_isMarkingAllRead) _markAllAsRead();
                  break;
                case 'clear_all':
                  if (!_isClearingAll) _clearAllNotifications();
                  break;
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'mark_all',
                enabled: !_isMarkingAllRead,
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: _primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(Icons.done_all_rounded,
                          size: 16, color: _primaryColor),
                    ),
                    SizedBox(width: 12),
                    Text(
                      _isMarkingAllRead
                          ? 'Memproses...'
                          : 'Tandai Semua Dibaca',
                      style: TextStyle(fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'clear_all',
                enabled: !_isClearingAll,
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(Icons.clear_all_rounded,
                          size: 16, color: Colors.red),
                    ),
                    SizedBox(width: 12),
                    Text(
                      _isClearingAll ? 'Menghapus...' : 'Hapus Semua',
                      style: TextStyle(fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    } else if (notifications.isNotEmpty) {
      // Hanya tombol hapus semua
      actions.add(
        Container(
          margin: EdgeInsets.only(right: 8),
          child: Material(
            color: Colors.red.withOpacity(0.9),
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: _isClearingAll ? null : _clearAllNotifications,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_isClearingAll)
                      SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    else
                      Icon(Icons.clear_all_rounded,
                          color: Colors.white, size: 14),
                    SizedBox(width: 4),
                    Text(
                      _isClearingAll ? 'Hapus...' : 'Hapus',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    } else if (unreadCount > 0) {
      // Hanya tombol tandai semua dibaca
      actions.add(
        Container(
          margin: EdgeInsets.only(right: 8),
          child: Material(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: _isMarkingAllRead ? null : _markAllAsRead,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_isMarkingAllRead)
                      SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    else
                      Icon(Icons.done_all_rounded,
                          color: Colors.white, size: 14),
                    SizedBox(width: 4),
                    Text(
                      _isMarkingAllRead ? 'Proses...' : 'Tandai',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    return actions;
  }

  // ...existing code...

  Widget _buildBody() {
    return Stack(
      children: [
        RefreshIndicator(
          color: _primaryColor,
          backgroundColor: Colors.white,
          strokeWidth: 3,
          onRefresh: () async {
            _animationController.reset();
            await _loadNotifications();
          },
          child: isLoading
              ? _buildLoadingState()
              : notifications.isEmpty
                  ? _buildEmptyState()
                  : Column(
                      children: [
                        _buildSearchBar(),
                        Expanded(child: _buildNotificationList()),
                      ],
                    ),
        ),
        if (_isClearingAll) _buildGlobalLoadingOverlay(),
      ],
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: _primaryColor.withOpacity(0.1),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: CircularProgressIndicator(
                color: _primaryColor,
                strokeWidth: 3,
              ),
            ),
            SizedBox(height: 32),
            Text(
              'Memuat notifikasi...',
              style: TextStyle(
                color: Colors.grey[700],
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Mohon tunggu sebentar',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: ListView(
          physics: AlwaysScrollableScrollPhysics(),
          children: [
            SizedBox(height: MediaQuery.of(context).size.height * 0.15),
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: EdgeInsets.all(40),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          _primaryColor.withOpacity(0.1),
                          _primaryColor.withOpacity(0.2),
                        ],
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: _primaryColor.withOpacity(0.1),
                          blurRadius: 30,
                          spreadRadius: 10,
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.notifications_none_rounded,
                      size: 80,
                      color: _primaryColor.withOpacity(0.7),
                    ),
                  ),
                  SizedBox(height: 40),
                  Text(
                    'Tidak ada notifikasi',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                  SizedBox(height: 16),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 40),
                    child: Text(
                      'Semua notifikasi akan muncul di sini.\nAnda akan mendapat pemberitahuan untuk hal-hal penting terkait peternakan Anda.',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                        height: 1.6,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  SizedBox(height: 40),
                  ElevatedButton.icon(
                    onPressed: () async {
                      _animationController.reset();
                      await _loadNotifications();
                    },
                    icon: Icon(Icons.refresh_rounded, size: 22),
                    label: Text('Muat Ulang',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w600)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _primaryColor,
                      foregroundColor: Colors.white,
                      padding:
                          EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                      elevation: 4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationList() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: _filteredNotifications.isEmpty
            ? _buildNoSearchResults()
            : ListView.builder(
                padding: EdgeInsets.fromLTRB(20, 8, 20, 24),
                itemCount: _filteredNotifications.length,
                itemBuilder: (context, index) => _buildNotificationCard(index),
              ),
      ),
    );
  }

  Widget _buildNoSearchResults() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 80),
        child: Column(
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 64,
              color: Colors.grey[400],
            ),
            SizedBox(height: 16),
            Text(
              'Tidak ada notifikasi yang cocok',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Coba gunakan kata kunci yang berbeda',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(int index) {
    final notification = _filteredNotifications[index];
    final isUnread = !(notification['is_read'] ?? false);
    final type = notification['type'];
    final color = _getNotificationColor(type);

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isUnread ? color.withOpacity(0.3) : Colors.grey[200]!,
          width: isUnread ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isUnread
                ? color.withOpacity(0.1)
                : Colors.black.withOpacity(0.05),
            blurRadius: isUnread ? 12 : 8,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () async {
            if (isUnread) {
              await _markAsRead(
                  notification['id'], notifications.indexOf(notification));
            }
            _showNotificationDetail(notification);
          },
          child: Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        _getNotificationIcon(type),
                        color: color,
                        size: 24,
                      ),
                    ),
                    SizedBox(width: 16),
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
                                    fontSize: 16,
                                    color: Colors.grey[800],
                                  ),
                                ),
                              ),
                              if (isUnread)
                                Container(
                                  width: 10,
                                  height: 10,
                                  decoration: BoxDecoration(
                                    color: color,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                            ],
                          ),
                          SizedBox(height: 6),
                          Row(
                            children: [
                              Icon(Icons.access_time_rounded,
                                  size: 14, color: Colors.grey[500]),
                              SizedBox(width: 4),
                              Text(
                                _getRelativeTime(notification['created_at']),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[500],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    _buildNotificationMenu(notification, index),
                  ],
                ),
                SizedBox(height: 16),
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
                      fontSize: 14,
                      color: Colors.grey[700],
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationMenu(Map<String, dynamic> notification, int index) {
    final isUnread = !(notification['is_read'] ?? false);

    return PopupMenuButton<String>(
      icon: Container(
        padding: EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(Icons.more_vert_rounded, color: Colors.grey[600], size: 18),
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 8,
      onSelected: (value) async {
        switch (value) {
          case 'mark_read':
            if (isUnread) {
              await _markAsRead(
                  notification['id'], notifications.indexOf(notification));
            }
            break;
          case 'delete':
            _showDeleteConfirmation(
                notification['id'], notifications.indexOf(notification));
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
                Container(
                  padding: EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: _primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Icon(Icons.mark_email_read_rounded,
                      size: 16, color: _primaryColor),
                ),
                SizedBox(width: 12),
                Text('Tandai Dibaca',
                    style: TextStyle(fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        PopupMenuItem(
          value: 'details',
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(Icons.info_outline_rounded,
                    size: 16, color: Colors.blue),
              ),
              SizedBox(width: 12),
              Text('Detail', style: TextStyle(fontWeight: FontWeight.w500)),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'delete',
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(Icons.delete_outline_rounded,
                    size: 16, color: Colors.red),
              ),
              SizedBox(width: 12),
              Text('Hapus', style: TextStyle(fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ],
    );
  }

  void _showDeleteConfirmation(int notificationId, int index) async {
    final bool? confirmed = await _showConfirmationDialog(
      title: 'Hapus Notifikasi',
      content:
          'Apakah Anda yakin ingin menghapus notifikasi ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Hapus',
      isDestructive: true,
    );

    if (confirmed == true) {
      _deleteNotification(notificationId, index);
    }
  }

  Widget _buildGlobalLoadingOverlay() {
    return Container(
      color: Colors.black54,
      child: Center(
        child: Container(
          margin: EdgeInsets.all(20),
          padding: EdgeInsets.all(32),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: _primaryColor, strokeWidth: 3),
              SizedBox(height: 24),
              Text(
                'Menghapus semua notifikasi...',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[800],
                ),
              ),
              SizedBox(height: 12),
              Text(
                'Mohon tunggu, jangan tutup aplikasi',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showNotificationDetail(Map<String, dynamic> notification) {
    final type = notification['type'];
    final color = _getNotificationColor(type);

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => Dialog(
        insetPadding: EdgeInsets.symmetric(horizontal: 20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        elevation: 10,
        backgroundColor: Colors.transparent,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
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
              // Header
              Container(
                padding: EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: _primaryColor,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        _getNotificationIcon(type),
                        color: Colors.white,
                        size: 24,
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
                    // Message
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Text(
                        notification['message'] ?? '',
                        style: TextStyle(
                          fontSize: 15,
                          height: 1.6,
                          color: Colors.grey[800],
                        ),
                      ),
                    ),
                    SizedBox(height: 20),
                    // Time info
                    Container(
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 4,
                            height: 40,
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                          SizedBox(width: 16),
                          Icon(Icons.schedule_rounded,
                              size: 20, color: Colors.grey[500]),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Waktu Diterima',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[600],
                                  ),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  _formatDateTime(notification['created_at']),
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[800],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Metadata if available
                    if (notification['metadata'] != null &&
                        notification['metadata'].toString().isNotEmpty) ...[
                      SizedBox(height: 20),
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.grey[50],
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey[200]!),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.code_rounded,
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
                            SizedBox(height: 12),
                            Text(
                              notification['metadata'].toString(),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[700],
                                fontFamily: 'monospace',
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    SizedBox(height: 32),
                    // Close button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _primaryColor,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16)),
                          elevation: 2,
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
