import 'package:flutter/material.dart';

class ErrorMessageDisplay extends StatelessWidget {
  final String errorMessage;

  const ErrorMessageDisplay({super.key, required this.errorMessage});

  @override
  Widget build(BuildContext context) {
    if (errorMessage.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(8.0),
      margin: const EdgeInsets.only(bottom: 16.0),
      decoration: BoxDecoration(
        color: Colors.red.shade100,
        borderRadius: BorderRadius.circular(4.0),
      ),
      child: Text(
        errorMessage,
        style: TextStyle(color: Colors.red.shade800),
      ),
    );
  }
}