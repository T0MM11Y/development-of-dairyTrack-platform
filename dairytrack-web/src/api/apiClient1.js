const BASE_URL = "http://127.0.0.1:5001";

// export const fetchAPI = async (endpoint, method = "GET", data = null) => {
//   const options = {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//     },
//   };

//   if (data) {
//     options.body = JSON.stringify(data);
//   }

//   const response = await fetch(`${BASE_URL}/${endpoint}`, options);
//   const contentType = response.headers.get("content-type");

//   if (!response.ok) {
//     if (contentType && contentType.includes("application/json")) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Something went wrong.");
//     } else {
//       const errorText = await response.text(); // tangani HTML error
//       console.error("Server Error:", errorText);
//       throw new Error("Internal Server Error");
//     }
//   }

//   // DELETE biasanya status 204, tidak ada body
//   if (response.status === 204) return true;

//   // response JSON
//   return await response.json();
// };

// export const fetchAPI = async (endpoint, method = "GET", data = null) => {
//   const options = { method };

//   if (data) {
//     if (data instanceof FormData) {
//       // Jangan tambahkan Content-Type agar browser menanganinya otomatis
//       options.body = data;
//     } else {
//       options.headers = {
//         "Content-Type": "application/json",
//       };
//       options.body = JSON.stringify(data);
//     }
//   }

//   const response = await fetch(`${BASE_URL}/${endpoint}`, options);
//   const contentType = response.headers.get("content-type");

//   if (!response.ok) {
//     if (contentType && contentType.includes("application/json")) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || "Something went wrong.");
//     } else {
//       const errorText = await response.text();
//       console.error("Server Error:", errorText);
//       throw new Error("Internal Server Error");
//     }
//   }

//   if (response.status === 204) return true;
//   return await response.json();
// };

export const fetchAPI = async (endpoint, method = "GET", data = null) => {
  const options = { method };

  if (data) {
    if (data instanceof FormData) {
      // Jangan tambahkan Content-Type agar browser menangani secara otomatis
      options.body = data;
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
  return await response.json();
};
