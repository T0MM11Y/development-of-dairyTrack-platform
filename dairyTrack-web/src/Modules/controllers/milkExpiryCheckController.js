import { API_URL1 } from "../../api/apiController.js";
import Swal from "sweetalert2";

/**
 * Get user ID from localStorage
 * @returns {number|null} User ID or null if not found
 */
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || user?.user_id || null;
  } catch (error) {
    console.error("Error getting user ID from localStorage:", error);
    return null;
  }
};

const getUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("User role:", user?.role);
    return user?.role || null;
  } catch (error) {
    console.error("Error getting user role from localStorage:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
const isUserAuthenticated = () => {
  const userId = getUserId();
  if (!userId) {
    Swal.fire({
      icon: "warning",
      title: "Authentication Required",
      text: "Please login to access this feature.",
    });
    return false;
  }
  return true;
};

/**
 * Get milk batches grouped by status with automatic expiry check
 * @returns {Promise<Object>} API response with batches grouped by status
 */
export const getMilkBatchesByStatus = async () => {
  try {
    if (!isUserAuthenticated()) {
      return { success: false, message: "User not authenticated" };
    }

    const userId = getUserId();
    const userRole = getUserRole();

    console.log("Fetching batches for user:", { userId, userRole }); // Debug log

    // Kirim user_role sebagai parameter
    const queryParams = new URLSearchParams({
      user_id: userId,
      ...(userRole && { user_role: userRole }),
    });

    const response = await fetch(
      `${API_URL1}/milk-expiry/milk-batches/status?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("API response:", result); // Debug log

      // Check if the API response has the expected structure
      if (!result.success) {
        throw new Error(result.message || "API returned unsuccessful response");
      }

      console.log("Fresh batches count:", result.data.fresh?.length || 0);
      console.log("Expired batches count:", result.data.expired?.length || 0);
      console.log("Used batches count:", result.data.used?.length || 0);

      return {
        success: true,
        data: result.data,
        fresh: result.data.fresh || [],
        expired: result.data.expired || [],
        used: result.data.used || [],
        summary: result.data.summary || {},
        auto_update_info: result.data.auto_update_info || {},
        user_info: result.data.user_info || {},
      };
    } else {
      const error = await response.json();
      console.error("API error response:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch milk batches by status.",
      });
      return { success: false, message: error.message };
    }
  } catch (error) {
    console.error("Error fetching milk batches by status:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching milk batches by status.",
    });
    return {
      success: false,
      message: "An error occurred while fetching milk batches by status.",
    };
  }
};
/**
 * Get expiry analysis with insights and automatic expiry check
 * @returns {Promise<Object>} API response with expiry analysis
 */
export const getExpiryAnalysis = async () => {
  try {
    if (!isUserAuthenticated()) {
      return { success: false, message: "User not authenticated" };
    }

    const userId = getUserId();
    const userRole = getUserRole();

    // Kirim user_role sebagai parameter
    const queryParams = new URLSearchParams({
      user_id: userId,
      ...(userRole && { user_role: userRole }),
    });

    const response = await fetch(
      `${API_URL1}/milk-expiry/milk-batches/expiry-analysis?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: data.data,
        current_time: data.data.current_time,
        expiring_soon_2_hours: data.data.expiring_soon_2_hours,
        overdue_expired: data.data.overdue_expired,
        expiring_1_hour: data.data.expiring_1_hour,
        expiring_4_hours: data.data.expiring_4_hours,
        summary: data.data.summary,
        auto_update_info: data.data.auto_update_info,
        user_info: data.data.user_info,
      };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to fetch expiry analysis.",
      });
      return { success: false, message: error.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while fetching expiry analysis.",
    });
    console.error("Error fetching expiry analysis:", error);
    return {
      success: false,
      message: "An error occurred while fetching expiry analysis.",
    };
  }
};

/**
 * Get milk batches by specific status with pagination
 * @param {string} status - Status of batches (fresh, expired, used)
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 10)
 * @returns {Promise<Object>} API response with paginated batches
 */
