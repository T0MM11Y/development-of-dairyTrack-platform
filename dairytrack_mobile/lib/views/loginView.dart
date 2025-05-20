import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import shared_preferences
import '../controller/APIURL1/loginController.dart'; // Import LoginController
import 'initialDashboard.dart'; // Import initialDashboard
// Make sure the class name matches the actual class in initialDashboard.dart
import '../widgets/inputField.dart'
    as input_widget; // Import InputField with prefix
import '../widgets/customButton.dart'; // Import CustomButton
import '../widgets/customAlert.dart'; // Import CustomAlert
import 'dart:async'; // Untuk timer

class LoginView extends StatefulWidget {
  @override
  _LoginViewState createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final LoginController _loginController =
      LoginController(); // Instance of LoginController
  bool _showPassword = false;
  bool _isLoading = false;

  int _failedAttempts = 0; // Counter untuk percobaan gagal
  bool _isLocked = false; // Status penguncian
  Timer? _lockTimer; // Timer untuk waktu tunggu
  int _lockDuration = 30; // Durasi waktu tunggu dalam detik

  void _handleLogin() async {
    if (_isLocked) {
      CustomAlert.showAlertDialog(
        context,
        "Login Locked",
        "Too many failed attempts. Please wait $_lockDuration seconds.",
        isError: true,
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final username = _usernameController.text.trim();
    final password = _passwordController.text;

    if (username.isEmpty || password.isEmpty) {
      setState(() {
        _isLoading = false;
      });
      CustomAlert.showAlertDialog(
        context,
        "Error",
        "Username and password cannot be empty.",
        isError: true,
      );
      return;
    }

    // Call the login method from LoginController
    final response = await _loginController.login(username, password);

    setState(() {
      _isLoading = false;
      if (response['success'] == true) {
        _failedAttempts = 0; // Reset counter jika berhasil login
        print(response);

        // Save user data to SharedPreferences
        _saveUserData(response);

        // Arahkan ke initialDashboard
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => InitialDashboard(),
          ), // Make sure 'InitialDashboard' is the correct class name
        );
      } else {
        _failedAttempts++;
        CustomAlert.showAlertDialog(
          context,
          "Error",
          response['message'] ?? "Login failed.",
          isError: true,
        );

        // Jika gagal lebih dari 3 kali, aktifkan penguncian
        if (_failedAttempts >= 3) {
          _isLocked = true;
          _startLockTimer();
        }
      }
    });
  }

  Future<void> _saveUserData(Map<String, dynamic> response) async {
    final prefs = await SharedPreferences.getInstance();
    prefs.setInt('userId', response['user_id'] as int);
    prefs.setString('userName', response['name'] as String);
    prefs.setString('userUsername', response['username'] as String);
    prefs.setString('userEmail', response['email'] as String);
    // Save other relevant user data
  }

  void _startLockTimer() {
    _lockTimer = Timer.periodic(Duration(seconds: 1), (timer) {
      setState(() {
        if (_lockDuration > 0) {
          _lockDuration--;
        } else {
          _isLocked = false;
          _failedAttempts = 0;
          _lockDuration = 30; // Reset durasi waktu tunggu
          _lockTimer?.cancel();
        }
      });
    });
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _lockTimer?.cancel(); // Pastikan timer dihentikan saat widget dihancurkan
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blueGrey[50],
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  backgroundColor: const Color.fromARGB(255, 226, 243, 248),
                  radius: 50,
                  backgroundImage: AssetImage('lib/assets/logo.png'),
                ),
                SizedBox(height: 16),
                Text(
                  "Welcome to DairyTrack",
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.blueGrey[800],
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  "Track your dairy products effortlessly",
                  style: TextStyle(fontSize: 16, color: Colors.blueGrey[600]),
                ),
                SizedBox(height: 32),
                Card(
                  elevation: 6,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      children: [
                        input_widget.InputField(
                          controller: _usernameController,
                          labelText: "Username",
                          prefixIcon: Icons.person,
                        ),
                        SizedBox(height: 16),
                        input_widget.InputField(
                          controller: _passwordController,
                          labelText: "Password",
                          prefixIcon: Icons.lock,
                          obscureText: !_showPassword,
                          showSuffixIcon: true,
                          onSuffixIconPressed: () {
                            setState(() {
                              _showPassword = !_showPassword;
                            });
                          },
                        ),
                        SizedBox(height: 16),
                        CustomButton(
                          onPressed: _handleLogin,
                          text: "Login",
                          isLoading: _isLoading,
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
