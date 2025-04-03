import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getAlldailyFeedItems, deletedailyFeedItem } from "../../../../api/pakan/dailyFeedItem";
import { getAllDailyFeeds } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";

const FeedItemListPage = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedItemsResponse, dailyFeedsResponse, cowsResponse] = await Promise.all([
        getAlldailyFeedItems(),
        getAllDailyFeeds(),
        getCows(),
      ]);

      setFeedItems(feedItemsResponse.success ? feedItemsResponse.data : []);
      setDailyFeeds(dailyFeedsResponse.success ? dailyFeedsResponse.data : []);
      setCows(cowsResponse.success ? cowsResponse.data : []);
    } catch (error) {
      console.error("Failed to fetch data:", error.message);
      setFeedItems([]);
      setDailyFeeds([]);
      setCows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Kelompokkan feedItems berdasarkan daily_feed_id
  const groupedFeedItems = dailyFeeds.map((dailyFeed) => {
    const items = feedItems.filter(item => item.daily_feed_id === dailyFeed.id);
    const cow = cows.find(c => c.id === dailyFeed.cow_id);

    return {
      daily_feed_id: dailyFeed.id,
      date: dailyFeed.date,
      session: dailyFeed.session,
      cow: cow ? cow.name : "Tidak Ada Info Sapi",
      items,
    };
  });

  // Dapatkan daftar unik feed_id untuk header kolom
  const uniqueFeedIds = [...new Set(feedItems.map(item => item.feed_id))].sort((a, b) => a - b);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Pakan Harian</h2>
        <button
          onClick={() => navigate("/admin/tambah/detail-pakan-harian")}
          className="btn btn-info waves-effect waves-light"
        >
          + Tambah Pakan Harian
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading feed items...</p>
      ) : groupedFeedItems.length === 0 ? (
        <p className="text-gray-500">Tidak ada data pakan harian tersedia.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Data Pakan Harian</h4>
              <div className="table-responsive">
                <table className="table table-bordered table-striped mb-0">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Sapi</th>
                      <th>Sesi</th>
                      {uniqueFeedIds.map(feedId => (
                        <th key={feedId}>pakan {feedId} (jumlah)</th>
                      ))}
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedFeedItems.map((group) => (
                      <tr key={group.daily_feed_id}>
                        <td>{group.date}</td>
                        <td>{group.cow}</td>
                        <td>{group.session}</td>
                        {uniqueFeedIds.map(feedId => {
                          const feedItem = group.items.find(item => item.feed_id === feedId);
                          return (
                            <td key={feedId}>{feedItem ? `${feedItem.feed.name} (${feedItem.quantity}kg)` : "-"}</td>
                          );
                        })}
                        <td>
                          <button
                            className="btn btn-info btn-sm me-2"
                            onClick={() => navigate(`/admin/pakan-harian/edit/${group.daily_feed_id}`)}
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: "Konfirmasi",
                                text: "Apakah Anda yakin ingin menghapus semua data pakan untuk sapi ini?",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#d33",
                                cancelButtonColor: "#3085d6",
                                confirmButtonText: "Ya, hapus!",
                                cancelButtonText: "Batal",
                              });

                              if (result.isConfirmed) {
                                try {
                                  await Promise.all(group.items.map(item => deletedailyFeedItem(item.id)));
                                  Swal.fire("Berhasil!", "Data pakan harian telah dihapus.", "success");
                                  fetchData();
                                } catch (error) {
                                  console.error("Gagal menghapus data pakan:", error.message);
                                  Swal.fire("Error!", "Terjadi kesalahan saat menghapus.", "error");
                                }
                              }
                            }}
                            className="btn btn-danger btn-sm"
                          >
                            <i className="ri-delete-bin-6-line"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedItemListPage;