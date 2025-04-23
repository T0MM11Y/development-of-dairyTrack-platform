import 'package:flutter/material.dart';

class MenuPemeriksaanKesehatan extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Menu Pemeriksaan Kesehatan'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: GridView.count(
            shrinkWrap: true,
            crossAxisCount: 2,
            crossAxisSpacing: 16.0,
            mainAxisSpacing: 16.0,
            children: [
              _buildMenuContainer(
                context,
                'Pemeriksaan Penyakit Sapi',
                Icons.health_and_safety,
                Colors.blue,
                onTap: () {
                  Navigator.pushNamed(context, '/all-pemeriksaan-penyakit-sapi');
                },
              ),
              _buildMenuContainer(
                context,
                'Gejala Penyakit Sapi',
                Icons.warning,
                Colors.orange,
                onTap: () {
                  Navigator.pushNamed(context, '/all-gejala');
                },
              ),
              _buildMenuContainer(
                context,
                'Riwayat Penyakit Sapi',
                Icons.history,
                Colors.purple,
                onTap: () {
                  Navigator.pushNamed(context, '/all-riwayat-penyakit-sapi');
                },
              ),
              _buildWideMenuContainer(
                context,
                'Reproduksi Sapi',
                Icons.pregnant_woman,
                Colors.green,
                onTap: () {
                  Navigator.pushNamed(context, '/all-reproduksi');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuContainer(
      BuildContext context, String title, IconData icon, Color color,
      {required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: color.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(color: color, width: 2.0),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48.0, color: color),
            const SizedBox(height: 8.0),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16.0,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWideMenuContainer(
      BuildContext context, String title, IconData icon, Color color,
      {required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 150.0,
        decoration: BoxDecoration(
          color: color.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(color: color, width: 2.0),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48.0, color: color),
            const SizedBox(height: 8.0),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16.0,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
