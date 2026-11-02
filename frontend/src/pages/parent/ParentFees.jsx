
import { useState } from "react";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Receipt,
  CalendarDays,
//   UserRound,
  X,
  Printer,
//   Download,
//   ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./ParentFees.css";

const feeData = [
  {
    id: 1,
    child: "Abebe Tadesse",
    grade: "Grade 10",
    tuition: 12000,
    library: 500,
    laboratory: 1000,
    examination: 500,
    transport: 2000,
    paid: 12000,
    dueDate: "2026-11-15",
  },
  {
    id: 2,
    child: "Hana Tadesse",
    grade: "Grade 7",
    tuition: 9000,
    library: 400,
    laboratory: 600,
    examination: 500,
    transport: 1500,
    paid: 7000,
    dueDate: "2026-11-20",
  },
];

const paymentsData = [
  {
    id: 1,
    receipt: "REC-2026-001",
    child: "Abebe Tadesse",
    amount: 12000,
    method: "Bank Transfer",
    date: "2026-10-05",
    status: "Completed",
    description: "Tuition fee payment",
  },
  {
    id: 2,
    receipt: "REC-2026-002",
    child: "Hana Tadesse",
    amount: 5000,
    method: "Cash",
    date: "2026-10-10",
    status: "Completed",
    description: "First installment",
  },
  {
    id: 3,
    receipt: "REC-2026-003",
    child: "Hana Tadesse",
    amount: 2000,
    method: "Bank Transfer",
    date: "2026-10-20",
    status: "Completed",
    description: "Second installment",
  },
  {
    id: 4,
    receipt: "REC-2026-004",
    child: "Abebe Tadesse",
    amount: 1500,
    method: "Mobile Banking",
    date: "2026-10-25",
    status: "Pending",
    description: "Additional fee payment",
  },
];

const currency = (amount) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(amount);

