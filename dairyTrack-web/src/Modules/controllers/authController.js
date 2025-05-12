import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2"; // Import SweetAlert

// Fungsi untuk login
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL1}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();

      // Simpan data user ke localStorage
      localStorage.setItem("user", JSON.stringify(data));
      console.log("User data saved to localStorage:", data);

      return { success: true, data };
    } else {
      const error = await response.json();
      return { success: false, message: error.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred during login.",
    });
    console.error("Error during login:", error);
    return { success: false, message: "An error occurred during login." };
  }
};

// Fungsi untuk logout
export const logout = async (token) => {
  try {
    const response = await fetch(`${API_URL1}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const error = await response.json();
      return { success: false, message: error.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred during logout.",
    });
    console.error("Error during logout:", error);
    return { success: false, message: "An error occurred during logout." };
  }
};
