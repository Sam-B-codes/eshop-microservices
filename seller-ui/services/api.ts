// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080/api",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// let isRefreshing = false;

// api.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;

//       try {
//         if (!isRefreshing) {
//           isRefreshing = true;

//           await api.post("/refresh-token");

//           isRefreshing = false;
//         }

//         return api(originalRequest);
//       } catch (refreshError) {
//         isRefreshing = false;

//         window.location.href = "/seller-login";

//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;