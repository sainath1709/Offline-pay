export default function WalletCard({ wallet }) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-purple-700 p-8 shadow-xl">
      <h3 className="text-lg text-white/80">
        Wallet Balance
      </h3>

      <h1 className="text-5xl font-bold mt-4">
        ₹{wallet?.onlineBalance ?? 0}
      </h1>

      <p className="mt-6 text-white/70">
        Available Balance
      </p>
    </div>
  );
}


// import { motion } from "framer-motion";

// import CountUp from "react-countup";

// export default function WalletCard({ wallet }) {
//   return (
//     <motion.div
//       whileHover={{
//         y: -10,
//         scale: 1.03,
//       }}
//       transition={{ duration: 0.25 }}
//       className="rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-2xl cursor-pointer"
//     >
//       <p className="text-white/70 uppercase tracking-widest text-sm">
//         Wallet Balance
//       </p>

//       <h1 className="text-5xl font-bold mt-5">
//   ₹{wallet?.onlineBalance ?? 0}
// </h1>

//       <div className="mt-8 border-t border-white/20 pt-5 flex justify-between">

//         <div>
//           <p className="text-white/60 text-sm">
//             Offline
//           </p>

//           <p className="font-semibold">
//             ₹{wallet?.offlineBalance ?? 0}
//           </p>
//         </div>

//         <div className="text-right">
//           <p className="text-white/60 text-sm">
//             Status
//           </p>

//           <p className="text-green-300 font-semibold">
//             ● Synced
//           </p>
//         </div>

//       </div>
//     </motion.div>
//   );
// }

// export default function WalletCard() {
//   return (
//     <div className="bg-red-500 p-10 rounded-xl">
//       Wallet Works
//     </div>
//   );
// }