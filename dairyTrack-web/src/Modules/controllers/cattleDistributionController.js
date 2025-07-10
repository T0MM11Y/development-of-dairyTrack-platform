import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2"; // Import SweetAlert

// Fungsi untuk menambahkan relasi antara User dan Cow (dengan alert)
export const assignCowToUser = async (userId, cowId) => {
  const result = await assignCowToUserSilent(userId, cowId);

  if (result.success) {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: result.message,
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: result.message,
    });
  }

  return result;
};

// Fungsi untuk menambahkan relasi antara User dan Cow (tanpa alert - untuk bulk operations)
export const assignCowToUserSilent = async (userId, cowId) => {
  try {
    const response = await fetch(`${API_URL1}/user-cow/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, cow_id: cowId }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message };
    } else if (response.status === 500) {
      return {
        success: false,
        message: "This cow is already assigned to this user.",
      };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to assign cow to user.",
      };
    }
  } catch (error) {
    console.error("Error assigning cow to user:", error);
    return {
      success: false,
      message: "An error occurred while assigning the cow to the user.",
    };
  }
};

// Fungsi untuk menghapus relasi antara User dan Cow (dengan alert)
export const unassignCowFromUser = async (userId, cowId) => {
  const result = await unassignCowFromUserSilent(userId, cowId);

  if (result.success) {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: result.message,
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: result.message,
    });
  }

  return result;
};

// Fungsi untuk menghapus relasi antara User dan Cow (tanpa alert - untuk bulk operations)
export const unassignCowFromUserSilent = async (userId, cowId) => {
  try {
    const response = await fetch(`${API_URL1}/user-cow/unassign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, cow_id: cowId }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to unassign cow from user.",
      };
    }
  } catch (error) {
    console.error("Error unassigning cow from user:", error);
    return {
      success: false,
      message: "An error occurred while unassigning the cow from the user.",
    };
  }
};

// Fungsi untuk mendapatkan daftar sapi yang dikelola oleh User tertentu
export const listCowsByUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL1}/user-cow/list/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, cows: data.cows }; // Kembalikan daftar sapi
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch cows.",
      };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching the cows.",
    });
    console.error("Error fetching cows:", error);
    return {
      success: false,
      message: "An error occurred while fetching the cows.",
    };
  }
};

export const getUsersWithCows = async () => {
  try {
    const response = await fetch(`${API_URL1}/user-cow/farmers-with-cows`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, usersWithCows: data.farmers_with_cows }; // Sesuaikan dengan nama properti API
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch users with cows.",
      };
    }
  } catch (error) {
    console.error("Error fetching users with cows:", error);
    return {
      success: false,
      message: "An error occurred while fetching users with cows.",
    };
  }
};
// Fungsi untuk mendapatkan semua pengguna dan semua sapi
export const getAllUsersAndAllCows = async () => {
  try {
    const response = await fetch(
      `${API_URL1}/user-cow/all-users-and-all-cows`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      // Filter users with role_id === 3
      const filteredUsers = data.users.filter((user) => user.role_id === 3);
      return { success: true, users: filteredUsers, cows: data.cows };
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch all users and all cows.",
      };
    }
  } catch (error) {
    console.error("Error fetching all users and all cows:", error);
    return {
      success: false,
      message: "An error occurred while fetching all users and all cows.",
    };
  }
};

export const getCowManagers = async (cowId) => {
  try {
    const response = await fetch(`${API_URL1}/user-cow/cow-managers/${cowId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, managers: data.managers }; // Kembalikan daftar manager
    } else {
      const error = await response.json();
      return {
        success: false,
        message: error.error || "Failed to fetch cow managers.",
      };
    }
  } catch (error) {
    console.error("Error fetching cow managers:", error);
    return {
      success: false,
      message: "An error occurred while fetching cow managers.",
    };
  }
};

// Fungsi untuk multiple assign dengan summary alert
export const assignMultipleCowsToUser = async (userId, cowIds) => {
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const cowId of cowIds) {
    const result = await assignCowToUserSilent(userId, cowId);
    results.push({ cowId, ...result });

    if (result.success) {
      successCount++;
    } else {
      errorCount++;
      errors.push(`Cow ID ${cowId}: ${result.message}`);
    }
  }

  // Show summary alert
  if (errorCount === 0) {
    Swal.fire({
      icon: "success",
      title: "All Assignments Successful",
      text: `Successfully assigned ${successCount} cow(s) to user.`,
    });
  } else if (successCount === 0) {
    Swal.fire({
      icon: "error",
      title: "All Assignments Failed",
      html: `Failed to assign all ${errorCount} cow(s):<br><br>${errors.join(
        "<br>"
      )}`,
    });
  } else {
    Swal.fire({
      icon: "warning",
      title: "Partial Success",
      html: `Successfully assigned: ${successCount} cow(s)<br>Failed: ${errorCount} cow(s)<br><br>Errors:<br>${errors.join(
        "<br>"
      )}`,
    });
  }

  return {
    success: errorCount === 0,
    successCount,
    errorCount,
    results,
    errors,
  };
};

// Fungsi untuk multiple unassign dengan summary alert
export const unassignMultipleCowsFromUser = async (userId, cowIds) => {
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const cowId of cowIds) {
    const result = await unassignCowFromUserSilent(userId, cowId);
    results.push({ cowId, ...result });

    if (result.success) {
      successCount++;
    } else {
      errorCount++;
      errors.push(`Cow ID ${cowId}: ${result.message}`);
    }
  }

  // Show summary alert
  if (errorCount === 0) {
    Swal.fire({
      icon: "success",
      title: "All Unassignments Successful",
      text: `Successfully unassigned ${successCount} cow(s) from user.`,
    });
  } else if (successCount === 0) {
    Swal.fire({
      icon: "error",
      title: "All Unassignments Failed",
      html: `Failed to unassign all ${errorCount} cow(s):<br><br>${errors.join(
        "<br>"
      )}`,
    });
  } else {
    Swal.fire({
      icon: "warning",
      title: "Partial Success",
      html: `Successfully unassigned: ${successCount} cow(s)<br>Failed: ${errorCount} cow(s)<br><br>Errors:<br>${errors.join(
        "<br>"
      )}`,
    });
  }

  return {
    success: errorCount === 0,
    successCount,
    errorCount,
    results,
    errors,
  };
};

// Fungsi untuk assign satu user ke multiple cows dengan summary alert
export const assignUserToMultipleCows = async (userId, cowIds) => {
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const cowId of cowIds) {
    const result = await assignCowToUserSilent(userId, cowId);
    results.push({ cowId, ...result });

    if (result.success) {
      successCount++;
    } else {
      errorCount++;
      errors.push(`Cow ID ${cowId}: ${result.message}`);
    }
  }

  // Show summary alert
  if (errorCount === 0) {
    Swal.fire({
      icon: "success",
      title: "Bulk Assignment Successful",
      text: `User successfully assigned to ${successCount} cow(s).`,
    });
  } else if (successCount === 0) {
    Swal.fire({
      icon: "error",
      title: "Bulk Assignment Failed",
      html: `Failed to assign user to all ${errorCount} cow(s):<br><br>${errors.join(
        "<br>"
      )}`,
    });
  } else {
    Swal.fire({
      icon: "warning",
      title: "Partial Assignment Success",
      html: `Successfully assigned to: ${successCount} cow(s)<br>Failed: ${errorCount} cow(s)<br><br>Errors:<br>${errors.join(
        "<br>"
      )}`,
    });
  }

  return {
    success: errorCount === 0,
    successCount,
    errorCount,
    results,
    errors,
  };
};
