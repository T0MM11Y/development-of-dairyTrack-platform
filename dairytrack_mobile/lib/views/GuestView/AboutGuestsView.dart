import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:url_launcher/url_launcher_string.dart';

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

class AboutGuestsView extends StatefulWidget {
  const AboutGuestsView({Key? key}) : super(key: key);

  @override
  _AboutGuestsViewState createState() => _AboutGuestsViewState();
}

class _AboutGuestsViewState extends State<AboutGuestsView>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late AnimationController _particleController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  final List<Map<String, dynamic>> statsData = [
    {
      'icon': Icons.show_chart,
      'value': '1000+',
      'label': 'Liters Milk/Day',
      'color': AppColors.primary,
    },
    {
      'icon': Icons.school,
      'value': '50+',
      'label': 'Trained Farmers',
      'color': AppColors.secondary,
    },
    {
      'icon': Icons.biotech,
      'value': '10+',
      'label': 'Genetic Research',
      'color': AppColors.accent,
    },
    {
      'icon': Icons.emoji_events,
      'value': '5+',
      'label': 'Cattle Awards',
      'color': AppColors.primary,
    },
  ];

  final List<Map<String, dynamic>> featuresData = [
    {
      'icon': Icons.local_drink,
      'title': 'Dairy Cattle',
      'description':
          'Focus on high-quality milk production through optimal nutrition management, health, and barn environment.',
      'color': AppColors.secondary,
      'url': 'https://id.wikipedia.org/wiki/Sapi_perah',
    },
    {
      'icon': Icons.biotech,
      'title': 'Girolando',
      'description':
          'Girolando cattle are the result of crossbreeding between Gir and Holstein cattle, combining tropical resistance with high milk productivity.',
      'color': AppColors.primary,
      'url': 'https://en.wikipedia.org/wiki/Girolando',
    },
    {
      'icon': Icons.health_and_safety,
      'title': 'Health & Nutrition',
      'description':
          'TSTH² applies research-based animal health and nutrition standards to ensure cattle welfare.',
      'color': AppColors.accent,
      'url':
          'https://www.fao.org/dairy-production-products/animal-health-and-welfare/en/',
    },
    {
      'icon': Icons.eco,
      'title': 'Green Environment',
      'description':
          'Commitment to sustainability by maintaining ecosystem balance and supporting environmentally friendly farming practices.',
      'color': AppColors.success,
      'url': 'https://www.fao.org/sustainability/en/',
    },
  ];

  final List<Map<String, dynamic>> girolandoFeatures = [
    {
      'icon': Icons.wb_sunny,
      'title': 'Climate Adaptability',
      'description': 'Heat and high humidity tolerance in tropical climates',
    },
    {
      'icon': Icons.shield,
      'title': 'Disease Resistance',
      'description': 'Resistance to tropical parasites and diseases',
    },
    {
      'icon': Icons.opacity,
      'title': 'Milk Production',
      'description': 'Average 15-25 liters/day with 4-5% fat content',
    },
    {
      'icon': Icons.calendar_month,
      'title': 'Lactation Period',
      'description': 'Lactation period of 275-305 days with good persistency',
    },
  ];

  final List<String> missionItems = [
    'Develop cattle management systems based on technology and data.',
    'Conduct research on nutrition, health, and cattle genetics to increase productivity.',
    'Increase farmer capacity through training and mentoring.',
    'Become a national and international collaboration center in cattle farming.',
  ];

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: Duration(milliseconds: 1500),
      vsync: this,
    );
    _particleController = AnimationController(
      duration: Duration(seconds: 20),
      vsync: this,
    )..repeat();

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: Offset(0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutBack,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _particleController.dispose();
    super.dispose();
  }

  Future<void> _launchURL(String url) async {
    try {
      final Uri uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
      } else {
        if (await canLaunchUrl(uri)) {
          await launchUrl(
            uri,
            mode: LaunchMode.inAppWebView,
          );
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Cannot open link: $url'),
                backgroundColor: AppColors.error,
                duration: Duration(seconds: 3),
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error opening link: ${e.toString()}'),
            backgroundColor: AppColors.error,
            duration: Duration(seconds: 3),
          ),
        );
      }
    }
  }

  Widget _buildFloatingParticles() {
    return AnimatedBuilder(
      animation: _particleController,
      builder: (context, child) {
        return Stack(
          children: List.generate(15, (index) {
            final progress = (_particleController.value + index * 0.1) % 1.0;
            final size = 2.0 + (index % 3) * 2.0;
            final opacity = 0.3 - (progress * 0.3);

            return Positioned(
              left: (index * 50.0) % MediaQuery.of(context).size.width,
              top: MediaQuery.of(context).size.height * progress,
              child: Opacity(
                opacity: opacity.clamp(0.0, 0.3),
                child: Container(
                  width: size,
                  height: size,
                  decoration: BoxDecoration(
                    color: AppColors.textOnPrimary,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            );
          }),
        );
      },
    );
  }

  Widget _buildHeroSection() {
    return Container(
      width: double.infinity,
      height: 360,
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
          // Floating particles
          _buildFloatingParticles(),
          // Content
          Positioned.fill(
            child: SafeArea(
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      FadeTransition(
                        opacity: _fadeAnimation,
                        child: SlideTransition(
                          position: _slideAnimation,
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
                                    Icon(Icons.verified,
                                        color: AppColors.accent, size: 14),
                                    SizedBox(width: 6),
                                    Flexible(
                                      child: Text(
                                        "Cattle Research Center",
                                        style: TextStyle(
                                          color: AppColors.accent,
                                          fontSize: 11,
                                          fontWeight: FontWeight.w600,
                                          letterSpacing: 0.5,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(height: 20),
                              // Main Title
                              Text(
                                "About Cattle at\nTSTH²",
                                style: TextStyle(
                                  color: AppColors.textOnPrimary,
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  height: 1.0,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              SizedBox(height: 12),
                              // Accent line
                              Container(
                                width: 80,
                                height: 3,
                                decoration: BoxDecoration(
                                  color: AppColors.accent,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              SizedBox(height: 16),
                              // Description
                              Text(
                                "TSTH² not only focuses on herbal plants and horticulture, but also serves as a center for dairy cattle development and research. We are committed to sustainable and modern cattle farming innovation.",
                                style: TextStyle(
                                  color:
                                      AppColors.textOnPrimary.withOpacity(0.9),
                                  fontSize: 14,
                                  height: 1.4,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                              SizedBox(height: 20),
                              // Features list
                              Column(
                                children: [
                                  "Genetic Research",
                                  "Modern Technology",
                                  "Sustainable"
                                ]
                                    .asMap()
                                    .entries
                                    .map((entry) => Container(
                                          margin: EdgeInsets.only(bottom: 6),
                                          child: Row(
                                            children: [
                                              Icon(
                                                Icons.check_circle,
                                                color: AppColors.textOnPrimary,
                                                size: 16,
                                              ),
                                              SizedBox(width: 8),
                                              Text(
                                                entry.value,
                                                style: TextStyle(
                                                  color:
                                                      AppColors.textOnPrimary,
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ))
                                    .toList(),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader({
    required String badge,
    required String title,
    required String description,
  }) {
    return Column(
      children: [
        Container(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: AppColors.secondary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(15),
          ),
          child: Text(
            badge,
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
          title,
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
          description,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: AppColors.textSecondary,
            fontSize: 15,
            height: 1.6,
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureCard(Map<String, dynamic> feature) {
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
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: feature['color'].withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                feature['icon'],
                size: 28,
                color: feature['color'],
              ),
            ),
            SizedBox(height: 16),
            Text(
              feature['title'],
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            SizedBox(height: 8),
            Text(
              feature['description'],
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
                height: 1.6,
              ),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => _launchURL(feature['url']),
              style: ElevatedButton.styleFrom(
                backgroundColor: feature['color'],
                foregroundColor: AppColors.textOnDark,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                elevation: 0,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "Learn More",
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward, size: 16),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard(Map<String, dynamic> stat) {
    return Container(
      padding: EdgeInsets.all(12),
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
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 48,
            height: 44,
            decoration: BoxDecoration(
              color: stat['color'].withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              stat['icon'],
              color: stat['color'],
              size: 24,
            ),
          ),
          SizedBox(height: 10),
          Text(
            stat['value'],
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          SizedBox(height: 4),
          Text(
            stat['label'],
            style: TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildGirolandoFeatureItem(Map<String, dynamic> feature) {
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(16),
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
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              feature['icon'],
              color: AppColors.primary,
              size: 24,
            ),
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  feature['title'],
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  feature['description'],
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMissionItem(String mission, int index) {
    return Container(
      margin: EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              Icons.check_circle,
              color: AppColors.secondary,
              size: 20,
            ),
          ),
          SizedBox(width: 16),
          Expanded(
            child: Text(
              mission,
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textPrimary,
                height: 1.6,
              ),
            ),
          ),
        ],
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
              child: Icon(Icons.info_outline,
                  color: AppColors.textOnPrimary, size: 20),
            ),
            SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'About TSTH²',
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
        automaticallyImplyLeading: false,
      ),
      body: RefreshIndicator(
        color: AppColors.secondary,
        onRefresh: () async {
          // Add refresh functionality if needed
          await Future.delayed(Duration(seconds: 1));
        },
        child: SingleChildScrollView(
          physics: AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              // Hero Section
              _buildHeroSection(),

              SizedBox(height: 40),

              // About Section
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: _buildSectionHeader(
                  badge: "ABOUT US",
                  title: "Leading Cattle Research &\nInnovation Center",
                  description:
                      "TSTH² develops data-based cattle farming technology and management, nutrition, and animal health to support local farmers in achieving optimal productivity.",
                ),
              ),

              SizedBox(height: 40),

              // Features Section
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: featuresData
                      .map((feature) => _buildFeatureCard(feature))
                      .toList(),
                ),
              ),

              SizedBox(height: 40),

              // Stats Section
              Container(
                padding: EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                ),
                child: Column(
                  children: [
                    _buildSectionHeader(
                      badge: "OUR ACHIEVEMENTS",
                      title: "Modern Cattle\nFarming Innovation",
                      description:
                          "We integrate digital technology for cattle monitoring, milk production recording, growth tracking, and health management.",
                    ),
                    SizedBox(height: 32),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 1.1,
                      ),
                      itemCount: statsData.length,
                      itemBuilder: (context, index) {
                        return _buildStatsCard(statsData[index]);
                      },
                    ),
                  ],
                ),
              ),

              SizedBox(height: 40),

              // Girolando Section
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    _buildSectionHeader(
                      badge: "SUPERIOR BREED",
                      title: "Girolando Breed\nDevelopment",
                      description:
                          "Girolando was first developed in Brazil and is now one of the main dairy cattle breeds in tropical regions.",
                    ),
                    SizedBox(height: 32),
                    Container(
                      width: double.infinity,
                      height: 200,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.lightGray.withOpacity(0.1),
                            blurRadius: 10,
                            offset: Offset(0, 5),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.asset(
                          'lib/assets/about.png',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    AppColors.secondary,
                                    AppColors.primary
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Icon(
                                Icons.pets,
                                size: 80,
                                color: AppColors.textOnPrimary,
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    SizedBox(height: 24),
                    Text(
                      "Girolando Breed Characteristics",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    SizedBox(height: 16),
                    Column(
                      children: girolandoFeatures
                          .map((feature) => _buildGirolandoFeatureItem(feature))
                          .toList(),
                    ),
                    SizedBox(height: 16),
                    Text(
                      "At TSTH², we maintain a Girolando population with a genetic ratio of 5/8 Holstein and 3/8 Gir that has proven optimal for Indonesian climate conditions.",
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textSecondary,
                        height: 1.6,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => _launchURL(
                                'https://openknowledge.fao.org/bitstreams/94676ea4-7091-4c52-adea-d23f573d0b50/download'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: AppColors.textOnDark,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(25),
                              ),
                              padding: EdgeInsets.symmetric(vertical: 12),
                              elevation: 0,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.book, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  "FAO Research",
                                  style: TextStyle(fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ),
                        SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => _launchURL(
                                'https://www.embrapa.br/en/gado-de-leite'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.surface,
                              foregroundColor: AppColors.secondary,
                              side: BorderSide(color: AppColors.secondary),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(25),
                              ),
                              padding: EdgeInsets.symmetric(vertical: 12),
                              elevation: 0,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.link, size: 20),
                                SizedBox(width: 8),
                                Text(
                                  "Embrapa",
                                  style: TextStyle(fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              SizedBox(height: 40),

              // Vision & Mission Section
              Container(
                padding: EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                ),
                child: Column(
                  children: [
                    _buildSectionHeader(
                      badge: "OUR COMMITMENT",
                      title: "Vision & Mission\nCattle Farming",
                      description:
                          "To become a center of excellence for research, innovation, and cattle development in Indonesia.",
                    ),
                    SizedBox(height: 32),
                    // Vision Card
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(20),
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
                          Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  Icons.lightbulb,
                                  color: AppColors.primary,
                                  size: 24,
                                ),
                              ),
                              SizedBox(width: 16),
                              Text(
                                "Vision",
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 16),
                          Text(
                            "To become a center of cattle farming research and innovation that produces technology and products to support national food security. We are committed to being a reference at national and regional levels in developing sustainable, efficient cattle farming with modern technology integration for farmer welfare and the independence of Indonesia's livestock industry.",
                            style: TextStyle(
                              fontSize: 16,
                              color: AppColors.textPrimary,
                              height: 1.6,
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 24),
                    // Mission Card
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(20),
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
                          Row(
                            children: [
                              Container(
                                width: 48,
                                height: 48,
                                decoration: BoxDecoration(
                                  color: AppColors.secondary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Icon(
                                  Icons.flag,
                                  color: AppColors.secondary,
                                  size: 24,
                                ),
                              ),
                              SizedBox(width: 16),
                              Text(
                                "Mission",
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 16),
                          Column(
                            children: missionItems
                                .asMap()
                                .entries
                                .map((entry) =>
                                    _buildMissionItem(entry.value, entry.key))
                                .toList(),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 80), // Extra space for bottom navigation
            ],
          ),
        ),
      ),
    );
  }
}
