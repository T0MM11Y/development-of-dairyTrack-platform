import 'package:flutter/material.dart';

// Import all views
import '../views/loginView.dart';
import '../views/initialAdminDashboard.dart';
import '../views/initialFarmerDashboard.dart';
import '../views/initialSupervisorDashboard.dart';
import '../views/milkingView.dart';
import '../views/cattleDistribution.dart';

// Cow Management Views
import '../views/cowManagement/listOfCowsView.dart';

// User Management Views
import '../views/usersManagement/listOfUsersView.dart';

// Highlights Views
import '../views/highlights/blogView.dart';
import '../views/highlights/blogDetailView.dart';
import '../views/highlights/galleryView.dart';

// Guest Views
import '../views/GuestView/GalleryGuestsView.dart';

class AppRoutes {
  // Route names
  static const String login = '/login';
  static const String adminDashboard = '/admin-dashboard';
  static const String farmerDashboard = '/farmer-dashboard';
  static const String supervisorDashboard = '/supervisor-dashboard';
  static const String milking = '/milking';
  static const String cattleDistribution = '/cattle-distribution';

  // Cow Management Routes
  static const String cowList = '/cows';
  static const String cowAdd = '/cows/add';
  static const String cowEdit = '/cows/edit';

  // User Management Routes
  static const String userList = '/users';
  static const String userAdd = '/users/add';
  static const String userEdit = '/users/edit';

  // Highlights Routes
  static const String blog = '/blog';
  static const String blogDetail = '/blog/detail';
  static const String gallery = '/gallery';

  // Guest Routes
  static const String guestGallery = '/guest/gallery';

  // Route generator
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case login:
        return MaterialPageRoute(
          builder: (_) => LoginView(),
          settings: settings,
        );

      case adminDashboard:
        return MaterialPageRoute(
          builder: (_) => InitialAdminDashboard(),
          settings: settings,
        );

      case farmerDashboard:
        return MaterialPageRoute(
          builder: (_) => InitialFarmerDashboard(),
          settings: settings,
        );

      case milking:
        return MaterialPageRoute(
          builder: (_) => MilkingView(),
          settings: settings,
        );
      case supervisorDashboard:
        return MaterialPageRoute(
          builder: (_) => InitialSupervisorDashboard(),
          settings: settings,
        );

      case cattleDistribution:
        return MaterialPageRoute(
          builder: (_) => CattleDistribution(),
          settings: settings,
        );

      // Cow Management Routes
      case cowList:
        return MaterialPageRoute(
          builder: (_) => ListOfCowsView(),
          settings: settings,
        );

      // User Management Routes
      case userList:
        return MaterialPageRoute(
          builder: (_) => ListOfUsersView(),
          settings: settings,
        );

      // Highlights Routes
      case blog:
        return MaterialPageRoute(
          builder: (_) => BlogView(),
          settings: settings,
        );

      case blogDetail:
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => BlogDetailView(
            blog: args?['blog'],
          ),
          settings: settings,
        );

      case gallery:
        return MaterialPageRoute(
          builder: (_) => GalleryView(),
          settings: settings,
        );

      // Guest Routes
      case guestGallery:
        return MaterialPageRoute(
          builder: (_) => GalleryGuestsView(),
          settings: settings,
        );

      // Default route (fallback)
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            appBar: AppBar(
              title: Text('Page Not Found'),
              backgroundColor: Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
            ),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Color(0xFFEF4444),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Page Not Found',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF111827),
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'The page "${settings.name}" does not exist.',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF6B7280),
                    ),
                  ),
                  SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () =>
                        Navigator.of(_).pushReplacementNamed(login),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding:
                          EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text('Go to Login'),
                  ),
                ],
              ),
            ),
          ),
          settings: settings,
        );
    }
  }

  // Navigation helper methods
  static Future<dynamic> pushNamed(BuildContext context, String routeName,
      {Object? arguments}) {
    return Navigator.of(context).pushNamed(routeName, arguments: arguments);
  }

  static Future<dynamic> pushReplacementNamed(
      BuildContext context, String routeName,
      {Object? arguments}) {
    return Navigator.of(context)
        .pushReplacementNamed(routeName, arguments: arguments);
  }

  static Future<dynamic> pushNamedAndRemoveUntil(
      BuildContext context, String routeName,
      {Object? arguments}) {
    return Navigator.of(context).pushNamedAndRemoveUntil(
      routeName,
      (route) => false,
      arguments: arguments,
    );
  }

  static void pop(BuildContext context, [dynamic result]) {
    Navigator.of(context).pop(result);
  }

  // Role-based navigation helpers
  static void navigateBasedOnRole(BuildContext context, String role) {
    switch (role.toLowerCase()) {
      case 'admin':
        pushReplacementNamed(context, adminDashboard);
        break;
      case 'farmer':
        pushReplacementNamed(context, farmerDashboard);
        break;
      case 'supervisor':
        pushReplacementNamed(context, supervisorDashboard);
        break;
      default:
        pushReplacementNamed(context, login);
        break;
    }
  }

  // Quick access methods for frequently used routes
  static void goToLogin(BuildContext context) {
    pushNamedAndRemoveUntil(context, login);
  }

  static void goToCowManagement(BuildContext context) {
    pushNamed(context, cowList);
  }

  static void goToUserManagement(BuildContext context) {
    pushNamed(context, userList);
  }

  static void goToBlog(BuildContext context) {
    pushNamed(context, blog);
  }

  static void goToGallery(BuildContext context) {
    pushNamed(context, gallery);
  }

  static void goToMilking(BuildContext context) {
    pushNamed(context, milking);
  }

  static void goToCattleDistribution(BuildContext context) {
    pushNamed(context, cattleDistribution);
  }

  // Edit/Add helpers
  static void editCow(BuildContext context, dynamic cow) {
    pushNamed(context, cowEdit, arguments: {'cow': cow});
  }

  static void addCow(BuildContext context) {
    pushNamed(context, cowAdd);
  }

  static void editUser(BuildContext context, dynamic user) {
    pushNamed(context, userEdit, arguments: {'user': user});
  }

  static void addUser(BuildContext context) {
    pushNamed(context, userAdd);
  }

  static void viewBlogDetail(BuildContext context, dynamic blog) {
    pushNamed(context, blogDetail, arguments: {'blog': blog});
  }
}
