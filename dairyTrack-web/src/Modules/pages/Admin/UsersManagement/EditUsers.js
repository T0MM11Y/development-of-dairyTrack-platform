import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { useHistory, useParams } from "react-router-dom";
import { Card, Spinner } from "react-bootstrap";
import { getUserById, editUser } from "../../../controllers/usersController";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditUser = () => {
  const { userId } = useParams();
  const history = useHistory();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    contact: "",
    religion: "",
    role_id: "",
    birth: "",
  });
  const [initialData, setInitialData] = useState(null); // Store initial data
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await getUserById(userId);
        if (response.success) {
          const userData = {
            username: response.user.username || "",
            name: response.user.name || "",
            email: response.user.email || "",
            contact: response.user.contact || "",
            religion: response.user.religion || "",
            role_id: response.user.role_id || "",
            birth: response.user.birth
              ? new Date(response.user.birth)
              : new Date(),
          };
          setFormData(userData);
          setInitialData(userData); // Save initial data for comparison
        } else {
          Swal.fire(
            "Error",
            response.message || "Failed to fetch user data.",
            "error"
          );
          history.push("/admin/list-users");
        }
      } catch (error) {
        Swal.fire("Error", "An unexpected error occurred.", "error");
        history.push("/admin/list-users");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, history]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBirthChange = (date) => {
    setFormData({ ...formData, birth: date });
  };

  const isFormChanged = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      return;
    }

    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save changes to this user?",
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

    // Sanitize data
    const cleanedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );

    try {
      const response = await editUser(userId, cleanedFormData);
      if (response.success) {
        Swal.fire("Success", "User updated successfully!", "success");
        history.push("/admin/list-users");
      } else {
        Swal.fire(
          "Error",
          response.message || "Failed to update user.",
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
              <i className="fas fa-user-edit me-2"></i>
              Edit User
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
              <p className="mt-3 text-primary">Loading user data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="mb-4">
                <h5
                  className="mb-3 border-bottom pb-2"
                  style={{ color: "grey", fontSize: "16px" }}
                >
                  <i className="fas fa-user-circle me-2"></i> Personal
                  Information
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
                      pattern="^[a-zA-Z0-9._-]{3,20}$"
                      title="Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens"
                      required
                    />
                    <div className="form-text">Must be unique</div>
                    <div className="form-text text-danger">
                      {formData.username &&
                        !/^[a-zA-Z0-9._-]{3,20}$/.test(formData.username) &&
                        "Username must be 3-20 characters with only letters, numbers, dots, underscores, and hyphens"}
                    </div>
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
                      placeholderText="Select birth date"
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
                      User must be at least 15 years old and not more than 100
                      years old.
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
                  <i className="fas fa-address-book me-2"></i> Contact
                  Information
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
                </div>
              </div>

              {/* Submit */}
              <div className="mt-4 text-end">
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  style={{ color: "white" }}
                  disabled={!isFormChanged || loading} // Disable button if no changes or loading
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

export default EditUser;