export const getMilkBatchesBySpecificStatus = async (
  status,
  page = 1,
  perPage = 10
) => {
  try {
    if (!isUserAuthenticated()) {
      return { success: false, message: "User not authenticated" };
    }

    // Validate status
    const validStatuses = ["fresh", "expired", "used"];
    if (!validStatuses.includes(status.toLowerCase())) {
      Swal.fire({
        icon: "error",
        title: "Invalid Status",
        text: `Invalid status: ${status}. Valid statuses are: fresh, expired, used`,
      });
      return {
        success: false,
        message: `Invalid status: ${status}. Valid statuses are: fresh, expired, used`,
      };
    }

    const userId = getUserId();
    const userRole = getUserRole();

    // Kirim user_role sebagai parameter
    const queryParams = new URLSearchParams({
      user_id: userId,
      page: page,
      per_page: perPage,
      ...(userRole && { user_role: userRole }),
    });

    const response = await fetch(
      `${API_URL1}/milk-expiry/milk-batches/status/${status}?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: data.data,
        batches: data.data.batches,
        pagination: data.data.pagination,
        auto_update_info: data.data.auto_update_info,
        user_info: data.data.user_info,
      };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || `Failed to fetch ${status} milk batches.`,
      });
      return { success: false, message: error.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: `An error occurred while fetching ${status} milk batches.`,
    });
    console.error(`Error fetching ${status} milk batches:`, error);
    return {
      success: false,
      message: `An error occurred while fetching ${status} milk batches.`,
    };
  }
};

/**
 * Update expired milk batches from FRESH to EXPIRED status
 * @returns {Promise<Object>} API response with update results
 */
export const updateExpiredMilkBatches = async () => {
  try {
    if (!isUserAuthenticated()) {
      return { success: false, message: "User not authenticated" };
    }

    // Confirmation dialog before update
    const confirmResult = await Swal.fire({
      title: "Update Expired Batches?",
      text: "This will update all expired milk batches from FRESH to EXPIRED status and send notifications. Continue?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update them!",
      cancelButtonText: "Cancel",
    });

    // If user cancels the update
    if (!confirmResult.isConfirmed) {
      return { success: false, canceled: true };
    }

    const userId = getUserId();
    const userRole = getUserRole();

    const response = await fetch(
      `${API_URL1}/milk-expiry/milk-batches/update-expired`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          ...(userRole && { user_role: userRole }),
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();

      // Show success message with details
      const updateCount = data.data.updated_count;
      const volumeUpdated = data.data.total_volume_updated;
      const notificationsSent = data.data.notifications_sent;

      Swal.fire({
        icon: "success",
        title: "Batches Updated!",
        html: `
          <div style="text-align: left;">
            <p><strong>Updated Batches:</strong> ${updateCount}</p>
            <p><strong>Total Volume:</strong> ${volumeUpdated} liters</p>
            <p><strong>Notifications Sent:</strong> ${notificationsSent}</p>
          </div>
        `,
        timer: 4000,
        timerProgressBar: true,
      });

      return {
        success: true,
        data: data.data,
        updated_batches: data.data.updated_batches,
        updated_count: data.data.updated_count,
        total_volume_updated: data.data.total_volume_updated,
        notifications_sent: data.data.notifications_sent,
        user_info: data.data.user_info,
      };
    } else {
      const error = await response.json();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update expired milk batches.",
      });
      return { success: false, message: error.message };
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while updating expired milk batches.",
    });
    console.error("Error updating expired milk batches:", error);
    return {
      success: false,
      message: "An error occurred while updating expired milk batches.",
    };
  }
};

/**
 * Show critical alerts for batches that need immediate attention
 * @returns {Promise<void>}
 */
export const showCriticalAlerts = async () => {
  try {
    const analysisResult = await getExpiryAnalysis();
    if (!analysisResult.success) return;

    const overdueBatches = analysisResult.overdue_expired || [];
    const criticalBatches = analysisResult.expiring_1_hour || [];

    const totalCritical = overdueBatches.length + criticalBatches.length;

    if (totalCritical > 0) {
      const criticalList = [
        ...overdueBatches.map(
          (batch) =>
            `<li><strong>${batch.batch_number}</strong> - Overdue (${batch.total_volume}L)</li>`
        ),
        ...criticalBatches.map(
          (batch) =>
            `<li><strong>${batch.batch_number}</strong> - Expires in 1 hour (${batch.total_volume}L)</li>`
        ),
      ].join("");

      await Swal.fire({
        icon: "warning",
        title: "Critical Milk Expiry Alerts!",
        html: `
          <div style="text-align: left;">
            <p>The following batches need immediate attention:</p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${criticalList}
            </ul>
            <p><strong>Total Critical Batches: ${totalCritical}</strong></p>
          </div>
        `,
        confirmButtonText: "Acknowledged",
        confirmButtonColor: "#dc3545",
      });
    }
  } catch (error) {
    console.error("Error showing critical alerts:", error);
  }
};

/**
 * Format hours remaining for display
 * @param {number} hoursRemaining - Hours until expiry (can be negative for overdue)
 * @returns {string} Formatted time string
 */
export const formatHoursRemaining = (hoursRemaining) => {
  if (hoursRemaining === null || hoursRemaining === undefined) return "N/A";

  if (hoursRemaining <= 0) {
    // Overdue
    const hoursOverdue = Math.abs(hoursRemaining);
    const hours = Math.floor(hoursOverdue);
    const minutes = Math.floor((hoursOverdue - hours) * 60);
    return `Overdue by ${hours}h ${minutes}m`;
  } else {
    // Still fresh
    const hours = Math.floor(hoursRemaining);
    const minutes = Math.floor((hoursRemaining - hours) * 60);
    return `${hours}h ${minutes}m remaining`;
  }
};

/**
 * Get urgency level based on hours until expiry
 * @param {number} hoursRemaining - Hours until expiry
 * @returns {string} Urgency level (overdue, critical, warning, caution, safe, unknown)
 */
export const getUrgencyLevel = (hoursRemaining) => {
  if (hoursRemaining === null || hoursRemaining === undefined) return "unknown";

  if (hoursRemaining <= 0) return "overdue";
  if (hoursRemaining <= 1) return "critical";
  if (hoursRemaining <= 2) return "warning";
  if (hoursRemaining <= 4) return "caution";
  return "safe";
};

/**
 * Export expiry analysis to PDF
 * @returns {Promise<void>}
 */
export const exportExpiryAnalysisToPDF = async () => {
  try {
    // For now, show a message that this feature is coming soon
    // You can implement the actual PDF export later
    await Swal.fire({
      icon: "info",
      title: "Export to PDF",
      text: "PDF export feature is coming soon!",
      timer: 2000,
      timerProgressBar: true,
    });
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    Swal.fire({
      icon: "error",
      title: "Export Error",
      text: "Failed to export to PDF.",
    });
  }
};

/**
 * Export expiry analysis to Excel
 * @returns {Promise<void>}
 */
export const exportExpiryAnalysisToExcel = async () => {
  try {
    // For now, show a message that this feature is coming soon
    // You can implement the actual Excel export later
    await Swal.fire({
      icon: "info",
      title: "Export to Excel",
      text: "Excel export feature is coming soon!",
      timer: 2000,
      timerProgressBar: true,
    });
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    Swal.fire({
      icon: "error",
      title: "Export Error",
      text: "Failed to export to Excel.",
    });
  }
};

/**
 * Get fresh batches that are expiring soon (utility function)
 * @returns {Promise<Object>} Fresh batches expiring soon
 */
export const getExpiringBatches = async () => {
  try {
    const analysisResult = await getExpiryAnalysis();
    if (analysisResult.success) {
      return {
        success: true,
        expiring_1_hour: analysisResult.expiring_1_hour || [],
        expiring_soon_2_hours: analysisResult.expiring_soon_2_hours || [],
        expiring_4_hours: analysisResult.expiring_4_hours || [],
        overdue_expired: analysisResult.overdue_expired || [],
        critical_alerts: analysisResult.summary?.critical_alerts || 0,
      };
    }
    return analysisResult;
  } catch (error) {
    console.error("Error getting expiring batches:", error);
    return {
      success: false,
      message: "An error occurred while getting expiring batches.",
    };
  }
};

/**
 * Get summary statistics for milk expiry
 * @returns {Promise<Object>} Summary statistics
 */
export const getExpirySummary = async () => {
  try {
    const statusResult = await getMilkBatchesByStatus();
    if (statusResult.success) {
      return {
        success: true,
        summary: statusResult.summary,
        auto_update_info: statusResult.auto_update_info,
        user_info: statusResult.user_info,
      };
    }
    return statusResult;
  } catch (error) {
    console.error("Error getting expiry summary:", error);
    return {
      success: false,
      message: "An error occurred while getting expiry summary.",
    };
  }
};
/**
 * Calculate and format time remaining from expiry date
 * @param {string} expiryDate - ISO date string of expiry
 * @returns {string} Formatted time remaining string
 */
export const formatTimeRemainingFromExpiryDate = (expiryDate) => {
  if (!expiryDate) return "N/A";

  try {
    const now = new Date();
    const expiry = new Date(expiryDate);

    // Calculate difference in milliseconds
    const diffInMs = expiry.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return formatHoursRemaining(diffInHours);
  } catch (error) {
    console.error("Error calculating time remaining:", error);
    return "N/A";
  }
};

/**
 * Calculate urgency level from expiry date
 * @param {string} expiryDate - ISO date string of expiry
 * @returns {string} Urgency level
 */
export const getUrgencyLevelFromExpiryDate = (expiryDate) => {
  if (!expiryDate) return "unknown";

  try {
    const now = new Date();
    const expiry = new Date(expiryDate);

    // Calculate difference in milliseconds
    const diffInMs = expiry.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return getUrgencyLevel(diffInHours);
  } catch (error) {
    console.error("Error calculating urgency level:", error);
    return "unknown";
  }
};

/**
 * Format time remaining for display (using time_remaining object from API)
 * @param {Object} timeRemaining - Time remaining object from API
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (timeRemaining) => {
  if (!timeRemaining) return "N/A";

  if (timeRemaining.is_overdue) {
    const hours = timeRemaining.hours;
    const minutes = timeRemaining.minutes;
    return `Overdue by ${hours}h ${minutes}m`;
  } else if (timeRemaining.is_expired) {
    return "Expired";
  } else {
    const hours = timeRemaining.hours;
    const minutes = timeRemaining.minutes;
    return `${hours}h ${minutes}m remaining`;
  }
};

/**
 * Get status badge color for UI
 * @param {string} status - Batch status
 * @returns {string} CSS class or color for status badge
 */
export const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case "fresh":
      return "bg-success";
    case "expired":
      return "bg-danger";
    case "used":
      return "bg-secondary";
    default:
      return "bg-light";
  }
};

/**
 * Check if batch needs urgent attention
 * @param {Object} batch - Batch object
 * @returns {boolean} True if batch needs urgent attention
 */
export const isUrgentBatch = (batch) => {
  if (!batch.time_remaining) return false;

  return (
    batch.time_remaining.is_overdue || batch.time_remaining.total_hours <= 1
  );
};
