import React, { useState, useEffect } from "react";
import { addCow } from "../../../controllers/cowsController";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import { Card, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateCows = () => {
  const [formData, setFormData] = useState({
    name: "",
    birth: null, // Changed to null for DatePicker
    breed: "Girolando", // Default breed
    lactation_phase: "",
    weight: "",
    gender: "Female",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const history = useHistory();

  // Reset lactation phase when gender changes
  useEffect(() => {
    if (formData.gender === "Male") {
      setFormData((prevState) => ({ ...prevState, lactation_phase: "-" }));
    } else if (formData.lactation_phase === "-") {
      setFormData((prevState) => ({ ...prevState, lactation_phase: "" }));
    }
  }, [formData.gender]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear specific error when field is changed
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleBirthChange = (date) => {
    setFormData({ ...formData, birth: date });
    // Clear birth error when date is changed
    if (errors.birth) {
      setErrors({ ...errors, birth: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Cow name is required";
      isValid = false;
    } else if (formData.name.trim().length > 30) {
      newErrors.name = "Cow name cannot exceed 30 characters";
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(formData.name.trim())) {
      newErrors.name =
        "Cow name can only contain letters, numbers, spaces and hyphens";
      isValid = false;
    }

    // Birth date validation
    if (!formData.birth) {
      newErrors.birth = "Birth date is required";
      isValid = false;
    } else {
      const birthDate = new Date(formData.birth);
      const currentDate = new Date();

      // Set times to midnight to compare dates only
      currentDate.setHours(0, 0, 0, 0);
      birthDate.setHours(0, 0, 0, 0);

      // Check if birth date is in the future
      if (birthDate > currentDate) {
        newErrors.birth = "Birth date cannot be in the future";
        isValid = false;
      } else {
        // Calculate age in years
        const ageInMilliseconds = currentDate - birthDate;
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

        // Check if age is reasonable (between 0 and 20 years)
        if (ageInYears > 20) {
          newErrors.birth =
            "The cow's age exceeds 20 years, which is unusual for cattle";
          isValid = false;
        }

        // For a female cow in lactation, ensure minimum age of 2 years (typical age for first calving)
        if (
          formData.gender === "Female" &&
          formData.lactation_phase !== "Dry" &&
          formData.lactation_phase !== "" &&
          ageInYears < 2
        ) {
          newErrors.birth =
            "A female cow in lactation should be at least 2 years old";
          isValid = false;
        }
      }
    }

    // Weight validation
    if (!formData.weight) {
      newErrors.weight = "Weight is required";
      isValid = false;
    } else {
      const weight = parseInt(formData.weight, 10);

      if (isNaN(weight) || weight <= 0) {
        newErrors.weight = "Weight must be a positive number";
        isValid = false;
      } else if (
        formData.gender === "Female" &&
        (weight < 400 || weight > 700)
      ) {
        newErrors.weight =
          "For female cows, weight must be between 400 kg and 700 kg";
        isValid = false;
      } else if (
        formData.gender === "Male" &&
        (weight < 800 || weight > 1200)
      ) {
        newErrors.weight =
          "For male cows, weight must be between 800 kg and 1200 kg";
        isValid = false;
      }
    }

    // Lactation phase validation for female cows
    if (formData.gender === "Female" && !formData.lactation_phase) {
      newErrors.lactation_phase = "Lactation phase is required for female cows";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      // Show first validation error
      const firstError = Object.values(errors)[0];
      if (firstError) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: firstError,
        });
      }
      return;
    }

    // Prepare data for submission
    const submissionData = {
      ...formData,
      birth: formData.birth ? formData.birth.toISOString().split("T")[0] : "",
    };

    setLoading(true);

    try {
      const response = await addCow(submissionData);

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
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                  <div className="form-text">
                    Enter the cow's name (e.g., Daisy).
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="birth" className="form-label">
                    Birth Date <span className="text-danger">*</span>
                  </label>
                  <DatePicker
                    selected={formData.birth}
                    onChange={handleBirthChange}
                    className={`form-control ${
                      errors.birth ? "is-invalid" : ""
                    }`}
                    dateFormat="yyyy-MM-dd"
                    maxDate={new Date()}
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    placeholderText="Select birth date"
                    required
                  />
                  {errors.birth && (
                    <div className="invalid-feedback">{errors.birth}</div>
                  )}
                  <div className="form-text">
                    Select a valid birth date (cannot be in the future, and must
                    be reasonable for the cow's age).
                  </div>
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div className="form-text">
                    Select the cow's gender (Male or Female).
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="lactation_phase" className="form-label">
                    Lactation Phase <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${
                      errors.lactation_phase ? "is-invalid" : ""
                    }`}
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
                  {errors.lactation_phase && (
                    <div className="invalid-feedback">
                      {errors.lactation_phase}
                    </div>
                  )}
                  <div className="form-text">
                    Select the lactation phase (only applicable for female
                    cows).
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="weight" className="form-label">
                    Weight (kg) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${
                      errors.weight ? "is-invalid" : ""
                    }`}
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min={formData.gender === "Female" ? 400 : 800}
                    max={formData.gender === "Female" ? 700 : 1200}
                    required
                  />
                  {errors.weight && (
                    <div className="invalid-feedback">{errors.weight}</div>
                  )}
                  <div className="form-text">
                    {formData.gender === "Female"
                      ? "Enter weight between 400-700 kg for female cows."
                      : "Enter weight between 800-1200 kg for male cows."}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-4 text-end">
              <button
                type="submit"
                className="btn btn-primary px-4"
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
