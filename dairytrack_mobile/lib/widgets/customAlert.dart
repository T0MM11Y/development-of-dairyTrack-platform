import 'package:flutter/material.dart';

class CustomAlert {
  static void showAlertDialog(
    BuildContext context,
    String title,
    String message, {
    bool isError = false,
  }) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.grey[900], // Warna latar belakang gelap
          title: Text(
            title,
            style: TextStyle(
              color:
                  isError ? Colors.redAccent : Colors.greenAccent, // Warna teks
              fontWeight: FontWeight.bold,
            ),
          ),
          content: Text(
            message,
            style: TextStyle(color: Colors.white), // Warna teks isi
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text(
                "OK",
                style: TextStyle(color: Colors.blueAccent), // Warna tombol
              ),
            ),
          ],
        );
      },
    );
  }
}
