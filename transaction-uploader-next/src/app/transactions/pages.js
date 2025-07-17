"use client";

import { useEffect, useState } from "react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/Transactions");
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <main style={{ maxWidth: "800px", margin: "50px auto", textAlign: "center" }}>
      <h2>Uploaded Transactions</h2>
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Symbol</th>
              <th>Order Side</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.referenceNumber}>
                <td>{t.referenceNumber}</td>
                <td>{t.name}</td>
                <td>{t.quantity}</td>
                <td>{t.amount}</td>
                <td>{t.symbol}</td>
                <td>{t.orderSide}</td>
                <td>{t.orderStatus}</td>
                <td>{new Date(t.transactionDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
