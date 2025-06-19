import 'package:dairytrack_mobile/views/initialAdminDashboard.dart'
    as admin_dashboard;
import 'package:dairytrack_mobile/views/initialFarmerDashboard.dart';
import 'package:dairytrack_mobile/views/initialSupervisorDashboard.dart'
    as supervisor_dashboard;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../controller/APIURL1/loginController.dart';
import '../routes/route.dart';
import 'dart:async';

// Compact Retro Color Scheme
class RetroAppColors {
  static const Color primary = Color(0xFF1E3A8A);
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color primaryDark = Color(0xFF0F172A);
  static const Color secondary = Color(0xFFFF6B35);
  static const Color secondaryLight = Color(0xFFFF8C42);
  static const Color secondaryDark = Color(0xFFE55039);
  static const Color accent = Color(0xFFFFC300);
  static const Color accentLight = Color(0xFFFFD60A);
  static const Color accentDark = Color(0xFFFFB700);
  static const Color darkGray = Color(0xFF2C2C2C);
  static const Color mediumGray = Color(0xFF4A4A4A);
  static const Color lightGray = Color(0xFF7A7A7A);
  static const Color softGray = Color(0xFFA8A8A8);
  static const Color paleGray = Color(0xFFE8E8E8);
  static const Color background = Color(0xFFF5F5DC);
  static const Color success = Color(0xFF2ECC71);
  static const Color error = Color(0xFFE74C3C);
  static const Color warning = Color(0xFFF39C12);
  static const Color info = Color(0xFF3498DB);
  static const Color surface = Color(0xFFFFFFF0);
  static const Color surfaceVariant = Color(0xFFF8F8F0);
  static const Color textPrimary = Color(0xFF2C2C2C);
  static const Color textSecondary = Color(0xFF4A4A4A);
  static const Color textTertiary = Color(0xFF7A7A7A);
  static const Color textOnPrimary = Colors.white;
  static const Color textOnDark = Colors.white;
}

enum UserRole {
  admin,
  farmer,
  supervisor,
  unknown;

  static UserRole fromString(String roleString) {
    final role = roleString.toLowerCase();
    if (role.contains('admin') || role.contains('administrator')) {
      return UserRole.admin;
    } else if (role.contains('farmer') || role.contains('peternak')) {
      return UserRole.farmer;
    } else if (role.contains('supervisor')) {
      return UserRole.supervisor;
    }
    return UserRole.unknown;
  }

  String get dashboardType {
    switch (this) {
      case UserRole.admin:
        return 'Admin';
      case UserRole.farmer:
        return 'Farmer';
      case UserRole.supervisor:
        return 'Supervisor';
      case UserRole.unknown:
        return 'Admin';
    }
  }

  String get dashboardRoute {
    switch (this) {
      case UserRole.admin:
        return AppRoutes.adminDashboard;
      case UserRole.farmer:
        return AppRoutes.farmerDashboard;
      case UserRole.supervisor:
        return AppRoutes.supervisorDashboard;
      case UserRole.unknown:
        return AppRoutes.adminDashboard;
    }
  }

  Widget get dashboard {
    switch (this) {
      case UserRole.admin:
        return admin_dashboard.InitialAdminDashboard();
      case UserRole.farmer:
        return InitialFarmerDashboard();
      case UserRole.supervisor:
        return supervisor_dashboard.InitialSupervisorDashboard();
      case UserRole.unknown:
        return admin_dashboard.InitialAdminDashboard();
    }
  }

  String get redirectMessage {
    switch (this) {
      case UserRole.admin:
        return "Mengarahkan ke Admin Dashboard";
      case UserRole.farmer:
        return "Mengarahkan ke Farmer Dashboard";
      case UserRole.supervisor:
        return "Mengarahkan ke Supervisor Dashboard";
      case UserRole.unknown:
        return "Mengarahkan ke Dashboard";
    }
  }
}

class LoginSecurityManager {
  static const int maxFailedAttempts = 3;
  static const int lockDurationSeconds = 30;

  int _failedAttempts = 0;
  bool _isLocked = false;
  Timer? _lockTimer;
  int _lockDuration = lockDurationSeconds;

  int get failedAttempts => _failedAttempts;
  bool get isLocked => _isLocked;
  int get lockDuration => _lockDuration;

  void incrementFailedAttempts() {
    _failedAttempts++;
    if (_failedAttempts >= maxFailedAttempts) {
      _lockAccount();
    }
  }

