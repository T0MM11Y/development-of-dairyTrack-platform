import 'package:dairytrack_mobile/controller/APIURL1/blogManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/galleryManagementController.dart';
import 'package:dairytrack_mobile/views/GuestView/AboutGuestsView.dart';
import 'package:dairytrack_mobile/views/GuestView/BlogGuestsView.dart';
import 'package:dairytrack_mobile/views/GuestView/GalleryGuestsView.dart';
import 'package:dairytrack_mobile/views/highlights/blogView.dart';
import 'package:dairytrack_mobile/views/highlights/galleryView.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'loginView.dart';
import '../controller/APIURL1/loginController.dart';

// Professional Corporate Color Scheme
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

class InitialDashboard extends StatefulWidget {
  @override
  _InitialDashboardState createState() => _InitialDashboardState();
}

class _InitialDashboardState extends State<InitialDashboard>
    with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  late AnimationController _animationController;

  // Controllers for fetching data
  final BlogManagementController _blogController = BlogManagementController();
  final GalleryManagementController _galleryController =
      GalleryManagementController();

  // Data lists
  List<Blog> _blogs = [];
  List<Gallery> _galleries = [];
  bool _isLoadingBlogs = true;
  bool _isLoadingGalleries = true;
  String _blogError = '';
  String _galleryError = '';

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 300),
    );
    _loadBlogsPreview();
    _loadGalleriesPreview();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadBlogsPreview() async {
    setState(() {
      _isLoadingBlogs = true;
      _blogError = '';
    });

    try {
      print('Loading blogs preview...');
      List<Blog> blogs = await _blogController.listBlogs();
      print('Blogs loaded: ${blogs.length}');

      setState(() {
        _blogs = blogs.take(3).toList();
        _isLoadingBlogs = false;
      });
    } catch (e) {
      print('Error loading blogs: $e');
      setState(() {
        _isLoadingBlogs = false;
        _blogError = e.toString();
      });
    }
  }

  Future<void> _loadGalleriesPreview() async {
    setState(() {
      _isLoadingGalleries = true;
      _galleryError = '';
    });

    try {
      print('Loading galleries preview...');
      List<Gallery> galleries = await _galleryController.listGalleries();
      print('Galleries loaded: ${galleries.length}');

      setState(() {
        _galleries = galleries.take(4).toList();
        _isLoadingGalleries = false;
      });
    } catch (e) {
      print('Error loading galleries: $e');
      setState(() {
        _isLoadingGalleries = false;
        _galleryError = e.toString();
      });
    }
  }

  String _stripHtmlTags(String htmlString) {
    if (htmlString.isEmpty) return htmlString;
    RegExp exp = RegExp(r"<[^>]*>", multiLine: true, caseSensitive: true);
    return htmlString.replaceAll(exp, '');
  }

  Widget _buildHeroSection() {
    return Container(
      width: double.infinity,
      height: 300,
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
            top: -50,
            right: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.textOnPrimary.withOpacity(0.05),
              ),
            ),
          ),
          Positioned(
            bottom: -30,
            left: -30,
            child: Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.textOnPrimary.withOpacity(0.08),
              ),
            ),
          ),
          // Professional grid pattern
          ...List.generate(15, (index) {
            return Positioned(
              left: (index % 5) * 80.0,
              top: 80 + (index ~/ 5) * 60.0,
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
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Badge
                    Container(
                      padding:
                          EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: AppColors.accent.withOpacity(0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified,
                              color: AppColors.accent, size: 14),
                          SizedBox(width: 6),
                          Text(
                            "Cattle Breeding Research Center",
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
                    SizedBox(height: 10),
                    // Main Title
                    Text(
                      "Modern Cattle\nFarming Innovation",
                      style: TextStyle(
                        color: AppColors.textOnPrimary,
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        height: 1.0,
                        letterSpacing: -0.5,
                      ),
                    ),
                    SizedBox(height: 10),
                    // Accent line
                    Container(
                      width: 80,
                      height: 3,
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    SizedBox(height: 20),
                    // Description
                    Text(
                      "Data-based livestock technology and management for the future of Indonesia's livestock industry",
                      style: TextStyle(
                        color: AppColors.textOnPrimary.withOpacity(0.9),
                        fontSize: 15,
                        height: 1.5,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    SizedBox(height: 10),
                    // CTA Button
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => AboutGuestsView()),
                        );
                      },
                      child: Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          borderRadius: BorderRadius.circular(25),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.accent.withOpacity(0.3),
                              blurRadius: 8,
                              offset: Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              "Explore Now",
                              style: TextStyle(
                                color: AppColors.textOnDark,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward,
                                color: AppColors.textOnDark, size: 16),
                          ],
                        ),
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

  Widget _buildAboutSection() {
    return Container(
      padding: EdgeInsets.all(24),
      child: Column(
        children: [
          // Section Header
          Column(
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.secondary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Text(
                  "TENTANG KAMI",
                  style: TextStyle(
                    color: AppColors.secondary,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
              SizedBox(height: 16),
              Text(
                "Leading Cattle Breeding\nResearch & Innovation Center",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  height: 1.2,
                ),
              ),
              SizedBox(height: 12),
              Container(
                width: 40,
                height: 3,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              SizedBox(height: 20),
              Text(
                "TSTH² develops data-based cattle farming technology and management, nutrition and animal health to support local farmers to achieve optimal productivity.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 15,
                  height: 1.6,
                ),
              ),
            ],
          ),
          SizedBox(height: 20),
          // Features Grid
          GridView.count(
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.1,
            children: [
              _buildFeatureCard(
                icon: Icons.local_drink_outlined,
                title: "Dairy cows",
                description: "Premium quality milk production",
                color: AppColors.primary,
              ),
              _buildFeatureCard(
                icon: Icons.biotech_outlined,
                title: "Girolando",
                description: "Superior crossbred breed",
                color: AppColors.secondary,
              ),
              _buildFeatureCard(
                icon: Icons.health_and_safety_outlined,
                title: "Health",
                description: "The best health & nutrition standards",
                color: AppColors.accent,
              ),
              _buildFeatureCard(
                icon: Icons.eco_outlined,
                title: "Sustainable",
                description: "Eco-friendly farming",
                color: AppColors.success,
              ),
            ],
          ),
          SizedBox(height: 32),
          // Stats Section
          Container(
            padding: EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.paleGray),
            ),
            child: Column(
              children: [
                Text(
                  "Our Achievements",
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildStatItem(
                        "200+", "Cattle Population", Icons.pets_outlined),
                    _buildStatItem(
                        "1000+", "Liters/Day", Icons.local_drink_outlined),
                    _buildStatItem("50+", "Breeder", Icons.people_outline),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.paleGray, width: 1),
        boxShadow: [
          BoxShadow(
            color: AppColors.lightGray.withOpacity(0.08),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 35,
            height: 35,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 6),
          Text(
            description,
            style: TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
              height: 1.3,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String value, String label, IconData icon) {
    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: AppColors.accent.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(icon, color: AppColors.accent, size: 28),
        ),
        SizedBox(height: 12),
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
        SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildBlogPreview() {
    return Container(
      padding: EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Latest Blogs",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    "Latest articles and news",
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              TextButton.icon(
                onPressed: () {
                  setState(() {
                    _currentIndex = 2;
                  });
                },
                icon: Icon(Icons.arrow_forward,
                    size: 16, color: AppColors.secondary),
                label: Text(
                  "See All",
                  style: TextStyle(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 20),
          _isLoadingBlogs
              ? _buildLoadingState("Loading blog...")
              : _blogError.isNotEmpty
                  ? _buildErrorState(
                      "Failed to load blog", _blogError, _loadBlogsPreview)
                  : _blogs.isEmpty
                      ? _buildEmptyState(Icons.article_outlined,
                          "There are no blogs available yet")
                      : ListView.builder(
                          shrinkWrap: true,
                          physics: NeverScrollableScrollPhysics(),
                          itemCount: _blogs.length,
                          itemBuilder: (context, index) {
                            final blog = _blogs[index];
                            return _buildBlogCard(blog);
                          },
                        ),
        ],
      ),
    );
  }

  Widget _buildBlogCard(Blog blog) {
    return Container(
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
          ClipRRect(
            borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
            child: Image.network(
              blog.photoUrl,
              height: 140,
              width: double.infinity,
              fit: BoxFit.cover,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return Container(
                  height: 140,
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
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  height: 140,
                  color: AppColors.surfaceVariant,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.image_not_supported_outlined,
                          color: AppColors.textSecondary, size: 32),
                      SizedBox(height: 8),
                      Text(
                        "Image cannot be loaded",
                        style: TextStyle(
                            color: AppColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
                Text(
                  _stripHtmlTags(blog.content),
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 12),
                Row(
                  children: [
                    Icon(Icons.schedule,
                        size: 14, color: AppColors.textTertiary),
                    SizedBox(width: 6),
                    Text(
                      DateFormat('dd MMM yyyy').format(blog.createdAt),
                      style: TextStyle(
                        fontSize: 12,
                        color: AppColors.textTertiary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGalleryPreview() {
    return Container(
      padding: EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Gallery",
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    "Visual documentation of activities",
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              TextButton.icon(
                onPressed: () {
                  setState(() {
                    _currentIndex = 3;
                  });
                },
                icon: Icon(Icons.arrow_forward,
                    size: 16, color: AppColors.secondary),
                label: Text(
                  "See All",
                  style: TextStyle(
                    color: AppColors.secondary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 20),
          _isLoadingGalleries
              ? _buildLoadingState("Loading gallery...")
              : _galleryError.isNotEmpty
                  ? _buildErrorState("Failed to load gallery", _galleryError,
                      _loadGalleriesPreview)
                  : _galleries.isEmpty
                      ? _buildEmptyState(Icons.photo_library_outlined,
                          "There are no galleries available yet")
                      : GridView.builder(
                          shrinkWrap: true,
                          physics: NeverScrollableScrollPhysics(),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 1,
                          ),
                          itemCount: _galleries.length,
                          itemBuilder: (context, index) {
                            final gallery = _galleries[index];
                            return _buildGalleryCard(gallery);
                          },
                        ),
        ],
      ),
    );
  }

  Widget _buildGalleryCard(Gallery gallery) {
    return Container(
      decoration: BoxDecoration(
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
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            Image.network(
              gallery.imageUrl,
              width: double.infinity,
              height: double.infinity,
              fit: BoxFit.cover,
              loadingBuilder: (context, child, loadingProgress) {
                if (loadingProgress == null) return child;
                return Container(
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
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: AppColors.surfaceVariant,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.image_not_supported_outlined,
                          color: AppColors.textSecondary, size: 32),
                      SizedBox(height: 8),
                      Text(
                        "Image cannot be loaded",
                        style: TextStyle(
                            color: AppColors.textSecondary, fontSize: 10),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                );
              },
            ),
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      AppColors.darkGray.withOpacity(0.8),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Text(
                  gallery.title,
                  style: TextStyle(
                    color: AppColors.textOnDark,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingState(String message) {
    return Container(
      height: 200,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
                color: AppColors.secondary, strokeWidth: 2),
            SizedBox(height: 16),
            Text(message, style: TextStyle(color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String title, String error, VoidCallback onRetry) {
    return Container(
      height: 200,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: AppColors.error),
            SizedBox(height: 16),
            Text(title,
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary)),
            SizedBox(height: 8),
            Text(error,
                style: TextStyle(color: AppColors.textSecondary),
                textAlign: TextAlign.center),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRetry,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.secondary,
                foregroundColor: AppColors.textOnDark,
                elevation: 0,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
              child: Text("Try again"),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(IconData icon, String message) {
    return Container(
      height: 200,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: AppColors.lightGray),
            SizedBox(height: 16),
            Text(message,
                style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildHomeContent() {
    return RefreshIndicator(
      color: AppColors.secondary,
      onRefresh: () async {
        await Future.wait([
          _loadBlogsPreview(),
          _loadGalleriesPreview(),
        ]);
      },
      child: SingleChildScrollView(
        physics: AlwaysScrollableScrollPhysics(),
        child: Column(
          children: [
            _buildHeroSection(),
            _buildAboutSection(),
            _buildBlogPreview(),
            _buildGalleryPreview(),
            SizedBox(height: 80), // Reduced bottom spacing
          ],
        ),
      ),
    );
  }

  Widget _buildContentSection() {
    switch (_currentIndex) {
      case 0:
        return _buildHomeContent();
      case 1:
        return AboutGuestsView();
      case 2:
        return BlogGuestsView();
      case 3:
        return GalleryGuestsView();
      default:
        return _buildHomeContent();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _currentIndex == 1 || _currentIndex == 2 || _currentIndex == 3
          ? null
          : AppBar(
              automaticallyImplyLeading: false, // This removes the back arrow
              title: Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.textOnPrimary.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.pets,
                        color: AppColors.textOnPrimary, size: 20),
                  ),
                  SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "TSTH² DairyTrack",
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textOnPrimary,
                        ),
                      ),
                      Text(
                        "Cattle Research Center",
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
              actions: [
                IconButton(
                  icon: Container(
                    padding: EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.textOnPrimary.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(Icons.refresh,
                        color: AppColors.textOnPrimary, size: 18),
                  ),
                  onPressed: () async {
                    await Future.wait([
                      _loadBlogsPreview(),
                      _loadGalleriesPreview(),
                    ]);
                  },
                ),
                SizedBox(width: 8),
              ],
            ),
      body: _buildContentSection(),
      floatingActionButton: _currentIndex == 0 ||
              _currentIndex == 1 ||
              _currentIndex == 2 ||
              _currentIndex == 3
          ? FloatingActionButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => LoginView()),
                );
              },
              backgroundColor: AppColors.accent,
              elevation: 4,
              child: Icon(Icons.login, color: AppColors.textOnDark, size: 24),
            )
          : null,
      // Compact Bottom Navigation Bar
      bottomNavigationBar: Container(
        height: 60, // Reduced height from default ~80
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: Border(
            top: BorderSide(color: AppColors.paleGray, width: 1),
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.darkGray.withOpacity(0.08),
              blurRadius: 8,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.transparent,
          elevation: 0,
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textTertiary,
          selectedFontSize: 10, // Reduced font size
          unselectedFontSize: 9, // Reduced font size
          iconSize: 20, // Reduced icon size
          items: [
            BottomNavigationBarItem(
              icon: Container(
                padding: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                decoration: BoxDecoration(
                  color: _currentIndex == 0
                      ? AppColors.primary.withOpacity(0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _currentIndex == 0 ? Icons.home : Icons.home_outlined,
                  size: 20,
                ),
              ),
              label: 'Home page',
            ),
            BottomNavigationBarItem(
              icon: Container(
                padding: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                decoration: BoxDecoration(
                  color: _currentIndex == 1
                      ? AppColors.primary.withOpacity(0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _currentIndex == 1 ? Icons.info : Icons.info_outline,
                  size: 20,
                ),
              ),
              label: 'About',
            ),
            BottomNavigationBarItem(
              icon: Container(
                padding: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                decoration: BoxDecoration(
                  color: _currentIndex == 2
                      ? AppColors.primary.withOpacity(0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _currentIndex == 2 ? Icons.article : Icons.article_outlined,
                  size: 20,
                ),
              ),
              label: 'Blogs',
            ),
            BottomNavigationBarItem(
              icon: Container(
                padding: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                decoration: BoxDecoration(
                  color: _currentIndex == 3
                      ? AppColors.primary.withOpacity(0.1)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _currentIndex == 3
                      ? Icons.photo_library
                      : Icons.photo_library_outlined,
                  size: 20,
                ),
              ),
              label: 'Gallery',
            ),
          ],
        ),
      ),
    );
  }
}
