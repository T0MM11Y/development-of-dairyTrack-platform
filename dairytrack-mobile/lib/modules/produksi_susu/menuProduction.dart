import 'package:dairy_track/modules/produksi_susu/analisisByLaktasi/analisisByLaktasi.dart';
import 'package:dairy_track/modules/produksi_susu/trendProduksiSusu/trenProduksiSusu.dart';
import 'package:flutter/material.dart';
import 'dataProduksiSusu/dataProduksiSusu.dart'; // Import halaman DataProduksiSusu

class MenuProduction extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Menu Produksi'),
      ),
      body: Center(
        // Membuat konten berada di tengah layar
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: GridView.count(
            shrinkWrap:
                true, // Menyesuaikan ukuran grid agar tidak memenuhi seluruh layar
            crossAxisCount: 2,
            crossAxisSpacing: 16.0,
            mainAxisSpacing: 16.0,
            children: [
              _buildMenuContainer(
                context,
                'Catatan Produksi Susu',
                Icons.note_alt,
                Colors.blue,
                () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DataProduksiSusu(),
                    ),
                  );
                },
              ),
              _buildMenuContainer(
                context,
                'Trend Produksi Susu',
                Icons.trending_up,
                Colors.green,
                () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => TrenProduksiSusuPage(),
                    ),
                  );
                },
              ),
              _buildMenuContainer(
                context,
                'Analisis by Laktasi',
                Icons.analytics,
                Colors.orange,
                () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => AnalisisByLaktasiPage(),
                    ),
                  );
                },
              ),
              _buildMenuContainer(
                context,
                'Kesegaran Produksi Susu',
                Icons.local_drink,
                Colors.purple,
                () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Kesegaran Produksi Susu dipilih')),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuContainer(BuildContext context, String title, IconData icon,
      Color color, VoidCallback onTap) {
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
            SizedBox(height: 8.0),
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

void main() {
  runApp(MaterialApp(
    home: MenuProduction(),
  ));
}
