import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { getNutritionById, updateNutrition } from "../../../../controllers/nutritionController";
import Swal from "sweetalert2";
import { Button, Form } from "react-bootstrap";

const NutritionEditPage = ({ id: propId, onClose, onSaved }) => {
  const { id } = useParams();
  const history = useHistory();
  const finalId = propId || id; // Use propId if provided, fallback to URL param
  const [form, setForm] = useState(null);
  const [originalName, setOriginalName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.user_id && userData.token) {
      setCurrentUser(userData);
    } else {
      Swal.fire({
        icon: "error",
        title: "Session Expired",
        text: "No valid user session found. Please log in again.",
      }).then(() => {
        localStorage.removeItem("user");
        if (onClose) onClose();
        else history.push("/");
      });
    }
  }, [history, onClose]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return; // Wait for user session to be set
      }
      if (!finalId) {
        setError("No valid ID provided.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await getNutritionById(finalId);
        if (response.success) {
          setForm({
            name: response.nutrition.name || "",
            unit: response.nutrition.unit || "",
            updated_at: response.nutrition.updated_at || "",
            updated_by: currentUser.user_id || "",
          });
          setOriginalName(response.nutrition.name || "");
        } else {
          throw new Error(response.message || "Nutrition not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load nutrition data.");
        Swal.fire({
          icon: "error",
          title: "Load Failed",
          text: err.message || "Failed to load nutrition data.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [finalId, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name === originalName && form.unit === form.unit) {
      Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "No changes were made to the nutrition data.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Changes",
      text: `Are you sure you want to update "${originalName}" to "${form.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      if (onClose) onClose();
      else history.push("/dashboard/nutrition-guide");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { name: form.name, unit: form.unit };
      const response = await updateNutrition(finalId, payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Nutrition updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        else history.push("/dashboard/nutrition-guide");
      } else {
        throw new Error(response.message || "Failed to update nutrition.");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "An error occurred while updating the data.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    else history.push("/dashboard/nutrition-guide");
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        background: "rgba(0,0,0,0.5)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "60px", // Adjust this value to move it down slightly
      }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light border-bottom">
            <h4 className="modal-title text-info fw-bold">
              <i className="fas fa-edit me-2" /> Edit Nutrition
            </h4>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-4">
            {error && <p className="text-danger text-center mb-4">{error}</p>}
            {loading || !form ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status" />
                <p className="mt-2">Loading data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Nutrition Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Unit</label>
                    <input
                      type="text"
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Updated By</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={currentUser?.name || "Unknown"}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Updated At</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={
                        form.updated_at
                          ? new Date(form.updated_at).toLocaleString("id-ID")
                          : "Not updated yet"
                      }
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-info w-100 mt-3"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionEditPage;