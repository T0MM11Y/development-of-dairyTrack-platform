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

    // Handle gender change to update lactation_phase accordingly
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

    // Weight validation
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

    // Birth date validation
    const birthDate = new Date(formData.birth);
    const currentDate = new Date();

    // Check if birth date is in the future
    if (birthDate > currentDate) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Birth Date",
        text: "Birth date cannot be in the future.",
      });
      return;
    }

    // Calculate age in years
    const ageInMilliseconds = currentDate - birthDate;
    const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

    // Check if age is reasonable (between 0 and 20 years)
    if (ageInYears > 20) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Birth Date",
        text: "The cow's age exceeds 20 years, which is unusual for cattle. Please verify the birth date.",
      });
      return;
    }

    // For a female cow in lactation, ensure minimum age of 2 years (typical age for first calving)
    if (
      formData.gender === "Female" &&
      formData.lactation_phase !== "Dry" &&
      formData.lactation_phase !== "" &&
      ageInYears < 2
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Combination",
        text: "A female cow in lactation should be at least 2 years old. Please adjust the birth date or lactation phase.",
      });
      return;
    }

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
                    <div className="form-text">
                      {formData.gender === "Female"
                        ? "For female cows, weight must be between 450 kg and 650 kg."
                        : "For male cows, weight must be between 700 kg and 900 kg."}
                    </div>
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
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                    <div className="form-text">
                      Select a valid birth date (cannot be in the future, and
                      must be reasonable for the cow's age).
                    </div>
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
                    {formData.gender === "Female" && (
                      <div className="form-text">
                        For cows in lactation (Early, Mid, Late), the age must
                        be at least 2 years.
                      </div>
                    )}
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
