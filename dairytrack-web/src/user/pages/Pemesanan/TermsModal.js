// PemesananComponents/TermsModal.jsx
import React from "react";
import { Modal, Button } from "react-bootstrap";

const TermsModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Syarat dan Ketentuan</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <h5>1. Umum</h5>
        <p>
          Dengan melakukan pemesanan pada platform kami, Anda menyetujui syarat dan ketentuan yang berlaku di bawah ini. Syarat dan ketentuan ini dapat berubah sewaktu-waktu tanpa pemberitahuan terlebih dahulu.
        </p>

        <h5>2. Pemesanan</h5>
        <p>
          <strong>2.1.</strong> Pemesanan dapat dilakukan melalui formulir pemesanan pada website kami.<br />
          <strong>2.2.</strong> Anda bertanggung jawab untuk memberikan informasi yang akurat dan lengkap ketika melakukan pemesanan.<br />
          <strong>2.3.</strong> Kami berhak menolak atau membatalkan pesanan jika terdapat ketidaksesuaian informasi atau alasan lainnya.
        </p>

        <h5>3. Harga dan Pembayaran</h5>
        <p>
          <strong>3.1.</strong> Semua harga yang tercantum dalam Rupiah (IDR) dan sudah termasuk pajak yang berlaku.<br />
          <strong>3.2.</strong> Kami berhak mengubah harga produk sewaktu-waktu tanpa pemberitahuan sebelumnya.<br />
          <strong>3.3.</strong> Pembayaran dilakukan sesuai dengan metode pembayaran yang tersedia dan harus dilunasi sebelum barang dikirim.
        </p>

        <h5>4. Pengiriman</h5>
        <p>
          <strong>4.1.</strong> Pengiriman dilakukan ke alamat yang Anda berikan saat pemesanan.<br />
          <strong>4.2.</strong> Waktu pengiriman dapat bervariasi tergantung lokasi dan ketersediaan stok.<br />
          <strong>4.3.</strong> Anda bertanggung jawab untuk memastikan ada seseorang yang dapat menerima barang saat pengiriman tiba.<br />
          <strong>4.4.</strong> Risiko kerusakan dan kehilangan beralih kepada Anda setelah produk diterima.
        </p>

        <h5>5. Pembatalan dan Pengembalian</h5>
        <p>
          <strong>5.1.</strong> Pembatalan pesanan dapat dilakukan sebelum barang dikirim.<br />
          <strong>5.2.</strong> Pengembalian produk harus dilakukan dalam waktu 3 hari setelah penerimaan jika terdapat cacat produksi.<br />
          <strong>5.3.</strong> Kami tidak menerima pengembalian untuk produk yang telah digunakan, dibuka, atau rusak karena kesalahan pengguna.
        </p>

        <h5>6. Perlindungan Data</h5>
        <p>
          <strong>6.1.</strong> Data pribadi yang Anda berikan saat pemesanan akan dijaga kerahasiaannya dan digunakan sesuai dengan kebijakan privasi kami.<br />
          <strong>6.2.</strong> Kami tidak akan menjual atau memberikan data Anda kepada pihak ketiga tanpa persetujuan Anda.
        </p>

        <h5>7. Ketersediaan Produk</h5>
        <p>
          <strong>7.1.</strong> Semua produk tersedia selama persediaan masih ada.<br />
          <strong>7.2.</strong> Jika produk yang Anda pesan tidak tersedia, kami akan menghubungi Anda untuk memberikan alternatif atau pengembalian dana.
        </p>

        <h5>8. Batasan Tanggung Jawab</h5>
        <p>
          <strong>8.1.</strong> Tanggung jawab kami terbatas pada nilai barang yang Anda beli.<br />
          <strong>8.2.</strong> Kami tidak bertanggung jawab atas kerugian tidak langsung yang mungkin timbul akibat penggunaan produk.
        </p>

        <h5>9. Perselisihan</h5>
        <p>
          Setiap perselisihan yang timbul dari atau sehubungan dengan pembelian produk kami akan diselesaikan secara musyawarah atau melalui jalur hukum yang berlaku di Indonesia.
        </p>

        <h5>10. Kontak</h5>
        <p>
          Jika Anda memiliki pertanyaan atau keluhan terkait dengan pesanan atau syarat dan ketentuan ini, silakan hubungi kami melalui:
        </p>
        <ul>
          <li>Email: info@pollung.com</li>
          <li>Telepon: +62 123 456 7890</li>
          <li>Alamat: Pollung, Humbang Hasundutan, Sumatera Utara, Indonesia</li>
        </ul>

        <h5>11. Kualitas Produk</h5>
        <p>
          <strong>11.1.</strong> Kami berkomitmen untuk menyediakan produk dengan kualitas terbaik sesuai dengan standar yang berlaku.<br />
          <strong>11.2.</strong> Produk kami dibuat dengan memperhatikan kebersihan dan keamanan pangan.<br />
          <strong>11.3.</strong> Meskipun demikian, kualitas produk dapat bervariasi tergantung pada kondisi penyimpanan dan penanganan setelah pengiriman.
        </p>

        <h5>12. Force Majeure</h5>
        <p>
          Kami tidak bertanggung jawab atas keterlambatan atau kegagalan dalam memenuhi kewajiban jika hal tersebut disebabkan oleh keadaan di luar kendali yang wajar, termasuk namun tidak terbatas pada:
        </p>
        <ul>
          <li>Bencana alam</li>
          <li>Epidemi atau pandemi</li>
          <li>Perang atau konflik</li>
          <li>Tindakan pemerintah</li>
          <li>Gangguan transportasi atau komunikasi</li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Tutup
        </Button>
        <Button variant="primary" onClick={onHide}>
          Saya Setuju
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TermsModal;