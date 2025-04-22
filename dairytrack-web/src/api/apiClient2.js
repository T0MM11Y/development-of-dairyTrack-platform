const BASE_URL = "http://127.0.0.1:5003/api";

export const fetchAPI = async (endpoint, method = "GET", data = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}/${endpoint}`, options);
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      // Look for 'message' property instead of 'detail'
      throw new Error(errorData.message || "An error occurred.");
    } else {
      const errorText = await response.text(); // Handle non-JSON error (e.g., HTML)
      console.error("Server Error:", errorText);
      throw new Error("Internal Server Error");
    }
  }

  // DELETE usually returns status 204 with no body
  if (response.status === 204) return true;

  // Return JSON response for successful requests
  return await response.json();
};