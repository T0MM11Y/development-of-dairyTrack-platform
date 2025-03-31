const BASE_URL = "http://127.0.0.1:5002/api";

//pny T0mm11y
<<<<<<< HEAD
// const BASE_URL = "http://127.0.0.1:5000/api";
=======
const BASE_URL = "http://127.0.0.1:8000/api";
>>>>>>> c5bd6d9a (api hasan)

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
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong.");
      } else {
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        throw new Error("Internal Server Error");
      }
    }

    // DELETE biasanya status 204, tidak ada body
    if (response.status === 204) return true;

    // response JSON
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};