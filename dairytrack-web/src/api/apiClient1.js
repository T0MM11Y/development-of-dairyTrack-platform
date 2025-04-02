const BASE_URL = "http://127.0.0.1:5001/api";

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

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      if (response.status === 401) {
        return {
          status: 401,
          message: "Unauthorized: Invalid email or password.",
        };
      }

      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        return {
          status: response.status,
          message: errorData.detail || "Something went wrong.",
        };
      } else {
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        return {
          status: response.status,
          message: "Internal Server Error",
        };
      }
    }

    if (response.status === 204) return { status: 204, message: "No Content" };

    return await response.json();
  } catch (error) {
    console.error("Network or Server Error:", error.message);
    return {
      status: 500,
      message: error.message || "An unexpected error occurred.",
    };
  }
};