function ParentFees() {
  const [selectedChild, setSelectedChild] = useState("All");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const filteredFees =
    selectedChild === "All"
      ? feeData
      : feeData.filter((fee) => fee.child === selectedChild);

  const filteredPayments = paymentsData.filter((payment) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      payment.receipt.toLowerCase().includes(searchText) ||
      payment.child.toLowerCase().includes(searchText) ||
      payment.description.toLowerCase().includes(searchText);

    const matchesChild =
      selectedChild === "All" || payment.child === selectedChild;

    const matchesStatus =
      statusFilter === "All" || payment.status === statusFilter;

    return matchesSearch && matchesChild && matchesStatus;
  });

  const totalFees = filteredFees.reduce(
    (sum, fee) =>
      sum +
      fee.tuition +
      fee.library +
      fee.laboratory +
      fee.examination +
      fee.transport,
    0
  );

  const totalPaid = filteredFees.reduce(
    (sum, fee) => sum + fee.paid,
    0
  );

  const balance = totalFees - totalPaid;

  const completedPayments = filteredPayments.filter(
    (payment) => payment.status === "Completed"
  );

  const totalTransactions = completedPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const printReceipt = (payment) => {
    const printWindow = window.open("", "_blank", "width=700,height=700");

    if (!printWindow) {
      alert("Please allow pop-ups to print the receipt.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 35px;
            color: #263247;
          }
          .receipt {
            max-width: 550px;
            margin: auto;
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 30px;
          }
          h1 { color: #6754d9; text-align: center; }
          h3 { text-align: center; }
          .line {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <h1>SCHOOL PAYMENT RECEIPT</h1>
          <h3>Official Payment Record</h3>
          <div class="line"><span>Receipt Number</span><strong>${payment.receipt}</strong></div>
          <div class="line"><span>Student</span><strong>${payment.child}</strong></div>
          <div class="line"><span>Description</span><strong>${payment.description}</strong></div>
          <div class="line"><span>Payment Date</span><strong>${payment.date}</strong></div>
          <div class="line"><span>Payment Method</span><strong>${payment.method}</strong></div>
          <div class="line"><span>Status</span><strong>${payment.status}</strong></div>
          <div class="line"><span>Amount</span><strong>${currency(payment.amount)}</strong></div>
          <div class="footer">Thank you. This is a sample receipt from the School Management System.</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="parent-fees-page container-fluid">
      {/* Hero Header */}
      <motion.div
        className="pf-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pf-hero-content">
          <span className="pf-hero-label">
            <Wallet size={15} /> FINANCIAL OVERVIEW
          </span>
          <h2>Fees & Payments</h2>
          <p>
            Monitor your children's school fees, payment history, and
            outstanding balances.
          </p>
          <div className="pf-hero-note">
            <CheckCircle size={17} />
            View your family's school fee information
          </div>
        </div>

        <div className="pf-hero-decoration">
          <CreditCard size={115} strokeWidth={1} />
        </div>
      </motion.div>

      {/* Child Filter */}
      <div className="pf-child-filter">
        <div>
          <span>STUDENT FILTER</span>
          <h4>Fee information by child</h4>
        </div>

        <select
          className="form-select"
          value={selectedChild}
          onChange={(event) => setSelectedChild(event.target.value)}
        >
          <option value="All">All Children</option>
          {feeData.map((fee) => (
            <option key={fee.id} value={fee.child}>
              {fee.child}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 pf-stat-row">
        <div className="col-12 col-sm-6 col-xl-4">
          <motion.div className="pf-stat-card" whileHover={{ y: -6 }}>
            <div className="pf-stat-icon purple">
              <Wallet size={25} />
            </div>
            <div>
              <span>Total Fees</span>
              <h3>{currency(totalFees)}</h3>
              <small>Expected school fees</small>
            </div>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <motion.div className="pf-stat-card" whileHover={{ y: -6 }}>
            <div className="pf-stat-icon green">
              <TrendingUp size={25} />
            </div>
            <div>
              <span>Total Paid</span>
              <h3>{currency(totalPaid)}</h3>
              <small>Recorded payments</small>
            </div>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-4">
          <motion.div className="pf-stat-card" whileHover={{ y: -6 }}>
            <div className="pf-stat-icon orange">
              <AlertCircle size={25} />
            </div>
            <div>
              <span>Outstanding Balance</span>
              <h3>{currency(balance)}</h3>
              <small>Remaining fees</small>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Payment Progress */}
      <motion.div
        className="pf-progress-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="pf-progress-heading">
          <div>
            <span>PAYMENT PROGRESS</span>
            <h4>Overall Fee Completion</h4>
          </div>
          <strong>
            {totalFees > 0
              ? Math.round((totalPaid / totalFees) * 100)
              : 0}
            %
          </strong>
        </div>

        <div className="progress pf-progress">
          <div
            className="progress-bar"
            style={{
              width: `${
                totalFees > 0
                  ? Math.min(100, (totalPaid / totalFees) * 100)
                  : 0
              }%`,
            }}
          />
        </div>

        <div className="pf-progress-footer">
          <span>Paid: {currency(totalPaid)}</span>
          <span>Remaining: {currency(balance)}</span>
        </div>
      </motion.div>

      {/* Fee Breakdown */}
      <div className="pf-section-heading">
        <div>
          <span>FEE STRUCTURE</span>
          <h3>Children's Fee Breakdown</h3>
          <p>Review each child's school fee allocation.</p>
        </div>
      </div>

      <div className="row g-4 pf-breakdown-row">
        {filteredFees.map((fee) => {
          const feeTotal =
            fee.tuition +
            fee.library +
            fee.laboratory +
            fee.examination +
            fee.transport;

          const remaining = feeTotal - fee.paid;

          const categories = [
            { name: "Tuition Fee", amount: fee.tuition },
            { name: "Library Fee", amount: fee.library },
            { name: "Laboratory Fee", amount: fee.laboratory },
            { name: "Examination Fee", amount: fee.examination },
            { name: "Transport Fee", amount: fee.transport },
          ];

          return (
            <div className="col-12 col-xl-6" key={fee.id}>
              <motion.div
                className="pf-breakdown-card"
                whileHover={{ y: -5 }}
              >
                <div className="pf-breakdown-header">
                  <div className="pf-student-icon">
                    <GraduationCap size={25} />
                  </div>
                  <div className="pf-student-info">
                    <h5>{fee.child}</h5>
                    <span>{fee.grade}</span>
                  </div>
                  <span
                    className={`pf-payment-status ${
                      remaining === 0 ? "paid" : "unpaid"
                    }`}
                  >
                    {remaining === 0 ? "Fully Paid" : "Balance Due"}
                  </span>
                </div>

                <div className="pf-fee-items">
                  {categories.map((category) => (
                    <div className="pf-fee-item" key={category.name}>
                      <span>{category.name}</span>
                      <strong>{currency(category.amount)}</strong>
                    </div>
                  ))}
                </div>

                <div className="pf-fee-total">
                  <span>Total Fees</span>
                  <strong>{currency(feeTotal)}</strong>
                </div>

                <div className="pf-fee-footer">
                  <div>
                    <span>Paid</span>
                    <strong className="text-success">
                      {currency(fee.paid)}
                    </strong>
                  </div>
                  <div>
                    <span>Remaining</span>
                    <strong className="text-danger">
                      {currency(remaining)}
                    </strong>
                  </div>
                </div>

                <div className="pf-due-date">
                  <CalendarDays size={16} />
                  Due date: {fee.dueDate}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Payment History */}
      <div className="pf-history-card">
        <div className="pf-history-header">
          <div>
            <span>TRANSACTION RECORDS</span>
            <h3>Payment History</h3>
            <p>Review previous fee transactions and receipts.</p>
          </div>

          <div className="pf-transaction-total">
            <span>Completed Payments</span>
            <strong>{currency(totalTransactions)}</strong>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="pf-history-filters">
          <div className="pf-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search receipt or student..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="pf-status-filter">
            <Filter size={17} />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table pf-table align-middle">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Student</th>
                <th>Description</th>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <motion.tr
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td>
                    <strong className="pf-receipt-number">
                      {payment.receipt}
                    </strong>
                  </td>

                  <td>{payment.child}</td>

                  <td>{payment.description}</td>

                  <td>
                    <span className="pf-payment-date">
                      <CalendarDays size={14} />
                      {payment.date}
                    </span>
                  </td>

                  <td>{payment.method}</td>

                  <td>
                    <strong>{currency(payment.amount)}</strong>
                  </td>

                  <td>
                    <span
                      className={`pf-transaction-status ${
                        payment.status === "Completed"
                          ? "completed"
                          : "pending"
                      }`}
                    >
                      {payment.status === "Completed" ? (
                        <CheckCircle size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                      {payment.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="pf-receipt-btn"
                      onClick={() => setSelectedPayment(payment)}
                      title="View receipt"
                    >
                      <Receipt size={17} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <div className="pf-empty">
              <Receipt size={40} />
              <h5>No payments found</h5>
              <p>Try changing your search or filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            className="pf-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPayment(null)}
          >
            <motion.div
              className="pf-receipt-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="pf-modal-top">
                <div className="pf-receipt-logo">
                  <Wallet size={25} />
                </div>
                <button
                  className="pf-modal-close"
                  onClick={() => setSelectedPayment(null)}
                  aria-label="Close receipt"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="pf-receipt-title">
                <CheckCircle size={37} />
                <h3>Payment Receipt</h3>
                <p>School Management System</p>
              </div>

              <div className="pf-receipt-amount">
                <span>Amount Paid</span>
                <h2>{currency(selectedPayment.amount)}</h2>
                <span
                  className={`pf-transaction-status ${
                    selectedPayment.status === "Completed"
                      ? "completed"
                      : "pending"
                  }`}
                >
                  {selectedPayment.status}
                </span>
              </div>

              <div className="pf-receipt-details">
                <div>
                  <span>Receipt Number</span>
                  <strong>{selectedPayment.receipt}</strong>
                </div>
                <div>
                  <span>Student</span>
                  <strong>{selectedPayment.child}</strong>
                </div>
                <div>
                  <span>Description</span>
                  <strong>{selectedPayment.description}</strong>
                </div>
                <div>
                  <span>Payment Date</span>
                  <strong>{selectedPayment.date}</strong>
                </div>
                <div>
                  <span>Payment Method</span>
                  <strong>{selectedPayment.method}</strong>
                </div>
              </div>

              {selectedPayment.status === "Pending" && (
                <p className="pf-pending-note">
                  This transaction is pending confirmation. It is not yet
                  recorded as a completed payment.
                </p>
              )}

              <button
                className="btn pf-print-btn"
                onClick={() => printReceipt(selectedPayment)}
                disabled={selectedPayment.status !== "Completed"}
              >
                <Printer size={17} />
                Print Receipt
              </button>

              <button
                className="btn pf-close-btn"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ParentFees;
