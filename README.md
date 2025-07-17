# 📦 Transaction Uploader Fullstack

A **fullstack CSV transaction uploader** built with:

✅ **ASP.NET Core (C#)** – Backend API  
✅ **Entity Framework Core** – Database (SQL Server)  
✅ **Next.js (React)** – Frontend for uploading and viewing records

---

## 🚀 Features

- **Upload CSV** with full validation rules:
  - Valid records are saved in `Transactions` table.
  - Invalid records are logged in `InvalidTransactions` table.
- **View Valid Transactions** – Click "Show Valid Records" to load valid database records.
- **View Invalid Records** – Click "Show Invalid Records" to see errors stored in DB.

---

## 🛠️ Technologies

- **Backend:** ASP.NET Core Web API, EF Core, SQL Server  
- **Frontend:** Next.js + React  
- **Database:** SQL Server (Local DB)

---

## 📂 Project Structure

C:\PURETECHNICAL_EXAM
│
├── TransactionService # Backend (ASP.NET Core)
│ ├── Controllers
│ ├── Models
│ └── Data
│
└── transaction-uploader-next # Frontend (Next.js)
├── src
│ └── app
│ └── page.js


---

## ⚡ How to Run

### **1. Backend (API)**

1. Open **Visual Studio** or run:
   ```bash
   cd TransactionService
   dotnet run
API will run at http://localhost:5002

2. Frontend (Next.js)

    Go to Next.js folder:

   cd transaction-uploader-next
npm install
npm run dev

App will run at http://localhost:3000

Sample CSV Format
ReferenceNumber,Quantity,Amount,Name,TransactionDate,Symbol,OrderSide,OrderStatus
REF1001,10,100.50,John Doe,17/07/2025 14:00:00,ABC,Buy,Open
REF1002,5,200.75,Jane Smith,17/07/2025 15:00:00,XYZ,Sell,Matched


