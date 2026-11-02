
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Clock,
  Receipt,
//   ArrowUpRight,
//   ArrowDownRight,
  CalendarDays,
  Download,
  CircleDollarSign,
} from "lucide-react";
import "./AccountantDashboard.css";

const initialTransactions = [
  {
    id: "PAY-1001",
    student: "Abebe Tadesse",
    grade: "Grade 10",
    type: "Tuition Fee",
    amount: 4500,
    date: "2026-10-30",
    status: "Completed",
  },
  {
    id: "PAY-1002",
    student: "Hana Tadesse",
    grade: "Grade 7",
    type: "Registration Fee",
    amount: 1200,
    date: "2026-10-29",
    status: "Completed",
  },
  {
    id: "PAY-1003",
    student: "Mekdes Alemu",
    grade: "Grade 9",
    type: "Tuition Fee",
    amount: 3000,
    date: "2026-10-28",
    status: "Pending",
  },
  {
    id: "PAY-1004",
    student: "Daniel Bekele",
    grade: "Grade 11",
    type: "Library Fee",
    amount: 500,
    date: "2026-10-27",
    status: "Completed",
  },
  {
    id: "PAY-1005",
    student: "Sara Tesfaye",
    grade: "Grade 8",
    type: "Tuition Fee",
    amount: 2500,
    date: "2026-10-26",
    status: "Pending",
  },
];

const monthlyIncome = [
  { month: "May", income: 42000, expenses: 18000 },
  { month: "Jun", income: 51000, expenses: 22000 },
  { month: "Jul", income: 46000, expenses: 19000 },
  { month: "Aug", income: 65000, expenses: 27000 },
  { month: "Sep", income: 58000, expenses: 24000 },
  { month: "Oct", income: 76000, expenses: 31000 },
];

const currency = (amount) =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(amount);

function AccountantDashboard() {
  const [transactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter((item) =>
    `${item.student} ${item.id} ${item.type}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalIncome = 325000;
  const totalExpenses = 118000;
  const totalBalance = totalIncome - totalExpenses;

  const cards = [
    {
      title: "Total Income",
      value: currency(totalIncome),
      description: "Total collected fees",
      icon: TrendingUp,
      color: "income",
      change: "+12.5%",
    },
    {
      title: "Total Expenses",
      value: currency(totalExpenses),
      description: "Recorded school expenses",
      icon: TrendingDown,
      color: "expenses",
      change: "+4.2%",
    },
    {
      title: "Available Balance",
      value: currency(totalBalance),
      description: "Income minus expenses",
      icon: Wallet,
      color: "balance",
      change: "+8.3%",
    },
    {
      title: "Students",
      value: "1,250",
      description: "Registered students",
      icon: Users,
      color: "students",
      change: "Active records",
    },
  ];

  return (
    <div className="accountant-dashboard">
      {/* Header */}
      <div className="accountant-welcome">
        <div>
          <span className="accountant-eyebrow">
            FINANCE MANAGEMENT
          </span>
          <h2>Accountant Dashboard</h2>
          <p>
            Monitor school income, expenses, payments, and financial
            activities.
          </p>
        </div>

        <div className="accountant-welcome-icon">
          <CircleDollarSign size={38} />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="accountant-stat-grid">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              className={`accountant-stat-card ${card.color}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -5 }}
            >
              <div className="accountant-stat-top">
                <div className="accountant-stat-icon">
                  <Icon size={23} />
                </div>
                <span>{card.change}</span>
              </div>

              <p>{card.title}</p>
              <h3>{card.value}</h3>
              <small>{card.description}</small>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Cards */}
      <div className="accountant-secondary-grid">
        <div className="accountant-secondary-card">
          <div className="secondary-icon pending-icon">
            <Clock size={23} />
          </div>
          <div>
            <span>Pending Payments</span>
            <h3>ETB 42,500</h3>
            <small>Awaiting confirmation</small>
          </div>
        </div>

        <div className="accountant-secondary-card">
          <div className="secondary-icon overdue-icon">
            <CalendarDays size={23} />
          </div>
          <div>
            <span>Overdue Fees</span>
            <h3>ETB 28,000</h3>
            <small>Outstanding student fees</small>
          </div>
        </div>

        <div className="accountant-secondary-card">
          <div className="secondary-icon receipt-icon">
            <Receipt size={23} />
          </div>
          <div>
            <span>Receipts Generated</span>
            <h3>186</h3>
            <small>This month</small>
          </div>
        </div>
      </div>

      {/* Income and Expenses Chart */}
      <div className="accountant-chart-section">
        <div className="accountant-section-heading">
          <div>
            <h3>Financial Overview</h3>
            <p>Monthly income and expenses</p>
          </div>

          <span className="chart-period">May - October 2026</span>
        </div>

        <div className="financial-chart">
          {monthlyIncome.map((item) => {
            const max = 80000;

            return (
              <div className="chart-month" key={item.month}>
                <div className="chart-bars">
                  <div
                    className="chart-bar income-bar"
                    style={{
                      height: `${(item.income / max) * 100}%`,
                    }}
                    title={`Income: ${currency(item.income)}`}
                  />
                  <div
                    className="chart-bar expense-bar"
                    style={{
                      height: `${(item.expenses / max) * 100}%`,
                    }}
                    title={`Expenses: ${currency(item.expenses)}`}
                  />
                </div>
                <span>{item.month}</span>
              </div>
            );
          })}
        </div>

        <div className="chart-legend">
          <span><i className="legend-income" /> Income</span>
          <span><i className="legend-expense" /> Expenses</span>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="accountant-transactions">
        <div className="accountant-section-heading">
          <div>
            <h3>Recent Transactions</h3>
            <p>Latest student payment activities</p>
          </div>

          <button
            className="transaction-export-btn"
            onClick={() => window.print()}
          >
            <Download size={16} />
            Print
          </button>
        </div>

        <div className="transaction-search">
          <CreditCard size={18} />
          <input
            placeholder="Search student, payment ID or fee type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="accountant-table-wrapper">
          <table className="table accountant-table align-middle">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Student</th>
                <th>Grade</th>
                <th>Fee Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td>
                    <td>{item.student}</td>
                    <td>{item.grade}</td>
                    <td>{item.type}</td>
                    <td className="transaction-amount">
                      {currency(item.amount)}
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <span
                        className={`transaction-status ${
                          item.status === "Completed"
                            ? "completed"
                            : "pending"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions */}
      <div className="accountant-permission-note">
        <div>
          <Wallet size={22} />
        </div>
        <p>
          <strong>Financial access only:</strong> You can manage
          payments, receipts, expenses, and financial reports.
          Academic grades, attendance, and administrator accounts
          are outside your permissions.
        </p>
      </div>
    </div>
  );
}

export default AccountantDashboard;
