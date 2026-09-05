import { useEffect, useState } from "react";
import API from "../../services/api";
import QRCodeModal from "../../components/QRCodeModal/QRCodeModal";
const Voucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
const [showQRModal, setShowQRModal] = useState(false);
  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    // 1. First load from local cache instantly
    const cached = localStorage.getItem("offlineVouchers");
    if (cached) {
      setVouchers(JSON.parse(cached));
    }

    // 2. Try to fetch from server if online
    try {
      const res = await API.get("/voucher");
      setVouchers(res.data.vouchers);
      // Update local cache
      localStorage.setItem("offlineVouchers", JSON.stringify(res.data.vouchers));
    } catch (err) {
      console.log("Offline mode: showing cached vouchers", err.message);
    }
  };

  return (
    <div className="min-h-screen text-white">

      <h1 className="text-4xl font-bold mb-8">
        Offline Vouchers
      </h1>

      {vouchers.length === 0 ? (

        <div className="text-center text-gray-400 mt-20">
          No vouchers available
        </div>

      ) : (

        <div className="grid lg:grid-cols-2 gap-6">

          {vouchers.map((voucher) => (

            <div
              key={voucher._id}
              className="bg-[#161B33] rounded-3xl p-8 shadow-xl border border-gray-700"
            >

              <h2 className="text-2xl font-bold mb-5">
                Voucher #{voucher.voucherId.slice(0,8)}
              </h2>

              <p className="text-gray-400">
                Remaining Balance
              </p>

              <h1 className="text-5xl font-bold text-green-400 mt-2">
                ₹{voucher.remainingValue}
              </h1>

              <div className="flex justify-between mt-8">

                <div>
                  <p className="text-gray-400">
                    Status
                  </p>

                  <p className="text-green-400 font-semibold">
                    {voucher.status}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">
                    Created
                  </p>

                  <p>
                    {new Date(voucher.createdAt).toLocaleDateString()}
                  </p>
                </div>

              </div>

              <button
  onClick={() => {
    setSelectedVoucher(voucher);
    setShowQRModal(true);
  }}
  className="mt-8 w-full bg-violet-600 hover:bg-violet-700 py-4 rounded-xl font-semibold"
>
  Generate QR
</button>
                

            </div>

          ))}

        </div>

      )}
      <QRCodeModal
  open={showQRModal}
  voucher={selectedVoucher}
  onClose={() => setShowQRModal(false)}
/>
    </div>
  );
};

export default Voucher;