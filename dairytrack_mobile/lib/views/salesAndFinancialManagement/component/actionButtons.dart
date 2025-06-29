import 'package:flutter/material.dart';

class ActionButtons extends StatelessWidget {
  final bool isLoading;
  final VoidCallback? onCancel;
  final VoidCallback? onSubmit;
  final String submitText;
  final Color submitColor;

  const ActionButtons({
    Key? key,
    required this.isLoading,
    this.onCancel,
    this.onSubmit,
    required this.submitText,
    required this.submitColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        TextButton(
          onPressed: onCancel ?? () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        const SizedBox(width: 8),
        ElevatedButton(
          onPressed: isLoading ? null : onSubmit,
          style: ElevatedButton.styleFrom(
            backgroundColor: submitColor,
          ),
          child: isLoading
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white,
                  ),
                )
              : Text(submitText, style: const TextStyle(color: Colors.white)),
        ),
      ],
    );
  }
}