  void resetFailedAttempts() => _failedAttempts = 0;

  void _lockAccount() {
    _isLocked = true;
    _lockDuration = lockDurationSeconds;
  }

  void startLockTimer(VoidCallback onTick) {
    _lockTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_lockDuration > 0) {
        _lockDuration--;
        onTick();
      } else {
        _unlock();
        timer.cancel();
      }
    });
  }

  void _unlock() {
    _isLocked = false;
    _failedAttempts = 0;
    _lockDuration = lockDurationSeconds;
  }

  void dispose() => _lockTimer?.cancel();
}

class UserDataManager {
  static Future<void> saveUserData(Map<String, dynamic> response) async {
    final prefs = await SharedPreferences.getInstance();

    try {
      final requiredFields = [
        'user_id',
        'name',
        'username',
        'email',
        'role',
        'token'
      ];
      for (final field in requiredFields) {
        if (!response.containsKey(field) || response[field] == null) {
          throw Exception('Missing required field: $field');
        }
      }

      await prefs.setInt('userId', response['user_id'] as int);
      await prefs.setString('userName', response['name'] as String);
      await prefs.setString('userUsername', response['username'] as String);
      await prefs.setString('userEmail', response['email'] as String);
      await prefs.setString('userRole', response['role'] as String);
      await prefs.setString('userToken', response['token'] as String);

      final userRole = UserRole.fromString(response['role'] as String);
      await prefs.setString('dashboardType', userRole.dashboardType);
      await prefs.setString('loginTimestamp', DateTime.now().toIso8601String());
    } catch (e) {
      debugPrint('Error saving user data: $e');
      rethrow;
    }
  }
}

class LoginView extends StatefulWidget {
  const LoginView({Key? key}) : super(key: key);

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> with TickerProviderStateMixin {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final LoginController _loginController = LoginController();
  late final LoginSecurityManager _securityManager;

  bool _showPassword = false;
  bool _isLoading = false;
  bool _isRedirecting = false;
  bool _loginSuccess = false;

  late AnimationController _animationController;
  late AnimationController _retroAnimationController;
  late AnimationController _redirectController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _retroGlowAnimation;
  late Animation<double> _redirectFadeAnimation;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    _securityManager = LoginSecurityManager();
    _initializeAnimations();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _retroAnimationController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);

    _redirectController = AnimationController(
      duration: const Duration(milliseconds: 1800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(parent: _animationController, curve: Curves.easeInOut));

    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
            CurvedAnimation(
                parent: _animationController, curve: Curves.easeOutBack));

    _retroGlowAnimation = Tween<double>(begin: 0.3, end: 1.0).animate(
        CurvedAnimation(
            parent: _retroAnimationController, curve: Curves.easeInOut));

