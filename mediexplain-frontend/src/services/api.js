import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Central Axios client with auth interceptor
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access_token");
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register" &&
        window.location.pathname !== "/forgot-password" &&
        window.location.pathname !== "/verify-otp" &&
        window.location.pathname !== "/reset-password"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  login: async (email, password) => {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    const response = await axios.post(`${API_BASE_URL}/auth/login`, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name,
      email,
      password,
    });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email,
    });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
      email,
      otp,
    });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Medical Reports API
export const reportsApi = {
  getDashboard: async () => {
    const response = await apiClient.get("/reports/dashboard");
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get("/reports/my-reports");
    return response.data;
  },

  search: async (query) => {
    const response = await apiClient.get(`/reports/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  upload: async (file, language = "English") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    const response = await apiClient.post("/reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  delete: async (reportId) => {
    const response = await apiClient.delete(`/reports/${reportId}`);
    return response.data;
  },

  download: async (reportId, filename = "medical-report.pdf") => {
    const response = await apiClient.get(`/reports/download/${reportId}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// AI Interactive Chat API
export const chatApi = {
  sendMessage: async (reportId, question) => {
    const response = await apiClient.post("/chat/", {
      report_id: reportId,
      question,
    });
    return response.data;
  },
};

// Backend Health & Connectivity API
export const healthApi = {
  check: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
      return response.status === 200 && response.data?.status === "healthy";
    } catch {
      return false;
    }
  },
  getDetails: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 3000 });
      return response.data;
    } catch (err) {
      return { status: "offline", error: err.message };
    }
  },
};

// Central Error Parser for consistent clinical UI feedback
export function getErrorMessage(error, defaultMsg = "An unexpected error occurred.") {
  if (!error) return defaultMsg;
  if (!error.response) {
    return `Unable to reach the backend server at ${API_BASE_URL}. Please verify that the FastAPI backend is running (run 'npm run start:backend' or 'run_servers.bat').`;
  }
  const detail = error.response.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }
  return error.response.data?.message || defaultMsg;
}

export default apiClient;

