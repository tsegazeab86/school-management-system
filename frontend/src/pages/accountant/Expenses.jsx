
import   { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingDown,
  Receipt,
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  CalendarDays,
  Filter,
  Building2,
  CheckCircle,
} from "lucide-react";
import "./Expenses.css";

const initialExpenses = [
  {
    id: 1,
    title: "Electricity Bill",
    category: "Utilities",
    amount: 12500,
    date: "2026-10-05",
    paidTo: "Ethiopian Electric Utility",
    method: "Bank Transfer",
    status: "Paid",
    description: "Monthly electricity payment.",
  },
  {
    id: 2,
    title: "Office Supplies",
    category: "Supplies",
    amount: 8500,
    date: "2026-10-08",
    paidTo: "ABC Stationery",
    method: "Cash",
    status: "Paid",
    description: "Pens, papers, notebooks and office materials.",
  },
  {
    id: 3,
    title: "Teacher Training",
    category: "Training",
    amount: 18000,
    date: "2026-10-12",
    paidTo: "Training Center",
    method: "Bank Transfer",
    status: "Pending",
    description: "Teacher professional development training.",
  },
  {
    id: 4,
    title: "Internet Service",
    category: "Utilities",
    amount: 4200,
    date: "2026-10-15",
    paidTo: "Internet Provider",
    method: "Mobile Banking",
    status: "Paid",
    description: "Monthly internet subscription.",
  },
  {
    id: 5,
    title: "Classroom Maintenance",
    category: "Maintenance",
    amount: 22000,
    date: "2026-10-18",
    paidTo: "Maintenance Team",
    method: "Cash",
    status: "Pending",
    description: "Classroom repair and maintenance.",
  },
  {
    id: 6,
    title: "School Transport Fuel",
    category: "Transport",
    amount: 9500,
    date: "2026-09-20",
    paidTo: "Fuel Station",
    method: "Cash",
    status: "Paid",
    description: "Fuel for school transportation.",
  },
];

const emptyForm = {
  title: "",
  category: "Utilities",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  paidTo: "",
  method: "Cash",
  status: "Paid",
  description: "",
};

const formatMoney = (amount) =>
  `ETB ${Number(amount || 0).toLocaleString("en-US")}`;

