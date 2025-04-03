import React from "react";
import { useParams } from "react-router-dom";

import Merawat from "../../assets/image/merawat.jpg";
import Teknologi from "../../assets/image/teknologi.jpg";
import Makanan from "../../assets/image/makanan.jpg";
import Kesehatan from "../../assets/image/kesehatan.jpg";
import Stress from "../../assets/image/stress.jpg";
import Lingkungan from "../../assets/image/lingkungan.jpg";

// Data artikel blog
const blogPosts = [
  {
    fullContent: (
      <>
       {/* Menambahkan margin top agar judul artikel turun ke bawah */}
       <div className="mt-12">
          <h1 className="text-3xl font-bold text-center">Cara Merawat Sapi untuk Produksi Susu Berkualitas</h1>
        </div>
        <img 
          src={Merawat} 
          alt="Merawat Sapi" 
          className="w-full h-64 object-cover rounded-lg mb-10" 
        />
        <p>Artikel lengkap tentang cara merawat sapi untuk produksi susu berkualitas akan dibahas di sini. Tips, trik, dan panduan langkah demi langkah bisa ditemukan di sini. Cara Merawat Sapi untuk Produksi Susu Berkualitas.</p>
        <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '10px' }}><strong>Pemberian Pakan Seimbang:</strong> Pemberian pakan yang seimbang sangat penting untuk mendukung kesehatan dan produktivitas sapi perah. Pakan yang kaya akan energi, protein, vitamin, dan mineral seperti rumput segar, silase, dan konsentrat harus diberikan secara tepat. Pakan yang baik membantu sapi menjaga kondisi tubuhnya, memperbaiki kualitas susu, dan mendukung proses reproduksi. Selain itu, pemberian pakan harus disesuaikan dengan kebutuhan setiap sapi berdasarkan usia, fase reproduksi, dan status kesehatannya.</li>
          <li style={{ marginBottom: '10px' }}><strong>Akses Air Bersih:</strong> Air adalah komponen vital yang sering diabaikan dalam pemeliharaan sapi perah. Kekurangan air dapat mempengaruhi kesehatan sapi dan kualitas susu yang dihasilkan. Sapi perah membutuhkan akses air bersih dan segar sepanjang waktu, karena air yang cukup tidak hanya membantu proses pencernaan, tetapi juga mempengaruhi produksi susu. Pastikan wadah air selalu terisi dan tidak tercemar untuk menghindari infeksi atau penyak</li>
          <li style={{ marginBottom: '10px' }}><strong>Perawatan Kesehatan:</strong> Untuk menjaga kesehatan sapi, vaksinasi rutin dan pemeriksaan kesehatan harus dilakukan secara berkala. Pemeriksaan ini meliputi deteksi penyakit, pengendalian parasit, dan perawatan kaki dan gigi sapi. Sapi yang sehat akan lebih produktif dalam menghasilkan susu dan memiliki daya tahan tubuh yang lebih baik terhadap penyakit. Selain itu, perawatan kesehatan yang baik akan meningkatkan kualitas susu dan mengurangi tingkat infeksi yang dapat merugikan produksi susu.</li>
          <li style={{ marginBottom: '10px' }}><strong>Lingkungan Nyaman:</strong> Sapi perah yang hidup dalam lingkungan yang bersih dan nyaman lebih cenderung menghasilkan susu dalam jumlah yang optimal. Kandang harus selalu dalam keadaan bersih, kering, dan memiliki ventilasi yang baik. Hindari suhu ekstrem yang dapat menyebabkan stres pada sapi, karena stres dapat menurunkan produksi susu secara signifikan. Pastikan juga ruang untuk bergerak cukup luas, karena sapi yang aktif dan nyaman lebih produktif.</li>
          <li style={{ marginBottom: '10px' }}><strong>Perawatan Udder:</strong> Cegah mastitis dengan menjaga kebersihan udder dan memeriksa kesehatan kelenjar susu secara rutin. Udder adalah bagian tubuh sapi yang sangat penting dalam produksi susu. Kebersihan udder harus dijaga untuk mencegah infeksi seperti mastitis, yang dapat menurunkan kualitas dan kuantitas susu. Periksa kesehatan kelenjar susu secara rutin, pastikan tidak ada luka atau infeksi, dan lakukan pembersihan udder sebelum memerah susu untuk menghindari kontaminasi. Perawatan udder yang baik juga melibatkan teknik pemerasan yang tepat untuk mencegah cedera.</li>
          <li style={{ marginBottom: '10px' }}><strong>Pemerasan Rutin:</strong> Perah susu pada waktu yang konsisten setiap hari menggunakan teknik yang tepat untuk menghindari stres pada sapi. Pemerasan susu yang rutin dan tepat waktu sangat penting dalam memastikan sapi tetap nyaman dan sehat. Pemerasan susu sebaiknya dilakukan pada waktu yang konsisten setiap hari untuk menghindari penumpukan susu yang dapat menyebabkan mastitis. Teknik pemerasan yang benar juga penting untuk mencegah stres pada sapi, yang bisa berdampak buruk pada kualitas susu. Gunakan alat pemerah susu yang higienis dan periksa kondisi sapi setelah diperah untuk memastikan tidak ada cedera.</li>
          <li style={{ marginBottom: '10px' }}><strong>Manajemen Reproduksi:</strong> Pilih bibit berkualitas dan berikan masa kering yang cukup untuk sapi sebelum melahirkan agar produksi susu tetap optimal. Pilih bibit sapi perah yang berkualitas tinggi untuk mendapatkan hasil produksi susu yang optimal. Selain itu, penting untuk memberikan masa kering yang cukup bagi sapi sebelum proses kelahiran untuk mempersiapkan tubuh sapi dalam fase menyusui. Pemilihan bibit yang baik dan pengaturan waktu reproduksi yang tepat akan memastikan sapi menghasilkan susu dengan kualitas yang baik setelah melahirkan.</li>
          <li style={{ marginBottom: '10px' }}><strong>Monitoring:</strong> Catat jumlah susu yang diperah setiap hari untuk memantau kesehatan dan kinerja sapi. Melakukan pencatatan dan pemantauan jumlah susu yang diperah setiap hari sangat penting dalam manajemen peternakan sapi perah. Pemantauan ini membantu mengetahui tren produksi susu dan mendeteksi jika ada penurunan yang tidak wajar, yang bisa menjadi indikasi adanya masalah kesehatan pada sapi atau faktor lain yang mempengaruhi produksi susu. Dengan mencatat data secara rutin, peternak dapat membuat keputusan yang lebih baik terkait perawatan dan perbaikan dalam sistem peternakan.</li>
        </ul>
      </>
    ),
  },
  {
      fullContent: (
        <>
        <div className="mt-12">
          <h1 className="text-3xl font-bold text-center">Pemanfaatan Teknologi dalam Peternakan Sapi</h1>
        </div>
          <img 
            src={Teknologi} 
            alt="Pemanfaatan Teknologi" 
            className="w-full h-64 object-cover rounded-lg mb-10" 
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
      fullContent: (
        <>
        <div className="mt-12">
          <h1 className="text-3xl font-bold text-center">Makanan Terbaik untuk Sapi Perah</h1>
        </div>
          <img 
            src={Makanan} 
            alt="Makanan Sapi" 
            className="w-full h-64 object-cover rounded-lg mb-10" 
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
      fullContent: (
        <>
        <div className="mt-12">
          <h1 className="text-3xl font-bold text-center">Manajemen Kesehatan Sapi di Peternakan</h1>
        </div>
          <img 
            src={Kesehatan} 
            alt="Manajemen Kesehatan" 
            className="w-full h-64 object-cover rounded-lg mb-10" 
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
      fullContent: (
        <>
        <div className="mt-12">
          <h1 className="text-3xl font-bold text-center">Pengaruh Stres pada Produksi Susu Sapi Perah</h1>
        </div>
          <img 
            src={Stress} 
            alt="Sapi Stress" 
            className="w-full h-64 object-cover rounded-lg mb-10" 
          />
          <p>Stres pada sapi perah dapat memiliki dampak signifikan terhadap produksi susu, kualitas susu, serta kesehatan sapi itu sendiri. Sapi yang mengalami stres akan mengalami penurunan performa yang berdampak langsung pada hasil produksi susu. Oleh karena itu, penting bagi peternak untuk memahami pengaruh stres terhadap sapi perah dan bagaimana cara mengurangi faktor-faktor yang dapat menyebabkan stres pada sapi. Berikut adalah penjelasan lebih rinci tentang pengaruh stres pada produksi susu sapi perah:</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Penurunan Produksi Susu :</strong> Stres dapat mengganggu sistem hormonal sapi, yang pada gilirannya mempengaruhi produksi susu. Ketika sapi mengalami stres, tubuhnya menghasilkan hormon stres, seperti kortisol, yang dapat mengurangi jumlah susu yang dihasilkan. Stres yang berkepanjangan, baik akibat faktor lingkungan, kesehatan, atau manajemen yang buruk, dapat menyebabkan penurunan produksi susu secara signifikan. Penurunan produksi ini bisa berlangsung selama beberapa hari atau minggu setelah sapi mengalami stres.</li>
            <li style={{ marginBottom: '10px' }}><strong>Kualitas Susu Menurun :</strong> Selain mengurangi jumlah produksi susu, stres juga dapat memengaruhi kualitas susu. Sapi yang mengalami stres cenderung menghasilkan susu dengan kualitas yang lebih rendah, misalnya kandungan lemak dan protein susu yang lebih rendah. Selain itu, stres dapat menyebabkan peningkatan kadar laktosa dalam susu, yang berpotensi mengurangi nilai komersialnya. Dalam beberapa kasus, stres juga dapat menyebabkan susu menjadi lebih rentan terhadap kontaminasi bakteri, yang dapat mengurangi kualitas higienis susu.</li>
            <li style={{ marginBottom: '10px' }}><strong>Gangguan Kesehatan pada Sapi :</strong> Stres yang berkepanjangan pada sapi dapat menyebabkan gangguan kesehatan lainnya, seperti penurunan daya tahan tubuh, masalah pencernaan, dan peningkatan kerentanannya terhadap penyakit. Sapi yang stres lebih rentan terhadap infeksi, seperti mastitis (infeksi pada kelenjar susu), yang tentunya akan berdampak pada produksi susu dan kesehatannya secara keseluruhan. Stres juga dapat memengaruhi siklus reproduksi sapi, yang dapat mengurangi kemampuan sapi untuk hamil atau melahirkan, serta menurunkan efisiensi produksi susu.</li>
            <li style={{ marginBottom: '10px' }}><strong>Stres Akibat Lingkungan :</strong> Salah satu penyebab stres pada sapi perah adalah faktor lingkungan yang buruk. Suhu yang terlalu tinggi atau rendah, kelembapan yang tinggi, serta kurangnya ventilasi yang baik dapat menyebabkan sapi merasa tidak nyaman. Sapi yang dipelihara di lingkungan yang tidak kondusif ini akan mengalami stres termal (stres akibat suhu ekstrem), yang berdampak langsung pada produksi susu. Untuk itu, penting bagi peternak untuk memastikan kandang sapi memiliki ventilasi yang baik dan suhu yang terjaga agar sapi tetap merasa nyaman.</li>
            <li style={{ marginBottom: '10px' }}><strong>Stres Akibat Pemeliharaan dan Perawatan yang Buruk :</strong> Cara penanganan sapi yang salah, seperti pemerasan susu yang kasar atau tidak teratur, juga dapat menyebabkan stres pada sapi. Sapi yang diperah secara tidak teratur atau menggunakan alat yang tidak higienis dapat mengalami ketidaknyamanan atau rasa sakit, yang akhirnya berujung pada penurunan produksi susu. Selain itu, kurangnya interaksi sosial dengan sapi lain atau pemisahan anak sapi dari induknya pada usia yang terlalu dini juga dapat menyebabkan stres.</li>
            <li style={{ marginBottom: '10px' }}><strong>Stres Psikologis dan Sosial :</strong> Sapi adalah hewan sosial yang membutuhkan interaksi dengan sapi lain untuk merasa aman dan nyaman. Pemisahan yang tiba-tiba atau pengasingan dari kelompok dapat menyebabkan stres psikologis, yang pada akhirnya dapat menurunkan produksi susu. Menjaga sapi dalam kelompok yang stabil dan memberikan cukup ruang untuk bergerak adalah langkah penting untuk mengurangi stres sosial.</li>
            <li style={{ marginBottom: '10px' }}><strong> Pengaruh Stres terhadap Kehamilan dan Reproduksi :</strong> Stres yang dialami sapi dapat memengaruhi kemampuan reproduksinya. Sapi yang stres mungkin mengalami gangguan ovulasi atau bahkan keguguran. Gangguan ini akan berdampak pada periode laktasi berikutnya, karena sapi yang tidak hamil atau tidak dapat melahirkan akan mengalami penurunan produksi susu. Oleh karena itu, mengelola stres dengan baik juga berpengaruh pada keberhasilan manajemen reproduksi sapi.</li>
          </ul>
          <p>Untuk mengurangi stres pada sapi perah dan meminimalkan dampaknya terhadap produksi susu, peternak bisa melakukan beberapa langkah sebagai berikut:</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Penyediaan Lingkungan yang Nyaman :</strong> Pastikan kandang memiliki ventilasi yang baik, suhu yang terjaga, dan kebersihan yang terawat.</li>
            <li style={{ marginBottom: '10px' }}><strong>Perawatan Rutin dan Konsisten :</strong> Pemerasan susu yang teratur dan teknik yang benar akan membantu mengurangi rasa sakit atau ketidaknyamanan pada sapi.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pengelolaan Pakan yang Tepat :</strong> Pastikan sapi mendapatkan pakan yang bergizi dan cukup, serta selalu memiliki akses ke air bersih.</li>
            <li style={{ marginBottom: '10px' }}><strong>Mengurangi Pemisahan Sosial :</strong> Sapi lebih nyaman jika hidup dalam kelompok yang stabil. Hindari pemisahan yang tidak perlu antara sapi.</li>
            <li style={{ marginBottom: '10px' }}><strong>Stimulasi Sosial :</strong> Memberikan perhatian ekstra pada sapi yang terlihat stres atau cemas, serta menyediakan ruang gerak yang cukup.</li>
            <li style={{ marginBottom: '10px' }}><strong>Monitor Kesehatan Secara Berkala :</strong> Pemeriksaan kesehatan yang rutin dapat mencegah masalah kesehatan yang lebih besar yang berpotensi menyebabkan stres.</li>
          </ul>
        </>
      ),
  },
  {
      fullContent: (
        <>
         <div className="mt-12">
          <h1 className="text-3xl font-bold text-center">Sapi Perah dan Pengaruh Lingkungan terhadap Produksi Susu</h1>
        </div>
          <img 
            src={Lingkungan} 
            alt="Pengaruh Lingkungan" 
            className="w-full h-64 object-cover rounded-lg mb-10" 
          />
          <p>Lingkungan tempat sapi perah hidup memiliki pengaruh yang sangat besar terhadap kesehatan dan produktivitasnya, termasuk dalam hal produksi susu. Faktor-faktor lingkungan yang tidak mendukung atau tidak optimal dapat menyebabkan stres pada sapi, yang pada gilirannya akan menurunkan jumlah dan kualitas susu yang dihasilkan. Oleh karena itu, memahami hubungan antara lingkungan dan produksi susu sangat penting untuk peternakan sapi perah yang sukses.</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Suhu dan Stres Termal :</strong> Suhu yang terlalu tinggi atau rendah dapat menyebabkan stres termal pada sapi perah. Sapi yang terpapar suhu ekstrem, baik itu panas yang berlebihan maupun cuaca dingin yang ekstrem, akan mengalami ketidaknyamanan yang mengarah pada penurunan produksi susu.</li>
            <li style={{ marginBottom: '10px' }}><strong>Kelembapan :</strong> Kelembapan tinggi dapat memperburuk efek stres panas. Kelembapan yang tinggi mengurangi kemampuan tubuh sapi untuk mendinginkan diri melalui penguapan keringat. Akibatnya, sapi lebih rentan terhadap stres panas, yang berdampak negatif pada kesehatan dan produktivitasnya. Kelembapan tinggi juga dapat menyebabkan masalah pernapasan dan meningkatkan risiko infeksi. Sebaliknya, kelembapan yang terlalu rendah, terutama dalam kandang tertutup, bisa menyebabkan dehidrasi pada sapi. Dehidrasi dapat menurunkan produksi susu dan menyebabkan masalah kesehatan lainnya.</li>
            <li style={{ marginBottom: '10px' }}><strong>Ventilasi dan Kualitas Udara :</strong> Ventilasi yang buruk dapat menyebabkan penurunan kualitas udara di dalam kandang, yang berujung pada penurunan kesehatan sapi. Sapi yang terpapar udara yang kotor atau lembap akan lebih rentan terhadap penyakit pernapasan dan infeksi. Selain itu, sirkulasi udara yang buruk dapat menyebabkan penumpukan gas berbahaya seperti amonia, yang dapat merusak saluran pernapasan sapi dan menurunkan kualitas susu. Menjaga ventilasi yang baik dengan memastikan sirkulasi udara yang lancar dan menyediakan udara segar adalah langkah penting untuk mencegah stres dan menjaga produktivitas susu sapi.</li>
            <li style={{ marginBottom: '10px' }}><strong>Kebersihan Kandang :</strong> Kandang yang kotor dapat menyebabkan infeksi dan penyakit pada sapi. Lingkungan yang kotor tidak hanya memperburuk kualitas udara, tetapi juga meningkatkan risiko penyakit kulit dan mastitis pada sapi. Mastitis adalah infeksi pada kelenjar susu yang dapat menurunkan kualitas dan kuantitas susu secara drastis. Pembersihan kandang yang rutin dan menjaga kebersihan tempat tidur sapi sangat penting untuk mencegah kontaminasi dan memastikan sapi merasa nyaman.</li>
            <li style={{ marginBottom: '10px' }}><strong>Kondisi Tanah dan Lahan :</strong> Jika sapi perah dibiarkan merumput di padang rumput, kualitas rumput dan kondisi lahan akan mempengaruhi kesehatan dan produksi susu sapi. Padang rumput yang kering atau tercemar dapat mengurangi asupan pakan berkualitas tinggi bagi sapi, yang dapat menurunkan produksi susu. Selain itu, rumput yang terkontaminasi oleh pestisida atau bahan kimia berbahaya dapat menyebabkan masalah kesehatan bagi sapi. Menjaga kualitas padang rumput dan memastikan tanah tidak tercemar adalah langkah penting dalam mengoptimalkan produksi susu dari sapi perah.</li>
            <li style={{ marginBottom: '10px' }}><strong>Stabilitas Lingkungan Sosial :</strong> Sapi adalah hewan sosial yang cenderung lebih bahagia dan produktif jika hidup dalam kelompok yang stabil. Gangguan sosial, seperti pemisahan mendadak antara induk dan anak sapi atau perubahan mendalam dalam struktur kelompok, dapat menyebabkan stres sosial. Stres sosial dapat berdampak pada produksi susu dan kesehatan mental sapi. Sapi yang terisolasi atau stres sosial cenderung menghasilkan lebih sedikit susu dibandingkan dengan sapi yang hidup dalam kelompok yang stabil.</li>
            <li style={{ marginBottom: '10px' }}><strong> Faktor Lain: Kebisingan dan Gangguan :</strong> Faktor lingkungan lain yang sering diabaikan adalah kebisingan. Suara keras atau berisik di sekitar kandang sapi, seperti suara mesin atau kendaraan, dapat menyebabkan stres. Kebisingan yang terus-menerus dapat mengganggu kenyamanan sapi, mengurangi kualitas tidur, dan meningkatkan tingkat stres mereka, yang pada akhirnya berdampak negatif pada produksi susu.</li>
          </ul>
          <p>Cara Mengoptimalkan Lingkungan untuk Produksi Susu yang Optimal</p>
          <ul style={{ paddingLeft: '20px', textAlign: 'justify', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}><strong>Suhu yang Terjaga :</strong> Gunakan sistem pendingin untuk mengurangi panas berlebih di musim panas, atau sediakan alat pemanas di musim dingin untuk menjaga suhu kandang tetap stabil.</li>
            <li style={{ marginBottom: '10px' }}><strong>Ventilasi yang Baik :</strong> Pastikan kandang memiliki ventilasi yang cukup untuk sirkulasi udara yang baik. Sistem ventilasi harus dirancang untuk mengalirkan udara segar dan mengurangi kelembapan berlebih.</li>
            <li style={{ marginBottom: '10px' }}><strong>Kebersihan Rutin :</strong> Lakukan pembersihan kandang secara berkala untuk menjaga kebersihan dan mencegah infeksi pada sapi.</li>
            <li style={{ marginBottom: '10px' }}><strong>Pemberian Pakan Berkualitas :</strong> Pastikan sapi mendapatkan pakan yang bergizi dan cukup, baik berupa rumput segar, silase, maupun konsentrat yang sesuai dengan kebutuhannya.</li>
            <li style={{ marginBottom: '10px' }}><strong>Lingkungan Sosial yang Stabil :</strong> Jaga sapi dalam kelompok yang stabil dan hindari pemisahan mendadak untuk mengurangi stres sosial.</li>
          </ul>
        </>
      ),
  },
];

const BlogDetail = () => {
  const { id } = useParams(); // Mendapatkan ID artikel dari URL
  const post = blogPosts[id]; // Mengambil artikel berdasarkan ID

  if (!post) {
    return <p>Artikel tidak ditemukan.</p>;
  }

  return (
    <div className="container py-5">
      <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
      <p className="text-sm text-gray-500 mb-2">{post.date}</p>
      <p className="text-base">{post.fullContent}</p>
    </div>
  );
};

export default BlogDetail;
