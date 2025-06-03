import React, { useState } from "react";
import Swal from "sweetalert2";
import { API_URL1 } from "../../../../api/apiController";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Card, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreateUser = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    contact: "",
    religion: "",
    role_id: "",
    password: "",
    birth: new Date(), // Initialize birth as a Date object
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBirthChange = (date) => {
    setFormData({ ...formData, birth: date });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ...existing code...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Form validation
    let isValid = true;
    let errorMessage = "";

    // Validate username (alphanumeric with limited special characters)
    const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
    if (!usernameRegex.test(formData.username)) {
      errorMessage =
        "Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errorMessage = "Please enter a valid email address";
      isValid = false;
    }

    // Contact number validation
    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(formData.contact)) {
      errorMessage = "Please enter a valid phone number";
      isValid = false;
    }

    // Birthdate validation - enhanced
    const birthDate = new Date(formData.birth);
    const today = new Date();
    const hundredYearsAgo = new Date();
    const fifteenYearsAgo = new Date();

    hundredYearsAgo.setFullYear(today.getFullYear() - 100);
    fifteenYearsAgo.setFullYear(today.getFullYear() - 15);

    // Set times to midnight to compare dates only
    today.setHours(0, 0, 0, 0);
    birthDate.setHours(0, 0, 0, 0);

    if (birthDate >= today) {
      errorMessage = "Birthdate cannot be today or in the future";
      isValid = false;
    } else if (birthDate > fifteenYearsAgo) {
      errorMessage = "User must be at least 15 years old";
      isValid = false;
    } else if (birthDate < hundredYearsAgo) {
      errorMessage = "Birthdate cannot be more than 100 years ago";
      isValid = false;
    }

    if (!isValid) {
      Swal.fire("Validation Error", errorMessage, "warning");
      setLoading(false);
      return;
    }

    // Sanitize data
    const cleanedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );

    try {
      const response = await fetch(`${API_URL1}/user/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedFormData),
      });

      if (response.ok) {
        Swal.fire("Success", "User created successfully", "success");
        history.push("/admin/list-users");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
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
              <i className="fas fa-user-plus me-2"></i>
              Create New User
            </h4>
          </div>
        </Card.Header>
        <Card.Body>
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-4">
              <h5
                className="mb-3 border-bottom pb-2"
                style={{ color: "grey", fontSize: "16px" }}
              >
                <i className="fas fa-user-circle me-2"></i> Personal Information
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="username" className="form-label">
                    Username <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  <div className="form-text">Must be unique</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="text-danger">*</span>
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
                  <label htmlFor="birth" className="form-label">
                    Birth Date <span className="text-danger">*</span>
                  </label>
                  <DatePicker
                    selected={formData.birth}
                    onChange={handleBirthChange}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                    placeholderText="Select your birth date"
                    maxDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 10)
                      )
                    }
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    required
                    style={{
                      backgroundColor: "#f9f9f9",
                      border: "1px solid #007bff",
                      borderRadius: "8px",
                      padding: "10px",
                      fontSize: "14px",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <div className="form-text text-muted">
                    Please select a date at least 10 years ago.
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="religion" className="form-label">
                    Religion <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="religion"
                    name="religion"
                    value={formData.religion}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Religion</option>
                    <option value="Islam">Islam</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Catholicism">Catholicism</option>
                    <option value="Hinduism">Hinduism</option>
                    <option value="Buddhism">Buddhism</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mb-4">
              <h5
                className="mb-3 border-bottom pb-2"
                style={{ color: "grey", fontSize: "16px" }}
              >
                <i className="fas fa-address-book me-2"></i> Contact Information
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                    title="Please enter a valid email address"
                    required
                  />
                  <div className="form-text text-danger">
                    {formData.email &&
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
                      "Invalid email format"}
                  </div>
                  <div className="form-text">Valid email address</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="contact" className="form-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    pattern="^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$"
                    required
                  />
                  <div className="form-text text-danger">
                    {formData.contact &&
                      !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(
                        formData.contact
                      ) &&
                      "Invalid phone number format"}
                  </div>
                  <div className="form-text">Valid phone number</div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="mb-4">
              <h5
                className="mb-3 border-bottom pb-2"
                style={{ color: "grey", fontSize: "16px" }}
              >
                <i className="fas fa-cog me-2"></i> Account Settings
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="role_id" className="form-label">
                    Role <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="role_id"
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="1">Admin</option>
                    <option value="2">Supervisor</option>
                    <option value="3">Farmer</option>
                  </select>
                  <div className="form-text">Determine user access level</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      minLength="8"
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={togglePasswordVisibility}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div className="form-text">Minimum 8 characters</div>
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
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Create User
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

export default CreateUser;
