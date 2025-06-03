import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useHistory, useParams } from "react-router-dom";
import { Card, Spinner } from "react-bootstrap";
import { getCowById, updateCow } from "../../../controllers/cowsController";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditCow = () => {
  const { cowId } = useParams();
  const history = useHistory();
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    weight: "",
    birth: null,
    gender: "",
    lactation_phase: "",
  });
  const [initialFormData, setInitialFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCowData = async () => {
      setLoading(true);
      try {
        const response = await getCowById(cowId);
        if (response.success) {
          const cowData = {
            name: response.cow.name || "",
            breed: response.cow.breed || "",
            weight: response.cow.weight || "",
            birth: response.cow.birth ? new Date(response.cow.birth) : null,
            gender: response.cow.gender || "",
            lactation_phase: response.cow.lactation_phase || "",
          };
          setFormData(cowData);
          setInitialFormData(cowData); // Store initial data
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
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleBirthChange = (date) => {
    setFormData({ ...formData, birth: date });
    if (errors.birth) {
      setErrors({ ...errors, birth: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

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

    if (!formData.birth) {
      newErrors.birth = "Birth date is required";
      isValid = false;
    } else {
      const birthDate = new Date(formData.birth);
      const currentDate = new Date();

      currentDate.setHours(0, 0, 0, 0);
      birthDate.setHours(0, 0, 0, 0);

      if (birthDate > currentDate) {
        newErrors.birth = "Birth date cannot be in the future";
        isValid = false;
      } else {
        const ageInMilliseconds = currentDate - birthDate;
        const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

        if (ageInYears > 20) {
          newErrors.birth =
            "The cow's age exceeds 20 years, which is unusual for cattle";
          isValid = false;
        }

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

    if (formData.gender === "Female" && !formData.lactation_phase) {
      newErrors.lactation_phase = "Lactation phase is required for female cows";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isFormChanged = () => {
    if (!initialFormData) return false;

    // Compare form data with initial form data
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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

    const submissionData = {
      ...formData,
      birth: formData.birth ? formData.birth.toISOString().split("T")[0] : "",
    };

    setLoading(true);

    try {
      const response = await updateCow(cowId, submissionData);
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
                    <div className="form-text">Enter the cow's name.</div>
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
                      Select a valid birth date (cannot be in the future).
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
                      value={formData.breed}
                      onChange={handleChange}
                      readOnly
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
                  disabled={loading || !isFormChanged()}
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
