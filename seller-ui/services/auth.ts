// import api from "./api";

// interface LoginData {
//   email: string;
//   password: string;
// }

// export const loginSeller = (data: LoginData) =>
//   api.post("/seller-login", data);

// export const getSeller = () =>
//   api.get("/seller");

// export const logoutSeller = () =>
//   api.post("/seller-logout");

// interface SetupSellerShopData {
//   shopName: string;
//   shopBio: string;
//   shopAddress: string;
//   website?: string;
//   category: string;
//   openingHours: string;
// }

// export const setupSellerShop = (
//   data: SetupSellerShopData
// ) => api.post("/seller/setup-shop", data);

// export const connectSellerBank = () => {
//   return api.post("/seller/connect-bank");
// };