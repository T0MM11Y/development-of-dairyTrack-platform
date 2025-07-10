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
    birth: new Date(),
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState({});

  // Live validation functions
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;
    if (!username) return { isValid: false, message: "Username is required" };
    if (!usernameRegex.test(username)) {
      return {
        isValid: false,
        message:
          "Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens",
      };
    }
    return { isValid: true, message: "" };
  };

  const validateName = (name) => {
    if (!name.trim())
      return { isValid: false, message: "Full name is required" };
    if (name.trim().length < 2)
      return { isValid: false, message: "Name must be at least 2 characters" };
    if (!/^[a-zA-Z\s]+$/.test(name))
      return {
        isValid: false,
        message: "Name can only contain letters and spaces",
      };
    return { isValid: true, message: "" };
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanEmail = email.toLowerCase().trim();

    if (!email) return { isValid: false, message: "Email is required" };
    if (!emailRegex.test(cleanEmail))
      return { isValid: false, message: "Please enter a valid email address" };
    if (
      cleanEmail.includes("..") ||
      cleanEmail.startsWith(".") ||
      cleanEmail.endsWith(".")
    ) {
      return {
        isValid: false,
        message: "Email cannot contain consecutive dots or start/end with dots",
      };
    }
    // Tambahan validasi untuk @gmail.co
    if (/@gmail\.co(\W|$)/i.test(cleanEmail)) {
      return {
        isValid: false,
        message: "Email domain @gmail.co is not valid. Use @gmail.com",
      };
    }
    if (
      !/\.(com|org|net|edu|gov|mil|int|co|id|ac|sch)(\.[a-z]{2})?$/i.test(
        cleanEmail
      )
    ) {
      return {
        isValid: false,
        message:
          "Please use a valid email domain (e.g., .com, .org, .net, .id, .co.id)",
      };
    }
    if (cleanEmail.split("@")[0].length < 3) {
      return {
        isValid: false,
        message: "Email username part must be at least 3 characters",
      };
    }
    if (/test|fake|dummy|sample|example|temp/i.test(cleanEmail)) {
      return {
        isValid: false,
        message: "Please use a real email address, not a test/dummy email",
      };
    }
    return { isValid: true, message: "" };
  };

  const validateContact = (contact) => {
    const phoneRegex =
      /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    if (!contact)
      return { isValid: false, message: "Phone number is required" };
    if (!phoneRegex.test(contact))
      return { isValid: false, message: "Please enter a valid phone number" };
    return { isValid: true, message: "" };
  };

  const validateReligion = (religion) => {
    if (!religion) return { isValid: false, message: "Religion is required" };
    return { isValid: true, message: "" };
  };

  const validateRole = (role_id) => {
    if (!role_id) return { isValid: false, message: "Role is required" };
    return { isValid: true, message: "" };
  };

  const validatePassword = (password) => {
    if (!password) return { isValid: false, message: "Password is required" };
    if (password.length < 8)
      return {
        isValid: false,
        message: "Password must be at least 8 characters",
      };
    if (!/(?=.*[a-z])/.test(password))
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter",
      };
    if (!/(?=.*[A-Z])/.test(password))
      return {
        isValid: false,
        message: "Password must contain at least one uppercase letter",
      };
    if (!/(?=.*\d)/.test(password))
      return {
        isValid: false,
        message: "Password must contain at least one number",
      };
    return { isValid: true, message: "" };
  };

  const validateBirthDate = (birth) => {
    const birthDate = new Date(birth);
    const today = new Date();
    const sixtyYearsAgo = new Date();
    const fifteenYearsAgo = new Date();

    sixtyYearsAgo.setFullYear(today.getFullYear() - 60);
    fifteenYearsAgo.setFullYear(today.getFullYear() - 15);

    today.setHours(0, 0, 0, 0);
    birthDate.setHours(0, 0, 0, 0);

    if (!birth) return { isValid: false, message: "Birth date is required" };
    if (birthDate >= today)
      return {
        isValid: false,
        message: "Birthdate cannot be today or in the future",
      };
    if (birthDate > fifteenYearsAgo)
      return { isValid: false, message: "User must be at least 15 years old" };
    if (birthDate < sixtyYearsAgo)
      return {
        isValid: false,
        message: "Birthdate cannot be more than 60 years ago",
      };
    return { isValid: true, message: "" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Live validation
    let validation;
    switch (name) {
      case "username":
        validation = validateUsername(value);
        break;
      case "name":
        validation = validateName(value);
        break;
      case "email":
        validation = validateEmail(value);
        break;
      case "contact":
        validation = validateContact(value);
        break;
      case "religion":
        validation = validateReligion(value);
        break;
      case "role_id":
        validation = validateRole(value);
        break;
      case "password":
        validation = validatePassword(value);
        break;
      default:
        validation = { isValid: true, message: "" };
    }

    setErrors({ ...errors, [name]: validation.message });
    setIsValid({ ...isValid, [name]: validation.isValid });
  };

  const handleBirthChange = (date) => {
    setFormData({ ...formData, birth: date });

    // Live validation for birth date
    const validation = validateBirthDate(date);
    setErrors({ ...errors, birth: validation.message });
    setIsValid({ ...isValid, birth: validation.isValid });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Final validation check
    const validations = {
      username: validateUsername(formData.username),
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      contact: validateContact(formData.contact),
      religion: validateReligion(formData.religion),
      role_id: validateRole(formData.role_id),
      password: validatePassword(formData.password),
      birth: validateBirthDate(formData.birth),
    };

    const newErrors = {};
    const newIsValid = {};
    let hasErrors = false;

    Object.keys(validations).forEach((key) => {
      newErrors[key] = validations[key].message;
      newIsValid[key] = validations[key].isValid;
      if (!validations[key].isValid) hasErrors = true;
    });

    setErrors(newErrors);
    setIsValid(newIsValid);

    if (hasErrors) {
      Swal.fire(
        "Validation Error",
        "Please fix all validation errors before submitting",
        "warning"
      );
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

    // Ensure email is lowercase
    cleanedFormData.email = cleanedFormData.email.toLowerCase();

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
        throw new Error(errorData.error);
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
                    className={`form-control ${
                      errors.username
                        ? "is-invalid"
                        : isValid.username
                        ? "is-valid"
                        : ""
                    }`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                  {isValid.username && (
                    <div className="valid-feedback">Username looks good!</div>
                  )}
                  <div className="form-text">Must be unique</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name
                        ? "is-invalid"
                        : isValid.name
                        ? "is-valid"
                        : ""
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
                  {isValid.name && (
                    <div className="valid-feedback">Name looks good!</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="birth" className="form-label">
                    Birth Date <span className="text-danger">*</span>
                  </label>
                  <DatePicker
                    selected={formData.birth}
                    onChange={handleBirthChange}
                    dateFormat="yyyy-MM-dd"
                    className={`form-control ${
                      errors.birth
                        ? "is-invalid"
                        : isValid.birth
                        ? "is-valid"
                        : ""
                    }`}
                    placeholderText="Select your birth date"
                    minDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 60)
                      )
                    }
                    maxDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 15)
                      )
                    }
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    required
                  />
                  {errors.birth && (
                    <div className="text-danger mt-1">{errors.birth}</div>
                  )}
                  {isValid.birth && (
                    <div className="text-success mt-1">
                      Birth date is valid!
                    </div>
                  )}
                  <div className="form-text text-muted">
                    Please select a date between 15 and 60 years ago.
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="religion" className="form-label">
                    Religion <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${
                      errors.religion
                        ? "is-invalid"
                        : isValid.religion
                        ? "is-valid"
                        : ""
                    }`}
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
                  {errors.religion && (
                    <div className="invalid-feedback">{errors.religion}</div>
                  )}
                  {isValid.religion && (
                    <div className="valid-feedback">Religion selected!</div>
                  )}
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
                    className={`form-control ${
                      errors.email
                        ? "is-invalid"
                        : isValid.email
                        ? "is-valid"
                        : ""
                    }`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                  {isValid.email && (
                    <div className="valid-feedback">Email looks good!</div>
                  )}
                  <div className="form-text">Valid email address</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="contact" className="form-label">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.contact
                        ? "is-invalid"
                        : isValid.contact
                        ? "is-valid"
                        : ""
                    }`}
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                  {errors.contact && (
                    <div className="invalid-feedback">{errors.contact}</div>
                  )}
                  {isValid.contact && (
                    <div className="valid-feedback">
                      Phone number looks good!
                    </div>
                  )}
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
                    className={`form-select ${
                      errors.role_id
                        ? "is-invalid"
                        : isValid.role_id
                        ? "is-valid"
                        : ""
                    }`}
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
                  {errors.role_id && (
                    <div className="invalid-feedback">{errors.role_id}</div>
                  )}
                  {isValid.role_id && (
                    <div className="valid-feedback">Role selected!</div>
                  )}
                  <div className="form-text">Determine user access level</div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${
                        errors.password
                          ? "is-invalid"
                          : isValid.password
                          ? "is-valid"
                          : ""
                      }`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
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
                  {errors.password && (
                    <div className="text-danger mt-1">{errors.password}</div>
                  )}
                  {isValid.password && (
                    <div className="text-success mt-1">
                      Password strength is good!
                    </div>
                  )}
                  <div className="form-text">
                    Must contain uppercase, lowercase, number and be 8+
                    characters
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
