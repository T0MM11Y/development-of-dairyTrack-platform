import 'package:dairy_track/routes/routes.dart';
import 'package:dairy_track/theme/GlobalStyle.dart';
import 'package:flutter/material.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Globalstyle.primaryAccent, // Warna utama aksen
              Globalstyle.secondaryAccent // Warna aksen sekunder
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Card(
              color: Globalstyle.primaryBackground, // Warna latar utama
              elevation: 20.0,
              shadowColor: Globalstyle.shadowOverlay, // Bayangan hitam lembut
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20.0),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    _buildLogo(),
                    const SizedBox(height: 1),
                    const Text(
                      'Welcome Back!',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color:
                            Globalstyle.secondaryAccent, // Warna aksen sekunder
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Please login to continue',
                      style: TextStyle(
                        fontSize: 16,
                        color: Globalstyle.neutralText, // Warna teks netral
                      ),
                    ),
                    const SizedBox(height: 30),
                    _buildEmailField(),
                    const SizedBox(height: 20),
                    _buildPasswordField(),
                    const SizedBox(height: 30),
                    _buildButton(context),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return const CircleAvatar(
      radius: 75,
      backgroundImage: AssetImage('assets/images/logo_dairy_track.png'),
      backgroundColor: Colors.transparent,
    );
  }

  Widget _buildEmailField() {
    return TextField(
      decoration: InputDecoration(
        labelText: 'Email',
        hintText: 'Enter your email',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: const BorderSide(
              color: Globalstyle.secondaryAccent,
              width: 1.5), // Warna aksen sekunder
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: const BorderSide(
              color: Globalstyle.primaryAccent,
              width: 2.0), // Warna utama aksen
        ),
        prefixIcon: const Icon(Icons.email,
            color: Globalstyle.secondaryAccent), // Warna aksen sekunder
        filled: true,
        fillColor: Globalstyle.secondaryBackground, // Warna latar sekunder
      ),
      keyboardType: TextInputType.emailAddress,
    );
  }

  Widget _buildPasswordField() {
    return TextField(
      decoration: InputDecoration(
        labelText: 'Password',
        hintText: 'Enter your password',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: const BorderSide(
              color: Globalstyle.secondaryAccent,
              width: 1.5), // Warna aksen sekunder
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12.0),
          borderSide: const BorderSide(
              color: Globalstyle.primaryAccent,
              width: 2.0), // Warna utama aksen
        ),
        prefixIcon: const Icon(Icons.lock,
            color: Globalstyle.secondaryAccent), // Warna aksen sekunder
        filled: true,
        fillColor: Globalstyle.secondaryBackground, // Warna latar sekunder
      ),
      obscureText: true,
    );
  }

  Widget _buildButton(BuildContext context) {
    return InkWell(
      onTap: () {
        Navigator.pushNamed(context, Routes.home);
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 15),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [
              Globalstyle.secondaryAccent, // Warna aksen sekunder
              Globalstyle.primaryAccent // Warna utama aksen
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12.0),
          boxShadow: [
            BoxShadow(
              color: Globalstyle.shadowOverlay, // Bayangan hitam lembut
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: const Center(
          child: Text(
            'Login',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Globalstyle.primaryBackground, // Warna latar utama
            ),
          ),
        ),
      ),
    );
  }
}
