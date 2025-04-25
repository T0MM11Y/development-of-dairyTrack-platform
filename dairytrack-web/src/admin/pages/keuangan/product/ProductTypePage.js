import { useEffect, useState } from "react";
import {
  getProductTypes,
  deleteProductType,
} from "../../../../api/keuangan/productType";
import DataTable from "react-data-table-component";
import ProductTypeCreateModal from "./ProductTypeCreatePage";
import ProductTypeEditModal from "./ProductTypeEditPage";
import {
  showAlert,
  showConfirmAlert,
} from "../../../../admin/pages/keuangan/utils/alert";
import { useTranslation } from "react-i18next";

const ProductTypePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const { t } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user"));
  const isSupervisor = user?.type === "supervisor";

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
      const productTypesRes = await getProductTypes();
      setData(productTypesRes);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = () => {
    fetchData();
    setShowCreateModal(false);
    showAlert({
      type: "success",
      title: "Berhasil",
      text: "Tipe produk berhasil ditambahkan.",
    });
  };

  const handleProductUpdated = () => {
    fetchData();
    setShowEditModal(null);
    showAlert({
      type: "success",
      title: "Berhasil",
      text: "Tipe produk berhasil diperbarui.",
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const result = await showConfirmAlert({
      title: "Konfirmasi Hapus",
      text: "Apakah Anda yakin ingin menghapus tipe produk ini? Tindakan ini tidak dapat dibatalkan.",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setSubmitting(true);
      try {
        await deleteProductType(deleteId);
        fetchData();
        await showAlert({
          type: "success",
          title: "Berhasil",
          text: "Tipe produk berhasil dihapus.",
        });
      } catch (err) {
        console.error("Gagal menghapus data:", err.message);
        await showAlert({
          type: "error",
          title: "Gagal Menghapus",
          text: "Gagal menghapus tipe produk: " + err.message,
        });
      } finally {
        setSubmitting(false);
        setDeleteId(null);
      }
    } else {
      setDeleteId(null);
    }
  };

  const formatRupiah = (number) => {
    if (!number) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: t("product.product_image"),
      cell: (row) => (
        <img
          src={row.image || "/placeholder-image.jpg"}
          alt={row.product_name}
          className="rounded"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
          }}
        />
      ),
      width: "100px",
    },
    {
      name: t("product.product_name"),
      selector: (row) => row.product_name,
      sortable: true,
    },
    {
      name: t("product.product_description"),
      cell: (row) => (
        <div>
          {row.product_description.length > 50
            ? `${row.product_description.substring(0, 50)}...`
            : row.product_description}
        </div>
      ),
      sortable: true,
    },
    {
      name: t("product.price"),
      cell: (row) => formatRupiah(row.price),
      sortable: true,
      selector: (row) => row.price,
    },
    {
      name: t("product.unit"),
      selector: (row) => row.unit,
      sortable: true,
    },
    {
      name: t("action"),
      cell: (row) => (
        <>
          <button
            className="btn btn-warning btn-sm me-2"
            onClick={() => {
              if (!isSupervisor) {
                setShowEditModal(row.id);
              }
            }}
            {...disableIfSupervisor}
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            onClick={() => {
              if (!isSupervisor && !submitting) {
                setDeleteId(row.id);
              }
            }}
            className="btn btn-danger btn-sm"
            disabled={submitting || isSupervisor}
            style={
              submitting || isSupervisor
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {}
            }
            title={
              isSupervisor
                ? "Supervisor tidak dapat menghapus tipe produk"
                : submitting
                ? "Sedang memproses..."
                : ""
            }
          >
            <i className="ri-delete-bin-6-line"></i>
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "150px",
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        minHeight: "55px",
      },
    },
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 m-1">
          {t("product.product_type")}
        </h2>
        <button
          className="btn btn-info"
          onClick={() => {
            if (!isSupervisor) {
              setShowCreateModal(true);
            }
          }}
          {...disableIfSupervisor}
        >
          + {t("product.product_type")}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={data}
            pagination
            persistTableHead
            progressPendingIndicator={
              <div className="text-center my-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">{t("product.loading_product_types")}...</p>
              </div>
            }
            progressPending={loading}
            noDataComponent={
              <div className="text-center my-3">
                <p className="text-gray-500">{t("product.no_product_types")}</p>
              </div>
            }
            customStyles={customStyles}
            highlightOnHover
            responsive
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="modal fade show d-block"
          style={{
            background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
          }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteModalTitle"
          onClick={() => setDeleteId(null)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 id="deleteModalTitle" className="modal-title text-danger">
                  {t("product.delete_confirmation")}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                  disabled={submitting}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  {t("product.confirm_delete_product_type")}
                  <br />
                  {t("product.action_cannot_be_undone")}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                  disabled={submitting}
                >
                  {t("product.cancel")}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {t("product.deleting")}...
                    </>
                  ) : (
                    t("product.delete")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <ProductTypeCreateModal
          onClose={() => setShowCreateModal(false)}
          onSaved={handleProductAdded}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <ProductTypeEditModal
          productId={showEditModal}
          onProductUpdated={handleProductUpdated}
          onClose={() => setShowEditModal(null)}
        />
      )}
    </div>
  );
};

export default ProductTypePage;
