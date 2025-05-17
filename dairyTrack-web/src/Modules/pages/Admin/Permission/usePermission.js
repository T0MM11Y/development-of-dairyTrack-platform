import { useState, useEffect } from "react";
import Swal from "sweetalert2";

// Custom hook to handle role-based permissions
const usePermissions = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  // Fetch user from localStorage
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData && userData.user_id && userData.role_id) {
        const userId = parseInt(userData.user_id);
        const roleId = parseInt(userData.role_id);
        if (isNaN(userId) || isNaN(roleId)) {
          throw new Error("Invalid user ID or role ID in localStorage.");
        }
        setCurrentUser({ ...userData, user_id: userId, role_id: roleId });
        setError(null);
      } else {
        setError("User not logged in. Please log in to continue.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User not logged in. Please log in to continue.",
        });
      }
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      setError("Failed to load user data. Please try again.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load user data. Please try again.",
      });
    }
  }, []);

  // Check if user is a supervisor (role_id === 2)
  const isSupervisor = currentUser?.role_id === 2;

  // Disable properties for supervisor role
  const disableIfSupervisor = isSupervisor
    ? {
        disabled: true,
        title: "Supervisor cannot perform this action",
        style: { opacity: 0.5, cursor: "not-allowed" },
      }
    : {};

  // Function to restrict actions for supervisors
  const restrictSupervisorAction = (action, actionName) => {
    if (isSupervisor) {
      Swal.fire({
        icon: "error",
        title: "Permission Denied",
        text: `Supervisors cannot ${actionName}.`,
      });
      return true; // Action is restricted
    }
    return false; // Action is allowed
  };

  return {
    currentUser,
    isSupervisor,
    disableIfSupervisor,
    restrictSupervisorAction,
    error,
  };
};

export default usePermissions;