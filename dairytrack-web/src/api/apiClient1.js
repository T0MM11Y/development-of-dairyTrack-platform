const BASE_URL = "http://127.0.0.1:5001";

export const fetchAPI = async (endpoint, method = "GET", data = null, isBlob = false) => {
  const options = { method };

  if (data) {
    if (data instanceof FormData) {
      options.body = data; // Biarkan browser handle headers-nya
    } else {
      options.headers = {
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify(data);
    }
  }

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

  if (response.status === 204) return true;

  // ⬇️ Cek apakah butuh Blob
  if (isBlob) {
    return await response.blob();
  }

  return await response.json();
};
