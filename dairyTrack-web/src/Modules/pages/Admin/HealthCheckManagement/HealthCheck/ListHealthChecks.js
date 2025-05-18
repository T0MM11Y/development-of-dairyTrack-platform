import React, { useEffect, useState } from "react";
import {
  getHealthChecks,
  deleteHealthCheck,
} from "../../../../controllers/healthCheckController";
import { listCows } from "../../../../controllers/cowsController";
import HealthCheckCreatePage from "./CreateHealthCheck";
import HealthCheckEditPage from "./EditHealthCheck";
import Swal from "sweetalert2";
import {
  Button,
  Card,
  Table,
  Spinner,
  InputGroup,
  FormControl,
  Badge,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";

const HealthCheckListPage = () => {
  const [data, setData] = useState([]);
  const [cows, setCows] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;
  const [searchTerm, setSearchTerm] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const [userManagedCows, setUserManagedCows] = useState([]);
const [currentUser, setCurrentUser] = useState(null);
const isSupervisor =
  currentUser?.role_id === 2;

useEffect(() => {
  const userData = JSON.parse(localStorage.getItem("user"));
  setCurrentUser(userData);

  const fetchUserCows = async () => {
    if (!userData) return;

    try {
      const { success, cows } = await listCowsByUser(userData.user_id || userData.id);
      if (success) setUserManagedCows(cows || []);
    } catch (err) {
      console.error("Gagal memuat sapi user:", err);
    }
  };

  fetchUserCows();
}, []);


  const disableIfSupervisor = isSupervisor
  ? {
      disabled: true,
      title: "Supervisor tidak dapat mengedit data",
      style: { opacity: 0.5, cursor: "not-allowed" },
    }
  : {};


 const fetchData = async () => {
  try {
    if (!currentUser) return;

    setLoading(true);
    const healthChecksData = await getHealthChecks();

    const isAdmin = currentUser.role_id === 1;
    const isSupervisor = currentUser.role_id === 2;

    let filteredHealthChecks = healthChecksData;

    if (!isAdmin && userManagedCows.length > 0) {
      const allowedCowIds = userManagedCows.map((cow) => cow.id);
      filteredHealthChecks = healthChecksData.filter((check) =>
        allowedCowIds.includes(check?.cow?.id)
      );
    }

    // 🔍 Jika supervisor tapi tidak punya sapi, tetap tampilkan semua (atau bisa dikustom)
    if (isSupervisor && userManagedCows.length === 0) {
      filteredHealthChecks = healthChecksData; // atau tampilkan []
    }

    setData(filteredHealthChecks || []);
    setHealthChecks(filteredHealthChecks || []);
  } catch (err) {
    Swal.fire("Error", "Gagal memuat data.", "error");
    setData([]);
    setHealthChecks([]);
  } finally {
    setLoading(false);
  }
};




  const ListCowName = (cow) => {
    if (!cow) return "Tidak diketahui";
    if (typeof cow === "object") return cow.name || "Tidak diketahui";
    const found = cows.find((c) => String(c.id) === String(cow));
    return found ? found.name : "Tidak diketahui";
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHealthCheck(deleteId);
      setData((prev) => prev.filter((item) => item.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const paginatedData = data
    .filter((item) =>
      ListCowName(item.cow).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

useEffect(() => {
  if (!currentUser) return;

  const isAdmin = currentUser.role_id === 1;
  const isSupervisor = currentUser.role_id === 2;

  // Admin langsung fetch
  if (isAdmin || isSupervisor) {
    fetchData();
  } else if (userManagedCows.length > 0) {
    fetchData(); // Non-admin non-supervisor tunggu sapi tersedia
  }
}, [userManagedCows, currentUser]);



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
  const rawCows = currentUser?.role_id === 1 ? cows : userManagedCows;
const [healthChecks, setHealthChecks] = useState([]);

const availableCows = Array.isArray(rawCows)
  ? rawCows.filter((cow) => {
      const hasActiveCheck = healthChecks.some((h) => {
        const status = (h?.status || "").toLowerCase();
        return h?.cow?.id === cow.id && status !== "handled" && status !== "healthy";
      });
      return !hasActiveCheck;
    })
  : [];


  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <h4 className="mb-0 text-primary fw-bold">
            <i className="fas fa-heartbeat me-2" /> Pemeriksaan Kesehatan
          </h4>
        </Card.Header>

        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <InputGroup style={{ maxWidth: "300px" }}>
              <FormControl
                placeholder="Cari nama sapi..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </InputGroup>
            <Button
  variant="primary"
  onClick={() => {
    if (availableCows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Bisa Menambah Pemeriksaan",
        text: "Tidak ada sapi yang tersedia untuk pemeriksaan. Semua sapi sedang diperiksa atau belum siap.",
      });
      return;
    }

    if (!isSupervisor) {
      setModalType("create");
    }
  }}
  {...disableIfSupervisor}
>
  <i className="fas fa-plus me-2" /> Tambah
</Button>

          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Memuat data pemeriksaan...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Tanggal</th>
                    <th>Sapi</th>
                    <th>Suhu</th>
                    <th>Detak</th>
                    <th>Napas</th>
                    <th>Ruminasi</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-muted">
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, idx) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                        <td>{new Date(item.checkup_date).toLocaleDateString("id-ID")}</td>
                        <td>{ListCowName(item.cow)}</td>
                        <td>{item.rectal_temperature}°C</td>
                        <td>{item.heart_rate} bpm</td>
                        <td>{item.respiration_rate} bpm</td>
                        <td>{item.rumination} kontraksi</td>
                        <td>
                          <Badge bg={
                            item.status === "healthy" ? "primary" :
                            item.status === "handled" ? "success" : "warning"
                          }>
                            {item.status === "healthy"
                              ? "Sehat"
                              : item.status === "handled"
                              ? "Sudah ditangani"
                              : "Belum ditangani"}
                          </Badge>
                        </td>
                        <td>
                          <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
  <Button
    variant="outline-warning"
    size="sm"
    className="me-2"
    onClick={() => {
      if (isSupervisor) return;

      if (item.status === "healthy") {
        Swal.fire({
          icon: "info",
          title: "Tidak Bisa Diedit",
          text: "Data ini menunjukkan kondisi sehat dan tidak perlu diedit.",
          confirmButtonText: "Mengerti",
        });
      } else if (item.status === "handled") {
        Swal.fire({
          icon: "info",
          title: "Tidak Bisa Diedit",
          text: "Data ini sudah ditangani dan tidak bisa diedit.",
          confirmButtonText: "Mengerti",
        });
      } else {
        setEditId(item.id);
        setModalType("edit");
      }
    }}
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

          {/* Pagination (optional) */}
          {Math.ceil(data.length / PAGE_SIZE) > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-3">
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </Button>
              <span className="fw-semibold">
                Halaman {currentPage} dari {Math.ceil(data.length / PAGE_SIZE)}
              </span>
              <Button
                variant="outline-primary"
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
            <HealthCheckCreatePage
              cows={cows}
              healthChecks={data}
              onClose={() => setModalType(null)}
              onSaved={() => {
                fetchData();
                setModalType(null);
              }}
            />
          )}

          {modalType === "edit" && editId && (
            <HealthCheckEditPage
              healthCheckId={editId}
              onClose={() => {
                setEditId(null);
                setModalType(null);
              }}
              onSaved={() => {
                fetchData();
                setEditId(null);
                setModalType(null);
              }}
            />
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default HealthCheckListPage;
    