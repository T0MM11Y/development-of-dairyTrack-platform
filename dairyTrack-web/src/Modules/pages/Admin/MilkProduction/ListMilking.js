import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { listCows } from "../../../../Modules/controllers/cowsController";
import {
  listCowsByUser,
  getCowManagers,
} from "../../../../Modules/controllers/cattleDistributionController";
import { getAllFarmers } from "../../../../Modules/controllers/usersController";

import {
  Button,
  Card,
  Form,
  FormControl,
  InputGroup,
  Modal,
  OverlayTrigger,
  Spinner,
  Tooltip,
  Badge,
  Row,
  Col,
} from "react-bootstrap";
import {
  getMilkingSessions,
  addMilkingSession,
  exportMilkProductionToPDF,
  exportMilkProductionToExcel,
  editMilkingSession,
  deleteMilkingSession,
} from "../../../../Modules/controllers/milkProductionController";

const ListMilking = () => {
  // ========== STATE MANAGEMENT ==========
  const [currentUser, setCurrentUser] = useState(null);
  const [cowList, setCowList] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableFarmersForCow, setAvailableFarmersForCow] = useState([]);
  const [loadingFarmers, setLoadingFarmers] = useState(false);
  const [userManagedCows, setUserManagedCows] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCow, setSelectedCow] = useState("");
  const [selectedMilker, setSelectedMilker] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [viewSession, setViewSession] = useState(null);

  // Form state
  const [newSession, setNewSession] = useState({
    cow_id: "",
    milker_id: "",
    volume: "",
    milking_time: getLocalDateTime(),
    notes: "",
  });

  const sessionsPerPage = 8;

  // ========== UTILITY FUNCTIONS ==========
  // Get local date and time helpers
  function getLocalDateTime() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  function getLocalDateString(date = new Date()) {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  }
  const fetchFarmersForCow = useCallback(
    async (cowId) => {
      if (!cowId || currentUser?.role_id !== 1) {
        setAvailableFarmersForCow([]);
        return;
      }

      setLoadingFarmers(true);
      try {
        const response = await getCowManagers(cowId);
        if (response.success) {
          setAvailableFarmersForCow(response.managers || []);
        } else {
          console.error("Error fetching farmers for cow:", response.message);
          setAvailableFarmersForCow([]);
        }
      } catch (err) {
        console.error("Error fetching farmers for cow:", err);
        setAvailableFarmersForCow([]);
      } finally {
        setLoadingFarmers(false);
      }
    },
    [currentUser]
  );

  const handleCowSelectionInAdd = (cowId) => {
    setNewSession({
      ...newSession,
      cow_id: cowId,
      milker_id: "", // Reset milker selection
    });

    // Fetch farmers for selected cow if admin
    if (currentUser?.role_id === 1) {
      fetchFarmersForCow(cowId);
    }
  };

  // Handle cow selection in edit modal
  const handleCowSelectionInEdit = (cowId) => {
    setSelectedSession({
      ...selectedSession,
      cow_id: cowId,
      milker_id: "", // Reset milker selection
    });

    // Fetch farmers for selected cow if admin
    if (currentUser?.role_id === 1) {
      fetchFarmersForCow(cowId);
    }
  };
  // Convert timestamp to local date string for filtering
  const getSessionLocalDate = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return getLocalDateString(date);
  }, []);

  // ========== DATA FETCHING ==========
  // Fetch user data and initialize session
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setCurrentUser(userData);

        // Debug logging
        console.log("ListMilking - User data:", userData);

        // Use consistent property name - prefer 'id' over 'user_id'
        const userId = userData.id || userData.user_id;
        console.log("ListMilking - User ID:", userId);
        console.log("ListMilking - Role ID:", userData.role_id);

        // Admin (role_id === 1) bisa pilih milker, farmer otomatis pakai user_id mereka
        const milkerId = userData.role_id === 1 ? "" : String(userId || "");
        setNewSession((prev) => ({
          ...prev,
          milker_id: milkerId,
        }));

        console.log("Initial milker_id set to:", milkerId);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  // Fetch user's managed cows
  useEffect(() => {
    // Use consistent property name
    const userId = currentUser?.id || currentUser?.user_id;
    if (!userId) return;

    const fetchUserManagedCows = async () => {
      try {
        const { success, cows } = await listCowsByUser(userId);
        if (success && cows) {
          setUserManagedCows(cows);
        }
      } catch (err) {
        console.error("Error fetching user's cows:", err);
      }
    };

    fetchUserManagedCows();
  }, [currentUser]);

  // Fetch farmers (for admins only)
  useEffect(() => {
    if (currentUser?.role_id !== 1) return;

    const fetchFarmers = async () => {
      try {
        const response = await getAllFarmers();
        if (response.success) {
          setFarmers(response.farmers || []);
        } else {
          console.error("Error fetching farmers:", response.message);
        }
      } catch (err) {
        console.error("Error fetching farmers:", err);
      }
    };

    fetchFarmers();
  }, [currentUser]);

  // Fetch all cows
  useEffect(() => {
    const fetchCows = async () => {
      try {
        const { success, cows } = await listCows();
        if (success) {
          setCowList(cows || []);
        }
      } catch (err) {
        console.error("Error fetching cows:", err);
      }
    };

    fetchCows();
  }, []);

  // Fetch milking sessions
  useEffect(() => {
    const fetchMilkingSessions = async () => {
      setLoading(true);
      try {
        const response = await getMilkingSessions();
        if (response.success && response.sessions) {
          setSessions(response.sessions);
          setError(null);
        } else {
          setError(response.message || "Failed to fetch milking sessions.");
          setSessions([]);
        }
      } catch (err) {
        setError("An error occurred while fetching milking sessions.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMilkingSessions();
  }, []);

  // ========== DATA PROCESSING & MEMOIZED VALUES ==========
  // Today's date for filtering
  const today = useMemo(() => getLocalDateString(), []);

  // Filter today's sessions using local date
  const todaySessions = useMemo(() => {
    return sessions.filter(
      (session) => getSessionLocalDate(session.milking_time) === today
    );
  }, [sessions, today, getSessionLocalDate]);

  // Calculate today's volume
  const todayVolume = useMemo(() => {
    return todaySessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );
  }, [todaySessions]);

  // Generate unique lists of cows and milkers for filtering
  const { uniqueCows, uniqueMilkers } = useMemo(() => {
    const cows = [...new Set(sessions.map((session) => session.cow_id))]
      .filter(Boolean)
      .map((id) => ({
        id,
        name: sessions.find((s) => s.cow_id === id)?.cow_name || `Cow #${id}`,
      }));

    const milkers = [...new Set(sessions.map((session) => session.milker_id))]
      .filter(Boolean)
      .map((id) => ({
        id,
        name:
          sessions.find((s) => s.milker_id === id)?.milker_name ||
          `Milker #${id}`,
      }));

    return { uniqueCows: cows, uniqueMilkers: milkers };
  }, [sessions]);

  // Update the milkStats calculation with the same enhanced search
  const milkStats = useMemo(() => {
    // Start with all sessions or filtered by user role
    let baseSessions = sessions;

    // Filter sessions for farmers (non-admin users)
    if (currentUser?.role_id !== 1 && userManagedCows.length > 0) {
      const managedCowIds = userManagedCows.map((cow) => String(cow.id));
      baseSessions = baseSessions.filter((session) =>
        managedCowIds.includes(String(session.cow_id))
      );
    }

    // Apply current filters to base sessions
    let filteredSessions = baseSessions.filter((session) => {
      // Enhanced search term - same logic as above
      const matchesSearch =
        !searchTerm ||
        (() => {
          const searchLower = searchTerm.toLowerCase().trim();

          const sessionDate = new Date(session.milking_time);
          const dateString = format(sessionDate, "yyyy-MM-dd");
          const timeString = format(sessionDate, "HH:mm");
          const fullDateTimeString = format(sessionDate, "yyyy-MM-dd HH:mm");

          const hours = sessionDate.getHours();
          let timePeriod = "";
          if (hours < 12) timePeriod = "morning";
          else if (hours < 18) timePeriod = "afternoon";
          else timePeriod = "evening";

          const searchFields = [
            session.cow_name?.toLowerCase() || "",
            session.milker_name?.toLowerCase() || "",
            String(session.cow_id),
            String(session.milker_id),
            String(session.id),
            String(session.volume),
            String(parseFloat(session.volume || 0).toFixed(1)),
            String(parseFloat(session.volume || 0).toFixed(2)),
            String(Math.round(parseFloat(session.volume || 0))),
            session.notes?.toLowerCase() || "",
            dateString,
            timeString,
            fullDateTimeString,
            timePeriod,
            format(sessionDate, "dd/MM/yyyy"),
            format(sessionDate, "MM/dd/yyyy"),
            format(sessionDate, "dd-MM-yyyy"),
            format(sessionDate, "MM-dd-yyyy"),
            format(sessionDate, "yyyy/MM/dd"),
            format(sessionDate, "MMMM yyyy").toLowerCase(),
            format(sessionDate, "MMM yyyy").toLowerCase(),
            format(sessionDate, "MMMM").toLowerCase(),
            format(sessionDate, "MMM").toLowerCase(),
            format(sessionDate, "yyyy"),
            format(sessionDate, "EEEE").toLowerCase(),
            format(sessionDate, "EEE").toLowerCase(),
            format(sessionDate, "h:mm a").toLowerCase(),
            format(sessionDate, "HH:mm"),
            `${session.volume}l`,
            `${session.volume} l`,
            `${session.volume}liters`,
            `${session.volume} liters`,
            `${session.volume}liter`,
            `${session.volume} liter`,
          ];

          return searchFields.some((field) => field.includes(searchLower));
        })();

      // Filter selects
      const matchesCow = selectedCow
        ? String(session.cow_id) === selectedCow
        : true;
      const matchesMilker = selectedMilker
        ? String(session.milker_id) === selectedMilker
        : true;

      // Date filter with local date handling
      const matchesDate = selectedDate
        ? getSessionLocalDate(session.milking_time) === selectedDate
        : true;

      return matchesSearch && matchesCow && matchesMilker && matchesDate;
    });

    // Calculate statistics for filtered data
    const totalVolume = filteredSessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );
    const totalSessions = filteredSessions.length;

    // Today's filtered sessions using local date
    const filteredTodaySessions = filteredSessions.filter(
      (session) => getSessionLocalDate(session.milking_time) === today
    );

    const filteredTodayVolume = filteredTodaySessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );

    // Base statistics (unfiltered, but respecting user role)
    const baseVolume = baseSessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );
    const baseTotalSessions = baseSessions.length;

    const baseTodaySessions = baseSessions.filter(
      (session) => getSessionLocalDate(session.milking_time) === today
    );
    const baseTodayVolume = baseTodaySessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );

    return {
      // Filtered statistics (shown when filters are active)
      totalVolume: totalVolume.toFixed(2),
      totalSessions,
      todayVolume: filteredTodayVolume.toFixed(2),
      todaySessions: filteredTodaySessions.length,
      avgVolumePerSession: totalSessions
        ? (totalVolume / totalSessions).toFixed(2)
        : "0.00",

      // Base statistics (shown when no filters are active)
      baseTotalVolume: baseVolume.toFixed(2),
      baseTotalSessions,
      baseTodayVolume: baseTodayVolume.toFixed(2),
      baseTodaySessions: baseTodaySessions.length,
      baseAvgVolumePerSession: baseTotalSessions
        ? (baseVolume / baseTotalSessions).toFixed(2)
        : "0.00",

      // Check if filters are active
      hasActiveFilters: !!(
        searchTerm ||
        selectedCow ||
        selectedMilker ||
        selectedDate
      ),
    };
  }, [
    sessions,
    currentUser,
    userManagedCows,
    today,
    searchTerm,
    selectedCow,
    selectedMilker,
    selectedDate,
    getSessionLocalDate,
  ]);

  // Filter, sort and paginate sessions
  const filteredAndPaginatedSessions = useMemo(() => {
    // Filter sessions based on user role
    let filteredSessions = sessions;

    // For non-admin users, show only their managed cows
    if (currentUser?.role_id !== 1 && userManagedCows.length > 0) {
      const managedCowIds = userManagedCows.map((cow) => String(cow.id));
      filteredSessions = filteredSessions.filter((session) =>
        managedCowIds.includes(String(session.cow_id))
      );
    }

    // Apply search and filter logic
    filteredSessions = filteredSessions.filter((session) => {
      // Enhanced search term - search across multiple fields
      const matchesSearch =
        !searchTerm ||
        (() => {
          const searchLower = searchTerm.toLowerCase().trim();

          // Convert session date to searchable format
          const sessionDate = new Date(session.milking_time);
          const dateString = format(sessionDate, "yyyy-MM-dd");
          const timeString = format(sessionDate, "HH:mm");
          const fullDateTimeString = format(sessionDate, "yyyy-MM-dd HH:mm");

          // Get time period
          const hours = sessionDate.getHours();
          let timePeriod = "";
          if (hours < 12) timePeriod = "morning";
          else if (hours < 18) timePeriod = "afternoon";
          else timePeriod = "evening";

          // Search in various fields
          const searchFields = [
            // Basic info
            session.cow_name?.toLowerCase() || "",
            session.milker_name?.toLowerCase() || "",
            String(session.cow_id),
            String(session.milker_id),
            String(session.id),

            // Volume - search with and without decimals
            String(session.volume),
            String(parseFloat(session.volume || 0).toFixed(1)),
            String(parseFloat(session.volume || 0).toFixed(2)),
            String(Math.round(parseFloat(session.volume || 0))),

            // Notes
            session.notes?.toLowerCase() || "",

            // Date and time in various formats
            dateString,
            timeString,
            fullDateTimeString,
            timePeriod,

            // Alternative date formats
            format(sessionDate, "dd/MM/yyyy"),
            format(sessionDate, "MM/dd/yyyy"),
            format(sessionDate, "dd-MM-yyyy"),
            format(sessionDate, "MM-dd-yyyy"),
            format(sessionDate, "yyyy/MM/dd"),

            // Month and year
            format(sessionDate, "MMMM yyyy").toLowerCase(),
            format(sessionDate, "MMM yyyy").toLowerCase(),
            format(sessionDate, "MMMM").toLowerCase(),
            format(sessionDate, "MMM").toLowerCase(),
            format(sessionDate, "yyyy"),

            // Day of week
            format(sessionDate, "EEEE").toLowerCase(),
            format(sessionDate, "EEE").toLowerCase(),

            // Time formats
            format(sessionDate, "h:mm a").toLowerCase(),
            format(sessionDate, "HH:mm"),

            // Volume with unit
            `${session.volume}l`,
            `${session.volume} l`,
            `${session.volume}liters`,
            `${session.volume} liters`,
            `${session.volume}liter`,
            `${session.volume} liter`,
          ];

          // Check if search term matches any field
          return searchFields.some((field) => field.includes(searchLower));
        })();

      // Filter selects
      const matchesCow = selectedCow
        ? String(session.cow_id) === selectedCow
        : true;
      const matchesMilker = selectedMilker
        ? String(session.milker_id) === selectedMilker
        : true;

      // Date filter with local date handling
      const matchesDate = selectedDate
        ? getSessionLocalDate(session.milking_time) === selectedDate
        : true;

      return matchesSearch && matchesCow && matchesMilker && matchesDate;
    });

    // Sort by milking time, most recent first
    filteredSessions.sort(
      (a, b) => new Date(b.milking_time) - new Date(a.milking_time)
    );

    // Calculate pagination
    const totalItems = filteredSessions.length;
    const totalPages = Math.ceil(totalItems / sessionsPerPage);

    // Get current page items
    const startIndex = (currentPage - 1) * sessionsPerPage;
    const paginatedItems = filteredSessions.slice(
      startIndex,
      startIndex + sessionsPerPage
    );

    return {
      filteredSessions,
      currentSessions: paginatedItems,
      totalItems,
      totalPages,
    };
  }, [
    sessions,
    searchTerm,
    selectedCow,
    selectedMilker,
    selectedDate,
    currentPage,
    sessionsPerPage,
    currentUser,
    userManagedCows,
    getSessionLocalDate,
  ]);
  // Check if user is a supervisor
  const isSupervisor = useMemo(() => currentUser?.role_id === 2, [currentUser]);

  // Handle deletion of a milking session
  const handleDeleteSession = useCallback(async (sessionId) => {
    try {
      const result = await Swal.fire({
        title: "Delete Milking Session?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      if (result.isConfirmed) {
        const response = await deleteMilkingSession(sessionId);

        if (response.success) {
          // Refresh sessions
          const sessionsResponse = await getMilkingSessions();
          if (sessionsResponse.success && sessionsResponse.sessions) {
            setSessions(sessionsResponse.sessions);
          }

          // Show success toast
          Swal.fire({
            title: "Deleted!",
            text: "The milking session has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: "top-end",
          });
        } else {
          await Swal.fire({
            title: "Error",
            text: response.message || "Failed to delete session",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      await Swal.fire({
        title: "Error",
        text: "An unexpected error occurred while deleting the session",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }, []);

  // Open add modal with pre-filled data
  const handleOpenAddModal = useCallback(() => {
    // Use consistent property name
    const userId = currentUser?.id || currentUser?.user_id;

    // Admin bisa pilih milker, farmer otomatis pakai user_id mereka
    const milkerId = currentUser?.role_id === 1 ? "" : String(userId || "");

    console.log("Opening add modal - User role:", currentUser?.role_id);
    console.log("Setting milker_id to:", milkerId);

    setNewSession({
      cow_id: "",
      milker_id: milkerId,
      volume: "",
      milking_time: getLocalDateTime(),
      notes: "",
    });
    setShowAddModal(true);
  }, [currentUser]);

  // Handle adding session dengan loading state
  const handleAddSession = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Enhanced debug logging
    console.log("=== ADD SESSION DEBUG ===");
    console.log("Current user:", currentUser);
    console.log("User role_id:", currentUser?.role_id);

    // Use consistent property name
    const userId = currentUser?.id || currentUser?.user_id;
    console.log("User ID:", userId);

    // Validation - ensure milker_id is not empty
    let finalMilkerId = newSession.milker_id;

    // If admin and no milker selected, show error
    if (currentUser?.role_id === 1 && !finalMilkerId) {
      setIsSubmitting(false);
      Swal.fire({
        icon: "warning",
        title: "Missing Milker",
        text: "Please select a milker for this session.",
      });
      return;
    }

    // If farmer and milker_id is empty, use their own ID
    if (currentUser?.role_id !== 1 && !finalMilkerId) {
      finalMilkerId = String(userId || "");
    }

    // Final validation - milker_id must not be empty
    if (!finalMilkerId) {
      setIsSubmitting(false);
      Swal.fire({
        icon: "error",
        title: "Invalid Milker ID",
        text: "Unable to determine milker ID. Please try again.",
      });
      return;
    }

    console.log("Final milker_id:", finalMilkerId);

    // Add creator info to notes
    const creatorInfo = currentUser
      ? `Created by: ${currentUser.name || currentUser.username} (Role: ${
          currentUser.role_id === 1
            ? "Admin"
            : currentUser.role_id === 2
            ? "Supervisor"
            : "Farmer"
        }, ID: ${userId})`
      : "Created by: Unknown";

    // Create session data with creator info
    const sessionData = {
      ...newSession,
      milker_id: finalMilkerId, // Use the validated milker_id
      volume: parseFloat(newSession.volume),
      notes: newSession.notes
        ? `${newSession.notes}\n\n${creatorInfo}`
        : creatorInfo,
    };

    console.log("Final session data:", sessionData);
    console.log("=== END DEBUG ===");

    try {
      const response = await addMilkingSession(sessionData);

      if (response.success) {
        console.log("Milking session added successfully");
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Milking session added successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh sessions list
        const sessionsResponse = await getMilkingSessions();
        if (sessionsResponse.success && sessionsResponse.sessions) {
          setSessions(sessionsResponse.sessions);
        }

        setShowAddModal(false);
        // Reset form with appropriate milker_id
        const resetMilkerId =
          currentUser?.role_id === 1 ? "" : String(userId || "");
        setNewSession({
          cow_id: "",
          milker_id: resetMilkerId,
          volume: "",
          milking_time: getLocalDateTime(),
          notes: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to add milking session",
        });
      }
    } catch (error) {
      console.error("Error adding milking session:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal with session data
  const openEditModal = useCallback((session) => {
    const localMilkingTime = new Date(session.milking_time);
    localMilkingTime.setMinutes(
      localMilkingTime.getMinutes() - localMilkingTime.getTimezoneOffset()
    );

    setSelectedSession({
      ...session,
      cow_id: String(session.cow_id),
      milking_time: localMilkingTime.toISOString().slice(0, 16), // Format sesuai input datetime-local
    });
    setShowEditModal(true);
  }, []);

  // Handle editing session dengan loading state
  const handleEditSession = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await editMilkingSession(
        selectedSession.id,
        selectedSession
      );

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Milking session updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });

        setShowEditModal(false);
        // Refresh sessions list
        const sessionsResponse = await getMilkingSessions();
        if (sessionsResponse.success && sessionsResponse.sessions) {
          setSessions(sessionsResponse.sessions);
        }
        setSelectedSession(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.message || "Failed to update milking session",
        });
      }
    } catch (error) {
      console.error("Error editing session:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open view modal with session data
  const openViewModal = useCallback((session) => {
    setViewSession({
      ...session,
      milking_time: session.milking_time,
    });
    setShowViewModal(true);
  }, []);

  // Handle exports
  const handleExportToPDF = () => exportMilkProductionToPDF();
  const handleExportToExcel = () => exportMilkProductionToExcel();

  // Handle pagination
  const handlePageChange = (page) => setCurrentPage(page);

  // Format milking time with badges based on time of day
  const getMilkingTimeLabel = (timeStr) => {
    const date = new Date(timeStr);
    const hours = date.getHours();

    let timeLabel = format(date, "HH:mm");
    let periodBadge;

    if (hours < 12) {
      periodBadge = (
        <Badge bg="warning" className="ms-2">
          Morning
        </Badge>
      );
    } else if (hours < 18) {
      periodBadge = (
        <Badge bg="info" className="ms-2">
          Afternoon
        </Badge>
      );
    } else {
      periodBadge = (
        <Badge bg="secondary" className="ms-2">
          Evening
        </Badge>
      );
    }

    return (
      <>
        {timeLabel} {periodBadge}
      </>
    );
  };

  // ========== CONSTANTS ==========
  const milkingTimeInfo = {
    Morning:
      "Milking session conducted in the morning (before 12 PM), typically yields higher milk volume.",
    Afternoon:
      "Milking session during afternoon hours (12 PM - 6 PM), moderate milk production.",
    Evening:
      "Evening milking session (after 6 PM), usually the last session of the day.",
  };

  // ========== RENDER METHODS ==========
  // Show loading spinner
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <h4
            className="mb-0"
            style={{
              color: "#3D90D7",
              fontSize: "25px",
              fontFamily: "Roboto, Monospace",
              letterSpacing: "1.4px",
            }}
          >
            <i className="fas fa-cow me-2" /> Milk Production Management
          </h4>
        </Card.Header>
        <Card.Body className="border-bottom">
          <div className="mb-3">
            <h6 className="text-muted mb-2">
              <i className="fas fa-info-circle me-1"></i>
              Milking Time Information
            </h6>
            <div className="row g-2">
              {Object.entries(milkingTimeInfo).map(([period, description]) => {
                const periodColors = {
                  Morning: "#fff3cd", // Light yellow for morning
                  Afternoon: "#d1ecf1", // Light blue for afternoon
                  Evening: "#f8d7da", // Light red for evening
                };

                return (
                  <div className="col-md-4" key={period}>
                    <div
                      className="p-2 border rounded"
                      style={{
                        backgroundColor: periodColors[period] || "#f8f9fa",
                        borderLeft: `4px solid ${
                          periodColors[period]?.replace("f", "c") || "#0d6efd"
                        }`,
                      }}
                    >
                      <h6
                        className="text-primary mb-1"
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          textTransform: "capitalize",
                        }}
                      >
                        {period} Session
                      </h6>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "12px" }}
                      >
                        {description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card.Body>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Button
                variant="primary shadow-sm opacity-35"
                onClick={handleOpenAddModal}
                style={{
                  opacity: 0.98,
                  letterSpacing: "1.3px",
                  fontWeight: "600",
                  fontSize: "0.8rem",
                }}
                disabled={isSupervisor}
              >
                <i className="fas fa-plus me-2" /> Add Milking Session
              </Button>
            </div>

            <div className="d-flex gap-2">
              <OverlayTrigger overlay={<Tooltip>Export to PDF</Tooltip>}>
                <Button
                  variant="danger shadow-sm opacity-35"
                  onClick={handleExportToPDF}
                >
                  <i className="fas fa-file-pdf me-2" /> PDF
                </Button>
              </OverlayTrigger>

              <OverlayTrigger overlay={<Tooltip>Export to Excel</Tooltip>}>
                <Button
                  variant="success shadow-sm opacity-35"
                  onClick={handleExportToExcel}
                >
                  <i className="fas fa-file-excel me-2" /> Excel
                </Button>
              </OverlayTrigger>
            </div>
          </div>

          {/* Stats Cards */}
          <Row className="mb-4">
            {/* Filter indicator */}
            {milkStats.hasActiveFilters && (
              <Col xs={12} className="mb-3">
                <div
                  className="alert alert-info d-flex align-items-center"
                  role="alert"
                >
                  <i className="fas fa-filter me-2"></i>
                  <span className="me-2">
                    Statistics are filtered based on current search and filter
                    criteria.
                  </span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCow("");
                      setSelectedMilker("");
                      setSelectedDate("");
                    }}
                  >
                    <i className="fas fa-times me-1"></i> Clear All Filters
                  </Button>
                </div>
              </Col>
            )}

            <Col md={3}>
              <Card className="bg-primary text-white mb-3 shadow-sm opacity-75">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-0">
                        {milkStats.hasActiveFilters ? "Filtered " : ""}Total
                        Sessions
                      </h6>
                      <h2 className="mt-2 mb-0">
                        {milkStats.hasActiveFilters
                          ? milkStats.totalSessions
                          : currentUser?.role_id === 1
                          ? milkStats.baseTotalSessions
                          : milkStats.totalSessions}
                      </h2>
                      {milkStats.hasActiveFilters && (
                        <small className="text-light opacity-75">
                          of{" "}
                          {currentUser?.role_id === 1
                            ? milkStats.baseTotalSessions
                            : milkStats.baseTotalSessions}{" "}
                          total
                        </small>
                      )}
                    </div>
                    <div>
                      <i className="fas fa-calendar-check fa-3x opacity-50"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="bg-success text-white mb-3 shadow-sm opacity-75">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-0">
                        {milkStats.hasActiveFilters ? "Filtered " : ""}Total
                        Volume
                      </h6>
                      <h2 className="mt-2 mb-0">
                        {milkStats.hasActiveFilters
                          ? `${milkStats.totalVolume} L`
                          : currentUser?.role_id === 1
                          ? `${milkStats.baseTotalVolume} L`
                          : `${milkStats.totalVolume} L`}
                      </h2>
                      {milkStats.hasActiveFilters && (
                        <small className="text-light opacity-75">
                          of{" "}
                          {currentUser?.role_id === 1
                            ? milkStats.baseTotalVolume
                            : milkStats.baseTotalVolume}{" "}
                          L total
                        </small>
                      )}
                    </div>
                    <div>
                      <i className="fas fa-fill-drip fa-3x opacity-50"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="bg-info text-white mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-0">
                        {milkStats.hasActiveFilters ? "Filtered " : ""}Today's
                        Volume
                      </h6>
                      <h2 className="mt-2 mb-0">
                        {milkStats.hasActiveFilters
                          ? `${milkStats.todayVolume} L`
                          : currentUser?.role_id === 1
                          ? `${milkStats.baseTodayVolume} L`
                          : `${milkStats.todayVolume} L`}
                      </h2>
                      {milkStats.hasActiveFilters && (
                        <small className="text-light opacity-75">
                          of{" "}
                          {currentUser?.role_id === 1
                            ? milkStats.baseTodayVolume
                            : milkStats.baseTodayVolume}{" "}
                          L today
                        </small>
                      )}
                    </div>
                    <div>
                      <i className="fas fa-glass fa-3x opacity-50"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={3}>
              <Card className="bg-warning text-dark mb-3 shadow-sm opacity-75">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-0">
                        {milkStats.hasActiveFilters ? "Filtered " : ""}Avg
                        Volume/Session
                      </h6>
                      <h2 className="mt-2 mb-0">
                        {milkStats.hasActiveFilters
                          ? `${milkStats.avgVolumePerSession} L`
                          : currentUser?.role_id === 1
                          ? `${milkStats.baseAvgVolumePerSession} L`
                          : `${milkStats.avgVolumePerSession} L`}
                      </h2>
                      {milkStats.hasActiveFilters && (
                        <small className="text-dark opacity-75">
                          base avg:{" "}
                          {currentUser?.role_id === 1
                            ? milkStats.baseAvgVolumePerSession
                            : milkStats.baseAvgVolumePerSession}{" "}
                          L
                        </small>
                      )}
                    </div>
                    <div>
                      <i className="fas fa-chart-line fa-3x opacity-50"></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Search and Filters */}
          <Row className="mb-4">
            <Col md={6} lg={4}>
              <InputGroup className="shadow-sm mb-3">
                <InputGroup.Text className="bg-primary text-white border-0 opacity-75">
                  <i className="fas fa-search" />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search by cow, milker, date, time, volume, notes..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="fas fa-times" />
                  </Button>
                )}
              </InputGroup>

              {/* Add search help text */}
              {searchTerm && (
                <Form.Text
                  className="text-muted d-block mb-2"
                  style={{ fontSize: "0.75rem" }}
                >
                  <i className="fas fa-lightbulb me-1"></i>
                  Search tips: Try cow names, dates (2024-01-15), times
                  (morning/afternoon/evening), volumes (5.5L), or any notes. Use
                  formats like "Jan 2024", "Monday", "15:30", etc.
                </Form.Text>
              )}
            </Col>
            <Col md={6} lg={3}>
              <Form.Group className="mb-3">
                <Form.Select
                  value={selectedCow}
                  onChange={(e) => {
                    setSelectedCow(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Filter by Cow</option>
                  {uniqueCows.map((cow) => (
                    <option key={cow.id} value={cow.id}>
                      {cow.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3}>
              <Form.Group className="mb-3">
                <Form.Select
                  value={selectedMilker}
                  onChange={(e) => {
                    setSelectedMilker(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Filter by Milker</option>
                  {uniqueMilkers.map((milker) => (
                    <option key={milker.id} value={milker.id}>
                      {milker.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={2}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Filter by Date"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Milking Sessions Table */}
          <div className="table-responsive">
            <table
              className="table table-hover border rounded shadow-sm"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              <thead className="bg-gradient-light">
                <tr
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    letterSpacing: "0.4px",
                  }}
                >
                  <th className="py-3 text-center" style={{ width: "5%" }}>
                    #
                  </th>
                  <th className="py-3" style={{ width: "15%" }}>
                    Cow
                  </th>
                  <th className="py-3" style={{ width: "12%" }}>
                    Milker
                  </th>
                  <th className="py-3" style={{ width: "10%" }}>
                    Volume (L)
                  </th>
                  <th className="py-3" style={{ width: "18%" }}>
                    Milking Time
                  </th>
                  <th className="py-3" style={{ width: "25%" }}>
                    Notes
                  </th>
                  <th className="py-3 text-center" style={{ width: "15%" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndPaginatedSessions.currentSessions.map(
                  (session, index) => (
                    <tr
                      key={session.id}
                      className="align-middle"
                      style={{ transition: "all 0.2s" }}
                    >
                      <td className="fw-bold text-center">
                        {(currentPage - 1) * sessionsPerPage + index + 1}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <Badge
                            bg="info"
                            pill
                            className="me-1 px-1 py-1"
                            style={{ letterSpacing: "0.5px" }}
                          >
                            ID: {session.cow_id}
                          </Badge>
                          <span className="fw-medium">
                            {session.cow_name || `-`}
                          </span>
                        </div>
                      </td>
                      <td style={{ letterSpacing: "0.3px", fontWeight: "500" }}>
                        {session.milker_name || `-`}
                      </td>
                      <td>
                        <Badge
                          bg="success text-white shadow-sm opacity-75"
                          className="px-1 py-1"
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            letterSpacing: "0.8px",
                          }}
                        >
                          {parseFloat(session.volume).toFixed(2)} L
                        </Badge>
                      </td>
                      <td>
                        <div
                          style={{
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span className="fw-bold">
                            {format(
                              new Date(session.milking_time),
                              "yyyy-MM-dd"
                            )}
                          </span>{" "}
                          {getMilkingTimeLabel(session.milking_time)}
                        </div>
                      </td>
                      <td>
                        {session.notes ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{session.notes}</Tooltip>}
                          >
                            <span
                              className="text-truncate d-inline-block fst-italic"
                              style={{
                                maxWidth: "400px",
                                letterSpacing: "0.2px",
                                color: "#555",
                                fontSize: "0.9rem",
                                borderLeft: "3px solid #eaeaea",
                                paddingLeft: "8px",
                              }}
                            >
                              {session.notes}
                            </span>
                          </OverlayTrigger>
                        ) : (
                          <span className="text-muted fst-italic">
                            No notes provided
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit Session</Tooltip>}
                          >
                            <span>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "8px",
                                }}
                                onClick={() => openEditModal(session)}
                                disabled={isSupervisor}
                                tabIndex={isSupervisor ? -1 : 0}
                              >
                                <i className="fas fa-edit" />
                              </Button>
                            </span>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>View Details</Tooltip>}
                          >
                            <Button
                              variant="outline-info"
                              size="sm"
                              className="d-flex align-items-center justify-content-center shadow-sm"
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                              }}
                              onClick={() => openViewModal(session)}
                            >
                              <i className="fas fa-eye" />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete Session</Tooltip>}
                          >
                            <span>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="d-flex align-items-center justify-content-center shadow-sm"
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "8px",
                                }}
                                onClick={() => handleDeleteSession(session.id)}
                                disabled={isSupervisor}
                                tabIndex={isSupervisor ? -1 : 0}
                              >
                                <i className="fas fa-trash-alt" />
                              </Button>
                            </span>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Empty state message */}
          {filteredAndPaginatedSessions.totalItems === 0 && (
            <div className="text-center py-5 my-4">
              <i className="fas fa-search fa-3x text-muted mb-4 opacity-50"></i>
              <p
                className="lead text-muted"
                style={{ letterSpacing: "0.5px", fontWeight: "500" }}
              >
                No milking sessions found matching your criteria.
              </p>
              <Button
                variant="outline-primary"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCow("");
                  setSelectedMilker("");
                  setSelectedDate("");
                }}
              >
                <i className="fas fa-sync-alt me-2"></i> Reset Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredAndPaginatedSessions.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing {(currentPage - 1) * sessionsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * sessionsPerPage,
                  filteredAndPaginatedSessions.totalItems
                )}{" "}
                of {filteredAndPaginatedSessions.totalItems} entries
              </div>

              <nav>
                <ul className="pagination justify-content-center mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(1)}
                    >
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>

                  {Array.from(
                    { length: filteredAndPaginatedSessions.totalPages },
                    (_, i) => {
                      const pageNumber = i + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber ===
                          filteredAndPaginatedSessions.totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <li
                            key={pageNumber}
                            className={`page-item ${
                              currentPage === pageNumber ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <li key={pageNumber} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    }
                  )}

                  <li
                    className={`page-item ${
                      currentPage === filteredAndPaginatedSessions.totalPages
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === filteredAndPaginatedSessions.totalPages
                        ? "disabled"
                        : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        handlePageChange(
                          filteredAndPaginatedSessions.totalPages
                        )
                      }
                    >
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </Card.Body>
      </Card>
      {/* View Milking Session Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title
            style={{ fontFamily: "'Roboto', sans-serif", fontSize: "1.5rem" }}
          >
            <i className="fas fa-eye me-2 text-info"></i>
            View Milking Session Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewSession && (
            <div className="p-3">
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2">Cow Information</h6>
                  <div className="border-start ps-3">
                    <p>
                      <span className="fw-bold me-2">Cow ID:</span>
                      <span>{viewSession.cow_id}</span>
                    </p>
                    <p>
                      <span className="fw-bold me-2">Cow Name:</span>
                      <span>{viewSession.cow_name || "N/A"}</span>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Milker Information</h6>
                  <div className="border-start ps-3">
                    <p>
                      <span className="fw-bold me-2">Milker ID:</span>
                      <span>{viewSession.milker_id}</span>
                    </p>
                    <p>
                      <span className="fw-bold me-2">Milker Name:</span>
                      <span>{viewSession.milker_name || "N/A"}</span>
                    </p>
                  </div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="text-muted mb-2">Milking Details</h6>
                  <div className="border-start ps-3">
                    <p>
                      <span className="fw-bold me-2">Volume:</span>
                      <Badge bg="success" className="px-2">
                        {parseFloat(viewSession.volume).toFixed(2)} L
                      </Badge>
                    </p>
                    <p>
                      <span className="fw-bold me-2">Date:</span>
                      <span>
                        {format(
                          new Date(viewSession.milking_time),
                          "yyyy-MM-dd"
                        )}
                      </span>
                    </p>
                    <p>
                      <span className="fw-bold me-2">Time:</span>
                      <span>
                        {getMilkingTimeLabel(viewSession.milking_time)}
                      </span>
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="text-muted mb-2">Additional Information</h6>
                  <div className="border-start ps-3">
                    <p>
                      <span className="fw-bold">Notes:</span>
                    </p>
                    <p className="fst-italic text-muted">
                      {viewSession.notes || "No notes provided"}
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Milking Session Modal */}
      <Modal
        show={showAddModal}
        onHide={() => !isSubmitting && setShowAddModal(false)}
        size="lg"
        backdrop={isSubmitting ? "static" : true}
        keyboard={!isSubmitting}
      >
        <Modal.Header closeButton={!isSubmitting} className="bg-light">
          <Modal.Title>
            <i className="fas fa-plus-circle me-2 text-primary"></i>
            Add New Milking Session
            {isSubmitting && (
              <Spinner
                animation="border"
                size="sm"
                className="ms-2"
                variant="primary"
              />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSession}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sapi</Form.Label>
                  <Form.Select
                    value={newSession.cow_id}
                    onChange={(e) => handleCowSelectionInAdd(e.target.value)}
                    required
                    className="shadow-sm"
                    disabled={isSubmitting}
                  >
                    <option value="">-- Select Cow --</option>
                    {(currentUser?.role_id === 1 ? cowList : userManagedCows)
                      .filter((cow) => cow.gender?.toLowerCase() === "female")
                      .map((cow) => (
                        <option key={cow.id} value={cow.id}>
                          {cow.name} (ID: {cow.id}) -{" "}
                          {cow.lactation_phase || "Unknown"}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Milker</Form.Label>
                  {currentUser?.role_id === 1 ? (
                    // Admin bisa memilih milker dari daftar farmers yang mengelola cow yang dipilih
                    <Form.Select
                      value={newSession.milker_id}
                      onChange={(e) =>
                        setNewSession({
                          ...newSession,
                          milker_id: e.target.value,
                        })
                      }
                      required
                      disabled={
                        !newSession.cow_id || loadingFarmers || isSubmitting
                      }
                      className={!newSession.cow_id ? "bg-light" : ""}
                    >
                      <option value="">
                        {!newSession.cow_id
                          ? "-- Choose the Cow First --"
                          : loadingFarmers
                          ? "-- Loading Breeders --"
                          : "-- Select Blusher --"}
                      </option>
                      {availableFarmersForCow.map((farmer) => (
                        <option key={farmer.user_id} value={farmer.id}>
                          {farmer.name || farmer.username} (ID:{" "}
                          {farmer.user_id || farmer.id})
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    // Farmer hanya bisa menggunakan ID mereka sendiri
                    <>
                      <Form.Control
                        type="text"
                        value={
                          currentUser
                            ? `${
                                currentUser.name || currentUser.username
                              } (ID: ${currentUser.id || currentUser.user_id})`
                            : ""
                        }
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Anda otomatis diatur sebagai pemerah untuk sesi ini
                      </Form.Text>
                    </>
                  )}
                  {currentUser?.role_id === 1 && !newSession.cow_id && (
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Silakan pilih sapi terlebih dahulu untuk melihat peternak
                      yang tersedia
                    </Form.Text>
                  )}
                  {currentUser?.role_id === 1 &&
                    newSession.cow_id &&
                    availableFarmersForCow.length === 0 &&
                    !loadingFarmers && (
                      <Form.Text className="text-warning">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        Tidak ada peternak yang ditugaskan untuk mengelola sapi
                        ini
                      </Form.Text>
                    )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-tint me-2 text-success"></i>
                    Volume (Liter)
                  </Form.Label>

                  {/* Volume Input */}
                  <div className="mb-2">
                    <Form.Control
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      placeholder="Masukkan volume susu dalam liter"
                      value={newSession.volume}
                      onChange={(e) =>
                        setNewSession({ ...newSession, volume: e.target.value })
                      }
                      required
                      className="shadow-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Quick Volume Buttons */}
                  <div className="mb-2">
                    <Form.Label className="form-label-sm text-muted">
                      Volume Cepat:
                    </Form.Label>
                    <div className="d-flex gap-1 flex-wrap">
                      {["3.0", "5.0", "7.5", "10.0", "15.0", "20.0"].map(
                        (volume) => (
                          <Button
                            key={volume}
                            variant="outline-success"
                            size="sm"
                            type="button"
                            onClick={() => {
                              setNewSession({
                                ...newSession,
                                volume: volume,
                              });
                            }}
                            style={{ fontSize: "0.7rem", padding: "3px 6px" }}
                            disabled={isSubmitting}
                          >
                            <i className="fas fa-plus me-1"></i>
                            {volume}L
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Volume Info Display */}
                  {newSession.volume && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Volume terpilih:{" "}
                        <strong>
                          {parseFloat(newSession.volume || 0).toFixed(1)} Liter
                        </strong>
                        {(() => {
                          const vol = parseFloat(newSession.volume || 0);
                          if (vol < 3) return " (Volume Rendah)";
                          if (vol <= 10) return " (Volume Normal)";
                          if (vol <= 20) return " (Volume Tinggi)";
                          return " (Volume Sangat Tinggi)";
                        })()}
                      </small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-calendar-alt me-2 text-primary"></i>
                    Waktu Pemerahan
                  </Form.Label>

                  {/* Date Input */}
                  <div className="mb-2">
                    <Form.Label className="form-label-sm text-muted">
                      Date:
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={newSession.milking_time.split("T")[0]}
                      onChange={(e) => {
                        const currentTime =
                          newSession.milking_time.split("T")[1] || "06:00";
                        setNewSession({
                          ...newSession,
                          milking_time: `${e.target.value}T${currentTime}`,
                        });
                      }}
                      required
                      className="shadow-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Time Input with Quick Buttons */}
                  <div>
                    <Form.Label className="form-label-sm text-muted">
                      Time:
                    </Form.Label>
                    <div className="d-flex gap-2 mb-2">
                      <Form.Control
                        type="time"
                        value={newSession.milking_time.split("T")[1] || "06:00"}
                        onChange={(e) => {
                          const currentDate =
                            newSession.milking_time.split("T")[0];
                          setNewSession({
                            ...newSession,
                            milking_time: `${currentDate}T${e.target.value}`,
                          });
                        }}
                        required
                        className="shadow-sm"
                        style={{ flex: 1 }}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Quick Time Buttons */}
                    <div className="d-flex gap-1 flex-wrap mb-2">
                      {[
                        {
                          time: "06:00",
                          label: "Morning (06:00)",
                          variant: "outline-warning",
                          icon: "fas fa-sun",
                        },
                        {
                          time: "14:00",
                          label: "Afternoon (14:00)",
                          variant: "outline-info",
                          icon: "fas fa-cloud-sun",
                        },
                        {
                          time: "18:00",
                          label: "Afternoon (18:00)",
                          variant: "outline-secondary",
                          icon: "fas fa-moon",
                        },
                      ].map((timeBtn) => (
                        <Button
                          key={timeBtn.time}
                          variant={timeBtn.variant}
                          size="sm"
                          type="button"
                          onClick={() => {
                            const currentDate =
                              newSession.milking_time.split("T")[0];
                            setNewSession({
                              ...newSession,
                              milking_time: `${currentDate}T${timeBtn.time}`,
                            });
                          }}
                          style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                          disabled={isSubmitting}
                        >
                          <i className={`${timeBtn.icon} me-1`}></i>
                          {timeBtn.label}
                        </Button>
                      ))}
                    </div>

                    {/* Current Selection Display */}
                    <div className="mt-2 p-2 bg-light rounded">
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        Chosen:{" "}
                        {(() => {
                          const date = new Date(newSession.milking_time);
                          const options = {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "Asia/Jakarta",
                          };
                          return date.toLocaleDateString("id-ID", options);
                        })()}
                      </small>
                    </div>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                <i className="fas fa-sticky-note me-2 text-secondary"></i>
                Notes
              </Form.Label>

              {/* Quick Notes Pills */}
              <div className="mb-3">
                <Form.Label className="form-label-sm text-muted mb-2">
                  Quick Note:
                </Form.Label>
                <div className="d-flex gap-1 flex-wrap">
                  {[
                    {
                      text: "Cow is healthy and productive",
                      label: "Healthy Condition",
                      variant: "outline-primary",
                      icon: "fas fa-heart-pulse",
                    },
                    {
                      text: "Milk production is normal and meets the target",
                      label: "Normal Production",
                      variant: "outline-success",
                      icon: "fas fa-check-circle",
                    },
                    {
                      text: "Milking process went smoothly without obstacles",
                      label: "Smooth Milking",
                      variant: "outline-info",
                      icon: "fas fa-clock",
                    },
                    {
                      text: "This cow needs special attention",
                      label: "Needs Attention",
                      variant: "outline-warning",
                      icon: "fas fa-exclamation-triangle",
                    },
                    {
                      text: "Milk quality is good and fresh",
                      label: "Good Quality",
                      variant: "outline-secondary",
                      icon: "fas fa-thumbs-up",
                    },
                    {
                      text: "Cow appears stressed or anxious",
                      label: "Cow Stressed",
                      variant: "outline-dark",
                      icon: "fas fa-tired",
                    },
                    {
                      text: "Production volume is lower than usual",
                      label: "Production Down",
                      variant: "outline-danger",
                      icon: "fas fa-arrow-down",
                    },
                    {
                      text: "Milking equipment is functioning properly",
                      label: "Equipment OK",
                      variant: "outline-success",
                      icon: "fas fa-tools",
                    },
                  ].map((note, index) => (
                    <Button
                      key={index}
                      variant={note.variant}
                      size="sm"
                      type="button"
                      onClick={() => {
                        setNewSession({
                          ...newSession,
                          notes: newSession.notes
                            ? `${newSession.notes}\n${note.text}`
                            : note.text,
                        });
                      }}
                      style={{
                        fontSize: "0.7rem",
                        padding: "4px 8px",
                        borderRadius: "15px",
                      }}
                      disabled={isSubmitting}
                    >
                      <i className={`${note.icon} me-1`}></i>
                      {note.label}
                    </Button>
                  ))}
                </div>

                {/* Clear Notes Button */}
                {newSession.notes && (
                  <div className="mt-2">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setNewSession({
                          ...newSession,
                          notes: "",
                        });
                      }}
                      style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                      disabled={isSubmitting}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Hapus Semua Catatan
                    </Button>
                  </div>
                )}
              </div>

              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter notes about this milking session or use the quick notes option above..."
                value={newSession.notes}
                onChange={(e) =>
                  setNewSession({ ...newSession, notes: e.target.value })
                }
                className="shadow-sm"
                disabled={isSubmitting}
              />

              {newSession.notes && (
                <Form.Text className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Karakter: {newSession.notes.length}
                </Form.Text>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Add...
                  </>
                ) : (
                  "Add Milking Session"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Milking Session Modal */}
      <Modal
        show={showEditModal}
        onHide={() => !isSubmitting && setShowEditModal(false)}
        size="lg"
        backdrop={isSubmitting ? "static" : true}
        keyboard={!isSubmitting}
      >
        <Modal.Header closeButton={!isSubmitting} className="bg-light">
          <Modal.Title>
            <i className="fas fa-edit me-2 text-primary"></i>
            Edit Sesi Pemerahan
            {isSubmitting && (
              <Spinner
                animation="border"
                size="sm"
                className="ms-2"
                variant="primary"
              />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSession && (
            <Form onSubmit={handleEditSession}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sapi</Form.Label>
                    <Form.Select
                      value={String(selectedSession.cow_id)}
                      onChange={(e) => handleCowSelectionInEdit(e.target.value)}
                      required
                      className="shadow-sm"
                      disabled={isSubmitting}
                    >
                      <option value="">-- Pilih Sapi --</option>
                      {(currentUser?.role_id === 1 ? cowList : userManagedCows)
                        .filter((cow) => cow.gender?.toLowerCase() === "female")
                        .map((cow) => (
                          <option key={cow.id} value={String(cow.id)}>
                            {cow.name} (ID: {cow.id}) -{" "}
                            {cow.lactation_phase || "Unknown"}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Pemerah</Form.Label>
                    {currentUser?.role_id === 1 ? (
                      <Form.Select
                        value={selectedSession.milker_id}
                        onChange={(e) =>
                          setSelectedSession({
                            ...selectedSession,
                            milker_id: e.target.value,
                          })
                        }
                        required
                        disabled={
                          !selectedSession.cow_id ||
                          loadingFarmers ||
                          isSubmitting
                        }
                        className={
                          !selectedSession.cow_id
                            ? "bg-light shadow-sm"
                            : "shadow-sm"
                        }
                      >
                        <option value="">
                          {!selectedSession.cow_id
                            ? "-- Choose the Cow First --"
                            : loadingFarmers
                            ? "-- Loading Breeders --"
                            : "-- Select Blusher --"}
                        </option>
                        {availableFarmersForCow.map((farmer) => (
                          <option key={farmer.user_id} value={farmer.user_id}>
                            {farmer.name} (ID: {farmer.user_id})
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      <>
                        <Form.Control
                          type="text"
                          value={
                            currentUser
                              ? `${
                                  currentUser.name || currentUser.username
                                } (ID: ${
                                  currentUser.user_id || currentUser.id
                                })`
                              : ""
                          }
                          disabled
                          className="bg-light shadow-sm"
                        />
                        <Form.Text className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Pemerah tidak dapat diubah untuk sesi Anda sendiri
                        </Form.Text>
                      </>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* Similar pattern for volume and time sections with disabled={isSubmitting} */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-tint me-2 text-success"></i>
                      Volume (Liter)
                    </Form.Label>

                    <div className="mb-2">
                      <Form.Control
                        type="number"
                        step="0.1"
                        min="0"
                        max="50"
                        placeholder="Enter the volume of milk in liters"
                        value={selectedSession.volume}
                        onChange={(e) =>
                          setSelectedSession({
                            ...selectedSession,
                            volume: e.target.value,
                          })
                        }
                        required
                        className="shadow-sm"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="mb-2">
                      <Form.Label className="form-label-sm text-muted">
                        Volume Cepat:
                      </Form.Label>
                      <div className="d-flex gap-1 flex-wrap">
                        {["3.0", "5.0", "7.5", "10.0", "15.0", "20.0"].map(
                          (volume) => (
                            <Button
                              key={volume}
                              variant="outline-success"
                              size="sm"
                              type="button"
                              onClick={() => {
                                setSelectedSession({
                                  ...selectedSession,
                                  volume: volume,
                                });
                              }}
                              style={{ fontSize: "0.7rem", padding: "3px 6px" }}
                              disabled={isSubmitting}
                            >
                              <i className="fas fa-plus me-1"></i>
                              {volume}L
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    {selectedSession.volume && (
                      <div className="mt-2 p-2 bg-light rounded">
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Volume terpilih:{" "}
                          <strong>
                            {parseFloat(selectedSession.volume || 0).toFixed(1)}{" "}
                            Liter
                          </strong>
                          {(() => {
                            const vol = parseFloat(selectedSession.volume || 0);
                            if (vol < 3) return " (Low Volume)";
                            if (vol <= 10) return " (Normal Volume)";
                            if (vol <= 20) return " (Volume Tinggi)";
                            return " (Very High Volume)";
                          })()}
                        </small>
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-calendar-alt me-2 text-primary"></i>
                      Waktu Pemerahan
                    </Form.Label>

                    <div className="mb-2">
                      <Form.Label className="form-label-sm text-muted">
                        Tanggal:
                      </Form.Label>
                      <Form.Control
                        type="date"
                        value={selectedSession.milking_time.split("T")[0]}
                        onChange={(e) => {
                          const currentTime =
                            selectedSession.milking_time.split("T")[1] ||
                            "06:00";
                          setSelectedSession({
                            ...selectedSession,
                            milking_time: `${e.target.value}T${currentTime}`,
                          });
                        }}
                        required
                        className="shadow-sm"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Form.Label className="form-label-sm text-muted">
                        Waktu:
                      </Form.Label>
                      <div className="d-flex gap-2 mb-2">
                        <Form.Control
                          type="time"
                          value={
                            selectedSession.milking_time.split("T")[1] ||
                            "06:00"
                          }
                          onChange={(e) => {
                            const currentDate =
                              selectedSession.milking_time.split("T")[0];
                            setSelectedSession({
                              ...selectedSession,
                              milking_time: `${currentDate}T${e.target.value}`,
                            });
                          }}
                          required
                          className="shadow-sm"
                          style={{ flex: 1 }}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="d-flex gap-1 flex-wrap mb-2">
                        {[
                          {
                            time: "06:00",
                            label: "Pagi (06:00)",
                            variant: "outline-warning",
                            icon: "fas fa-sun",
                          },
                          {
                            time: "14:00",
                            label: "Siang (14:00)",
                            variant: "outline-info",
                            icon: "fas fa-cloud-sun",
                          },
                          {
                            time: "18:00",
                            label: "Sore (18:00)",
                            variant: "outline-secondary",
                            icon: "fas fa-moon",
                          },
                        ].map((timeBtn) => (
                          <Button
                            key={timeBtn.time}
                            variant={timeBtn.variant}
                            size="sm"
                            type="button"
                            onClick={() => {
                              const currentDate =
                                selectedSession.milking_time.split("T")[0];
                              setSelectedSession({
                                ...selectedSession,
                                milking_time: `${currentDate}T${timeBtn.time}`,
                              });
                            }}
                            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                            disabled={isSubmitting}
                          >
                            <i className={`${timeBtn.icon} me-1`}></i>
                            {timeBtn.label}
                          </Button>
                        ))}
                      </div>

                      <div className="mt-2 p-2 bg-light rounded">
                        <small className="text-muted">
                          <i className="fas fa-clock me-1"></i>
                          Dipilih:{" "}
                          {(() => {
                            const date = new Date(selectedSession.milking_time);
                            const options = {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Jakarta",
                            };
                            return date.toLocaleDateString("id-ID", options);
                          })()}
                        </small>
                      </div>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="fas fa-sticky-note me-2 text-secondary"></i>
                  Catatan
                </Form.Label>

                <div className="mb-3">
                  <Form.Label className="form-label-sm text-muted mb-2">
                    Catatan Cepat:
                  </Form.Label>
                  <div className="d-flex gap-1 flex-wrap">
                    {[
                      {
                        text: "Cow is healthy and productive",
                        label: "Healthy Condition",
                        variant: "outline-primary",
                        icon: "fas fa-heart-pulse",
                      },
                      {
                        text: "Milk production is normal and meets the target",
                        label: "Normal Production",
                        variant: "outline-success",
                        icon: "fas fa-check-circle",
                      },
                      {
                        text: "Milking process went smoothly without obstacles",
                        label: "Smooth Milking",
                        variant: "outline-info",
                        icon: "fas fa-clock",
                      },
                      {
                        text: "This cow needs special attention",
                        label: "Needs Attention",
                        variant: "outline-warning",
                        icon: "fas fa-exclamation-triangle",
                      },
                      {
                        text: "Milk quality is good and fresh",
                        label: "Good Quality",
                        variant: "outline-secondary",
                        icon: "fas fa-thumbs-up",
                      },
                      {
                        text: "Cow appears stressed or anxious",
                        label: "Cow Stressed",
                        variant: "outline-dark",
                        icon: "fas fa-tired",
                      },
                      {
                        text: "Production volume is lower than usual",
                        label: "Production Down",
                        variant: "outline-danger",
                        icon: "fas fa-arrow-down",
                      },
                      {
                        text: "Milking equipment is functioning properly",
                        label: "Equipment OK",
                        variant: "outline-success",
                        icon: "fas fa-tools",
                      },
                    ].map((note, index) => (
                      <Button
                        key={index}
                        variant={note.variant}
                        size="sm"
                        type="button"
                        onClick={() => {
                          setSelectedSession({
                            ...selectedSession,
                            notes: selectedSession.notes
                              ? `${selectedSession.notes}\n${note.text}`
                              : note.text,
                          });
                        }}
                        style={{
                          fontSize: "0.7rem",
                          padding: "4px 8px",
                          borderRadius: "15px",
                        }}
                        disabled={isSubmitting}
                      >
                        <i className={`${note.icon} me-1`}></i>
                        {note.label}
                      </Button>
                    ))}
                  </div>

                  {selectedSession.notes && (
                    <div className="mt-2">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        type="button"
                        onClick={() => {
                          setSelectedSession({
                            ...selectedSession,
                            notes: "",
                          });
                        }}
                        style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-trash me-1"></i>
                        Hapus Semua Catatan
                      </Button>
                    </div>
                  )}
                </div>

                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Enter notes about this milking session or use the quick notes option above...."
                  value={selectedSession.notes || ""}
                  onChange={(e) =>
                    setSelectedSession({
                      ...selectedSession,
                      notes: e.target.value,
                    })
                  }
                  className="shadow-sm"
                  disabled={isSubmitting}
                />

                {selectedSession.notes && (
                  <Form.Text className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Karakter: {selectedSession.notes.length}
                  </Form.Text>
                )}
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Menyimpan...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListMilking;
