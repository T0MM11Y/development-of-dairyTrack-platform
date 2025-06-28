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
      _showErrorSnackBar('An error occurred while loading notifications');
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
_showSuccessSnackBar('Notification marked as read');
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
_showSuccessSnackBar('All notifications marked as read');
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
    title: 'Delete All Notifications',
    content:
        'Are you sure you want to delete all notifications? This action cannot be undone.',
    confirmText: 'Delete All',
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
_showSuccessSnackBar('All notifications deleted successfully');
        } else {
          _showErrorSnackBar(result['message']);
        }
      } catch (e) {
_showErrorSnackBar('An error occurred while deleting all notifications');
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
_showSuccessSnackBar('Notification deleted successfully');
      } else {
        _showErrorSnackBar(result['message']);
      }
    } catch (e) {
_showErrorSnackBar('An error occurred while deleting the notification');
      print('Error deleting notification: $e');
    }
  }

  // Get notification color based on type
  Color _getNotificationColor(String? type) {
    switch (type) {
      case 'production_decrease':
      case 'low_production':
        return Color(0xFFE74C3C); // Red for low/decrease production
      case 'production_increase':
      case 'high_production':
        return Color(0xFF27AE60); // Green for high/increase production
      case 'health_check':
        return Color(0xFF3498DB); // Blue for health
      case 'follow_up':
        return Color(0xFF9B59B6); // Purple for follow-up
      case 'milk_expiry':
      case 'PROD_EXPIRED':
        return Color(0xFFDC3545); // Dark red for expired
      case 'milk_warning':
      case 'PRODUCT_LONG_EXPIRED':
        return Color(0xFFF39C12); // Orange for warning
      case 'Sisa Pakan Menipis':
        return Color(0xFFE67E22); // Orange for feed warning
      case 'PRODUCT_STOCK':
        return Color(0xFF17A2B8); // Teal for stock
      case 'ORDER':
        return Color(0xFF6F42C1); // Indigo for order
      case 'reproduction':
        return Color(0xFFE91E63); // Pink for reproduction
      default:
        return Color(0xFF6C757D); // Gray for default
    }
  }

  // Get notification icon based on type
  IconData _getNotificationIcon(String? type) {
    switch (type) {
      case 'production_decrease':
      case 'low_production':
        return Icons.trending_down_rounded;
      case 'production_increase':
      case 'high_production':
        return Icons.trending_up_rounded;
      case 'health_check':
        return Icons.health_and_safety_rounded;
      case 'follow_up':
        return Icons.follow_the_signs_rounded;
      case 'milk_expiry':
      case 'PROD_EXPIRED':
        return Icons.dangerous_rounded;
      case 'milk_warning':
      case 'PRODUCT_LONG_EXPIRED':
        return Icons.warning_amber_rounded;
      case 'Sisa Pakan Menipis':
        return Icons.grass_rounded;
      case 'PRODUCT_STOCK':
        return Icons.inventory_rounded;
      case 'ORDER':
        return Icons.shopping_cart_rounded;
      case 'reproduction':
        return Icons.favorite_rounded;
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
      margin: EdgeInsets.fromLTRB(16, 12, 16, 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
hintText: 'Search notifications...',
          hintStyle: TextStyle(color: Colors.grey[500], fontSize: 13),
          prefixIcon: Container(
            padding: EdgeInsets.all(10),
            child: Icon(Icons.search_rounded, color: _primaryColor, size: 18),
          ),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear_rounded,
                      color: Colors.grey[400], size: 18),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {
                      _searchQuery = '';
                      _applySearchFilter();
                    });
                  },
                  padding: EdgeInsets.all(8),
                )
              : null,
          filled: true,
          fillColor: Colors.white,
          contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey[200]!, width: 1),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: _primaryColor, width: 1.5),
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
      toolbarHeight: 60,
      leading: Container(
        margin: EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(8),
        ),
        child: IconButton(
          icon:
              Icon(Icons.arrow_back_ios_rounded, color: Colors.white, size: 18),
          onPressed: () => Navigator.pop(context),
          padding: EdgeInsets.zero,
        ),
      ),
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
                Icon(Icons.notifications_rounded,
                    color: Colors.white, size: 20),
                if (unreadCount > 0)
                  Positioned(
                    right: -2,
                    top: -2,
                    child: Container(
                      padding: EdgeInsets.all(2),
                      decoration: BoxDecoration(
                        color: Colors.red.shade400,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      constraints: BoxConstraints(minWidth: 14, minHeight: 14),
                      child: Text(
                        unreadCount > 99 ? '99+' : unreadCount.toString(),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 9,
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
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Notifications',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    fontSize: 18,
                  ),
                ),
                if (unreadCount > 0)
                  Text(
                    '$unreadCount unread',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 11,
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
                         ? 'Processing...'
: 'Mark All as Read',
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
_isClearingAll ? 'Deleting...' : 'Delete All',
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
_isClearingAll ? 'Deleting...' : 'Delete',
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
_isMarkingAllRead ? 'Processing...' : 'Mark',
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
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: _primaryColor.withOpacity(0.1),
                    blurRadius: 15,
                    spreadRadius: 3,
                  ),
                ],
              ),
              child: CircularProgressIndicator(
                color: _primaryColor,
                strokeWidth: 2.5,
              ),
            ),
            SizedBox(height: 24),
            Text(
'Loading notifications...',
              style: TextStyle(
                color: Colors.grey[700],
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 6),
            Text(
'Please wait a moment',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 13,
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
            SizedBox(height: MediaQuery.of(context).size.height * 0.12),
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
                          _primaryColor.withOpacity(0.08),
                          _primaryColor.withOpacity(0.15),
                        ],
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: _primaryColor.withOpacity(0.08),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.notifications_none_rounded,
                      size: 64,
                      color: _primaryColor.withOpacity(0.7),
                    ),
                  ),
                  SizedBox(height: 32),
                  Text(
'No notifications',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                  SizedBox(height: 12),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
'All notifications will appear here.\nYou will receive alerts about important matters related to your farm.',
                      style: TextStyle(
                        fontSize: 14,
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
                    icon: Icon(Icons.refresh_rounded, size: 18),
                    label: Text('Muat Ulang',
                        style: TextStyle(
                            fontSize: 14, fontWeight: FontWeight.w600)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _primaryColor,
                      foregroundColor: Colors.white,
                      padding:
                          EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      elevation: 2,
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
                padding: EdgeInsets.fromLTRB(16, 6, 16, 20),
                itemCount: _filteredNotifications.length,
                itemBuilder: (context, index) => _buildNotificationCard(index),
              ),
      ),
    );
  }

  Widget _buildNoSearchResults() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 60),
        child: Column(
          children: [
            Icon(
              Icons.search_off_rounded,
              size: 48,
              color: Colors.grey[400],
            ),
            SizedBox(height: 12),
            Text(
'No matching notifications',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 15,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 6),
            Text(
'Try using a different keyword',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 13,
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
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isUnread ? color.withOpacity(0.3) : Colors.grey[200]!,
          width: isUnread ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: isUnread
                ? color.withOpacity(0.08)
                : Colors.black.withOpacity(0.04),
            blurRadius: isUnread ? 8 : 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () async {
            if (isUnread) {
              await _markAsRead(
                  notification['id'], notifications.indexOf(notification));
            }
            _showNotificationDetail(notification);
          },
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        _getNotificationIcon(type),
                        color: color,
                        size: 18,
                      ),
                    ),
                    SizedBox(width: 12),
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
                                    fontSize: 14,
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
                                  size: 12, color: Colors.grey[500]),
                              SizedBox(width: 3),
                              Text(
                                _getRelativeTime(notification['created_at']),
                                style: TextStyle(
                                  fontSize: 11,
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
                SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.grey[200]!),
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
  }

  Widget _buildNotificationMenu(Map<String, dynamic> notification, int index) {
    final isUnread = !(notification['is_read'] ?? false);

    return PopupMenuButton<String>(
      icon: Container(
        padding: EdgeInsets.all(3),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(Icons.more_vert_rounded, color: Colors.grey[600], size: 16),
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      elevation: 6,
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
                  padding: EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: _primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Icon(Icons.mark_email_read_rounded,
                      size: 14, color: _primaryColor),
                ),
                SizedBox(width: 10),
                Text('Tandai Dibaca',
                    style:
                        TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
              ],
            ),
          ),
        PopupMenuItem(
          value: 'details',
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Icon(Icons.info_outline_rounded,
                    size: 14, color: Colors.blue),
              ),
              SizedBox(width: 10),
              Text('Detail',
                  style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'delete',
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Icon(Icons.delete_outline_rounded,
                    size: 14, color: Colors.red),
              ),
              SizedBox(width: 10),
              Text('Delete',
                  style: TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
            ],
          ),
        ),
      ],
    );
  }

 void _showDeleteConfirmation(int notificationId, int index) async {
  final bool? confirmed = await _showConfirmationDialog(
    title: 'Delete Notification',
    content:
        'Are you sure you want to delete this notification? This action cannot be undone.',
    confirmText: 'Delete',
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
          margin: EdgeInsets.all(16),
          padding: EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: _primaryColor, strokeWidth: 2.5),
              SizedBox(height: 20),
              Text(
'Deleting all notifications...',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[800],
                ),
              ),
              SizedBox(height: 8),
              Text(
'Please wait, do not close the app',
                style: TextStyle(
                  fontSize: 13,
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
        insetPadding: EdgeInsets.symmetric(horizontal: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 8,
        backgroundColor: Colors.transparent,
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 15,
                spreadRadius: 3,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: _primaryColor,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        _getNotificationIcon(type),
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        notification['title'] ?? 'notification',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              // Content
              Container(
                padding: EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Message
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
                          height: 1.5,
                          color: Colors.grey[800],
                        ),
                      ),
                    ),
                    SizedBox(height: 16),
                    // Time info
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 3,
                            height: 32,
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          SizedBox(width: 12),
                          Icon(Icons.schedule_rounded,
                              size: 16, color: Colors.grey[500]),
                          SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
'Received Time',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[600],
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  _formatDateTime(notification['created_at']),
                                  style: TextStyle(
                                    fontSize: 13,
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
                      SizedBox(height: 16),
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.grey[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[200]!),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.code_rounded,
                                    size: 14, color: Colors.grey[600]),
                                SizedBox(width: 6),
                                Text(
'Additional Details',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.grey[700],
                                  ),
                                ),
                              ],
                            ),
                            SizedBox(height: 8),
                            Text(
                              notification['metadata'].toString(),
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey[700],
                                fontFamily: 'monospace',
                                height: 1.4,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    SizedBox(height: 24),
                    // Close button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _primaryColor,
                          foregroundColor: Colors.white,
                          padding: EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          elevation: 2,
                        ),
                        child: Text(
                          'Close',
                          style: TextStyle(
                              fontSize: 14, fontWeight: FontWeight.w600),
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
