import 'package:flutter/material.dart';

class Globalstyle {
  // Warna utama
  static const Color primaryBackground = Color(0xFFFFFEFA); // Warna putih susu
  static const Color secondaryBackground = Color(0xFFFFFDD0); // Warna krim susu
  static const Color accentHighlight =
      Color(0xFFFFE135); // Warna kuning mentega
  static const Color primaryAccent =
      Color(0xFF87CEEB); // Warna langit (kemasan susu)
  static const Color secondaryAccent =
      Color(0xFF8B4513); // Warna tanah (peternakan)

  // Warna tambahan
  static const Color tertiaryBackground = Color(0xFFFFF8E1); // Warna krim muda
  static const Color lightAccent = Color(0xFFADD8E6); // Warna biru muda
  static const Color darkAccent =
      Color(0xFF5D4037); // Warna coklat gelap (coklat susu)
  static const Color neutralText = Colors.grey; // Warna teks abu-abu

  // Warna berbasis opacity
  static Color shadowOverlay = Colors.black.withOpacity(0.5); // Bayangan hitam
  static Color transparentHighlight =
      secondaryBackground.withOpacity(0.1); // Krim transparan
  static Color shadowAccent =
      secondaryAccent.withOpacity(0.5); // Bayangan coklat
}
