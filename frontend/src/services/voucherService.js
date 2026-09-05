import api from "./api";

export const mintVoucher = (amount) =>
  api.post("/voucher/mint", { amount });

export const getVouchers = () =>
  api.get("/voucher");