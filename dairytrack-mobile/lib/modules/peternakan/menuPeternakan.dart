import 'package:flutter/material.dart';

class MenuPeternakan extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => true, // Nonaktifkan tombol "Back" bawaan perangkat
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: const Color.fromARGB(255, 93, 144, 231),
          title: const Text('Menu Produksi'),
          leading: BackButton(
            onPressed: () {
              // Tambahkan logika khusus jika diperlukan
              Navigator.maybePop(context);
            },
          ),
        ),
        body: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.only(top: 156.0, left: 46.0, right: 46.0),
            child: Column(
              children: [
                GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 23.0,
                  mainAxisSpacing: 16.0,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
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
                        Navigator.pushNamed(context, '/all-supervisor');
                      },
                    ),
                    _buildMenuContainer(
                      context,
                      'Blog Articles',
                      Icons.article,
                      Colors.purple,
                      onTap: () {
                        Navigator.pushNamed(context, '/all-blog');
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 24.0),
                _buildWideMenuContainer(
                  context,
                  'Gallery',
                  Icons.photo,
                  Colors.red,
                  onTap: () {
                    Navigator.pushNamed(context, '/all-gallery');
                  },
                ),
                const SizedBox(height: 24.0),
              ],
            ),
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
            Icon(icon, size: 40.0, color: color),
            const SizedBox(height: 8.0),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14.0,
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
        height: 100.0,
        decoration: BoxDecoration(
          color: color.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(color: color, width: 2.0),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40.0, color: color),
            const SizedBox(width: 16.0),
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
    debugShowCheckedModeBanner: false,
    home: MenuPeternakan(),
    routes: {
      '/all-peternak': (context) => Scaffold(
            appBar: AppBar(title: const Text('Data Peternak')),
            body: const Center(child: Text('Halaman Data Peternak')),
          ),
      '/all-cow': (context) => Scaffold(
            appBar: AppBar(title: const Text('Data Sapi')),
            body: const Center(child: Text('Halaman Data Sapi')),
          ),
      '/all-supervisor': (context) => Scaffold(
            appBar: AppBar(title: const Text('Data Supervisor')),
            body: const Center(child: Text('Halaman Data Supervisor')),
          ),
      '/all-blog': (context) => Scaffold(
            appBar: AppBar(title: const Text('Blog Articles')),
            body: const Center(child: Text('Halaman Blog Articles')),
          ),
    },
  ));
}
