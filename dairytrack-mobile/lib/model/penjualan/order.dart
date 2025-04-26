// // import './productType.dart';
// import './orderItem.dart';

// class Order {
//   final int id;
//   final String orderNo;
//   final String customerName;
//   final String email;
//   final String phoneNumber;
//   final String location;
//   final double shippingCost;
//   final double totalPrice;
//   final String status;
//   final String? paymentMethod;
//   final DateTime createdAt;
//   final List<OrderItem> orderItems;
//   final String notes;

//   Order({
//     required this.id,
//     required this.orderNo,
//     required this.customerName,
//     required this.email,
//     required this.phoneNumber,
//     required this.location,
//     required this.shippingCost,
//     required this.totalPrice,
//     required this.status,
//     this.paymentMethod,
//     required this.createdAt,
//     required this.orderItems,
//     required this.notes,
//   });

//   factory Order.fromJson(Map<String, dynamic> json) {
//     return Order(
//       id: json['id'] ?? 0, // Default to 0 if null
//       orderNo: json['order_no'] ?? 'Unknown', // Default to 'Unknown' if null
//       customerName:
//           json['customer_name'] ?? 'Unknown', // Default to 'Unknown' if null
//       email: json['email'] ?? '', // Default to empty string if null
//       phoneNumber:
//           json['phone_number'] ?? '', // Default to empty string if null
//       location: json['location'] ?? '', // Default to empty string if null
//       shippingCost: json['shipping_cost'] != null
//           ? double.tryParse(json['shipping_cost'].toString()) ?? 0.0
//           : 0.0, // Default to 0.0 if null or invalid
//       totalPrice: json['total_price'] != null
//           ? double.tryParse(json['total_price'].toString()) ?? 0.0
//           : 0.0, // Default to 0.0 if null or invalid
//       status: json['status'] ?? 'Unknown', // Default to 'Unknown' if null
//       paymentMethod: json['payment_method'], // Nullable, no default needed
//       createdAt: json['created_at'] != null
//           ? DateTime.parse(json['created_at'])
//           : DateTime(1970, 1, 1), // Default to epoch if null
//       orderItems: json['order_items'] != null
//           ? (json['order_items'] as List)
//               .map((item) => OrderItem.fromJson(item))
//               .toList()
//           : [], // Default to empty list if null
//       notes: json['notes'] ?? '', // Default to empty string if null
//     );
//   }

//   Map<String, dynamic> toJson() {
//     return {
//       'id': id,
//       'order_no': orderNo,
//       'customer_name': customerName,
//       'email': email,
//       'phone_number': phoneNumber,
//       'location': location,
//       'shipping_cost': shippingCost,
//       'total_price': totalPrice,
//       'status': status,
//       if (paymentMethod != null)
//         'payment_method': paymentMethod, // Only include if not null
//       'created_at': createdAt.toIso8601String(),
//       'order_items': orderItems.map((item) => item.toJson()).toList(),
//       'notes': notes,
//     };
//   }
// }
