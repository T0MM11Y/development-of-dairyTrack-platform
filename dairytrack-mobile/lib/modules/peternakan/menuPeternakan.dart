import 'package:flutter/material.dart';

class MenuPeternakan extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Menu Produksi'),
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
                'Data Peternak',
                Icons.person,
                Colors.blue,
                onTap: () {
                  Navigator.pushNamed(context, '/all-peternak');
                },
              ),
              _buildMenuContainer(
                context,
                'Data Sapi',
                Icons.pets,
                Colors.green,
                onTap: () {
                  Navigator.pushNamed(context, '/all-cow');
                },
              ),
              _buildMenuContainer(
                context,
                'Data Supervisor',
                Icons.supervisor_account,
                Colors.orange,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Data Supervisor dipilih')),
                  );
                },
              ),
              _buildMenuContainer(
                context,
                'Blog Articles',
                Icons.article,
                Colors.purple,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Blog Articles dipilih')),
                  );
                },
              ),
              // Perpanjang container untuk Gallery
              _buildWideMenuContainer(
                context,
                'Gallery',
                Icons.photo,
                Colors.red,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Gallery dipilih')),
                  );
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

  // Widget khusus untuk memperpanjang Gallery
  Widget _buildWideMenuContainer(
      BuildContext context, String title, IconData icon, Color color,
      {required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity, // Membuat lebar penuh
        height: 150.0, // Menambah tinggi container
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

void main() {
  runApp(MaterialApp(
    home: MenuPeternakan(),
    routes: {
      '/all-peternak': (context) => Scaffold(
            appBar: AppBar(title: const Text('Data Peternak')),
            body: const Center(child: Text('Halaman Data Peternak')),
          ),
    },
  ));
}
