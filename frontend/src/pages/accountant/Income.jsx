
import   { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Wallet,
  Receipt,
  CalendarDays,
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  Filter,
  CheckCircle,
} from "lucide-react";
import "./Income.css";

const initialIncome = [
  {
    id: 1,
    title: "Grade 10 Student Fees",
    category: "Student Fees",
    amount: 45000,
    date: "2026-10-03",
    receivedFrom: "Grade 10 Students",
    method: "Bank Transfer",
    status: "Received",
    description: "Monthly student fee collection.",
  },
  {
    id: 2,
    title: "Library Donation",
    category: "Donation",
    amount: 12000,
    date: "2026-10-07",
    receivedFrom: "Community Support Group",
    method: "Cash",
    status: "Received",
    description: "Donation for library resources.",
  },
  {
    id: 3,
    title: "School Registration Fees",
    category: "Registration",
    amount: 18000,
    date: "2026-10-11",
    receivedFrom: "New Students",
    method: "Mobile Banking",
    status: "Received",
    description: "Registration fees for new students.",
  },
  {
    id: 4,
    title: "Education Support Grant",
    category: "Grant",
    amount: 60000,
    date: "2026-10-14",
    receivedFrom: "Education Support Organization",
    method: "Bank Transfer",
    status: "Pending",
    description: "Education support grant awaiting confirmation.",
  },
  {
    id: 5,
    title: "School Event Contribution",
    category: "Other",
    amount: 7500,
    date: "2026-10-20",
    receivedFrom: "Parent Committee",
    method: "Cash",
    status: "Received",
    description: "Contribution for school activities.",
  },
  {
    id: 6,
    title: "Grade 9 Student Fees",
    category: "Student Fees",
    amount: 32000,
    date: "2026-09-18",
    receivedFrom: "Grade 9 Students",
    method: "Bank Transfer",
    status: "Received",
    description: "Student fee collection.",
  },
];

const emptyForm = {
  title: "",
  category: "Student Fees",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  receivedFrom: "",
  method: "Cash",
  status: "Received",
  description: "",
};

const formatMoney = (amount) =>
  `ETB ${Number(amount || 0).toLocaleString("en-US")}`;

