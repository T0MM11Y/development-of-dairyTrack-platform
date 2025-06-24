import 'package:dairytrack_mobile/controller/APIURL1/blogManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/categoryManagementController.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

// Professional Corporate Color Scheme - Same as initialDashboard
class AppColors {
  // Primary Colors - Deep Navy Blue (Trust & Professionalism)
  static const Color primary = Color(0xFF1E3A8A); // Deep Navy Blue
  static const Color primaryLight = Color(0xFF3B82F6); // Bright Blue
  static const Color primaryDark = Color(0xFF1E293B); // Dark Slate

  // Secondary Colors - Warm Emerald (Growth & Nature)
  static const Color secondary = Color(0xFF059669); // Emerald Green
  static const Color secondaryLight = Color(0xFF10B981); // Light Emerald
  static const Color secondaryDark = Color(0xFF047857); // Dark Emerald

  // Accent Colors - Premium Gold (Quality & Excellence)
  static const Color accent = Color(0xFFF59E0B); // Amber Gold
  static const Color accentLight = Color(0xFFFBBF24); // Light Gold
  static const Color accentDark = Color(0xFFD97706); // Dark Gold

  // Neutral Colors - Modern Gray Scale
  static const Color darkGray = Color(0xFF111827); // Almost Black
  static const Color mediumGray = Color(0xFF374151); // Dark Gray
  static const Color lightGray = Color(0xFF6B7280); // Medium Gray
  static const Color softGray = Color(0xFF9CA3AF); // Light Gray
  static const Color paleGray = Color(0xFFF3F4F6); // Very Light Gray
  static const Color background = Color(0xFFFAFAFA); // Off White Background

  // Status Colors
  static const Color success = Color(0xFF10B981); // Success Green
  static const Color error = Color(0xFFEF4444); // Error Red
  static const Color warning = Color(0xFFF59E0B); // Warning Amber
  static const Color info = Color(0xFF3B82F6); // Info Blue

  // Surface Colors
  static const Color surface = Colors.white;
  static const Color surfaceVariant = Color(0xFFF8FAFC);
  static const Color surfaceElevated = Color(0xFFFFFFF);

  // Text Colors
  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF4B5563);
  static const Color textTertiary = Color(0xFF9CA3AF);
  static const Color textOnPrimary = Colors.white;
  static const Color textOnDark = Colors.white;
}

class BlogGuestsView extends StatefulWidget {
  const BlogGuestsView({Key? key}) : super(key: key);

  @override
  _BlogGuestsViewState createState() => _BlogGuestsViewState();
}

