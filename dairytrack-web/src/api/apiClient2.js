// apiClient.js
const BASE_URL = "http://127.0.0.1:5003/api";

export const fetchAPI = async (endpoint, method = "GET", data = null) => {
  const url = `${BASE_URL}/${endpoint}`;
  console.log("Fetching URL:", url, "Method:", method, "Data:", data);

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      // Add Authorization header if needed
      // "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    console.log("Response Status:", response.status, "Headers:", response.headers);

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred.");
      } else {
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        throw new Error("Internal Server Error");
      }
    }

    if (response.status === 204) return true;
    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error.message);
    throw error;
  }
};

// notification API
export const getFeedNotifications = () => fetchAPI("notification");