    _redirectFadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
            parent: _redirectController,
            curve: Interval(0.0, 0.3, curve: Curves.easeOut)));

    _progressAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
        CurvedAnimation(
            parent: _redirectController,
            curve: Interval(0.4, 1.0, curve: Curves.easeInOut)));

    _animationController.forward();
  }

  String? _validateInput(String username, String password) {
    if (username.isEmpty || password.isEmpty) {
      return "Username dan password tidak boleh kosong.";
    }
    if (username.length < 3) return "Username minimal 3 karakter.";
    if (password.length < 6) return "Password minimal 6 karakter.";
    return null;
  }

  Future<void> _handleLogin() async {
    if (_securityManager.isLocked) {
      _showRetroAlert("Login Terkunci",
          "Terlalu banyak percobaan gagal. Silakan tunggu ${_securityManager.lockDuration} detik.",
          isError: true);
      return;
    }

    final username = _usernameController.text.trim();
    final password = _passwordController.text;
    final validationError = _validateInput(username, password);

    if (validationError != null) {
      _showRetroAlert("Error", validationError, isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await _loginController.login(username, password);
      if (!mounted) return;
      setState(() => _isLoading = false);
      await _handleLoginResponse(response);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _showRetroAlert("Error", "Terjadi kesalahan jaringan. Silakan coba lagi.",
          isError: true);
    }
  }

  Future<void> _handleLoginResponse(Map<String, dynamic> response) async {
    if (response['success'] == true) {
      await _handleSuccessfulLogin(response);
    } else {
      _handleFailedLogin(response);
    }
  }

  Future<void> _handleSuccessfulLogin(Map<String, dynamic> response) async {
    _securityManager.resetFailedAttempts();

    try {
      await UserDataManager.saveUserData(response);
      final userRole = UserRole.fromString(response['role']?.toString() ?? '');

      setState(() => _loginSuccess = true);
      await Future.delayed(const Duration(milliseconds: 400));
      setState(() => _isRedirecting = true);
      _redirectController.forward();
      await Future.delayed(const Duration(milliseconds: 2000));

      if (mounted) _navigateToDashboard(userRole, response);
    } catch (e) {
      setState(() {
        _loginSuccess = false;
        _isRedirecting = false;
      });
      _showRetroAlert(
          "Error", "Gagal menyimpan data pengguna. Silakan coba lagi.",
          isError: true);
    }
  }

  void _handleFailedLogin(Map<String, dynamic> response) {
    _securityManager.incrementFailedAttempts();
    _showRetroAlert(
        "Login Gagal", response['message'] ?? "Username atau password salah.",
        isError: true);

    if (_securityManager.isLocked) {
      _securityManager.startLockTimer(() {
        if (mounted) setState(() {});
      });
    }
    setState(() {});
  }

  void _navigateToDashboard(UserRole userRole, Map<String, dynamic> response) {
    AppRoutes.pushNamedAndRemoveUntil(context, userRole.dashboardRoute,
        arguments: {
          'userRole': userRole.dashboardType,
          'userName': response['name'],
          'userEmail': response['email'],
          'userId': response['user_id'],
        });
  }

  void _showRetroAlert(String title, String message,
      {required bool isError, VoidCallback? onClose}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: Container(
            constraints: const BoxConstraints(maxWidth: 300),
            decoration: BoxDecoration(
              color: RetroAppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                  color:
                      isError ? RetroAppColors.error : RetroAppColors.success,
                  width: 2),
              boxShadow: [
                BoxShadow(
                  color:
                      (isError ? RetroAppColors.error : RetroAppColors.success)
                          .withOpacity(0.25),
                  blurRadius: 15,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color:
                        isError ? RetroAppColors.error : RetroAppColors.success,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(14),
                      topRight: Radius.circular(14),
                    ),
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: RetroAppColors.surface,
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(
                              color: RetroAppColors.surface, width: 2),
                        ),
                        child: Icon(
                          isError
                              ? Icons.error_outline
                              : Icons.check_circle_outline,
                          color: isError
                              ? RetroAppColors.error
                              : RetroAppColors.success,
                          size: 24,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: RetroAppColors.textOnDark,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Text(
                        message,
                        style: const TextStyle(
                          fontSize: 14,
                          color: RetroAppColors.textPrimary,
                          height: 1.4,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      Container(
                        width: double.infinity,
                        height: 40,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              RetroAppColors.accent,
                              RetroAppColors.accentLight
                            ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: RetroAppColors.accentDark, width: 1),
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              Navigator.of(context).pop();
                              onClose?.call();
                            },
                            borderRadius: BorderRadius.circular(20),
                            child: const Center(
                              child: Text(
                                "OK",
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: RetroAppColors.textOnDark,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRetroRedirectOverlay() {
    return AnimatedBuilder(
      animation: _redirectController,
      builder: (context, child) {
        if (!_isRedirecting) return const SizedBox.shrink();

        return Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [RetroAppColors.primary, RetroAppColors.primaryLight],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Center(
            child: FadeTransition(
              opacity: _redirectFadeAnimation,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              RetroAppColors.accent.withOpacity(0.3),
                              Colors.transparent
                            ],
                          ),
                        ),
                      ),
                      Container(
                        width: 70,
                        height: 60,
                        decoration: BoxDecoration(
                          color: RetroAppColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                              color: RetroAppColors.accent, width: 3),
                          boxShadow: [
                            BoxShadow(
                              color: RetroAppColors.accent.withOpacity(0.4),
                              blurRadius: 15,
                              offset: const Offset(0, 0),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(11),
                          child: Image.asset(
                            'lib/assets/logo.png',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(Icons.pets,
                                  color: RetroAppColors.primary, size: 25);
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: RetroAppColors.accent.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                      border:
                          Border.all(color: RetroAppColors.accent, width: 1),
                    ),
                    child: Text(
                      UserRole.fromString(_usernameController.text)
                          .redirectMessage,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: RetroAppColors.textOnDark,
                        letterSpacing: 0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Mohon tunggu sebentar...",
                    style: TextStyle(
                      fontSize: 14,
                      color: RetroAppColors.textOnDark.withOpacity(0.9),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Container(
                    width: 200,
                    height: 8,
                    decoration: BoxDecoration(
                      color: RetroAppColors.textOnDark.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: AnimatedBuilder(
                      animation: _progressAnimation,
                      builder: (context, child) {
                        return Container(
                          width: 200 * _progressAnimation.value,
                          height: 8,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                RetroAppColors.accent,
                                RetroAppColors.accentLight
                              ],
                            ),
                            borderRadius: BorderRadius.circular(4),
                            boxShadow: [
                              BoxShadow(
                                color: RetroAppColors.accent.withOpacity(0.5),
                                blurRadius: 6,
                                offset: const Offset(0, 0),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                  AnimatedBuilder(
                    animation: _progressAnimation,
                    builder: (context, child) {
                      return Text(
                        "${(_progressAnimation.value * 100).toInt()}%",
                        style: const TextStyle(
                          fontSize: 14,
                          color: RetroAppColors.textOnDark,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 1,
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildRetroBackground() {
    return Stack(
      children: [
        Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [RetroAppColors.primary, RetroAppColors.primaryLight],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        Positioned(
          top: -60,
          right: -60,
          child: AnimatedBuilder(
            animation: _retroGlowAnimation,
            builder: (context, child) {
              return Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: RetroAppColors.accent
                      .withOpacity(0.08 * _retroGlowAnimation.value),
                ),
              );
            },
          ),
        ),
        Positioned(
          bottom: -40,
          left: -40,
          child: AnimatedBuilder(
            animation: _retroGlowAnimation,
            builder: (context, child) {
              return Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: RetroAppColors.secondary
                      .withOpacity(0.12 * _retroGlowAnimation.value),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRetroInputField({
    required TextEditingController controller,
    required String labelText,
    required IconData prefixIcon,
    bool obscureText = false,
    bool showSuffixIcon = false,
    VoidCallback? onSuffixIconPressed,
    TextInputType? keyboardType,
  }) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: RetroAppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: RetroAppColors.accent, width: 2),
        boxShadow: [
          BoxShadow(
            color: RetroAppColors.accent.withOpacity(0.15),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        obscureText: obscureText,
        keyboardType: keyboardType,
        enabled: !_isLoading && !_isRedirecting,
        style: const TextStyle(
          color: RetroAppColors.textPrimary,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          labelText: labelText,
          labelStyle: const TextStyle(
            color: RetroAppColors.textSecondary,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
          prefixIcon: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [RetroAppColors.accent, RetroAppColors.accentLight],
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(prefixIcon, color: RetroAppColors.textOnDark, size: 18),
          ),
          suffixIcon: showSuffixIcon
              ? IconButton(
                  icon: Icon(
                    obscureText ? Icons.visibility : Icons.visibility_off,
                    color: RetroAppColors.secondary,
                    size: 18,
                  ),
                  onPressed: onSuffixIconPressed,
                )
              : null,
          border: InputBorder.none,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          floatingLabelBehavior: FloatingLabelBehavior.never,
        ),
      ),
    );
  }

  Widget _buildRetroButton() {
    return Container(
      width: double.infinity,
      height: 46,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: _loginSuccess
              ? [RetroAppColors.success, RetroAppColors.success]
              : [RetroAppColors.secondary, RetroAppColors.secondaryLight],
        ),
        borderRadius: BorderRadius.circular(23),
        border: Border.all(
          color: _loginSuccess
              ? RetroAppColors.success
              : RetroAppColors.secondaryDark,
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: (_loginSuccess
                    ? RetroAppColors.success
                    : RetroAppColors.secondary)
                .withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _isLoading ||
                  _securityManager.isLocked ||
                  _loginSuccess ||
                  _isRedirecting
              ? null
              : _handleLogin,
          borderRadius: BorderRadius.circular(23),
          child: Container(
            alignment: Alignment.center,
            child: _loginSuccess
                ? const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle,
                          color: RetroAppColors.textOnDark, size: 18),
                      SizedBox(width: 8),
                      Text(
                        "LOGIN BERHASIL!",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: RetroAppColors.textOnDark,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  )
                : _isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                              RetroAppColors.textOnDark),
                        ),
                      )
                    : Text(
                        _securityManager.isLocked
                            ? "LOCKED (${_securityManager.lockDuration}s)"
                            : "ENTER",
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: RetroAppColors.textOnDark,
                          letterSpacing: 0.5,
                        ),
                      ),
          ),
        ),
      ),
    );
  }

  Widget _buildRetroFailedAttemptsIndicator() {
    if (_securityManager.failedAttempts <= 0) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: RetroAppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: RetroAppColors.error, width: 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: RetroAppColors.error,
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Icon(Icons.warning_amber_rounded,
                color: RetroAppColors.textOnDark, size: 16),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "WARNING!",
                  style: TextStyle(
                    color: RetroAppColors.error,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  "The experiment failed: ${_securityManager.failedAttempts}/${LoginSecurityManager.maxFailedAttempts}",
                  style: const TextStyle(
                    color: RetroAppColors.error,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRetroLoginForm() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: RetroAppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: RetroAppColors.accent, width: 2),
        boxShadow: [
          BoxShadow(
            color: RetroAppColors.accent.withOpacity(0.2),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [RetroAppColors.accent, RetroAppColors.accentLight],
              ),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: RetroAppColors.accentDark, width: 1),
            ),
            child: const Text(
              "Welcome Back!",
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: RetroAppColors.textOnDark,
                letterSpacing: 1,
              ),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            "Log in to your account to continue",
            style: TextStyle(
              fontSize: 12,
              color: RetroAppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 20),
          _buildRetroInputField(
            controller: _usernameController,
            labelText: "Username",
            prefixIcon: Icons.person_outline,
            keyboardType: TextInputType.text,
          ),
          const SizedBox(height: 16),
          _buildRetroInputField(
            controller: _passwordController,
            labelText: "Password",
            prefixIcon: Icons.lock_outline,
            obscureText: !_showPassword,
            showSuffixIcon: true,
            onSuffixIconPressed: () =>
                setState(() => _showPassword = !_showPassword),
          ),
          const SizedBox(height: 20),
          _buildRetroButton(),
          _buildRetroFailedAttemptsIndicator(),
        ],
      ),
    );
  }

  Widget _buildRetroLogoSection() {
    return AnimatedBuilder(
      animation: _retroGlowAnimation,
      builder: (context, child) {
        return Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: RetroAppColors.surface.withOpacity(0.9),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: RetroAppColors.accent, width: 2),
            boxShadow: [
              BoxShadow(
                color: RetroAppColors.accent
                    .withOpacity(0.3 * _retroGlowAnimation.value),
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            children: [
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          RetroAppColors.accent
                              .withOpacity(0.2 * _retroGlowAnimation.value),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: RetroAppColors.surface,
                      borderRadius: BorderRadius.circular(12),
                      border:
                          Border.all(color: RetroAppColors.primary, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: RetroAppColors.primary.withOpacity(0.2),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.asset(
                        'lib/assets/logo.png',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return const Icon(Icons.pets,
                              color: RetroAppColors.primary, size: 30);
                        },
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [
                      RetroAppColors.primary,
                      RetroAppColors.primaryLight
                    ],
                  ),
                  borderRadius: BorderRadius.circular(10),
                  border:
                      Border.all(color: RetroAppColors.primaryDark, width: 1),
                ),
                child: const Text(
                  "TSTH² DAIRYTRACK",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: RetroAppColors.textOnDark,
                    letterSpacing: 1,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "Cattle Farm Management System",
                style: TextStyle(
                  fontSize: 12,
                  color: RetroAppColors.textSecondary,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _securityManager.dispose();
    _animationController.dispose();
    _retroAnimationController.dispose();
    _redirectController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          _buildRetroBackground(),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildRetroLogoSection(),
                        const SizedBox(height: 24),
                        _buildRetroLoginForm(),
                        const SizedBox(height: 20),
                        Container(
                          decoration: BoxDecoration(
                            color:
                                RetroAppColors.textOnPrimary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color:
                                  RetroAppColors.textOnPrimary.withOpacity(0.3),
                              width: 1,
                            ),
                          ),
                          child: TextButton(
                            onPressed: _isRedirecting
                                ? null
                                : () => Navigator.pop(context),
                            style: TextButton.styleFrom(
                              foregroundColor: RetroAppColors.textOnPrimary,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.arrow_back_ios,
                                    size: 14,
                                    color: RetroAppColors.textOnPrimary),
                                const SizedBox(width: 6),
                                Text(
                                  "BACK TO GUEST MODE",
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: RetroAppColors.textOnPrimary,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.5,
                                  ),
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
          ),
          if (_isRedirecting) _buildRetroRedirectOverlay(),
        ],
      ),
    );
  }
}
