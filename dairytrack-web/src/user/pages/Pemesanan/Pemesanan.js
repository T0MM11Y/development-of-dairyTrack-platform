// Pemesanan.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProductStocks } from "../../../api/keuangan/product";
import { createOrder } from "../../../api/keuangan/order";
import Swal from "sweetalert2";
import Breadcrumb from "./Breadcrumb";
import ContactInfo from "./ContactInfo";
import OrderForm from "./OrderForm";
import "./ContactUs.css";

const Pemesanan = () => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    location: "",
    notes: "",
    status: "Requested",
    order_items: [],
  });

  // New item state (for adding to order)
  const [newItem, setNewItem] = useState({ product_type: "", quantity: 1 });

  // For calculating totals
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Fetch available products on mount
  useEffect(() => {
    const loadAvailableStock = async () => {
      try {
        const response = await getProductStocks();
        // Group by product_type and get required data
        const groupedProducts = response.reduce((acc, product) => {
          if (product.status === "available") {
            const type = product.product_type;
            if (!acc[type]) {
              acc[type] = {
                product_type: type,
                product_name: product.product_type_detail.product_name,
                total_quantity: 0,
                image: product.product_type_detail.image,
                price: product.product_type_detail.price || 30000, // Default price if not available
              };
            }
            acc[type].total_quantity += product.quantity;
          }
          return acc;
        }, {});
        setAvailableProducts(Object.values(groupedProducts));
      } catch (err) {
        setError("Gagal memuat stok produk: " + err.message);
      }
    };
    loadAvailableStock();
  }, []);

  // Calculate order totals whenever order items change
  useEffect(() => {
    calculateTotal();
  }, [form.order_items]);

  const calculateTotal = () => {
    let newSubtotal = 0;

    form.order_items.forEach((item) => {
      const product = availableProducts.find(
        (p) => p.product_type === parseInt(item.product_type)
      );
      if (product) {
        newSubtotal += product.price * item.quantity;
      }
    });

    setSubtotal(newSubtotal);
    setTotal(newSubtotal);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleIncrement = () => {
    setNewItem((prev) => ({ ...prev, quantity: parseInt(prev.quantity) + 1 }));
  };

  const handleDecrement = () => {
    if (newItem.quantity > 1) {
      setNewItem((prev) => ({
        ...prev,
        quantity: parseInt(prev.quantity) - 1,
      }));
    }
  };

  const addOrderItem = () => {
    if (!newItem.product_type || !newItem.quantity) {
      setError("Pilih produk dan masukkan jumlah");
      return;
    }

    const selectedProduct = availableProducts.find(
      (p) => p.product_type === parseInt(newItem.product_type)
    );

    if (!selectedProduct) {
      setError("Produk tidak ditemukan");
      return;
    }

    const requestedQuantity = parseInt(newItem.quantity);
    if (selectedProduct.total_quantity < requestedQuantity) {
      setError(
        `Stok ${selectedProduct.product_name} tidak cukup. Tersedia: ${selectedProduct.total_quantity}`
      );
      return;
    }

    // Check if product with same product_type already exists
    const existingItemIndex = form.order_items.findIndex(
      (item) => item.product_type === parseInt(newItem.product_type)
    );

    if (existingItemIndex !== -1) {
      // If exists, add to quantity
      const updatedItems = [...form.order_items];
      const newQuantity =
        updatedItems[existingItemIndex].quantity + requestedQuantity;

      // Validate stock again after merging
      if (selectedProduct.total_quantity < newQuantity) {
        setError(
          `Stok ${selectedProduct.product_name} tidak cukup. Tersedia: ${selectedProduct.total_quantity}`
        );
        return;
      }

      updatedItems[existingItemIndex].quantity = newQuantity;

      setForm((prev) => ({
        ...prev,
        order_items: updatedItems,
      }));
    } else {
      // If new, add as new item
      setForm((prev) => ({
        ...prev,
        order_items: [
          ...prev.order_items,
          {
            product_type: parseInt(newItem.product_type),
            quantity: requestedQuantity,
          },
        ],
      }));
    }

    setNewItem({ product_type: "", quantity: 1 });
    setError("");
  };

  const removeOrderItem = (index) => {
    setForm((prev) => ({
      ...prev,
      order_items: prev.order_items.filter((_, i) => i !== index),
    }));
  };

  // Increment item quantity
  const incrementItemQuantity = (index) => {
    const updatedItems = [...form.order_items];
    const currentItem = updatedItems[index];
    const selectedProduct = availableProducts.find(
      (p) => p.product_type === currentItem.product_type
    );

    // Check if stock is available
    if (currentItem.quantity + 1 > selectedProduct.total_quantity) {
      setError(
        `Stok ${selectedProduct.product_name} tidak cukup. Tersedia: ${selectedProduct.total_quantity}`
      );
      return;
    }

    updatedItems[index].quantity += 1;

    setForm((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
    setError("");
  };

  // Decrement item quantity
  const decrementItemQuantity = (index) => {
    const updatedItems = [...form.order_items];
    const currentItem = updatedItems[index];

    if (currentItem.quantity <= 1) {
      // If quantity is only 1, remove item
      removeOrderItem(index);
      return;
    }

    updatedItems[index].quantity -= 1;

    setForm((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
  };

  // Format price in Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Reset form to initial state
  const resetForm = () => {
    setForm({
      customer_name: "",
      email: "",
      phone_number: "",
      location: "",
      notes: "",
      status: "Requested",
      order_items: [],
    });
    setNewItem({ product_type: "", quantity: 1 });
    setError("");
    setTotal(0);
    setSubtotal(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (form.order_items.length === 0) {
      setError("Tambahkan minimal satu item pesanan");
      setSubmitting(false);
      return;
    }

    // Construct name from firstName and lastName if those fields are used
    const firstName = e.target.firstName?.value;
    const lastName = e.target.lastName?.value;

    const payload = {
      ...form,
      customer_name:
        firstName && lastName ? `${firstName} ${lastName}` : form.customer_name,
    };

    try {
      await createOrder(payload);

      // Show success alert
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Pesanan Anda telah berhasil dikirim",
        confirmButtonText: "OK",
        confirmButtonColor: "#4CAF50",
      }).then(() => {
        // Reset form after success
        resetForm();
      });
    } catch (err) {
      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Pesanan Gagal",
        text: `Gagal membuat pesanan: ${
          err.message || "Terjadi kesalahan pada sistem"
        }`,
        confirmButtonText: "Coba Lagi",
        confirmButtonColor: "#d33",
      });

      setError("Gagal membuat pesanan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="order-page-container">
      <Breadcrumb />

      <div className="order-header"></div>

      <div className="order-content" style={{ opacity: submitting ? 0.7 : 1 }}>
        {/* Container untuk peta dan form */}
        <div className="order-main-container">
          {/* Peta Lokasi */}
          <div className="order-map-container">
            <h2 className="section-title">Lokasi Kami</h2>
            <div className="map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.955655519632!2d98.6253594!3d2.2886875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x302e0787e9196b01%3A0x67392c0157f55171!7JQG%2BF4H%2C%20Aek%20Nauli%20I%2C%20Kec.%20Pollung%2C%20Kabupaten%20Humbang%20Hasundutan%2C%20Sumatera%20Utara%2022456!5e0!3m2!1sen!2sid!4v1684305845722!5m2!1sen!2sid&zoom=5"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: "8px" }}
                allowFullScreen=""
                loading="lazy"
                title="Peta Pollung Humbang Hasundutan"
              ></iframe>
            </div>
          </div>

          <div className="order-form-container">
            <div className="form-card">
              <div className="form-header">
                <h2>Detail Pemesanan</h2>
                <div className="form-steps">
                  <div className="step active">1</div>
                  <div className="step-line"></div>
                  <div className="step">2</div>
                  <div className="step-line"></div>
                  <div className="step">3</div>
                </div>
              </div>

              <OrderForm
                form={form}
                newItem={newItem}
                availableProducts={availableProducts}
                subtotal={subtotal}
                total={total}
                error={error}
                submitting={submitting}
                formatPrice={formatPrice}
                handleChange={handleChange}
                handleItemChange={handleItemChange}
                handleDecrement={handleDecrement}
                handleIncrement={handleIncrement}
                addOrderItem={addOrderItem}
                removeOrderItem={removeOrderItem}
                incrementItemQuantity={incrementItemQuantity}
                decrementItemQuantity={decrementItemQuantity}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>

        <ContactInfo />
      </div>
    </div>
  );
};

export default Pemesanan;