export default function Expenses() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const currentMonthExpenses = expenses
    .filter((item) => item.date.slice(0, 7) === "2026-10")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const pendingExpenses = expenses
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.paidTo.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [expenses, search, categoryFilter, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setEditingId(expense.id);
    setForm({
      ...expense,
      amount: String(expense.amount),
    });
    setShowModal(true);
    setSelectedExpense(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0 || !form.paidTo.trim()) {
      alert("Please enter a title, valid amount, and paid-to name.");
      return;
    }

    if (editingId) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...form, id: editingId, amount: Number(form.amount) }
            : item
        )
      );
    } else {
      setExpenses((prev) => [
        {
          ...form,
          id: Date.now(),
          amount: Number(form.amount),
        },
        ...prev,
      ]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const deleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      setSelectedExpense(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Title",
      "Category",
      "Amount",
      "Date",
      "Paid To",
      "Method",
      "Status",
      "Description",
    ];

    const rows = filteredExpenses.map((item) => [
      item.title,
      item.category,
      item.amount,
      item.date,
      item.paidTo,
      item.method,
      item.status,
      item.description,
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
    link.download = "school-expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="expenses-page container-fluid">
      <div className="expenses-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2>Expenses Management</h2>
          <p>Track and manage school expenditure records.</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button className="expense-export-btn" onClick={exportCSV}>
            <Download size={17} /> Export CSV
          </button>
          <button className="expense-add-btn" onClick={openAddModal}>
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      <div className="row g-3 expense-stats">
        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="expense-stat-card">
            <div className="expense-stat-icon purple">
              <Wallet size={23} />
            </div>
            <span>Total Expenses</span>
            <h3>{formatMoney(totalExpenses)}</h3>
            <small>All recorded expenses</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="expense-stat-card">
            <div className="expense-stat-icon blue">
              <CalendarDays size={23} />
            </div>
            <span>October Expenses</span>
            <h3>{formatMoney(currentMonthExpenses)}</h3>
            <small>Current month records</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="expense-stat-card">
            <div className="expense-stat-icon orange">
              <TrendingDown size={23} />
            </div>
            <span>Pending Expenses</span>
            <h3>{formatMoney(pendingExpenses)}</h3>
            <small>Awaiting payment</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="expense-stat-card">
            <div className="expense-stat-icon green">
              <Receipt size={23} />
            </div>
            <span>Expense Records</span>
            <h3>{expenses.length}</h3>
            <small>Total transactions</small>
          </motion.div>
        </div>
      </div>

      <div className="expense-table-card">
        <div className="expense-table-heading">
          <div>
            <h4>Expense Records</h4>
            <p>Review and manage school expenses.</p>
          </div>
          <span className="expense-record-count">
            {filteredExpenses.length} records
          </span>
        </div>

        <div className="row g-3 expense-filters">
          <div className="col-12 col-lg-5">
            <div className="expense-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search title, category or paid to..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Utilities">Utilities</option>
              <option value="Supplies">Supplies</option>
              <option value="Training">Training</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Transport">Transport</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="col-12 col-lg-1">
            <button
              className="expense-reset-btn"
              title="Reset filters"
              onClick={() => {
                setSearch("");
                setCategoryFilter("All");
                setStatusFilter("All");
              }}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table expense-table align-middle">
            <thead>
              <tr>
                <th>Expense</th>
                <th>Category</th>
                <th>Paid To</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="expense-title-cell">
                      <div className="expense-row-icon">
                        <Building2 size={17} />
                      </div>
                      <strong>{item.title}</strong>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.paidTo}</td>
                  <td>{item.date}</td>
                  <td className="expense-amount">
                    {formatMoney(item.amount)}
                  </td>
                  <td>
                    <span
                      className={`expense-status ${
                        item.status === "Paid" ? "paid" : "pending"
                      }`}
                    >
                      {item.status === "Paid" && <CheckCircle size={13} />}
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="expense-actions">
                      <button
                        title="View"
                        onClick={() => setSelectedExpense(item)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => openEditModal(item)}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        title="Delete"
                        className="delete"
                        onClick={() => deleteExpense(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="7" className="expense-empty">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="expense-modal-backdrop">
            <motion.div
              className="expense-modal"
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="expense-modal-header">
                <div>
                  <h4>{editingId ? "Edit Expense" : "Add New Expense"}</h4>
                  <p>Enter the expense information below.</p>
                </div>
                <button onClick={() => setShowModal(false)}>
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label>Expense Title</label>
                    <input
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Electricity Bill"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Category</label>
                    <select
                      className="form-select"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option>Utilities</option>
                      <option>Supplies</option>
                      <option>Training</option>
                      <option>Maintenance</option>
                      <option>Transport</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label>Amount (ETB)</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0.01"
                      step="0.01"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Date</label>
                    <input
                      className="form-control"
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Paid To</label>
                    <input
                      className="form-control"
                      name="paidTo"
                      value={form.paidTo}
                      onChange={handleChange}
                      placeholder="Person or company"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label>Payment Method</label>
                    <select
                      className="form-select"
                      name="method"
                      value={form.method}
                      onChange={handleChange}
                    >
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Mobile Banking</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label>Status</label>
                    <select
                      className="form-select"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option>Paid</option>
                      <option>Pending</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="3"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Additional details..."
                    />
                  </div>
                </div>

                <div className="expense-modal-footer">
                  <button
                    type="button"
                    className="expense-cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="expense-save-btn">
                    {editingId ? "Save Changes" : "Add Expense"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {selectedExpense && (
          <div
            className="expense-modal-backdrop"
            onClick={() => setSelectedExpense(null)}
          >
            <motion.div
              className="expense-modal expense-detail-modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="expense-modal-header">
                <div>
                  <h4>Expense Details</h4>
                  <p>Review this expense record.</p>
                </div>
                <button onClick={() => setSelectedExpense(null)}>
                  <X size={21} />
                </button>
              </div>

              <div className="expense-detail-list">
                <div><span>Title</span><strong>{selectedExpense.title}</strong></div>
                <div><span>Category</span><strong>{selectedExpense.category}</strong></div>
                <div><span>Amount</span><strong>{formatMoney(selectedExpense.amount)}</strong></div>
                <div><span>Date</span><strong>{selectedExpense.date}</strong></div>
                <div><span>Paid To</span><strong>{selectedExpense.paidTo}</strong></div>
                <div><span>Payment Method</span><strong>{selectedExpense.method}</strong></div>
                <div><span>Status</span><strong>{selectedExpense.status}</strong></div>
                <div className="detail-description">
                  <span>Description</span>
                  <p>{selectedExpense.description || "No description provided."}</p>
                </div>
              </div>

              <div className="expense-modal-footer">
                <button
                  className="expense-cancel-btn"
                  onClick={() => setSelectedExpense(null)}
                >
                  Close
                </button>
                <button
                  className="expense-save-btn"
                  onClick={() => openEditModal(selectedExpense)}
                >
                  <Edit size={16} /> Edit Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
