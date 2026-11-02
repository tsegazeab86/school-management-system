
import   { useState } from "react";
import {
  Search,
  Receipt,
  Download,
  Printer,
  Eye,
  X,
  CheckCircle,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import "./Receipts.css";

const initialReceipts = [
  {
    id: "REC-1001",
    student: "Abebe Kebede",
    studentId: "STU001",
    amount: 5000,
    method: "Cash",
    date: "2026-10-25",
    reference: "PAY001",
    description: "Tuition Fee",
  },
  {
    id: "REC-1002",
    student: "Hana Tadesse",
    studentId: "STU002",
    amount: 3000,
    method: "Bank Transfer",
    date: "2026-10-26",
    reference: "PAY002",
    description: "Tuition Fee",
  },
  {
    id: "REC-1003",
    student: "Mekdes Alemu",
    studentId: "STU004",
    amount: 2500,
    method: "Mobile Banking",
    date: "2026-10-28",
    reference: "PAY004",
    description: "Registration Fee",
  },
  {
    id: "REC-1004",
    student: "Yohannes Tesfaye",
    studentId: "STU005",
    amount: 1000,
    method: "Cash",
    date: "2026-10-29",
    reference: "PAY005",
    description: "Library Fee",
  },
];

const money = (amount) =>
  `ETB ${Number(amount).toLocaleString()}`;

export default function Receipts() {
  const [receipts] = useState(initialReceipts);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const totalAmount = receipts.reduce(
    (sum, receipt) => sum + receipt.amount,
    0
  );

  const filteredReceipts = receipts.filter((receipt) => {
    const query = search.toLowerCase();

    const matchesSearch =
      receipt.student.toLowerCase().includes(query) ||
      receipt.studentId.toLowerCase().includes(query) ||
      receipt.id.toLowerCase().includes(query);

    const matchesMethod =
      methodFilter === "All" || receipt.method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const downloadReceipt = (receipt) => {
    const content = `
SCHOOL MANAGEMENT SYSTEM
OFFICIAL PAYMENT RECEIPT

Receipt Number: ${receipt.id}
Date: ${receipt.date}

Student Name: ${receipt.student}
Student ID: ${receipt.studentId}

Description: ${receipt.description}
Payment Method: ${receipt.method}
Payment Reference: ${receipt.reference}

Amount Paid: ${money(receipt.amount)}

Status: PAID

Thank you.
    `;

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receipt.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="accountant-receipts-page">
      <div className="receipts-heading">
        <div>
          <span className="receipts-eyebrow">FINANCE MANAGEMENT</span>
          <h2>Receipts Management</h2>
          <p>View, manage and print student payment receipts.</p>
        </div>
      </div>

      <div className="row g-3 receipts-stats">
        <div className="col-md-4">
          <motion.div
            className="receipt-stat-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="receipt-stat-icon purple">
              <Receipt />
            </div>
            <span>Total Receipts</span>
            <h3>{receipts.length}</h3>
            <small>Recorded payment receipts</small>
          </motion.div>
        </div>

        <div className="col-md-4">
          <motion.div
            className="receipt-stat-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="receipt-stat-icon green">
              <Wallet />
            </div>
            <span>Total Receipt Amount</span>
            <h3>{money(totalAmount)}</h3>
            <small>Total recorded amount</small>
          </motion.div>
        </div>

        <div className="col-md-4">
          <motion.div
            className="receipt-stat-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="receipt-stat-icon orange">
              <CalendarDays />
            </div>
            <span>Receipt Records</span>
            <h3>{filteredReceipts.length}</h3>
            <small>Matching current filters</small>
          </motion.div>
        </div>
      </div>

      <div className="receipts-card">
        <div className="receipts-card-heading">
          <div>
            <h4>Payment Receipts</h4>
            <p>Search and view recorded receipts.</p>
          </div>

          <span className="receipts-count">
            {filteredReceipts.length} Records
          </span>
        </div>

        <div className="receipts-filters">
          <div className="receipts-search">
            <Search size={18} />
            <input
              placeholder="Search student or receipt number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="All">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Mobile Banking">Mobile Banking</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table receipts-table align-middle">
            <thead>
              <tr>
                <th>Receipt Number</th>
                <th>Student</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id}>
                  <td className="receipt-id">{receipt.id}</td>

                  <td>
                    <div className="receipt-student">
                      <div className="receipt-avatar">
                        {receipt.student.charAt(0)}
                      </div>
                      <div>
                        <strong>{receipt.student}</strong>
                        <small>{receipt.studentId}</small>
                      </div>
                    </div>
                  </td>

                  <td>{receipt.description}</td>
                  <td className="receipt-amount">
                    {money(receipt.amount)}
                  </td>
                  <td>{receipt.method}</td>
                  <td>{receipt.date}</td>

                  <td>
                    <span className="receipt-paid-status">
                      <CheckCircle size={13} /> Paid
                    </span>
                  </td>

                  <td>
                    <button
                      className="receipt-action-btn"
                      title="View receipt"
                      onClick={() => setSelectedReceipt(receipt)}
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      className="receipt-action-btn download"
                      title="Download receipt"
                      onClick={() => downloadReceipt(receipt)}
                    >
                      <Download size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan="8" className="receipts-empty">
                    <Receipt size={30} />
                    <p>No receipts found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReceipt && (
        <div className="receipts-modal-overlay">
          <div className="receipt-paper">
            <div className="receipt-modal-actions">
              <button
                onClick={printReceipt}
                className="receipt-print-btn"
              >
                <Printer size={16} /> Print
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="receipt-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div className="receipt-school-heading">
              <div className="receipt-school-icon">
                <Receipt size={28} />
              </div>
              <h2>School Management System</h2>
              <p>Official Payment Receipt</p>
            </div>

            <div className="receipt-success">
              <CheckCircle size={18} /> PAYMENT RECEIVED
            </div>

            <div className="receipt-number-row">
              <span>Receipt Number</span>
              <strong>{selectedReceipt.id}</strong>
            </div>

            <div className="receipt-number-row">
              <span>Payment Date</span>
              <strong>{selectedReceipt.date}</strong>
            </div>

            <hr />

            <h4>Student Information</h4>
            <div className="receipt-number-row">
              <span>Student Name</span>
              <strong>{selectedReceipt.student}</strong>
            </div>
            <div className="receipt-number-row">
              <span>Student ID</span>
              <strong>{selectedReceipt.studentId}</strong>
            </div>

            <hr />

            <h4>Payment Information</h4>
            <div className="receipt-number-row">
              <span>Description</span>
              <strong>{selectedReceipt.description}</strong>
            </div>
            <div className="receipt-number-row">
              <span>Payment Method</span>
              <strong>{selectedReceipt.method}</strong>
            </div>
            <div className="receipt-number-row">
              <span>Reference</span>
              <strong>{selectedReceipt.reference}</strong>
            </div>

            <div className="receipt-total">
              <span>Amount Paid</span>
              <strong>{money(selectedReceipt.amount)}</strong>
            </div>

            <p className="receipt-thank-you">
              Thank you for your payment!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
