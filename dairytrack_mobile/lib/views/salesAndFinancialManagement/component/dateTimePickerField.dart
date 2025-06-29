import 'package:flutter/material.dart';

class DateTimePickerField extends StatelessWidget {
  final TextEditingController controller;
  final String labelText;
  final DateTime? initialDate;
  final VoidCallback onTap;

  const DateTimePickerField({
    Key? key,
    required this.controller,
    required this.labelText,
    this.initialDate,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      readOnly: true,
      decoration: InputDecoration(
        labelText: labelText,
        border: const OutlineInputBorder(),
        hintText: 'Select date and time',
      ),
      onTap: onTap,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return '$labelText is required';
        }
        return null;
      },
    );
  }
}
