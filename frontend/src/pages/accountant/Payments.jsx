
import   { useState } from "react";
import {
  Search,
  Plus,
  CreditCard,
  CheckCircle,
  Clock,
  Receipt,
  X,
  Download,
  Eye,
  Filter,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import "./Payments.css";

const initialPayments = [
  {
    id: "PAY001",
    student: "Abebe Kebede",
    studentId: "STU001",
    amount: 5000,
    method: "Cash",
    reference: "REF-1001",
    date: "2026-10-25",
    status: "Completed",
  },
  {
    id: "PAY002",
    student: "Hana Tadesse",
    studentId: "STU002",
    amount: 3000,
    method: "Bank Transfer",
    reference: "REF-1002",
    date: "2026-10-26",
    status: "Completed",
  },
  {
    id: "PAY003",
    student: "Dawit Bekele",
    studentId: "STU003",
    amount: 1500,
    method: "Cash",
    reference: "REF-1003",
    date: "2026-10-27",
    status: "Pending",
  },
  {
    id: "PAY004",
    student: "Mekdes Alemu",
    studentId: "STU004",
    amount: 2500,
    method: "Mobile Banking",
    reference: "REF-1004",
    date: "2026-10-28",
    status: "Completed",
  },
  {
    id: "PAY005",
    student: "Yohannes Tesfaye",
    studentId: "STU005",
    amount: 1000,
    method: "Cash",
    reference: "REF-1005",
    date: "2026-10-29",
    status: "Pending",
  },
];

const money = (amount) =>
  `ETB ${Number(amount).toLocaleString()}`;

export default function Payments() {
  const [payments, setPayments] = useState(initialPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [form, setForm] = useState({
    student: "",
    studentId: "",
    amount: "",
    method: "Cash",
    reference: "",
    date: "2026-10-31",
  });

  const totalCollected = payments
    .filter((p) => p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const completedCount = payments.filter(
    (p) => p.status === "Completed"
  ).length;

  const filteredPayments = payments.filter((payment) => {
    const query = search.toLowerCase();

    const matchesSearch =
      payment.student.toLowerCase().includes(query) ||
      payment.studentId.toLowerCase().includes(query) ||
      payment.id.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || payment.status === statusFilter;

    const matchesMethod =
      methodFilter === "All" || payment.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const openAddModal = () => {
    setForm({
      student: "",
      studentId: "",
      amount: "",
      method: "Cash",
      reference: "",
      date: "2026-10-31",
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = Number(form.amount);

    if (
      !form.student.trim() ||
      !form.studentId.trim() ||
      !form.reference.trim() ||
      amount <= 0 ||
      !form.date
    ) {
      alert("Please enter valid payment information.");
      return;
    }

    const newPayment = {
      id: `PAY${String(Date.now()).slice(-6)}`,
      ...form,
      amount,
      status: "Completed",
    };

    setPayments((prev) => [newPayment, ...prev]);
    setShowModal(false);
  };

  const exportCSV = () => {
    const header = [
      "Payment ID",
      "Student",
      "Student ID",
      "Amount",
      "Method",
      "Reference",
      "Date",
      "Status",
    ];

    const rows = filteredPayments.map((p) => [
      p.id,
      p.student,
      p.studentId,
      p.amount,
      p.method,
      p.reference,
      p.date,
      p.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "payments-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="accountant-payments-page">
      <div className="payments-heading">
        <div>
          <span className="payments-eyebrow">FINANCE MANAGEMENT</span>
          <h2>Payments Management</h2>
          <p>Record and monitor student fee payments.</p>
        </div>

        <div className="payments-heading-actions">
          <button className="payments-export-btn" onClick={exportCSV}>
            <Download size={17} /> Export
          </button>
          <button className="payments-add-btn" onClick={openAddModal}>
            <Plus size={18} /> Record Payment
          </button>
        </div>
      </div>

      <div className="row g-3 payments-stats">
        <div className="col-md-4">
          <motion.div
            className="payment-stat-card collected"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="payment-stat-icon">
              <Wallet />
            </div>
            <span>Total Collected</span>
            <h3>{money(totalCollected)}</h3>
            <small>Successfully recorded payments</small>
          </motion.div>
        </div>

        <div className="col-md-4">
          <motion.div
            className="payment-stat-card pending"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="payment-stat-icon">
              <Clock />
            </div>
            <span>Pending Amount</span>
            <h3>{money(pendingAmount)}</h3>
            <small>Payments awaiting confirmation</small>
          </motion.div>
        </div>

        <div className="col-md-4">
          <motion.div
            className="payment-stat-card count"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="payment-stat-icon">
              <CheckCircle />
            </div>
            <span>Completed Payments</span>
            <h3>{completedCount}</h3>
            <small>Confirmed transactions</small>
          </motion.div>
        </div>
      </div>

      <div className="payments-table-card">
        <div className="payments-table-heading">
          <div>
            <h4>Payment History</h4>
            <p>View all recorded student transactions.</p>
          </div>
          <span className="payments-count">
            {filteredPayments.length} Payments
          </span>
        </div>

        <div className="payments-filters">
          <div className="payments-search">
            <Search size={18} />
            <input
              placeholder="Search student, ID or payment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="payments-filter">
            <Filter size={17} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <select
            className="payments-method-filter"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="All">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Mobile Banking">Mobile Banking</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table payments-table align-middle">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="payment-id">{payment.id}</td>
                  <td>
                    <div className="payment-student">
                      <div className="payment-avatar">
                        {payment.student.charAt(0)}
                      </div>
                      <div>
                        <strong>{payment.student}</strong>
                        <small>{payment.studentId}</small>
                      </div>
                    </div>
                  </td>
                  <td className="payment-amount">
                    {money(payment.amount)}
                  </td>
                  <td>{payment.method}</td>
                  <td>{payment.reference}</td>
                  <td>{payment.date}</td>
                  <td>
                    <span
                      className={`payment-status ${payment.status.toLowerCase()}`}
                    >
                      {payment.status === "Completed" ? (
                        <CheckCircle size={13} />
                      ) : (
                        <Clock size={13} />
                      )}
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="payment-view-btn"
                      title="View payment"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="8" className="payments-empty">
                    <CreditCard size={30} />
                    <p>No payments found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="payments-modal-overlay">
          <div className="payments-modal">
            <div className="payments-modal-heading">
              <div>
                <h4>Record New Payment</h4>
                <p>Enter payment details below.</p>
              </div>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Student Name</label>
              <input
                required
                placeholder="Enter student name"
                value={form.student}
                onChange={(e) =>
                  setForm({ ...form, student: e.target.value })
                }
              />

              <label>Student ID</label>
              <input
                required
                placeholder="Enter student ID"
                value={form.studentId}
                onChange={(e) =>
                  setForm({ ...form, studentId: e.target.value })
                }
              />

              <label>Payment Amount (ETB)</label>
              <input
                required
                type="number"
                min="1"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
              />

              <label>Payment Method</label>
              <select
                value={form.method}
                onChange={(e) =>
                  setForm({ ...form, method: e.target.value })
                }
              >
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Mobile Banking</option>
              </select>

              <label>Reference Number</label>
              <input
                required
                placeholder="Enter reference number"
                value={form.reference}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
              />

              <label>Payment Date</label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
              />

              <div className="payments-modal-actions">
                <button
                  type="button"
                  className="payments-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="payments-save-btn">
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPayment && (
        <div className="payments-modal-overlay">
          <div className="payments-modal payment-detail-modal">
            <div className="payments-modal-heading">
              <div>
                <h4>Payment Details</h4>
                <p>{selectedPayment.id}</p>
              </div>
              <button onClick={() => setSelectedPayment(null)}>
                <X />
              </button>
            </div>

            <div className="payment-detail-icon">
              <Receipt size={28} />
            </div>

            <h3 className="payment-detail-amount">
              {money(selectedPayment.amount)}
            </h3>

            <p className="payment-detail-caption">
              {selectedPayment.status} Payment
            </p>

            <div className="payment-detail-list">
              <p><strong>Student:</strong> {selectedPayment.student}</p>
              <p><strong>Student ID:</strong> {selectedPayment.studentId}</p>
              <p><strong>Method:</strong> {selectedPayment.method}</p>
              <p><strong>Reference:</strong> {selectedPayment.reference}</p>
              <p><strong>Date:</strong> {selectedPayment.date}</p>
              <p><strong>Status:</strong> {selectedPayment.status}</p>
            </div>

            <button
              className="payments-save-btn w-100 mt-3"
              onClick={() => setSelectedPayment(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
