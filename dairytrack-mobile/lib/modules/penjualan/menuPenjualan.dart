import 'package:flutter/material.dart';

class MenuPenjualan extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Menu Penjualan'),
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
                'Produk',
                Icons.shopping_bag,
                Colors.blue,
                () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Produk dipilih')),
                  );
                },
              ),
              _buildMenuContainer(
                context,
                'Tipe Produk',
                Icons.category,
                Colors.green,
                () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Tipe Produk dipilih')),
                  );
                },
              ),
              _buildMenuContainer(
                context,
                'Riwayat Produk',
                Icons.history,
                Colors.orange,
                () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Riwayat Produk dipilih')),
                  );
                },
              ),
              _buildMenuContainer(
                context,
                'Penjualan',
                Icons.point_of_sale,
                Colors.purple,
                () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Penjualan dipilih')),
                  );
                },
              ),
              _buildWideMenuContainer(
                context,
                'Keuangan',
                Icons.account_balance_outlined,
                Colors.red,
                () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Keuangan dipilih')),
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

  Widget _buildWideMenuContainer(BuildContext context, String title,
      IconData icon, Color color, VoidCallback onTap) {
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
