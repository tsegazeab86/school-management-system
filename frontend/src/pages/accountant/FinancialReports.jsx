
import   { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Download,
  CalendarDays,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import "./FinancialReports.css";

const monthlyData = [
  { month: "May", income: 85000, expenses: 42000 },
  { month: "Jun", income: 92000, expenses: 48000 },
  { month: "Jul", income: 78000, expenses: 39000 },
  { month: "Aug", income: 110000, expenses: 52000 },
  { month: "Sep", income: 98000, expenses: 47000 },
  { month: "Oct", income: 125000, expenses: 61000 },
];

const incomeCategories = [
  { name: "Student Fees", amount: 185000 },
  { name: "Registration", amount: 35000 },
  { name: "Donations", amount: 18000 },
  { name: "Other Income", amount: 12000 },
];

const expenseCategories = [
  { name: "Staff Salaries", amount: 95000 },
  { name: "Utilities", amount: 22000 },
  { name: "Supplies", amount: 18000 },
  { name: "Maintenance", amount: 14000 },
  { name: "Transport", amount: 12000 },
];

const recentTransactions = [
  {
    id: 1,
    title: "Grade 10 Student Fees",
    type: "Income",
    category: "Student Fees",
    date: "2026-10-03",
    amount: 45000,
  },
  {
    id: 2,
    title: "Electricity Bill",
    type: "Expense",
    category: "Utilities",
    date: "2026-10-05",
    amount: 12500,
  },
  {
    id: 3,
    title: "Library Donation",
    type: "Income",
    category: "Donation",
    date: "2026-10-07",
    amount: 12000,
  },
  {
    id: 4,
    title: "Office Supplies",
    type: "Expense",
    category: "Supplies",
    date: "2026-10-08",
    amount: 8500,
  },
  {
    id: 5,
    title: "Registration Fees",
    type: "Income",
    category: "Registration",
    date: "2026-10-11",
    amount: 18000,
  },
  {
    id: 6,
    title: "Teacher Training",
    type: "Expense",
    category: "Training",
    date: "2026-10-12",
    amount: 18000,
  },
];

const money = (value) =>
  `ETB ${Number(value || 0).toLocaleString("en-US")}`;

export default function FinancialReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("2026");
  const [transactionFilter, setTransactionFilter] = useState("All");

  // Demonstration figures. Replace with database results later.
  const totalIncome = 250000;
  const totalExpenses = 161000;
  const netBalance = totalIncome - totalExpenses;
  const studentFeesCollected = 185000;
  const outstandingFees = 42000;
  const collectionRate = 81;

  const filteredTransactions = recentTransactions.filter((item) => {
    return (
      transactionFilter === "All" ||
      item.type === transactionFilter
    );
  });

  const exportReport = () => {
    const headers = ["Date", "Description", "Category", "Type", "Amount"];

    const rows = filteredTransactions.map((item) => [
      item.date,
      item.title,
      item.category,
      item.type,
      item.amount,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial-report-${selectedPeriod}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxChartValue = Math.max(
    ...monthlyData.map((item) => Math.max(item.income, item.expenses))
  );

  return (
    <div className="financial-page container-fluid">
      <div className="financial-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2>Financial Reports</h2>
          <p>Review school income, expenses, and financial performance.</p>
        </div>

        <div className="financial-header-actions">
          <select
            className="form-select financial-year-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="2026">Academic Year 2026</option>
            <option value="2025">Academic Year 2025</option>
            <option value="2024">Academic Year 2024</option>
          </select>

          <button className="financial-export-btn" onClick={exportReport}>
            <Download size={17} /> Export Report
          </button>
        </div>
      </div>

      <div className="row g-3 financial-stats">
        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="financial-stat-card">
            <div className="financial-stat-top">
              <div className="financial-stat-icon green">
                <TrendingUp size={22} />
              </div>
              <span className="financial-trend positive">
                <ArrowUpRight size={15} /> Income
              </span>
            </div>
            <span className="financial-stat-label">Total Income</span>
            <h3>{money(totalIncome)}</h3>
            <small>Recorded school income</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="financial-stat-card">
            <div className="financial-stat-top">
              <div className="financial-stat-icon red">
                <TrendingDown size={22} />
              </div>
              <span className="financial-trend negative">
                <ArrowDownRight size={15} /> Expenses
              </span>
            </div>
            <span className="financial-stat-label">Total Expenses</span>
            <h3>{money(totalExpenses)}</h3>
            <small>Recorded school expenditure</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="financial-stat-card">
            <div className="financial-stat-top">
              <div className="financial-stat-icon purple">
                <PiggyBank size={22} />
              </div>
              <span className="financial-trend positive">Net balance</span>
            </div>
            <span className="financial-stat-label">Available Balance</span>
            <h3>{money(netBalance)}</h3>
            <small>Income minus expenses</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="financial-stat-card">
            <div className="financial-stat-top">
              <div className="financial-stat-icon orange">
                <Wallet size={22} />
              </div>
              <span className="financial-trend warning">Outstanding</span>
            </div>
            <span className="financial-stat-label">Unpaid Student Fees</span>
            <h3>{money(outstandingFees)}</h3>
            <small>Student fee balances</small>
          </motion.div>
        </div>
      </div>

      <div className="row g-3 financial-main-row">
        <div className="col-12 col-xl-8">
          <div className="financial-card financial-chart-card">
            <div className="financial-card-heading">
              <div>
                <h4>Income vs Expenses</h4>
                <p>Monthly financial performance for 2026.</p>
              </div>
              <div className="financial-chart-legend">
                <span><i className="legend-income" /> Income</span>
                <span><i className="legend-expense" /> Expenses</span>
              </div>
            </div>

            <div className="financial-chart">
              <div className="financial-y-labels">
                <span>130k</span>
                <span>100k</span>
                <span>70k</span>
                <span>40k</span>
                <span>0</span>
              </div>

              <div className="financial-chart-area">
                <div className="financial-chart-grid">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="financial-bars">
                  {monthlyData.map((item) => (
                    <div className="financial-month-column" key={item.month}>
                      <div className="financial-bar-pair">
                        <div
                          className="financial-bar income-bar"
                          style={{
                            height: `${(item.income / maxChartValue) * 100}%`,
                          }}
                          title={`Income: ${money(item.income)}`}
                        />
                        <div
                          className="financial-bar expense-bar"
                          style={{
                            height: `${(item.expenses / maxChartValue) * 100}%`,
                          }}
                          title={`Expenses: ${money(item.expenses)}`}
                        />
                      </div>
                      <span className="financial-month-label">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="financial-card collection-card">
            <div className="financial-card-heading">
              <div>
                <h4>Fee Collection</h4>
                <p>Student fee payment progress.</p>
              </div>
              <CalendarDays size={20} />
            </div>

            <div className="collection-progress">
              <div
                className="collection-circle"
                style={{ "--progress": `${collectionRate}%` }}
              >
                <div>
                  <strong>{collectionRate}%</strong>
                  <span>Collected</span>
                </div>
              </div>
            </div>

            <div className="collection-detail">
              <div>
                <span><i className="collection-dot collected" /> Collected Fees</span>
                <strong>{money(studentFeesCollected)}</strong>
              </div>
              <div>
                <span><i className="collection-dot outstanding" /> Outstanding</span>
                <strong>{money(outstandingFees)}</strong>
              </div>
              <div>
                <span>Total Expected</span>
                <strong>{money(studentFeesCollected + outstandingFees)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 financial-category-row">
        <div className="col-12 col-lg-6">
          <div className="financial-card category-card">
            <div className="financial-card-heading">
              <div>
                <h4>Income by Category</h4>
                <p>Sources of school income.</p>
              </div>
              <TrendingUp size={20} className="income-heading-icon" />
            </div>

            {incomeCategories.map((item) => (
              <div className="category-item" key={item.name}>
                <div className="category-item-info">
                  <span>{item.name}</span>
                  <strong>{money(item.amount)}</strong>
                </div>
                <div className="category-progress">
                  <div
                    className="category-progress-fill income-fill"
                    style={{
                      width: `${(item.amount / totalIncome) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="financial-card category-card">
            <div className="financial-card-heading">
              <div>
                <h4>Expenses by Category</h4>
                <p>Where school funds are spent.</p>
              </div>
              <TrendingDown size={20} className="expense-heading-icon" />
            </div>

            {expenseCategories.map((item) => (
              <div className="category-item" key={item.name}>
                <div className="category-item-info">
                  <span>{item.name}</span>
                  <strong>{money(item.amount)}</strong>
                </div>
                <div className="category-progress">
                  <div
                    className="category-progress-fill expense-fill"
                    style={{
                      width: `${(item.amount / totalExpenses) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="financial-card financial-transactions-card">
        <div className="financial-card-heading">
          <div>
            <h4>Recent Financial Transactions</h4>
            <p>Recent income and expenditure records.</p>
          </div>

          <div className="financial-transaction-filter">
            <FileText size={17} />
            <select
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value)}
            >
              <option value="All">All Transactions</option>
              <option value="Income">Income Only</option>
              <option value="Expense">Expenses Only</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table financial-table align-middle">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.date}</td>
                  <td>
                    <span
                      className={`transaction-type ${
                        item.type === "Income" ? "type-income" : "type-expense"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td
                    className={
                      item.type === "Income"
                        ? "transaction-income"
                        : "transaction-expense"
                    }
                  >
                    {item.type === "Income" ? "+" : "-"}
                    {money(item.amount)}
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="5" className="financial-empty">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="financial-footer-note">
        <FileText size={17} />
        <span>
          This report is a demonstration using sample data. Connect it to your
          MySQL database before using it for actual school financial decisions.
        </span>
      </div>
    </div>
  );
}
