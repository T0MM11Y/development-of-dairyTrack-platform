// src/pages/Admin/FeedManagement/FeedStock/FeedStockListPage.js
import React, { useEffect, useState } from "react";
import { getAllFeedStocks } from "../../../../controllers/feedStockController";
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
} from "react-bootstrap";

const FeedStockListPage = () => {
  const [data, setData] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const PAGE_SIZE = 6;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSupervisor = user?.role === "Supervisor";

  const disableIfSupervisor = isSupervisor
    ? {
        disabled: true,
        title: "Supervisor tidak dapat mengedit data",
        style: { opacity: 0.5, cursor: "not-allowed" },
      }
    : {};

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockResponse, feedResponse] = await Promise.all([
        getAllFeedStocks(),
        listFeeds(),
      ]);

      if (stockResponse.success) {
        setData(stockResponse.data || []);
      } else {
        setData([]);
      }

      if (feedResponse.success) {
        setFeeds(feedResponse.feeds || []);
      } else {
        setFeeds([]);
      }
    } catch (err) {
      Swal.fire("Error", "Gagal memuat data stok pakan.", "error");
      setData([]);
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = data
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (!user.token) {
      Swal.fire({
        icon: "error",
        title: "Sesi Berakhir",
        text: "Token tidak ditemukan. Silakan login kembali.",
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    } else {
      fetchData();
    }
  }, []);

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <h4 className="mb-0 text-primary fw-bold">
            <i className="fas fa-box me-2" /> Daftar Stok Pakan
          </h4>
        </Card.Header>

        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <InputGroup style={{ maxWidth: "300px" }}>
              <FormControl
                placeholder="Cari nama pakan..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </InputGroup>
            <div>
              <Button
                variant="primary"
                onClick={() => !isSupervisor && setModalType("create")}
                {...disableIfSupervisor}
              >
                <i className="fas fa-plus me-2" /> Tambah Stok
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Memuat data stok pakan...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="align-middle">
                <thead className="table-light">
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
                        <td>
                          {item.stock?.created_by?.name || "Tidak diketahui"}
                        </td>
                        <td>
                          {item.stock?.updated_at
                            ? new Date(item.stock.updated_at).toLocaleDateString("id-ID")
                            : "Belum diperbarui"}
                        </td>
                        <td>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-2"
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
          )}

          {Math.ceil(data.length / PAGE_SIZE) > 1 && (
            <div className="d-flex justify-content-end">
              <Button
                variant="outline-secondary"
                size="sm"
                className="me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </Button>
              <span className="align-self-center">
                Page {currentPage} of {Math.ceil(data.length / PAGE_SIZE)}
              </span>
              <Button
                variant="outline-secondary"
                size="sm"
                className="ms-2"
                disabled={currentPage === Math.ceil(data.length / PAGE_SIZE)}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}

          {modalType === "create" && (
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