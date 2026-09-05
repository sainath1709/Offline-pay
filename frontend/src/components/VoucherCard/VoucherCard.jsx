// export default function VoucherCard({ vouchers }) {
//   const active = vouchers.filter(v => v.status === "ACTIVE");

//   return (
//     <div className="rounded-3xl bg-[#1E293B] p-8 shadow-xl">
//       <h3 className="text-gray-400">
//         Active Vouchers
//       </h3>

//       <h1 className="text-5xl font-bold mt-4">
//         {active.length}
//       </h1>

//       <p className="mt-5 text-green-400">
//         Total Vouchers: {vouchers.length}
//       </p>
//     </div>
//   );
// }


export default function VoucherCard({ vouchers }) {
  return (
    <div className="rounded-3xl bg-[#1E293B] p-8 shadow-xl">
      <h3 className="text-gray-400">Active Vouchers</h3>

      <h1 className="text-5xl font-bold mt-4">
        {vouchers?.length || 0}
      </h1>

      <p className="mt-5 text-green-400">
        Total Vouchers
      </p>
    </div>
  );
}



