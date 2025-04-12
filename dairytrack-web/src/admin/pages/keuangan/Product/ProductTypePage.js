import { useEffect, useState } from "react";
import { getProductTypes, deleteProductType } from "../../../../api/keuangan/productType";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";

const ProductTypePage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteId) return;

    setSubmitting(true);
    try {
      await deleteProductType(deleteId);
      fetchData();
      setDeleteId(null);
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // DataTable columns configuration
  const columns = [
    {
      name: 'Image',
      cell: row => (
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
      width: '80px',
    },
    {
      name: 'Product Name',
      selector: row => row.product_name,
      sortable: true,
    },
    {
      name: 'Description',
      selector: row => row.product_description,
      cell: row => (
        <div>
          {row.product_description.length > 50
            ? `${row.product_description.substring(0, 50)}...`
            : row.product_description}
        </div>
      ),
      sortable: true,
    },
    {
      name: 'Price',
      selector: row => parseFloat(row.price),
      cell: row => `Rp ${parseFloat(row.price).toLocaleString("id-ID")}`,
      sortable: true,
      right: true,
    },
    {
      name: 'Unit',
      selector: row => row.unit,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <>
          <Link
            to={`/admin/keuangan/type-product/edit/${row.id}`}
            className="btn btn-warning btn-sm me-2"
          >
            <i className="ri-edit-line"></i>
          </Link>
          <button
            onClick={() => setDeleteId(row.id)}
            className="btn btn-danger btn-sm"
          >
            <i className="ri-delete-bin-6-line"></i>
          </button>
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Custom DataTable styles
  const customStyles = {
    headCells: {
      style: {
        fontWeight: 'bold',
        fontSize: '14px',
      },
    },
    rows: {
      style: {
        minHeight: '70px', // Increased to accommodate the image
      },
    },
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 m-1">Product Types</h2>
        <Link to="/admin/keuangan/type-product/create" className="btn btn-info">
          + Product Type
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body">
          {/* <h4 className="card-title">Product Type Data</h4> */}
          
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
                <p className="mt-2">Loading product type data...</p>
              </div>
            }
            progressPending={loading}
            noDataComponent={
              <div className="text-center my-3">
                <p className="text-gray-500">No product type data available.</p>
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
          }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Confirmation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                  disabled={submitting}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this product type?
                  <br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                  disabled={submitting}
                >
                  Cancel
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
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTypePage;