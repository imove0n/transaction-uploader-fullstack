"use client";

import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [invalidRecords, setInvalidRecords] = useState([]);
  const [showValidTable, setShowValidTable] = useState(false);
  const [showInvalidTable, setShowInvalidTable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setStatusMessage(`Selected file: ${e.target.files[0].name}`);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage("❌ Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5002/api/Transactions/UploadCsv", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setStatusMessage(`✅ ${data.message} | Records Inserted: ${data.recordsInserted}`);
        setShowValidTable(false);
        setShowInvalidTable(false);
      } else {
        const rawText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(rawText);
          errorMessage = errorJson.message || rawText;
        } catch {
          errorMessage = rawText;
        }
        setStatusMessage(`❌ Upload failed: ${errorMessage}`);
      }
    } catch (error) {
      setStatusMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5002/api/Transactions");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data);
      setShowValidTable(true);
      setShowInvalidTable(false);
      setStatusMessage(`✅ Loaded ${data.length} valid records.`);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setStatusMessage("❌ Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvalidRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5002/api/InvalidTransactions");
      if (!res.ok) throw new Error("Failed to fetch invalid records");
      const data = await res.json();
      setInvalidRecords(data);
      setShowInvalidTable(true);
      setShowValidTable(false);
      setStatusMessage(`✅ Loaded ${data.length} invalid records.`);
    } catch (error) {
      console.error("Error fetching invalid records:", error);
      setStatusMessage("❌ Failed to load invalid records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: "800px", margin: "50px auto", textAlign: "center" }}>
      <h2>Transaction CSV Uploader</h2>

      {/* ✅ Custom Browse Button */}
      <label
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
      >
        📂 Browse CSV File
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={{ display: "none" }} // ✅ Hide "No file selected" text
        />
      </label>

      <br />

      <button
        onClick={handleUpload}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      <p>{statusMessage}</p>

      {statusMessage && (
        <>
          <button
            onClick={fetchTransactions}
            style={{
              marginTop: "10px",
              marginRight: "10px",
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Show Valid Records"}
          </button>

          <button
            onClick={fetchInvalidRecords}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Show Invalid Records"}
          </button>
        </>
      )}

      {/* ✅ Valid Transactions Table */}
      {showValidTable && (
        <div style={{ marginTop: "20px" }}>
          <h3>✅ Valid Transactions</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Reference</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Name</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Quantity</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Amount</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Symbol</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Order Side</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Status</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, index) => (
                <tr
                  key={t.referenceNumber}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                    color: "black",
                  }}
                >
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.referenceNumber}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.name}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.quantity}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.amount}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.symbol}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.orderSide}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{t.orderStatus}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {new Date(t.transactionDate).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Invalid Records Table */}
      {showInvalidTable && (
        <div style={{ marginTop: "20px" }}>
          <h3>❌ Invalid Records</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#dc3545", color: "white" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Line Number</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Error Message</th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>Uploaded At</th>
              </tr>
            </thead>
            <tbody>
              {invalidRecords.map((r, index) => (
                <tr
                  key={r.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white",
                    color: "black",
                  }}
                >
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{r.id}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{r.lineNumber}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>{r.errorMessage}</td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {new Date(r.uploadedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