class _BlogGuestsViewState extends State<BlogGuestsView>
    with TickerProviderStateMixin {
  final BlogManagementController _blogController = BlogManagementController();
  final CategoryManagementController _categoryController =
      CategoryManagementController();

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  List<Blog> _blogs = [];
  List<Category> _categories = [];
  String? _selectedCategoryId;
  bool _isLoading = true;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _fetchBlogs();
    _fetchCategories();
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _fetchBlogs({String? categoryId}) async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      List<Blog> blogs =
          await _blogController.listBlogs(categoryId: categoryId);
      setState(() {
        _blogs = blogs;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load blog: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchCategories() async {
    try {
      final response = await _categoryController.listCategories();
      if (response['success']) {
        List<dynamic> categoryData = response['data']['categories'];
        List<Category> categories =
            categoryData.map((json) => Category.fromJson(json)).toList();
        setState(() {
          _categories = categories;
        });
      }
    } catch (e) {
      // Silent fail for categories - tidak kritis untuk guest view
    }
  }

  Future<void> _refreshData() async {
    await Future.wait([
      _fetchBlogs(categoryId: _selectedCategoryId),
      _fetchCategories(),
    ]);
  }

  String _stripHtmlTags(String htmlString) {
    if (htmlString.isEmpty) return htmlString;

    RegExp exp = RegExp(r"<[^>]*>", multiLine: true, caseSensitive: true);
    String result = htmlString.replaceAll(exp, '');

    result = result
        .replaceAll('&nbsp;', ' ')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&#39;', "'")
        .replaceAll('&apos;', "'");

    result = result
        .replaceAll(RegExp(r'\n\s*\n\s*\n'), '\n\n')
        .replaceAll(RegExp(r'[ \t]+'), ' ')
        .trim();

    return result;
  }

  void _showBlogDetail(Blog blog) {
    showDialog(
      context: context,
      builder: (context) => _buildBlogDetailDialog(blog),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      width: double.infinity,
      height: 200,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary,
            AppColors.primaryLight,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          // Elegant geometric patterns
          Positioned(
            top: -30,
            right: -30,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.textOnPrimary.withOpacity(0.05),
              ),
            ),
          ),
          Positioned(
            bottom: -20,
            left: -20,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.textOnPrimary.withOpacity(0.08),
              ),
            ),
          ),
          // Professional grid pattern
          ...List.generate(10, (index) {
            return Positioned(
              left: (index % 5) * 80.0,
              top: 40 + (index ~/ 5) * 60.0,
              child: Container(
                width: 2,
                height: 2,
                decoration: BoxDecoration(
                  color: AppColors.textOnPrimary.withOpacity(0.3),
                  shape: BoxShape.circle,
                ),
              ),
            );
          }),
          // Content
          Positioned.fill(
            child: SafeArea(
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    FadeTransition(
                      opacity: _fadeAnimation,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Badge
                          Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 16, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.accent.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                  color: AppColors.accent.withOpacity(0.4)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.article,
                                    color: AppColors.accent, size: 14),
                                SizedBox(width: 6),
                                Text(
                                  "Blogs and Articles",
                                  style: TextStyle(
                                    color: AppColors.accent,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: 16),
                          // Main Title
                          Text(
                            "Latest Information & News\nTSTH²",
                            style: TextStyle(
                              color: AppColors.textOnPrimary,
                              fontSize: 24,
                              fontWeight: FontWeight.w800,
                              height: 1.1,
                              letterSpacing: -0.5,
                            ),
                          ),
                          SizedBox(height: 8),
                          // Accent line
                          Container(
                            width: 60,
                            height: 3,
                            decoration: BoxDecoration(
                              color: AppColors.accent,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                          SizedBox(height: 12),
                          // Description
                          Text(
                            "Find the latest articles on dairy farming, technology and innovation.",
                            style: TextStyle(
                              color: AppColors.textOnPrimary.withOpacity(0.9),
                              fontSize: 13,
                              height: 1.4,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.paleGray),
        boxShadow: [
          BoxShadow(
            color: AppColors.lightGray.withOpacity(0.06),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: DropdownButtonFormField<String>(
        decoration: InputDecoration(
          border: InputBorder.none,
          labelText: 'Filter by Category',
          labelStyle: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          prefixIcon:
              Icon(Icons.filter_list, color: AppColors.secondary, size: 20),
        ),
        dropdownColor: AppColors.surface,
        style: TextStyle(color: AppColors.textPrimary, fontSize: 14),
        value: _selectedCategoryId,
        items: [
          DropdownMenuItem(
            value: null,
            child: Text('All Categories',
                style: TextStyle(fontWeight: FontWeight.w500)),
          ),
          ..._categories.map((category) => DropdownMenuItem(
                value: category.id.toString(),
                child: Text(category.name,
                    style: TextStyle(fontWeight: FontWeight.w500)),
              )),
        ],
        onChanged: (value) {
          setState(() {
            _selectedCategoryId = value;
          });
          _fetchBlogs(categoryId: value);
        },
      ),
    );
  }

  Widget _buildBlogDetailDialog(Blog blog) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        width: MediaQuery.of(context).size.width * 0.95,
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.darkGray.withOpacity(0.2),
              blurRadius: 20,
              offset: Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          children: [
            // Header dengan gambar
            Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                image: DecorationImage(
                  image: NetworkImage(blog.photoUrl),
                  fit: BoxFit.cover,
                  onError: (error, stackTrace) {},
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      AppColors.darkGray.withOpacity(0.7),
                    ],
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned(
                      top: 16,
                      right: 16,
                      child: IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: Container(
                          padding: EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.darkGray.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Icon(
                            Icons.close,
                            color: AppColors.textOnDark,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 16,
                      left: 16,
                      right: 16,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            blog.title,
                            style: TextStyle(
                              color: AppColors.textOnDark,
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(
                                Icons.calendar_today,
                                color: AppColors.textOnDark.withOpacity(0.8),
                                size: 14,
                              ),
                              SizedBox(width: 4),
                              Text(
                                DateFormat('dd MMMM yyyy')
                                    .format(blog.createdAt),
                                style: TextStyle(
                                  color: AppColors.textOnDark.withOpacity(0.8),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Content area
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Categories
                    if (blog.categories != null &&
                        blog.categories!.isNotEmpty) ...[
                      Wrap(
                        spacing: 8.0,
                        runSpacing: 4.0,
                        children: blog.categories!.map((category) {
                          return Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.secondary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                  color: AppColors.secondary.withOpacity(0.3)),
                            ),
                            child: Text(
                              category.name,
                              style: TextStyle(
                                color: AppColors.secondary,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      SizedBox(height: 16),
                    ],

                    // Content
                    Expanded(
                      child: SingleChildScrollView(
                        child: Text(
                          _stripHtmlTags(blog.content),
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 16,
                            height: 1.6,
                          ),
                        ),
                      ),
                    ),

                    // Footer info
                    Container(
                      padding: EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: AppColors.textSecondary,
                            size: 16,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Last updated: ${DateFormat('dd MMM yyyy').format(blog.updatedAt)}',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Container(
      padding: EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            color: AppColors.secondary,
            strokeWidth: 3,
          ),
          SizedBox(height: 20),
          Text(
            "Loading article...",
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Container(
        margin: EdgeInsets.all(24),
        padding: EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.paleGray),
          boxShadow: [
            BoxShadow(
              color: AppColors.lightGray.withOpacity(0.06),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            SizedBox(height: 16),
            Text(
              'Oops! Something went wrong',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            SizedBox(height: 8),
            Text(
              _errorMessage,
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _refreshData,
              icon: Icon(Icons.refresh),
              label: Text('Try again'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.secondary,
                foregroundColor: AppColors.textOnDark,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                elevation: 0,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyWidget() {
    return Center(
      child: Container(
        margin: EdgeInsets.all(24),
        padding: EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.paleGray),
          boxShadow: [
            BoxShadow(
              color: AppColors.lightGray.withOpacity(0.06),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.article_outlined,
              size: 64,
              color: AppColors.textSecondary,
            ),
            SizedBox(height: 16),
            Text(
              'No Blog Yet',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            SizedBox(height: 8),
            Text(
              _selectedCategoryId != null
                  ? 'There are no blogs in the selected category'
                  : 'There are no blogs available at this time',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBlogList() {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 24),
      itemCount: _blogs.length,
      itemBuilder: (context, index) {
        final blog = _blogs[index];
        return _buildBlogCard(blog);
      },
    );
  }

  Widget _buildBlogCard(Blog blog) {
    return GestureDetector(
      onTap: () => _showBlogDetail(blog),
      child: Container(
        margin: EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.paleGray),
          boxShadow: [
            BoxShadow(
              color: AppColors.lightGray.withOpacity(0.06),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image section
            ClipRRect(
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              child: Stack(
                children: [
                  Image.network(
                    blog.photoUrl,
                    width: double.infinity,
                    height: 180,
                    fit: BoxFit.cover,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return Container(
                        height: 180,
                        child: Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                                : null,
                            color: AppColors.secondary,
                            strokeWidth: 2,
                          ),
                        ),
                      );
                    },
                    errorBuilder: (context, error, stackTrace) => Container(
                      height: 180,
                      color: AppColors.surfaceVariant,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.image_not_supported_outlined,
                            size: 48,
                            color: AppColors.textSecondary,
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Image cannot be loaded',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding:
                          EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.darkGray.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        DateFormat('dd MMM yyyy').format(blog.createdAt),
                        style: TextStyle(
                          color: AppColors.textOnDark,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Content section
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    blog.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                      height: 1.3,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 8),

                  // Content preview
                  Text(
                    _stripHtmlTags(blog.content),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                  SizedBox(height: 12),

                  // Categories
                  if (blog.categories != null && blog.categories!.isNotEmpty)
                    Wrap(
                      spacing: 6.0,
                      runSpacing: 4.0,
                      children: blog.categories!.take(3).map((category) {
                        return Container(
                          padding:
                              EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.secondary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: AppColors.secondary.withOpacity(0.3)),
                          ),
                          child: Text(
                            category.name,
                            style: TextStyle(
                              color: AppColors.secondary,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        );
                      }).toList(),
                    )
                  else
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.paleGray),
                      ),
                      child: Text(
                        'Umum',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 10,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),

                  SizedBox(height: 12),

                  // Footer with read more
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.schedule,
                            size: 14,
                            color: AppColors.textTertiary,
                          ),
                          SizedBox(width: 4),
                          Text(
                            DateFormat('dd MMM yyyy').format(blog.updatedAt),
                            style: TextStyle(
                              color: AppColors.textTertiary,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.secondary,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Read more',
                              style: TextStyle(
                                color: AppColors.textOnDark,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(
                              Icons.arrow_forward,
                              color: AppColors.textOnDark,
                              size: 12,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.textOnPrimary.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child:
                  Icon(Icons.article, color: AppColors.textOnPrimary, size: 20),
            ),
            SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Blogs TSTH²',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textOnPrimary,
                  ),
                ),
                Text(
                  "Articles & News",
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.textOnPrimary.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.textOnPrimary.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child:
                  Icon(Icons.refresh, color: AppColors.textOnPrimary, size: 18),
            ),
            onPressed: _refreshData,
          ),
          SizedBox(width: 8),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.secondary,
        onRefresh: _refreshData,
        child: Column(
          children: [
            // Hero Section
            _buildHeroSection(),

            // Category Filter
            _buildCategoryFilter(),

            // Blog List
            Expanded(
              child: _isLoading
                  ? _buildLoadingState()
                  : _errorMessage.isNotEmpty
                      ? _buildErrorWidget()
                      : _blogs.isEmpty
                          ? _buildEmptyWidget()
                          : _buildBlogList(),
            ),
          ],
        ),
      ),
    );
  }
}
