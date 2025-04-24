// import './productType.dart';

// class OrderItem {
//   final int id;
//   final ProdukType productTypeDetail;
//   final int quantity;
//   final double totalPrice;

//   OrderItem({
//     required this.id,
//     required this.productTypeDetail,
//     required this.quantity,
//     required this.totalPrice,
//   });

//   factory OrderItem.fromJson(Map<String, dynamic> json) {
//     return OrderItem(
//       id: json['id'] ?? 0, // Default to 0 if null
//       productTypeDetail: json['product_type_detail'] != null
//           ? ProdukType.fromJson(json['product_type_detail'])
//           : ProdukType(
//               id: 0,
//               productName: 'Unknown',
//               productDescription: '',
//               image: '',
//               price: 0.0,
//               unit: 'Unknown',
//               createdAt: DateTime(1970, 1, 1),
//               updatedAt: DateTime(1970, 1, 1),
//             ), // Default if null
//       quantity: json['quantity'] ?? 0, // Default to 0 if null
//       totalPrice: json['total_price'] != null
//           ? double.tryParse(json['total_price'].toString()) ?? 0.0
//           : 0.0, // Default to 0.0 if null or invalid
//     );
//   }

//   Map<String, dynamic> toJson() {
//     return {
//       'id': id,
//       'product_type_detail': productTypeDetail.toJson(),
//       'quantity': quantity,
//       'total_price': totalPrice,
//     };
//   }
// }