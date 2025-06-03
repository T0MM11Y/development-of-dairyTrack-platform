import React, { useEffect, useState } from "react";
import { getAllFeedStocks, getAllFeedStockHistory, deleteFeedStockHistory } from "../../../../controllers/feedStockController";
import { listFeeds } from "../../../../controllers/feedController";
import AddFeedStock from "./AddStock";
import EditFeedStock from "./EditStock";
import Swal from "sweetalert2";
import {
  Button,
  Card,
  Table,
  Spinner,
  InputGroup,
  FormControl,
  Tabs,
  Tab,
} from "react-bootstrap";

const FeedStockListPage = () => {
  const [data, setData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const PAGE_SIZE = 6;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSupervisor = user?.role === "Supervisor";

  const disableIfSupervisor = isSupervisor
    ? {
        disabled: true,
        title: "Supervisor tidak dapat mengedit atau menghapus data",
        style: { opacity: 0.5, cursor: "not-allowed" },
      }
    : {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockResponse, feedResponse, historyResponse] = await Promise.all([
        getAllFeedStocks(),
        listFeeds(),
        getAllFeedStockHistory(),
      ]);

      if (stockResponse.success) {
        setData(stockResponse.data || []);
      } else {
        setData([]);
        Swal.fire("Error", stockResponse.message || "Gagal memuat data stok pakan.", "error");
      }

      if (feedResponse.success) {
        setFeeds(feedResponse.feeds || []);
      } else {
        setFeeds([]);
        Swal.fire("Error", feedResponse.message || "Gagal memuat data pakan.", "error");
      }

      if (historyResponse.success) {
        setHistoryData(historyResponse.data || []);
      } else {
        setHistoryData([]);
        Swal.fire("Error", historyResponse.message || "Gagal memuat riwayat stok pakan.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Gagal memuat data.", "error");
      setData([]);
      setFeeds([]);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id, feedName) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus riwayat untuk pakan ${feedName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteFeedStockHistory(id);
        if (response.success) {
          Swal.fire("Berhasil", "Riwayat stok pakan berhasil dihapus.", "success");
          fetchData();
        } else {
          Swal.fire("Error", response.message || "Gagal menghapus riwayat stok pakan.", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Terjadi kesalahan saat menghapus riwayat stok pakan.", "error");
      }
    }
  };

  const paginatedData = data
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const paginatedHistoryData = historyData
    .filter((item) =>
      item.feed_name.toLowerCase().includes(historySearchTerm.toLowerCase())
    )
    .slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE);

  useEffect(() => {
    if (!user.token) {
      localStorage.removeItem("user");
      window.location.href = "/";
    } else {
      fetchData();
    }
  }, []);

  return (
    <div className="container-fluid mt-4">
      <style>
        {`
          .custom-card {
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .custom-card-header {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 1.5rem;
          }
          .custom-card-header h4 {
            margin: 0;
            font-weight: 600;
            font-size: 1.5rem;
          }
          .custom-table {
            margin-bottom: 0;
            background-color: #fff;
          }
          .custom-table th {
            background-color: #f8f9fa;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.9rem;
            padding: 1rem;
            color: #495057;
          }
          .custom-table td {
            padding: 1rem;
            vertical-align: middle;
            font-size: 0.95rem;
            color: #343a40;
          }
          .custom-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .custom-table tr:hover {
            background-color: #e9ecef;
            transition: background-color 0.2s;
          }
          .custom-tabs .nav-link {
            font-weight: 500;
            color: #495057;
            padding: 0.75rem 1.5rem;
            border-radius: 8px 8px 0 0;
          }
          .custom-tabs .nav-link.active {
            background-color: #007bff;
            color: white;
            font-weight: 600;
          }
          .custom-button {
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          .custom-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          .search-input {
            border-radius: 8px;
            border: 1px solid #ced4da;
            font-size: 0.95rem;
          }
          .pagination-container {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.95rem;
          }
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 3rem 0;
          }
          .loading-text {
            margin-top: 1rem;
            color: #6c757d;
            font-size: 1rem;
          }
        `}
      </style>

      <Card className="custom-card">
        <Card.Header className="custom-card-header">
          <h4>
            <i className="fas fa-box me-2" /> Manajemen Stok Pakan
          </h4>
        </Card.Header>

        <Card.Body className="p-4">
          <Tabs defaultActiveKey="stocks" id="feedstock-tabs" className="custom-tabs mb-4">
            <Tab eventKey="stocks" title="Stok Pakan">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <InputGroup style={{ maxWidth: "300px" }}>
                  <FormControl
                    className="search-input"
                    placeholder="Cari nama pakan..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>
                <Button
                  variant="primary"
                  className="custom-button"
                  onClick={() => !isSupervisor && setModalType("add")}
                  {...disableIfSupervisor}
                >
                  <i className="fas fa-plus me-2" /> Tambah Stok
                </Button>
              </div>

              {loading ? (
                <div className="loading-container">
                  <Spinner animation="border" variant="primary" />
                  <p className="loading-text">Memuat data stok pakan...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table bordered className="custom-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Nama Pakan</th>
                          <th>Stok</th>
                          <th>Pemilik</th>
                          <th>Dibuat Oleh</th>
                          <th>Tanggal Diperbarui</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center text-muted">
                              Tidak ada data ditemukan.
                            </td>
                          </tr>
                        ) : (
                          paginatedData.map((item, idx) => (
                            <tr key={item.id}>
                              <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                              <td>{item.name}</td>
                              <td>{item.stock ? item.stock.stock : "0"}</td>
                              <td>{item.stock?.user_name || "Tidak diketahui"}</td>
                              <td>{item.stock?.created_by?.name || "Tidak diketahui"}</td>
                              <td>
                                {item.stock?.updated_at
                                  ? new Date(item.stock.updated_at).toLocaleDateString("id-ID")
                                  : "Belum diperbarui"}
                              </td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="custom-button"
                                  onClick={() => {
                                    if (!isSupervisor && item.stock) {
                                      setEditId(item.stock.id);
                                      setModalType("edit");
                                    }
                                  }}
                                  {...disableIfSupervisor}
                                  disabled={!item.stock}
                                >
                                  <i className="fas fa-edit" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {Math.ceil(data.length / PAGE_SIZE) > 1 && (
                    <div className="pagination-container mt-3 justify-content-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="custom-button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Prev
                      </Button>
                      <span>
                        Halaman {currentPage} dari {Math.ceil(data.length / PAGE_SIZE)}
                      </span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="custom-button"
                        disabled={currentPage === Math.ceil(data.length / PAGE_SIZE)}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Tab>

            <Tab eventKey="history" title="Riwayat Stok">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <InputGroup style={{ maxWidth: "300px" }}>
                  <FormControl
                    className="search-input"
                    placeholder="Cari nama pakan..."
                    value={historySearchTerm}
                    onChange={(e) => {
                      setHistorySearchTerm(e.target.value);
                      setHistoryPage(1);
                    }}
                  />
                </InputGroup>
              </div>

              {loading ? (
                <div className="loading-container">
                  <Spinner animation="border" variant="primary" />
                  <p className="loading-text">Memuat riwayat stok pakan...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table bordered className="custom-table">
                      <thead>
                        <tr>
                          <th>Tanggal</th>
                          <th>Keterangan</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedHistoryData.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center text-muted">
                              Tidak ada riwayat ditemukan.
                            </td>
                          </tr>
                        ) : (
                          paginatedHistoryData.map((item, idx) => (
                            <tr key={item.id}>
                              <td>
                                {new Date(item.created_at).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </td>
                              <td>
                                {item.action === "CREATE"
                                  ? `${item.user_name || "Pengguna Tidak Diketahui"} menambah stok pakan ${item.feed_name || "Tidak Diketahui"} sebanyak ${item.stock} kg`
                                  : `${item.user_name || "Pengguna Tidak Diketahui"} mengubah stok pakan ${item.feed_name || "Tidak Diketahui"} dari ${item.previous_stock}kg menjadi ${item.stock}kg`}
                              </td>
                              <td>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="custom-button"
                                  onClick={() => !isSupervisor && handleDeleteHistory(item.id, item.feed_name)}
                                  {...disableIfSupervisor}
                                >
                                  <i className="fas fa-trash" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {Math.ceil(historyData.length / PAGE_SIZE) > 1 && (
                    <div className="pagination-container mt-3 justify-content-end">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="custom-button"
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage(historyPage - 1)}
                      >
                        Prev
                      </Button>
                      <span>
                        Halaman {historyPage} dari {Math.ceil(historyData.length / PAGE_SIZE)}
                      </span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="custom-button"
                        disabled={historyPage === Math.ceil(historyData.length / PAGE_SIZE)}
                        onClick={() => setHistoryPage(historyPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Tab>
          </Tabs>

          {modalType === "add" && (
            <AddFeedStock
              feeds={feeds}
              onClose={() => setModalType(null)}
              onSaved={() => {
                fetchData();
                setModalType(null);
              }}
            />
          )}

          {modalType === "edit" && editId && (
            <EditFeedStock
              id={editId}
              onClose={() => {
                setModalType(null);
                setEditId(null);
              }}
              onSaved={() => {
                fetchData();
                setModalType(null);
                setEditId(null);
              }}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default FeedStockListPage;