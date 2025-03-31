import 'package:dairy_track/theme/GlobalStyle.dart';
import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Home'),
        backgroundColor: Globalstyle.primaryAccent, // Gunakan warna utama aksen
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 50.0),
        child: Column(
          mainAxisAlignment:
              MainAxisAlignment.center, // Pusatkan secara vertikal
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.only(right: 8.0, bottom: 8.0),
                    padding: const EdgeInsets.all(50.0),
                    decoration: BoxDecoration(
                      color:
                          Globalstyle.secondaryAccent, // Warna aksen sekunder
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    child: Center(
                      child: Text(
                        'Menu 1',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Globalstyle
                              .primaryBackground, // Warna latar utama
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.only(left: 8.0, bottom: 8.0),
                    padding: const EdgeInsets.all(50.0),
                    decoration: BoxDecoration(
                      color: Globalstyle.darkAccent, // Warna aksen gelap
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    child: Center(
                      child: Text(
                        'Menu 2',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Globalstyle
                              .primaryBackground, // Warna latar utama
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.only(right: 8.0, bottom: 8.0),
                    padding: const EdgeInsets.all(50.0),
                    decoration: BoxDecoration(
                      color: Globalstyle.lightAccent, // Warna aksen terang
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    child: Center(
                      child: Text(
                        'Menu 3',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Globalstyle
                              .primaryBackground, // Warna latar utama
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.only(left: 8.0, bottom: 8.0),
                    padding: const EdgeInsets.all(50.0),
                    decoration: BoxDecoration(
                      color: Globalstyle
                          .secondaryBackground, // Warna latar sekunder
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    child: Center(
                      child: Text(
                        'Menu 4',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Globalstyle.neutralText, // Warna teks netral
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Row(
              children: [
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.only(right: 8.0),
                    padding: const EdgeInsets.all(50.0),
                    decoration: BoxDecoration(
                      color: Globalstyle.primaryAccent, // Warna utama aksen
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    child: Center(
                      child: Text(
                        'Menu 5',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Globalstyle
                              .primaryBackground, // Warna latar utama
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    margin: const EdgeInsets.only(left: 8.0),
                    padding: const EdgeInsets.all(50.0),
                    decoration: BoxDecoration(
                      color: Globalstyle.shadowOverlay, // Warna bayangan
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    child: Center(
                      child: Text(
                        'Menu 6',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Globalstyle
                              .primaryBackground, // Warna latar utama
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
