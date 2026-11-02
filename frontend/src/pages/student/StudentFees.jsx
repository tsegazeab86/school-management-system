
import {   useState } from "react";
import {
  Wallet,
  CreditCard,
  Receipt,
  CalendarDays,
  CircleCheck,
  Clock3,
  AlertCircle,
  //   Download,
  Search,
  Eye,
  X,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Library,
  Printer,
  ArrowUpRight,
  ShieldCheck,
  Banknote,
} from "lucide-react";
import { motion } from "framer-motion";
import "./StudentFees.css";

const feeItems = [
  {
    id: 1,
    name: "Tuition Fee",
    description: "Academic year tuition",
    amount: 18000,
    paid: 18000,
    icon: GraduationCap,
    color: "blue",
  },
  {
    id: 2,
    name: "Registration Fee",
    description: "Annual student registration",
    amount: 2500,
    paid: 2500,
    icon: BookOpen,
    color: "purple",
  },
  {
    id: 3,
    name: "Laboratory Fee",
    description: "Computer and science laboratory",
    amount: 3500,
    paid: 2000,
    icon: FlaskConical,
    color: "orange",
  },
  {
    id: 4,
    name: "Library Fee",
    description: "Library access and services",
    amount: 1500,
    paid: 0,
    icon: Library,
    color: "green",
  },
];

const initialPayments = [
  {
    id: 1,
    receipt: "REC-2026-001",
    date: "2026-09-12",
    method: "Bank Transfer",
    description: "Tuition Fee",
    amount: 10000,
    status: "Completed",
  },
  {
    id: 2,
    receipt: "REC-2026-002",
    date: "2026-09-20",
    method: "Mobile Banking",
    description: "Registration Fee",
    amount: 2500,
    status: "Completed",
  },
  {
    id: 3,
    receipt: "REC-2026-003",
    date: "2026-10-02",
    method: "Bank Transfer",
    description: "Tuition Fee",
    amount: 8000,
    status: "Completed",
  },
  {
    id: 4,
    receipt: "REC-2026-004",
    date: "2026-10-10",
    method: "Cash",
    description: "Laboratory Fee",
    amount: 2000,
    status: "Completed",
  },
];

