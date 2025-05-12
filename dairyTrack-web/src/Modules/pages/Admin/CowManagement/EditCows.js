import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useHistory, useParams } from "react-router-dom";
import { Card, Spinner } from "react-bootstrap";
import { getCowById, updateCow } from "../../../controllers/cowsController";

const EditCow = () => {
  const { cowId } = useParams();
  const history = useHistory();
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    weight: "",
    birth: "",
    gender: "",
    lactation_phase: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCowData = async () => {
      setLoading(true);
      try {
        const response = await getCowById(cowId);
        if (response.success) {
          setFormData({
            name: response.cow.name || "",
            breed: response.cow.breed || "",
            weight: response.cow.weight || "",
            birth: response.cow.birth
              ? new Date(response.cow.birth).toISOString().split("T")[0]
              : "",
            gender: response.cow.gender || "",
            lactation_phase: response.cow.lactation_phase || "",
          });
        } else {
          Swal.fire(
            "Error",
            response.message || "Failed to fetch cow data.",
            "error"
          );
          history.push("/admin/list-cows");
        }
      } catch (error) {
        Swal.fire("Error", "An unexpected error occurred.", "error");
        history.push("/admin/list-cows");
      } finally {
        setLoading(false);
      }
    };

    fetchCowData();
  }, [cowId, history]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save changes to this cow?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save changes!",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await updateCow(cowId, formData);
      if (response.success) {
        Swal.fire("Success", "Cow updated successfully!", "success");
        history.push("/admin/list-cows");
      } else {
        Swal.fire(
          "Error",
          response.message || "Failed to update cow.",
          "error"
        );
      }
    } catch (error) {
      Swal.fire("Error", "An unexpected error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-gradient-primary text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4
              className="mb-0"
              style={{
                color: "#3D90D7",
                fontSize: "20px",
                fontFamily: "Roboto, Monospace",
                letterSpacing: "1px",
              }}
            >
              <i className="fas fa-edit me-2"></i>
              Edit Cow
            </h4>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center">
              <Spinner
                animation="border"
                role="status"
                className="text-primary"
              />
              <p className="mt-3 text-primary">Loading cow data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Cow Information */}
              <div className="mb-4">
                <h5
                  className="mb-3 border-bottom pb-2"
                  style={{ color: "grey", fontSize: "16px" }}
                >
                  <i className="fas fa-info-circle me-2"></i> Cow Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="breed" className="form-label">
                      Breed <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="breed"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="weight" className="form-label">
                      Weight (kg) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="birth" className="form-label">
                      Birth Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="birth"
                      name="birth"
                      value={formData.birth}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="gender" className="form-label">
                      Gender <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="lactation_phase" className="form-label">
                      Lactation Phase <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="lactation_phase"
                      name="lactation_phase"
                      value={formData.lactation_phase}
                      onChange={handleChange}
                      disabled={formData.gender === "Male"} // Disable jika gender adalah Male
                      required
                    >
                      {formData.gender === "Male" ? (
                        <option value="-">-</option>
                      ) : (
                        <>
                          <option value="" disabled>
                            Select Lactation Phase
                          </option>
                          <option value="Dry">Dry</option>
                          <option value="Early">Early</option>
                          <option value="Mid">Mid</option>
                          <option value="Late">Late</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="mt-4 text-end">
                <button
                  type="submit"
                  className="btn btn-info px-4"
                  style={{ color: "white" }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditCow;
