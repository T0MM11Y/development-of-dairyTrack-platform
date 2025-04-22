import 'dart:convert';
import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/routes/routes.dart';
import 'package:dairy_track/theme/GlobalStyle.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginPage extends StatefulWidget {
  LoginPage({super.key});

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final LoginController loginController = LoginController();

  bool isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              color: Colors.white,
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: <Widget>[
                      _buildLogo(),
                      const SizedBox(height: 20),
                      const Text(
                        'Welcome Back!',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w600,
                          color: Globalstyle.secondaryAccent,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Login to continue',
                        style: TextStyle(
                          fontSize: 14,
                          color: Globalstyle.neutralText,
                        ),
                      ),
                      const SizedBox(height: 30),
                      _buildEmailField(),
                      const SizedBox(height: 16),
                      _buildPasswordField(),
                      const SizedBox(height: 24),
                      _buildButton(context),
                    ],
                  ),
                ),
              ),
            ),
          ),
          if (isLoading)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const Center(
                child: CircularProgressIndicator(
                  color: Globalstyle.primaryAccent,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildLogo() {
    return const CircleAvatar(
      radius: 50,
      backgroundImage: AssetImage('assets/images/logo_dairy_track.png'),
      backgroundColor: Colors.transparent,
    );
  }

  Widget _buildEmailField() {
    return TextField(
      controller: emailController,
      decoration: InputDecoration(
        labelText: 'Email',
        hintText: 'Enter your email',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        prefixIcon: const Icon(Icons.email, color: Globalstyle.secondaryAccent),
        filled: true,
        fillColor: Globalstyle.secondaryBackground,
      ),
      keyboardType: TextInputType.emailAddress,
    );
  }

  Widget _buildPasswordField() {
    return TextField(
      controller: passwordController,
      decoration: InputDecoration(
        labelText: 'Password',
        hintText: 'Enter your password',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        prefixIcon: const Icon(Icons.lock, color: Globalstyle.secondaryAccent),
        filled: true,
        fillColor: Globalstyle.secondaryBackground,
      ),
      obscureText: true,
    );
  }

  Widget _buildButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: isLoading
            ? null
            : () async {
                setState(() {
                  isLoading = true;
                });

                final email = emailController.text.trim();
                final password = passwordController.text.trim();

                final response = await loginController.login(email, password);

                setState(() {
                  isLoading = false;
                });

                if (response['status'] == 200) {
                  Navigator.pushNamed(context, Routes.home);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(response['message'])),
                  );
                }
              },
        style: ElevatedButton.styleFrom(
          backgroundColor: Globalstyle.primaryAccent,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
        child: const Text(
          'Login',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class LoginController {
  Future<Map<String, dynamic>> login(String email, String password) async {
    if (email.isEmpty || password.isEmpty) {
      return {
        'status': 400,
        'message': 'Email and password are required.',
      };
    }

    try {
      final response = await fetchAPI(
        "auth/login",
        method: "POST",
        data: {'email': email, 'password': password},
      );

      if (response['status'] == 200) {
        final userData = response['user'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString("user", jsonEncode(userData));
        return {
          'status': 200,
          'message': 'Login successful.',
          'user': userData,
          'name': userData['name'],
          'email': userData['email'],
        };
      }

      return {
        'status': response['status'],
        'message': response['message'] ?? 'Login failed.',
      };
    } catch (error) {
      return {
        'status': 500,
        'message': error.toString() ?? 'An unexpected error occurred.',
      };
    }
  }
}
