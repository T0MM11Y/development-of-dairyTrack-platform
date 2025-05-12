import { 
  FaHorse, 
  FaBreadSlice, 
  FaGlassWhiskey,
  FaMoneyBillWave
} from 'react-icons/fa';

function Dashboard() {
  const stats = [
    { title: "Total Sapi", value: "142", icon: <FaHorse />, color: "primary" },
    { title: "Stok Pakan (kg)", value: "1,250", icon: <FaBreadSlice />, color: "success" },
    { title: "Produksi Susu (hari ini)", value: "320 L", icon: <FaGlassWhiskey />, color: "info" },
    { title: "Pendapatan (bulan ini)", value: "Rp 12.5 Jt", icon: <FaMoneyBillWave />, color: "warning" }
  ];

  return (
    <div className="dashboard sb-admin-content">
      <h1 className="page-header">Dashboard Overview</h1>
      
      <div className="row mb-4">
        {stats.map((stat, index) => (
          <div className="col-xl-3 col-md-6 mb-4" key={index}>
            <div className={`card border-left-${stat.color} shadow h-100 py-2`}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className={`text-xs font-weight-bold text-${stat.color} text-uppercase mb-1`}>
                      {stat.title}
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {stat.value}
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className={`icon-circle bg-${stat.color}-light`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="row">
        <div className="col-xl-8 col-lg-7">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Grafik Produksi Susu Mingguan</h6>
            </div>
            <div className="card-body">
              <div className="chart-area">
                {/* Tempat untuk grafik */}
                <p className="text-center">Grafik akan ditampilkan di sini</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-4 col-lg-5">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Aktivitas Terkini</h6>
            </div>
            <div className="card-body">
              <div className="activity-feed">
                <div className="feed-item">
                  <div className="feed-time">10 menit lalu</div>
                  <div className="feed-content">Pemberian pakan pagi selesai</div>
                </div>
                <div className="feed-item">
                  <div className="feed-time">1 jam lalu</div>
                  <div className="feed-content">Pemeriksaan kesehatan 5 sapi</div>
                </div>
                <div className="feed-item">
                  <div className="feed-time">3 jam lalu</div>
                  <div className="feed-content">Produksi susu pagi: 150L</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;