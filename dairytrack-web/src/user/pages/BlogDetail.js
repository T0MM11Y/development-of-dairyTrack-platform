import React from "react";
import { useParams, Link } from "react-router-dom";
import Merawat from "../../assets/image/merawat.jpg";
import Teknologi from "../../assets/image/teknologi.jpg";
import Makanan from "../../assets/image/makanan.jpg";
import Kesehatan from "../../assets/image/kesehatan.jpg";
import Stress from "../../assets/image/stress.jpg";
import Lingkungan from "../../assets/image/lingkungan.jpg";

const DetailBlog = () => {
  const { id } = useParams(); // Mengambil parameter id dari URL
  const blogPosts = [
    {
      topic: "Perawatan Sapi",
      content: (
        <>
      <p style={{ textAlign: "left", marginTop: "0px" }}>1 April 2025</p>
       <h2 style={{ textAlign: "center", marginBottom: "2px" }}>
  Cara Merawat Sapi untuk Produksi Susu Berkualitas
</h2>
          <img 
            src={Merawat} 
            alt="Merawat Sapi" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }}
          />
          
          <p>
            Merawat sapi dengan baik adalah kunci untuk menghasilkan susu berkualitas tinggi. Dalam artikel ini, kami akan membahas berbagai cara merawat sapi agar tetap sehat dan produktif.
          </p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Pemberian Pakan Seimbang:</strong> Pemberian pakan yang seimbang sangat penting untuk mendukung kesehatan dan produktivitas sapi perah.  </li>
            <li style={{ marginBottom: '10px' }}><strong>Akses Air Bersih:</strong> Air adalah komponen vital yang sering diabaikan dalam pemeliharaan sapi perah. Kekurangan air dapat mempengaruhi kesehatan sapi dan kualitas susu yang dihasilkan.</li>
            <li style={{ marginBottom: '10px' }}><strong>Perawatan Kesehatan:</strong> Untuk menjaga kesehatan sapi, vaksinasi rutin dan pemeriksaan kesehatan harus dilakukan secara berkala. Pemeriksaan ini meliputi deteksi penyakit, pengendalian parasit, dan perawatan kaki dan gigi sapi.  </li>
            <li style={{ marginBottom: '10px' }}><strong>Lingkungan Nyaman:</strong> Sapi perah yang hidup dalam lingkungan yang bersih dan nyaman lebih cenderung menghasilkan susu dalam jumlah yang optimal. Kandang harus selalu dalam keadaan bersih, kering, dan memiliki ventilasi yang baik. </li>
            <li style={{ marginBottom: '10px' }}><strong>Perawatan Udder:</strong> Cegah mastitis dengan menjaga kebersihan udder dan memeriksa kesehatan kelenjar susu secara rutin. Udder adalah bagian tubuh sapi yang sangat penting dalam produksi susu. Kebersihan udder harus dijaga untuk mencegah infeksi seperti mastitis, yang dapat menurunkan kualitas dan kuantitas susu.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pemerasan Rutin:</strong> Perah susu pada waktu yang konsisten setiap hari menggunakan teknik yang tepat untuk menghindari stres pada sapi. Pemerasan susu yang rutin dan tepat waktu sangat penting dalam memastikan sapi tetap nyaman dan sehat. </li>
            <li style={{ marginBottom: '10px' }}><strong>Manajemen Reproduksi:</strong> Pilih bibit berkualitas dan berikan masa kering yang cukup untuk sapi sebelum melahirkan agar produksi susu tetap optimal. Pilih bibit sapi perah yang berkualitas tinggi untuk mendapatkan hasil produksi susu yang optimal.</li>
            <li style={{ marginBottom: '10px' }}><strong>Monitoring:</strong> Catat jumlah susu yang diperah setiap hari untuk memantau kesehatan dan kinerja sapi. Melakukan pencatatan dan pemantauan jumlah susu yang diperah setiap hari sangat penting dalam manajemen peternakan sapi perah. </li>
          </ul>
        </>
      )
    },
    {
      topic: "Teknologi Peternakan",
      content: (
        <>
         <p style={{ textAlign: "left", marginTop: "0px" }}>25 Maret 2025</p>
        <h2 style={{ textAlign: "center" }}>Pemanfaatan Teknologi dalam Peternakan Sapi</h2>
          <img 
            src={Teknologi} 
            alt="Teknologi Peternakan" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }} 
          />
          <p>Pemanfaatan teknologi dalam peternakan sapi semakin penting untuk meningkatkan efisiensi, produktivitas, dan kualitas produk yang dihasilkan, terutama dalam bidang peternakan sapi perah. Teknologi dapat membantu peternak untuk memonitor kesehatan sapi, mengelola pakan dengan lebih baik, serta meningkatkan proses pemeliharaan sapi. Beberapa teknologi yang sering digunakan dalam peternakan sapi antara lain:</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Sistem Pemantauan Kesehatan Sapi:</strong> Teknologi sensor dan perangkat wearable dapat dipasang pada sapi untuk memantau kondisi fisiknya secara real-time. Alat ini dapat mendeteksi tanda-tanda awal penyakit, cedera, atau stres pada sapi, yang memungkinkan tindakan medis cepat dilakukan untuk menjaga kesehatan sapi dan mencegah kerugian.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pakan Cerdas dan Otomatis :</strong> Teknologi dalam pemberian pakan kini semakin canggih dengan adanya sistem pakan otomatis yang dapat menghitung jumlah pakan yang dibutuhkan oleh setiap sapi berdasarkan kebutuhan individu mereka. Ini membantu mengurangi pemborosan pakan, meningkatkan efisiensi pemberian pakan, dan memastikan sapi mendapatkan nutrisi yang tepat.</li>
            <li style={{ marginBottom: '10px' }}><strong>Robot Perah Sapi :</strong> Robot pemerah susu atau automatic milking systems (AMS) membantu peternak untuk memerah susu sapi dengan lebih efisien dan higienis. Robot ini tidak hanya mengurangi tenaga kerja manusia, tetapi juga meminimalisir potensi infeksi pada udder sapi dan memastikan pemerasan dilakukan secara konsisten.</li>
            <li style={{ marginBottom: '10px' }}><strong>Sistem Manajemen Peternakan:</strong> Teknologi perangkat lunak seperti sistem manajemen peternakan (Farm Management Software) dapat membantu peternak mengelola data tentang sapi, pakan, kesehatan, dan hasil susu. Sistem ini memudahkan peternak untuk memonitor dan menganalisis performa peternakan secara keseluruhan, meningkatkan pengambilan keputusan untuk efisiensi operasional.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pemetaan dan Analisis Data:</strong> Penggunaan teknologi GPS dan drone untuk memetakan dan memonitor kondisi lahan peternakan memungkinkan peternak untuk merencanakan penggunaan lahan secara lebih efisien. Data yang dikumpulkan juga bisa digunakan untuk analisis pertumbuhan tanaman pakan dan pengelolaan lahan yang lebih ramah lingkungan.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pemeliharaan Lingkungan yang Lebih Baik:</strong> Teknologi sensor juga digunakan untuk memonitor kualitas lingkungan di kandang, termasuk kelembapan, suhu, dan kadar oksigen. Hal ini membantu peternak menciptakan lingkungan yang nyaman bagi sapi, yang akan meningkatkan produktivitas susu dan kesehatan sapi secara keseluruhan.</li>
          </ul>
        </>
      ),
    },
    {
      topic: "Pakan Ternak",
      content: (
        <>
        <p style={{ textAlign: "left", marginTop: "0px" }}>18 Maret 2025</p>
         <h2 style={{ textAlign: "center" }}>Makanan Terbaik untuk Sapi Perah</h2>
          <img 
            src={Makanan} 
            alt="Pakan Ternak" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }} 
          />
          <p>Memilih pakan yang tepat sangat penting untuk sapi perah karena kualitas pakan langsung mempengaruhi produksi susu dan kesehatan sapi. Pakan yang baik akan mendukung sapi untuk tetap sehat, produktif, dan menghasilkan susu berkualitas tinggi. Berikut adalah beberapa jenis pakan yang terbaik untuk sapi perah:</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Rumput Segar:</strong> Rumput adalah pakan utama untuk sapi perah. Rumput yang segar dan hijau mengandung banyak serat yang diperlukan untuk sistem pencernaan sapi. Serat ini membantu menjaga keseimbangan mikroflora di dalam rumen, yang penting untuk fermentasi pakan dan penyerapan nutrisi. Rumput legum seperti alfalfa dan clover sangat baik karena mengandung banyak protein dan mineral yang penting untuk sapi perah.</li>
            <li style={{ marginBottom: '10px' }}><strong>Silase:</strong>  Silase adalah pakan fermentasi yang terbuat dari tanaman hijau seperti jagung atau rumput yang difermentasi dalam kondisi anaerobik (tanpa oksigen). Silase kaya akan energi dan sangat baik untuk sapi perah, terutama di musim kemarau ketika rumput segar sulit didapat. Silase memiliki kandungan energi yang tinggi, yang membantu sapi untuk memproduksi lebih banyak susu.</li>
            <li style={{ marginBottom: '10px' }}><strong>Konsentrat (Pakan Ternak Kering):</strong> Konsentrat adalah pakan tambahan yang kaya akan energi, protein, dan nutrisi penting lainnya. Pakan ini biasanya diberikan dalam bentuk pelet atau biji-bijian, seperti jagung, gandum, dan biji kedelai. Konsentrat digunakan untuk meningkatkan produksi susu sapi perah, terutama jika kualitas rumput segar atau silase terbatas. Penggunaan konsentrat harus disesuaikan dengan kebutuhan sapi untuk menghindari kelebihan energi yang bisa menyebabkan obesitas atau masalah pencernaan.</li>
            <li style={{ marginBottom: '10px' }}><strong>Hasil Sampingan Pangan:</strong> Hasil sampingan pangan seperti bekatul, ampas tahu, dan ampas kelapa bisa menjadi alternatif pakan yang baik dan murah untuk sapi perah. Hasil sampingan ini kaya akan serat dan kadang-kadang mengandung lebih banyak protein dibandingkan dengan rumput biasa. Namun, pastikan kualitasnya baik dan tidak tercemar bahan kimia atau bahan berbahaya lainnya.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pakan Berbasis Protein Tinggi:</strong>Sapi perah membutuhkan lebih banyak protein untuk mendukung produksi susu yang optimal. Pakan berbasis protein tinggi, seperti kedelai, bungkil kelapa, dan bungkil kacang tanah, sangat berguna untuk memenuhi kebutuhan protein sapi. Protein membantu dalam perbaikan dan pembentukan otot, serta mendukung proses produksi susu yang sehat.</li>
            <li style={{ marginBottom: '10px' }}><strong>Mineral dan Vitamin:</strong> Selain karbohidrat dan protein, sapi perah juga membutuhkan mineral dan vitamin untuk mendukung metabolisme tubuh dan meningkatkan daya tahan tubuh. Mineral seperti kalsium, fosfor, dan magnesium sangat penting untuk pembentukan tulang dan kesehatan sapi. Vitamin A, D, dan E juga sangat dibutuhkan untuk kesehatan kulit, mata, serta untuk meningkatkan produksi susu.</li>
            <li style={{ marginBottom: '10px' }}><strong>Akses Air Bersih :</strong> Sapi perah membutuhkan akses air bersih dan segar dalam jumlah yang cukup. Air sangat penting untuk proses pencernaan dan penyerapan nutrisi, serta mendukung produksi susu. Kekurangan air dapat mengurangi kualitas dan kuantitas susu, bahkan menyebabkan dehidrasi dan gangguan metabolisme pada sapi. Pastikan sapi memiliki akses air yang cukup setiap saat.</li>
          </ul>
        </>
      ),
    },
    {
  
      topic: "Manajemen Kesehatan",
      content: (
        <>
         <p style={{ textAlign: "left", marginTop: "0px" }}>01 April 2025</p>
         <h2 style={{ textAlign: "center" }}>Manajemen Kesehatan Sapi di Peternakan</h2>
          <img 
            src={Kesehatan} 
            alt="Manajemen Kesehatan" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }} 
          />
          <p>Manajemen kesehatan sapi adalah salah satu faktor terpenting dalam keberhasilan peternakan sapi, terutama dalam produksi susu dan daging. Sapi yang sehat akan lebih produktif dan menghasilkan susu serta daging yang berkualitas tinggi. Oleh karena itu, penting untuk memiliki sistem manajemen kesehatan yang baik di peternakan sapi. Berikut adalah beberapa aspek penting dalam manajemen kesehatan sapi di peternakan:</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Vaksinasi Rutin :</strong> Vaksinasi adalah cara paling efektif untuk mencegah penyakit yang dapat memengaruhi kesehatan sapi perah dan sapi potong. Vaksinasi yang tepat waktu dapat membantu sapi terhindar dari penyakit-penyakit berbahaya seperti brucellosis, anthrax, dan penyakit tetanus. Sebagai peternak, penting untuk mengetahui jadwal vaksinasi yang diperlukan untuk sapi dan melaksanakan vaksinasi sesuai anjuran dokter hewan.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pemeriksaan Kesehatan Berkala :</strong> Pemeriksaan kesehatan secara berkala sangat penting untuk mendeteksi masalah kesehatan pada sapi sejak dini. Pemeriksaan rutin dapat mencakup pemeriksaan fisik, deteksi parasit internal atau eksternal, serta pengamatan terhadap gejala-gejala penyakit seperti demam, penurunan nafsu makan, atau perubahan dalam pola produksi susu. Deteksi dini akan memudahkan pengobatan dan mencegah penyebaran penyakit ke sapi lainnya.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pengendalian Parasit :</strong> Parasit baik internal (cacing) maupun eksternal (kutuan, caplak) dapat mengganggu kesehatan sapi dan menurunkan produktivitas. Pengendalian parasit harus dilakukan secara rutin menggunakan obat-obatan atau tindakan pencegahan lainnya, seperti menjaga kebersihan kandang dan lingkungan sekitar. Pengobatan untuk parasit internal sering kali melibatkan pemberian obat cacing, sedangkan untuk parasit eksternal dapat menggunakan obat anti-parasit topikal atau melalui pemeliharaan kandang yang bersih.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pencegahan Mastitis :</strong> Mastitis adalah infeksi pada kelenjar susu yang umum terjadi pada sapi perah dan dapat menyebabkan penurunan kualitas susu yang signifikan. Untuk mencegah mastitis, penting untuk menjaga kebersihan udder dan menggunakan teknik pemerasan yang benar. Selain itu, pemeriksaan udder secara rutin untuk mendeteksi tanda-tanda infeksi atau iritasi sangat penting. Menggunakan alat pemerah susu yang higienis dan rutin membersihkan udder sebelum pemerasan adalah langkah preventif yang baik.</li>
            <li style={{ marginBottom: '10px' }}><strong>Perawatan Kuku dan Gigi :</strong> Kuku sapi yang tidak terawat dapat menyebabkan masalah mobilitas dan infeksi, sementara masalah gigi dapat memengaruhi kemampuan sapi untuk mengunyah makanan dengan benar. Melakukan pemotongan kuku secara berkala dan pemeriksaan gigi sapi sangat penting untuk memastikan sapi tetap nyaman dan sehat. Pemotongan kuku dan pemeriksaan gigi juga dapat mencegah terjadinya cedera yang lebih serius pada sapi.</li>
            <li style={{ marginBottom: '10px' }}><strong>Manajemen Stres Stres :</strong> Stres dapat memengaruhi kesehatan dan produktivitas sapi. Oleh karena itu, penting untuk mengurangi faktor-faktor yang menyebabkan stres, seperti suhu ekstrem, kekurangan pakan, atau perubahan lingkungan yang tiba-tiba. Membuat lingkungan kandang yang nyaman dengan ventilasi yang baik, pengaturan suhu yang tepat, serta menjaga interaksi sosial yang positif antara sapi sangat membantu mengurangi stres pada sapi.</li>
            <li style={{ marginBottom: '10px' }}><strong>Manajemen Reproduksi :</strong> Kesehatan reproduksi sapi sangat mempengaruhi produktivitas jangka panjang, baik dalam produksi susu maupun daging. Pemilihan bibit yang sehat dan pengaturan waktu reproduksi yang tepat sangat penting untuk memastikan sapi melahirkan pada waktu yang optimal dan dalam kondisi sehat. Program inseminasi buatan atau pengawinan dengan sapi jantan berkualitas tinggi dapat membantu meningkatkan hasil produksi sapi.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pemantauan Kesehatan dengan Teknologi :</strong> Pemanfaatan teknologi dalam pemantauan kesehatan sapi semakin berkembang. Penggunaan alat atau sistem digital untuk memantau suhu tubuh, detak jantung, dan pola makan sapi dapat membantu mendeteksi masalah kesehatan lebih cepat. Beberapa peternakan besar juga menggunakan sistem pemantauan otomatis untuk mendeteksi tanda-tanda penyakit atau stres, memungkinkan tindakan cepat dilakukan untuk mencegah penyebaran penyakit.</li>
          </ul>
        </>
      ),
    },
    {
      topic: "Produksi Susu",
      content: (
        <>
        <p style={{ textAlign: "left", marginTop: "0px" }}>10 Maret 2025</p>
         <h2 style={{ textAlign: "center" }}>Strategi Peningkatan Produksi Susu Sapi</h2>
          <img 
            src={Merawat} 
            alt="Produksi Susu" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }} 
          />
          <p>Artikel ini membahas strategi yang dapat diterapkan untuk meningkatkan produksi susu sapi secara efisien dan berkelanjutan, yaitu:</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Peningkatan Kualitas Pakan :</strong> Pemberian pakan bernutrisi tinggi seperti hijauan segar, silase, dan konsentrat, serta suplemen mineral dan vitamin sangat penting untuk menunjang kesehatan dan produksi susu</li>
            <li style={{ marginBottom: '10px' }}><strong>Manajemen Kesehatan Sapi :</strong> Kesehatan sapi harus diperhatikan dengan vaksinasi rutin, menjaga kebersihan kandang, serta penanganan cepat terhadap sapi yang sakit agar produksi susu tetap optimal.</li>
            <li style={{ marginBottom: '10px' }}><strong>Genetika dan Pemuliaan :</strong> Penggunaan inseminasi buatan dengan bibit unggul dapat menghasilkan keturunan dengan produksi susu lebih tinggi dan kualitas genetik yang lebih baik.</li>
            <li style={{ marginBottom: '10px' }}><strong>Manajemen Pemerahan yang Efektif :</strong> Proses pemerahan harus dilakukan secara teratur dengan teknik yang benar serta kebersihan peralatan yang terjaga untuk menghindari risiko infeksi ambing dan mempertahankan produksi susu.</li>
            <li style={{ marginBottom: '10px' }}><strong>Lingkungan dan Kesejahteraan Sapi :</strong> Lingkungan kandang yang nyaman dengan ventilasi baik, akses air bersih yang cukup, serta minimisasi stres dapat meningkatkan kesejahteraan sapi dan produktivitas susu.</li>
            <li style={{ marginBottom: '10px' }}><strong>Monitoring dan Analisis Produksi :</strong> Penerapan sistem pemantauan produksi susu harian dan pencatatan data yang baik dapat membantu dalam menganalisis pola produksi serta menemukan solusi jika terjadi penurunan hasil susu.</li>
          </ul>
        </>
      ),
    },
    {
      topic: "Teknologi Peternakan",
      content: (
        <>
        <p style={{ textAlign: "left", marginTop: "0px" }}>5 Maret 2025</p>
         <h2 style={{ textAlign: "center" }}>Teknologi IoT untuk Monitoring Peternakan</h2>
          <img 
            src={Teknologi} 
            alt="Teknologi Peternakan" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }} 
          />
          <p>Penggunaan teknologi IoT dalam peternakan dapat membantu peternak memantau kondisi sapi secara real-time.Internet of Things (IoT) memberikan solusi inovatif dalam monitoring peternakan dengan menghubungkan perangkat sensor dan sistem otomatisasi untuk meningkatkan efisiensi dan produktivitas, diantaranya:</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Sensor lingkungan :</strong> Digunakan untuk memantau suhu, kelembaban, dan kualitas udara di kandang guna memastikan kondisi yang ideal bagi ternak.</li>
            <li style={{ marginBottom: '10px' }}><strong>Sensor kesehatan :</strong> Dapat mendeteksi detak jantung, suhu tubuh, tingkat aktivitas, dan perilaku makan, sehingga peternak dapat segera mengambil tindakan jika ada tanda-tanda penyakit.</li>
            <li style={{ marginBottom: '10px' }}><strong>RFID dan GPS tracking :</strong> Memungkinkan identifikasi individu dan pemantauan lokasi ternak secara real-time untuk mencegah kehilangan dan mengelola pergerakan hewan dengan lebih efektif. </li>
            <li style={{ marginBottom: '10px' }}><strong>Sistem pemberian pakan otomatis :</strong> Dapat menyesuaikan jumlah dan waktu pemberian pakan sesuai dengan kebutuhan ternak, meningkatkan efisiensi pakan dan kesehatan hewan. </li>
            <li style={{ marginBottom: '10px' }}><strong>Platform berbasis Cloud :</strong> Memungkinkan peternak untuk mengakses data dan analisis melalui aplikasi mobile atau dashboard, sehingga keputusan dapat diambil secara cepat dan akurat. </li>
          </ul>
        </>
      ),
    },
    {
      topic: "Pakan Ternak",
      content: (
        <>
         <p style={{ textAlign: "left", marginTop: "0px" }}>28 Februari 2025</p>
         <h2 style={{ textAlign: "center" }}>Pakan Fermentasi untuk Sapi: Manfaat dan Cara Membuatnya</h2>
          <img 
            src={Makanan} 
            alt="Pakan Ternak" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }} 
          />
          <p>Pakan fermentasi dapat meningkatkan pencernaan sapi dan kualitas susu.Proses fermentasi juga menghasilkan probiotik alami yang baik untuk kesehatan pencernaan sapi, mengurangi risiko penyakit pencernaan, serta meningkatkan daya tahan tubuh. Selain itu, pakan fermentasi lebih tahan lama dibandingkan hijauan segar, sehingga dapat menjadi cadangan pakan saat musim kemarau.</p>
          <p>Cara Membuat Pakan Fermentasi</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Persiapan Bahan :</strong> Siapkan hijauan berkualitas seperti rumput gajah, jerami padi, atau daun jagung, lalu tambahkan dedak, ampas tahu, atau bungkil kelapa sebagai sumber energi, serta gunakan starter fermentasi seperti EM4 atau ragi tape untuk mempercepat proses fermentasi.</li>
            <li style={{ marginBottom: '10px' }}><strong>Proses Pembuatan :</strong> Cincang hijauan kecil-kecil, campurkan dengan dedak dan bahan tambahan, larutkan EM4 atau ragi dalam air, semprotkan merata pada campuran, masukkan ke dalam drum atau plastik kedap udara, padatkan, tutup rapat, dan diamkan selama 7-14 hari hingga fermentasi selesai.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pemberian ke Sapi :</strong> Buka wadah fermentasi, biarkan terkena udara beberapa menit, dan berikan pakan fermentasi sesuai dengan kebutuhan sapi. </li>
          </ul>
        </>
      ),
    },
    {
      topic: "Manajemen Kesehatan",
      content: (
        <>
          <p style={{ textAlign: "left", marginTop: "0px" }}>20 Februari 2025</p>
         <h2 style={{ textAlign: "center" }}>Pentingnya Vaksinasi untuk Sapi di Peternakan</h2>
          <img 
            src={Kesehatan} 
            alt="Manajemen Kesehatan" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }} 
          />
          <p>Vaksinasi adalah langkah penting dalam menjaga kesehatan sapi.</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Mencegah Penyakit Infeksius :</strong> Vaksinasi membantu mencegah penyakit infeksius yang dapat menyerang sapi, seperti brucellosis, anthrax, dan mastitis. Penyakit ini dapat menyebabkan penurunan kesehatan sapi secara signifikan, mengganggu produksi susu atau daging, bahkan menyebabkan kematian pada ternak.</li>
            <li style={{ marginBottom: '10px' }}><strong>Meningkatkan Daya Tahan Tubuh Sapi :</strong> Dengan vaksinasi, sistem kekebalan tubuh sapi menjadi lebih kuat dan mampu melawan infeksi secara lebih efektif. Ini mengurangi risiko sapi terinfeksi penyakit yang bisa menurunkan kualitas produksi.</li>
            <li style={{ marginBottom: '10px' }}><strong>Menjaga Keberlanjutan Produksi :</strong> Vaksinasi dapat memperpanjang umur produktif sapi dengan mencegah penyakit yang dapat menurunkan kinerja ternak. Sapi yang sehat akan menghasilkan susu dan daging secara konsisten, meningkatkan efisiensi dan keuntungan peternakan. </li>
            <li style={{ marginBottom: '10px' }}><strong>Meningkatkan Keamanan dan Kualitas Produk :</strong> Dengan sapi yang sehat, kualitas susu dan daging yang dihasilkan juga lebih baik, karena sapi yang terhindar dari penyakit menghasilkan produk yang lebih higienis dan bernutrisi tinggi.</li>
          </ul>
        </>
      ),

    },
    {
      topic: "Teknologi Peternakan",
      content: (
        <>
         <p style={{ textAlign: "left", marginTop: "0px" }}>15 Februari 2025</p>
         <h2 style={{ textAlign: "center" }}>Mengelola Limbah Peternakan dengan Teknologi Modern</h2>
          <img 
            src={Teknologi} 
            alt="Teknologi Peternakan" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }} 
          />
          <p>Limbah peternakan dapat dikelola dengan teknologi modern untuk mengurangi dampak lingkungan. Artikel ini membahas solusi inovatif.</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Biogas :</strong> Limbah kotoran sapi dapat diolah menjadi biogas untuk menghasilkan energi terbarukan yang dapat digunakan di peternakan, seperti untuk pemanasan atau pembangkit listrik kecil.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pupuk Organik :</strong> Limbah peternakan dapat dikomposkan untuk menghasilkan pupuk organik berkualitas yang mendukung pertanian atau dijual sebagai produk tambahan.</li>
            <li style={{ marginBottom: '10px' }}><strong>Bioremediasi Limbah Cair :</strong> Teknologi bioremediasi menggunakan mikroorganisme untuk mengolah limbah cair, mengurangi pencemaran, dan memungkinkan penggunaan kembali air limbah.</li>
            <li style={{ marginBottom: '10px' }}><strong>Sensor Limbah :</strong> Sensor untuk memantau kualitas limbah secara real-time membantu peternak mengelola limbah dengan efisien dan ramah lingkungan.</li>
          </ul>
        </>
      ),
    },
    {
      topic: "Perawatan Sapi",
      content: (
        <>
        <p style={{ textAlign: "left", marginTop: "0px" }}>10 Februari 2025</p>
         <h2 style={{ textAlign: "center" }}>Tips Memilih Bibit Sapi Berkualitas untuk Peternakan</h2>
          <img 
            src={Merawat} 
            alt="Teknologi Peternakan" 
            style={{ width: "70%", borderRadius: "0px", marginBottom: "30px", display: "block", margin: "0 auto" }} 
          />
          <p>Memilih bibit sapi yang berkualitas adalah langkah awal untuk peternakan yang sukses. Artikel ini memberikan tips praktis untuk memilih bibit terbaik.</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Perhatikan Kesehatan Fisik :</strong> Pilih sapi yang terlihat sehat, dengan bulu mengkilap, mata cerah, serta tubuh yang tidak cacat atau terluka. Pastikan sapi bebas dari tanda-tanda penyakit, seperti batuk, diare, atau kelelahan berlebihan.</li>
            <li style={{ marginBottom: '10px' }}><strong>Periksa Umur dan Bobot :</strong> Pilih bibit sapi yang sesuai dengan tujuan peternakan, baik untuk produksi susu atau daging. Sapi yang terlalu muda atau terlalu tua dapat mengurangi produktivitas. Pastikan sapi memiliki bobot tubuh yang ideal sesuai umur dan jenisnya.</li>
            <li style={{ marginBottom: '10px' }}><strong>Cek Riwayat Keturunan :</strong> Pilih sapi dengan riwayat keturunan yang baik. Sapi dengan induk yang produktif, baik dalam produksi susu atau daging, biasanya mewariskan kualitas yang sama pada keturunannya.</li>
            <li style={{ marginBottom: '10px' }}><strong>Lihat Struktur Tubuh :</strong> Pilih sapi dengan struktur tubuh yang proporsional, terutama bagian kaki, punggung, dan kaki depan. Sapi yang memiliki tubuh kuat dan seimbang akan lebih produktif dan tahan terhadap stres.</li>
            <li style={{ marginBottom: '10px' }}><strong>Cek Status Vaksinasi dan Kesehatan :</strong> Pastikan bibit sapi telah menerima vaksinasi yang lengkap dan rutin, serta pemeriksaan kesehatan dari dokter hewan untuk memastikan sapi bebas dari penyakit menular atau genetik.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pertimbangkan Lingkungan dan Pakan :</strong> Pilih bibit sapi yang sudah terbiasa dengan lingkungan dan pakan yang akan diberikan di peternakan Anda. Sapi yang adaptif terhadap kondisi peternakan akan lebih cepat berkembang dan sehat.</li>
          </ul>
        </>
      ),
    },
  ];

  // Mengambil post berdasarkan id
  const post = blogPosts[id];

console.log('ID:', id);
console.log('Post:', post);

if (!post) {
  return <h2>Artikel tidak ditemukan</h2>;
}

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 offset-lg-2">
          <h1 className="mb-4" style={{ marginTop: "150px" }}>{post.title}</h1>
          <p className="text-muted">{post.date}</p>
          <img
            src={post.image}
            alt={post.title}
            className="img-fluid mb-4"
            style={{ borderRadius: "8px" }}
          />
          <p>{post.content}</p>
          <Link to="/blog" className="btn btn-success mt-4" style={{ marginBottom: "50px" }}>
            Kembali ke Blog
          </Link>
        </div>
      </div>
    </div>
  );
  
};

export default DetailBlog;