export default function Income() {
  const [income, setIncome] = useState(initialIncome);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const totalIncome = income
    .filter((item) => item.status === "Received")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const currentMonthIncome = income
    .filter(
      (item) =>
        item.date.slice(0, 7) === new Date().toISOString().slice(0, 7) &&
        item.status === "Received"
    )
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const pendingIncome = income
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const filteredIncome = useMemo(() => {
    return income.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.receivedFrom.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [income, search, categoryFilter, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setForm({ ...item, amount: String(item.amount) });
    setSelectedIncome(null);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.title.trim() ||
      !form.receivedFrom.trim() ||
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      alert("Please enter a title, received-from name, and valid amount.");
      return;
    }

    const savedItem = {
      ...form,
      id: editingId || Date.now(),
      amount: Number(form.amount),
    };

    if (editingId) {
      setIncome((prev) =>
        prev.map((item) => (item.id === editingId ? savedItem : item))
      );
    } else {
      setIncome((prev) => [savedItem, ...prev]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const deleteIncome = (id) => {
    if (window.confirm("Are you sure you want to delete this income record?")) {
      setIncome((prev) => prev.filter((item) => item.id !== id));
      setSelectedIncome(null);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Title",
      "Category",
      "Amount",
      "Date",
      "Received From",
      "Method",
      "Status",
      "Description",
    ];

    const rows = filteredIncome.map((item) => [
      item.title,
      item.category,
      item.amount,
      item.date,
      item.receivedFrom,
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
    link.download = "school-income.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="income-page container-fluid">
      <div className="income-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2>Income Management</h2>
          <p>Record and monitor money received by the school.</p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button className="income-export-btn" onClick={exportCSV}>
            <Download size={17} /> Export CSV
          </button>
          <button className="income-add-btn" onClick={openAddModal}>
            <Plus size={18} /> Add Income
          </button>
        </div>
      </div>

      <div className="row g-3 income-stats">
        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="income-stat-card">
            <div className="income-stat-icon green">
              <Wallet size={23} />
            </div>
            <span>Total Received</span>
            <h3>{formatMoney(totalIncome)}</h3>
            <small>Confirmed income records</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="income-stat-card">
            <div className="income-stat-icon blue">
              <CalendarDays size={23} />
            </div>
            <span>This Month</span>
            <h3>{formatMoney(currentMonthIncome)}</h3>
            <small>Received this month</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="income-stat-card">
            <div className="income-stat-icon orange">
              <TrendingUp size={23} />
            </div>
            <span>Pending Income</span>
            <h3>{formatMoney(pendingIncome)}</h3>
            <small>Awaiting confirmation</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="income-stat-card">
            <div className="income-stat-icon purple">
              <Receipt size={23} />
            </div>
            <span>Income Records</span>
            <h3>{income.length}</h3>
            <small>Total transactions</small>
          </motion.div>
        </div>
      </div>

      <div className="income-table-card">
        <div className="income-table-heading">
          <div>
            <h4>Income Records</h4>
            <p>Review and manage all recorded income.</p>
          </div>
          <span className="income-record-count">
            {filteredIncome.length} records
          </span>
        </div>

        <div className="row g-3 income-filters">
          <div className="col-12 col-lg-5">
            <div className="income-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search title, category or received from..."
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
              <option value="Student Fees">Student Fees</option>
              <option value="Registration">Registration</option>
              <option value="Donation">Donation</option>
              <option value="Grant">Grant</option>
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
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="col-12 col-lg-1">
            <button
              className="income-reset-btn"
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
          <table className="table income-table align-middle">
            <thead>
              <tr>
                <th>Income Title</th>
                <th>Category</th>
                <th>Received From</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncome.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="income-title-cell">
                      <div className="income-row-icon">
                        <TrendingUp size={17} />
                      </div>
                      <strong>{item.title}</strong>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.receivedFrom}</td>
                  <td>{item.date}</td>
                  <td className="income-amount">
                    {formatMoney(item.amount)}
                  </td>
                  <td>
                    <span
                      className={`income-status ${
                        item.status === "Received" ? "received" : "pending"
                      }`}
                    >
                      {item.status === "Received" && (
                        <CheckCircle size={13} />
                      )}
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="income-actions">
                      <button
                        title="View"
                        onClick={() => setSelectedIncome(item)}
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
                        onClick={() => deleteIncome(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredIncome.length === 0 && (
                <tr>
                  <td colSpan="7" className="income-empty">
                    No income records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="income-modal-backdrop">
            <motion.div
              className="income-modal"
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="income-modal-header">
                <div>
                  <h4>{editingId ? "Edit Income" : "Add New Income"}</h4>
                  <p>Enter the income information below.</p>
                </div>
                <button onClick={() => setShowModal(false)}>
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label>Income Title</label>
                    <input
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Student Fees"
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
                      <option>Student Fees</option>
                      <option>Registration</option>
                      <option>Donation</option>
                      <option>Grant</option>
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
                    <label>Received From</label>
                    <input
                      className="form-control"
                      name="receivedFrom"
                      value={form.receivedFrom}
                      onChange={handleChange}
                      placeholder="Person or organization"
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
                      <option>Received</option>
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

                <div className="income-modal-footer">
                  <button
                    type="button"
                    className="income-cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="income-save-btn">
                    {editingId ? "Save Changes" : "Add Income"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {selectedIncome && (
          <div
            className="income-modal-backdrop"
            onClick={() => setSelectedIncome(null)}
          >
            <motion.div
              className="income-modal income-detail-modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="income-modal-header">
                <div>
                  <h4>Income Details</h4>
                  <p>Review this income record.</p>
                </div>
                <button onClick={() => setSelectedIncome(null)}>
                  <X size={21} />
                </button>
              </div>

              <div className="income-detail-list">
                <div><span>Title</span><strong>{selectedIncome.title}</strong></div>
                <div><span>Category</span><strong>{selectedIncome.category}</strong></div>
                <div><span>Amount</span><strong>{formatMoney(selectedIncome.amount)}</strong></div>
                <div><span>Date</span><strong>{selectedIncome.date}</strong></div>
                <div><span>Received From</span><strong>{selectedIncome.receivedFrom}</strong></div>
                <div><span>Payment Method</span><strong>{selectedIncome.method}</strong></div>
                <div><span>Status</span><strong>{selectedIncome.status}</strong></div>
                <div className="income-detail-description">
                  <span>Description</span>
                  <p>{selectedIncome.description || "No description provided."}</p>
                </div>
              </div>

              <div className="income-modal-footer">
                <button
                  className="income-cancel-btn"
                  onClick={() => setSelectedIncome(null)}
                >
                  Close
                </button>
                <button
                  className="income-save-btn"
                  onClick={() => openEditModal(selectedIncome)}
                >
                  <Edit size={16} /> Edit Income
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