const formatMoney = (amount) =>
  `ETB ${Number(amount).toLocaleString("en-US")}`;

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function StudentFees() {
  const [payments] = useState(initialPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const totalFees = feeItems.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = feeItems.reduce((sum, item) => sum + item.paid, 0);
  const remaining = totalFees - paidAmount;
  const paymentProgress = Math.round((paidAmount / totalFees) * 100);

  const filteredPayments = payments.filter((payment) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      payment.receipt.toLowerCase().includes(searchText) ||
      payment.description.toLowerCase().includes(searchText) ||
      payment.method.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "All" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="student-fees-page">
      {/* Header */}
      <div className="fees-topbar">
        <div>
          <div className="fees-eyebrow">
            <Wallet size={15} />
            STUDENT FINANCE CENTER
          </div>
          <h1>Fees & Payments</h1>
          <p>Track your school fees, balances, and payment history.</p>
        </div>

        <div className="fees-academic-badge">
          <CalendarDays size={17} />
          <span>Academic Year 2026/2027</span>
        </div>
      </div>

      {/* Financial overview */}
      <div className="fees-overview-grid">
        <motion.div
          className="fees-overview-card fees-total-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="fees-card-heading">
            <span>Total School Fees</span>
            <div className="fees-icon-box">
              <Wallet size={21} />
            </div>
          </div>
          <h2>{formatMoney(totalFees)}</h2>
          <p>All registered academic charges</p>
          <div className="fees-card-decoration">ETB</div>
        </motion.div>

        <motion.div
          className="fees-overview-card fees-paid-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="fees-card-heading">
            <span>Total Paid</span>
            <div className="fees-icon-box">
              <CircleCheck size={21} />
            </div>
          </div>
          <h2>{formatMoney(paidAmount)}</h2>
          <p>{paymentProgress}% of total fees paid</p>
          <div className="fees-card-decoration">
            <CircleCheck size={75} />
          </div>
        </motion.div>

        <motion.div
          className="fees-overview-card fees-balance-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="fees-card-heading">
            <span>Outstanding Balance</span>
            <div className="fees-icon-box">
              <AlertCircle size={21} />
            </div>
          </div>
          <h2>{formatMoney(remaining)}</h2>
          <p>Amount remaining to be paid</p>
          <div className="fees-card-decoration">
            <Banknote size={75} />
          </div>
        </motion.div>
      </div>

      {/* Payment progress and student information */}
      <div className="row g-4 fees-middle-row">
        <div className="col-lg-7">
          <section className="fees-panel fees-progress-panel h-100">
            <div className="fees-panel-title">
              <div>
                <span className="fees-section-label">PAYMENT SUMMARY</span>
                <h3>Your payment progress</h3>
              </div>
              <div className="fees-progress-icon">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <div className="fees-progress-amounts">
              <div>
                <small>Paid amount</small>
                <strong>{formatMoney(paidAmount)}</strong>
              </div>
              <div className="text-end">
                <small>Total amount</small>
                <strong>{formatMoney(totalFees)}</strong>
              </div>
            </div>

            <div className="fees-progress-track">
              <div
                className="fees-progress-fill"
                style={{ width: `${paymentProgress}%` }}
              />
            </div>

            <div className="fees-progress-footer">
              <span>{paymentProgress}% completed</span>
              <span>{formatMoney(remaining)} remaining</span>
            </div>

            <div className="fees-deadline-box">
              <div className="fees-deadline-icon">
                <Clock3 size={20} />
              </div>
              <div>
                <strong>Next payment deadline</strong>
                <p>30 November 2026</p>
              </div>
              <span className="fees-due-label">Upcoming</span>
            </div>
          </section>
        </div>

        <div className="col-lg-5">
          <section className="fees-panel fees-student-panel h-100">
            <div className="fees-student-panel-top">
              <div className="fees-student-avatar">AT</div>
              <div>
                <span className="fees-section-label">STUDENT ACCOUNT</span>
                <h3>Abebe Tadesse</h3>
                <p>Student ID: STU-2026-001</p>
              </div>
            </div>

            <div className="fees-student-details">
              <div>
                <span>Department</span>
                <strong>Computer Science</strong>
              </div>
              <div>
                <span>Academic Year</span>
                <strong>2026/2027</strong>
              </div>
              <div>
                <span>Semester</span>
                <strong>Semester I</strong>
              </div>
              <div>
                <span>Account Status</span>
                <strong className="fees-account-status">
                  <span /> Active
                </strong>
              </div>
            </div>

            <div className="fees-secure-note">
              <ShieldCheck size={17} />
              Your fee information is private.
            </div>
          </section>
        </div>
      </div>

      {/* Fee breakdown */}
      <section className="fees-panel fees-breakdown-panel">
        <div className="fees-panel-title">
          <div>
            <span className="fees-section-label">ACADEMIC CHARGES</span>
            <h3>Fee breakdown</h3>
            <p>Review the charges assigned to your student account.</p>
          </div>
          <span className="fees-item-count">{feeItems.length} fee items</span>
        </div>

        <div className="fees-breakdown-list">
          {feeItems.map((fee, index) => {
            const Icon = fee.icon;
            const balance = fee.amount - fee.paid;
            const percentage = Math.round((fee.paid / fee.amount) * 100);

            return (
              <motion.div
                className="fees-breakdown-item"
                key={fee.id}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
              >
                <div className={`fees-item-icon ${fee.color}`}>
                  <Icon size={22} />
                </div>

                <div className="fees-item-info">
                  <strong>{fee.name}</strong>
                  <span>{fee.description}</span>
                </div>

                <div className="fees-item-progress">
                  <div className="fees-mini-track">
                    <div
                      className={`fees-mini-fill ${fee.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <small>{percentage}% paid</small>
                </div>

                <div className="fees-item-money">
                  <strong>{formatMoney(fee.amount)}</strong>
                  <span>
                    {balance === 0
                      ? "Fully paid"
                      : `${formatMoney(balance)} remaining`}
                  </span>
                </div>

                <span
                  className={`fees-status-pill ${balance === 0 ? "paid" : "pending"
                    }`}
                >
                  {balance === 0 ? "Paid" : "Pending"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Payment history */}
      <section className="fees-panel fees-history-panel">
        <div className="fees-panel-title fees-history-heading">
          <div>
            <span className="fees-section-label">TRANSACTION RECORDS</span>
            <h3>Payment history</h3>
            <p>View your previous fee payments and receipts.</p>
          </div>
          <div className="fees-history-total">
            <Receipt size={18} />
            {payments.length} transactions
          </div>
        </div>

        <div className="fees-table-tools">
          <div className="fees-search-box">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search receipt, fee or method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="fees-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table fees-table align-middle">
            <thead>
              <tr>
                <th>RECEIPT ID</th>
                <th>PAYMENT DATE</th>
                <th>DESCRIPTION</th>
                <th>METHOD</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <strong className="fees-receipt-id">
                        {payment.receipt}
                      </strong>
                    </td>
                    <td>{formatDate(payment.date)}</td>
                    <td>{payment.description}</td>
                    <td>
                      <span className="fees-method">
                        <CreditCard size={15} />
                        {payment.method}
                      </span>
                    </td>
                    <td>
                      <strong>{formatMoney(payment.amount)}</strong>
                    </td>
                    <td>
                      <span
                        className={`fees-status-pill ${payment.status === "Completed"
                          ? "paid"
                          : "pending"
                          }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="fees-view-btn"
                        onClick={() => setSelectedReceipt(payment)}
                        title="View receipt"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="fees-empty-state">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="fees-table-footer">
          <span>
            Showing {filteredPayments.length} of {payments.length} records
          </span>
          <span>Currency: Ethiopian Birr (ETB)</span>
        </div>
      </section>

      {/* Information notice */}
      <div className="fees-demo-notice">
        <div className="fees-notice-icon">
          <AlertCircle size={19} />
        </div>
        <div>
          <strong>Demo payment information</strong>
          <p>
            This page currently displays sample payment records. It does not
            accept payments or connect to a bank. Actual payment processing
            requires a secure backend and an authorized payment provider.
          </p>
        </div>
      </div>

      {/* Receipt modal */}
      {selectedReceipt && (
        <div
          className="fees-modal-overlay"
          onClick={() => setSelectedReceipt(null)}
        >
          <motion.div
            className="fees-receipt-modal"
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="fees-modal-actions no-print">
              <span>PAYMENT RECEIPT</span>
              <button onClick={() => setSelectedReceipt(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="fees-receipt-content">
              <div className="fees-receipt-brand">
                <div className="fees-receipt-logo">
                  <GraduationCap size={27} />
                </div>
                <div>
                  <h2>INJIBARA SCHOOL</h2>
                  <p>Student Finance Department</p>
                </div>
              </div>

              <div className="fees-receipt-success">
                <CircleCheck size={34} />
                <strong>Payment {selectedReceipt.status}</strong>
                <span>Official demo receipt</span>
              </div>

              <div className="fees-receipt-amount">
                <span>Amount paid</span>
                <strong>{formatMoney(selectedReceipt.amount)}</strong>
              </div>

              <div className="fees-receipt-details">
                <div>
                  <span>Receipt number</span>
                  <strong>{selectedReceipt.receipt}</strong>
                </div>
                <div>
                  <span>Student name</span>
                  <strong>Abebe Tadesse</strong>
                </div>
                <div>
                  <span>Student ID</span>
                  <strong>STU-2026-001</strong>
                </div>
                <div>
                  <span>Payment date</span>
                  <strong>{formatDate(selectedReceipt.date)}</strong>
                </div>
                <div>
                  <span>Description</span>
                  <strong>{selectedReceipt.description}</strong>
                </div>
                <div>
                  <span>Payment method</span>
                  <strong>{selectedReceipt.method}</strong>
                </div>
              </div>

              <div className="fees-receipt-footer">
                This is a demonstration receipt generated from sample data.
                It is not proof of a real payment.
              </div>
            </div>

            <div className="fees-receipt-buttons no-print">
              <button
                className="fees-close-btn"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
              <button className="fees-print-btn" onClick={handlePrint}>
                <Printer size={17} />
                Print receipt
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default StudentFees;
