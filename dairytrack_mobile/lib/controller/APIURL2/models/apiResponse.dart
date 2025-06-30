// controller/APIURL2/models/apiResponse.dart
import 'package:logger/logger.dart';

class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final String? error;

  ApiResponse({
    required this.success,
    this.message = '',
    this.data,
    this.error,
  });

  factory ApiResponse.fromJson(
      Map<String, dynamic> json, T Function(dynamic)? fromJsonT) {
    final logger = Logger();
    try {
      String? errorMessage;
      if (json['error'] != null) {
        errorMessage = json['error'] is List
            ? json['error'].join(', ')
            : json['error'].toString();
      } else if (json['detail'] != null) {
        errorMessage = json['detail'].toString();
      } else if (json['non_field_errors'] != null) {
        errorMessage = json['non_field_errors'] is List
            ? json['non_field_errors'].join(', ')
            : json['non_field_errors'].toString();
      } else {
        errorMessage = json.values.isNotEmpty
            ? json.values.first is List
                ? json.values.first.join(', ')
                : json.values.first.toString()
            : null;
      }

      return ApiResponse<T>(
        success: json['success'] ??
            json['statusCode']?.toString().startsWith('2') ??
            false,
        message: json['message']?.toString() ?? 'Operation successful',
        data: json['data'] != null && fromJsonT != null
            ? fromJsonT(json['data'])
            : null,
        error: errorMessage,
      );
    } catch (e) {
      logger.e('Error parsing ApiResponse: $e, JSON: $json');
      return ApiResponse<T>(
        success: false,
        message: 'Failed to parse response',
        error: e.toString(),
      );
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data,
      'error': error,
    };
  }
}
