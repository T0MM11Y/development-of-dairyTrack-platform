// class ProdukType {
//   final int id;
//   final String productName;
//   final String productDescription;
//   final String image;
//   final double price;
//   final String unit;
//   final DateTime createdAt;
//   final DateTime updatedAt;

//   ProdukType({
//     required this.id,
//     required this.productName,
//     required this.productDescription,
//     required this.image,
//     required this.price,
//     required this.unit,
//     required this.createdAt,
//     required this.updatedAt,
//   });

//   factory ProdukType.fromJson(Map<String, dynamic> json) {
//     return ProdukType(
//       id: json['id'] ?? 0, // Default to 0 if null
//       productName: json['product_name'] ?? 'Unknown', // Default to 'Unknown' if null
//       productDescription: json['product_description'] ?? '', // Default to empty string if null
//       image: json['image'] ?? '', // Default to empty string if null
//       price: json['price'] != null
//           ? double.tryParse(json['price'].toString()) ?? 0.0
//           : 0.0, // Default to 0.0 if null or invalid
//       unit: json['unit'] ?? 'Unknown', // Default to 'Unknown' if null
//       createdAt: json['created_at'] != null
//           ? DateTime.parse(json['created_at'])
//           : DateTime(1970, 1, 1), // Default to epoch if null
//       updatedAt: json['updated_at'] != null
//           ? DateTime.parse(json['updated_at'])
//           : DateTime(1970, 1, 1), // Default to epoch if null
//     );
//   }

//   Map<String, dynamic> toJson() {
//     return {
//       'id': id,
//       'product_name': productName,
//       'product_description': productDescription,
//       'image': image,
//       'price': price,
//       'unit': unit,
//       'created_at': createdAt.toIso8601String(),
//       'updated_at': updatedAt.toIso8601String(),
//     };
//   }
// }

class ProdukType {
  final int id;
  final String productName;
  final String productDescription;
  final String image;
  final String price; // Changed to String to match JSON response
  final String unit;
  final DateTime createdAt;
  final DateTime updatedAt;

  ProdukType({
    required this.id,
    required this.productName,
    required this.productDescription,
    required this.image,
    required this.price,
    required this.unit,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ProdukType.fromJson(Map<String, dynamic> json) {
    return ProdukType(
      id: json['id'] ?? 0,
      productName: json['product_name'] ?? 'Unknown',
      productDescription: json['product_description'] ?? '',
      image: json['image'] ?? '',
      price: json['price']?.toString() ?? '0.0', // Store as string
      unit: json['unit'] ?? 'Unknown',
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime(1970, 1, 1),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime(1970, 1, 1),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_name': productName,
      'product_description': productDescription,
      'image': image,
      'price': price,
      'unit': unit,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
