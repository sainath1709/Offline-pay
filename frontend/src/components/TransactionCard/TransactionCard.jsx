// export default function TransactionCard({ transactions }) {

//   const today = new Date().toDateString();

//   const todayTransactions = transactions.filter(
//     t => new Date(t.createdAt).toDateString() === today
//   );

//   const total = todayTransactions.reduce(
//     (sum, t) => sum + t.amount,
//     0
//   );

//   return (
//     <div className="rounded-3xl bg-[#1E293B] p-8 shadow-xl">
//       <h3 className="text-gray-400">
//         Today's Transactions
//       </h3>

//       <h1 className="text-5xl font-bold mt-4">
//         {todayTransactions.length}
//       </h1>

//       <p className="text-blue-400 mt-5">
//         ₹{total} Processed
//       </p>
//     </div>
//   );
// }


export default function TransactionCard({ transactions }) {

  const totalProcessed = transactions.reduce(
    (sum, tx) => sum + tx.amount,
    0
  );

  return (
    <div className="rounded-3xl bg-[#1E293B] p-8 shadow-xl">
      <h3 className="text-gray-400">
        Today's Transactions
      </h3>

      <h1 className="text-5xl font-bold mt-4">
        {transactions.length}
      </h1>

      <p className="text-blue-400 mt-5">
        ₹{totalProcessed} Processed
      </p>
    </div>
  );
}



