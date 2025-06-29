import React, { useEffect, useState } from "react";
import { listFeeds, deleteFeed, getFeedById } from "../../../../controllers/feedController";
import { listFeedTypes } from "../../../../controllers/feedTypeController";
import { listNutritions } from "../../../../controllers/nutritionController";
import FeedCreatePage from "./CreateFeed";
import Swal from "sweetalert2";
import {
  Button,
  Card,
  Table,
  Spinner,
  InputGroup,
  FormControl,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

const FeedListPage = () => {
  const [data, setData] = useState([]);
  const [feedTypes, setFeedTypes] = useState([]);
  const [nutritions, setNutritions] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [editFeed, setEditFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const PAGE_SIZE = 6;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSupervisor = user?.role?.toLowerCase() === "supervisor";

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
      const [feedResponse, feedTypeResponse, nutritionResponse] = await Promise.all([
        listFeeds(),
        listFeedTypes(),
        listNutritions(),
      ]);

      if (feedResponse.success) {
        setData(feedResponse.feeds || []);
      } else {
        if (feedResponse.message?.includes("Token")) {
          Swal.fire({
            icon: "error",
            title: "Sesi Berakhir",
            text: "Token tidak valid atau kedaluwarsa. Silakan login kembali.",
          });
          localStorage.removeItem("user");
          window.location.href = "/";
        } else {
          Swal.fire("Error", feedResponse.message || "Gagal memuat data.", "error");
        }
        setData([]);
      }

      if (feedTypeResponse.success) {
        setFeedTypes(feedTypeResponse.feedTypes || []);
      } else {
        setFeedTypes([]);
      }

      if (nutritionResponse.success) {
        setNutritions(nutritionResponse.nutritions || []);
      } else {
        setNutritions([]);
      }
    } catch (err) {
      Swal.fire("Error", "Gagal memuat data.", "error");
      setData([]);
      setFeedTypes([]);
      setNutritions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await deleteFeed(deleteId);
      if (response.success) {
        setData((prev) => prev.filter((item) => item.id !== deleteId));
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Pakan berhasil dihapus.",
          timer: 1500,
          showConfirmButton: false,
        });
        setDeleteId(null);
      } else {
        if (response.message?.includes("Token")) {
          Swal.fire({
            icon: "error",
            title: "Sesi Berakhir",
            text: "Token tidak valid atau kedaluwarsa. Silakan login kembali.",
          });
          localStorage.removeItem("user");
          window.location.href = "/";
        } else {
          Swal.fire("Error", response.message || "Gagal menghapus pakan.", "error");
        }
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan saat menghapus pakan.", "error");
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await getFeedById(id);
      if (response.success) {
        setEditFeed(response.feed);
        setModalType("edit");
      } else {
        Swal.fire("Error", response.message || "Gagal memuat data pakan.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan saat memuat data pakan.", "error");
    }
  };

  const paginatedData = data
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (!user.token || !user.user_id || !user.role) {
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

  useEffect(() => {
    if (deleteId) {
      Swal.fire({
        title: "Yakin ingin menghapus?",
        text: "Data yang dihapus tidak dapat dikembalikan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          handleDelete();
        } else {
          setDeleteId(null);
        }
      });
    }
  }, [deleteId]);

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-primary text-white py-3">
          <h4 className="mb-0 fw-bold">
            <i className="fas fa-box me-2" /> Daftar Pakan
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
                <i className="fas fa-plus me-2" /> Tambah
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Memuat data pakan...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Jenis Pakan</th>
                    <th>Nama Pakan</th>
                    <th>Satuan</th>
                    <th>Stok Minimum</th>
                    <th>Harga</th>
                    <th>Dibuat Oleh</th>
                    <th>Diperbarui Oleh</th>
                    <th>Tanggal Dibuat</th>
                    <th>Tanggal Diperbarui</th>
                    <th>Nutrisi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center text-muted">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                        <td>{item.type_name || "Tidak diketahui"}</td>
                        <td>{item.name}</td>
                        <td>{item.unit}</td>
                        <td>{item.min_stock}</td>
                        <td>Rp {item.price.toLocaleString("id-ID")}</td>
                        <td>{item.created_by ? item.created_by.name : "Tidak diketahui"}</td>
                        <td>{item.updated_by ? item.updated_by.name : "Tidak diketahui"}</td>
                        <td>{new Date(item.created_at).toLocaleDateString("id-ID")}</td>
                        <td>{new Date(item.updated_at).toLocaleDateString("id-ID")}</td>
                        <  td>
                          {item.nutrisi_records.length > 0
                            ? item.nutrisi_records.map((n, i) => (
                                <div key={i}>
                                  {n.nutrisi_name} ({n.amount} {n.unit})
                                </div>
                              ))
                            : "Tidak ada nutrisi"}
                        </td>
                        <td>
                          <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
                            <Button
                              variant="outline-warning"
                              size="sm"
                              className="me-2"
                              onClick={() => !isSupervisor && handleEdit(item.id)}
                              {...disableIfSupervisor}
                            >
                              <i className="fas fa-edit" />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger overlay={<Tooltip>Hapus</Tooltip>}>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => !isSupervisor && setDeleteId(item.id)}
                              {...disableIfSupervisor}
                            >
                              <i className="fas fa-trash" />
                            </Button>
                          </OverlayTrigger>
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

          {(modalType === "create" || modalType === "edit") && (
            <FeedCreatePage
              show={true}
              feedTypes={feedTypes}
              nutritions={nutritions}
              feed={modalType === "edit" ? editFeed : null}
              onClose={() => {
                setModalType(null);
                setEditFeed(null);
              }}
              onSaved={() => {
                fetchData();
                setModalType(null);
                setEditFeed(null);
              }}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default FeedListPage;