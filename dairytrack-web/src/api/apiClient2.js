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
      // Use 'message' instead of 'detail' to match your backend's response structure
      throw new Error(errorData.message || "Terjadi kesalahan yang tidak diketahui.");
    } else {
      const errorText = await response.text(); // Handle non-JSON errors (e.g., HTML)
      console.error("Server Error:", errorText);
      throw new Error("Internal Server Error");
    }
  }

  // DELETE typically returns 204 with no body
  if (response.status === 204) return true;

  // Return JSON response for successful requests
  return await response.json();
};