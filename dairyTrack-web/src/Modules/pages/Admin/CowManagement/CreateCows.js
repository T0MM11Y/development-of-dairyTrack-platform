import React, { useState } from "react";
import { addCow } from "../../../controllers/cowsController";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import { Card, Spinner } from "react-bootstrap";

const CreateCows = () => {
  const [formData, setFormData] = useState({
    name: "",
    birth: "",
    breed: "Girolando", // Default breed
    lactation_phase: "",
    weight: "",
    gender: "Female",
  });
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "gender" && value === "Male") {
      setFormData({ ...formData, [name]: value, lactation_phase: "-" });
    } else if (name === "gender" && value === "Female") {
      setFormData({ ...formData, [name]: value, lactation_phase: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const weight = parseInt(formData.weight, 10);

    if (formData.gender === "Female" && (weight < 450 || weight > 650)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Weight",
        text: "For female cows, weight must be between 450 kg and 650 kg.",
      });
      return;
    }

    if (formData.gender === "Male" && (weight < 700 || weight > 900)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Weight",
        text: "For male cows, weight must be between 700 kg and 900 kg.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await addCow(formData);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Cow added successfully!",
        });
        history.push("/admin/list-cows");
      } else {
        throw new Error(response.message || "Failed to add cow.");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
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
              <i className="fas fa-cow me-2"></i>
              Add New Cow
            </h4>
          </div>
        </Card.Header>
        <Card.Body>
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
                  <div className="form-text">
                    Enter the cow's name (e.g., Daisy).
                  </div>{" "}
                  {/* Penjelasan */}
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
                  <div className="form-text">Select the cow's birth date.</div>{" "}
                  {/* Penjelasan */}
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
                    value="Girolando"
                    readOnly
                  />
                  <div className="form-text">
                    The breed is pre-filled as Girolando.
                  </div>{" "}
                  {/* Penjelasan */}
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="form-text">
                    Select the cow's gender (Male or Female).
                  </div>{" "}
                  {/* Penjelasan */}
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
                    disabled={formData.gender === "Male"}
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
                  <div className="form-text">
                    Select the lactation phase (only applicable for female
                    cows).
                  </div>{" "}
                  {/* Penjelasan */}
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
                  <div className="form-text">
                    Enter the cow's weight in kilograms (e.g., 500).
                  </div>{" "}
                  {/* Penjelasan */}
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
                    Save Cow
                  </>
                )}
              </button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreateCows;
