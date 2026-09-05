import api from "./api";

export const generateQR = (voucherId, amount) =>
  api.post("/qr/generate", {
    voucherId,
    amount,
  });

export const pay = (transactionId) =>
  api.post("/payment/pay", {
    transactionId,
  });