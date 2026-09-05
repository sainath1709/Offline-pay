import api from "./api";

export const getWallet = () =>
  api.get("/wallet");