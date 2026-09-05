const QRCode = require("qrcode");

const generateQRCode = async (payload) => {
  return await QRCode.toDataURL(
    JSON.stringify(payload),
    {
      errorCorrectionLevel: "M",
      margin: 4,
      width: 600,
    }
  );
};

module.exports = {
  generateQRCode,
};