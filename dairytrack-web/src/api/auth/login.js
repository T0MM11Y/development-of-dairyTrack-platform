import { fetchAPI } from "../apiClient";

export const login = async (data) => {
  if (!data || !data.email || !data.password) {
    return {
      status: 400,
      message: "Email and password are required.",
    };
  }

  try {
    const response = await fetchAPI("auth/login", "POST", data);

    if (response.status === 200) {
      const userData = response.user;
      localStorage.setItem("user", JSON.stringify(userData));
      return {
        status: 200,
        message: "Login successful.",
        user: userData,
      };
    }

    return {
      status: response.status,
      message: response.message || "Login failed.",
    };
  } catch (error) {
    return {
      status: 500,
      message: error.message || "An unexpected error occurred.",
    };
  }
};
