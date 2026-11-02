
import   { useState } from "react";
import {
  Search,
  Plus,
  Wallet,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  X,
  Users,
  Download,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import "./AccountantStudentFees.css";

const initialFees = [
  {
    id: 1,
    student: "Abebe Kebede",
    studentId: "STU001",
    grade: "Grade 9",
    feeType: "Tuition Fee",
    total: 5000,
    paid: 5000,
    dueDate: "2026-11-15",
  },
  {
    id: 2,
    student: "Hana Tadesse",
    studentId: "STU002",
    grade: "Grade 10",
    feeType: "Tuition Fee",
    total: 6000,
    paid: 3000,
    dueDate: "2026-11-20",
  },
  {
    id: 3,
    student: "Dawit Bekele",
    studentId: "STU003",
    grade: "Grade 11",
    feeType: "Registration Fee",
    total: 1500,
    paid: 0,
    dueDate: "2026-10-20",
  },
  {
    id: 4,
    student: "Mekdes Alemu",
    studentId: "STU004",
    grade: "Grade 12",
    feeType: "Tuition Fee",
    total: 7000,
    paid: 7000,
    dueDate: "2026-11-25",
  },
  {
    id: 5,
    student: "Yohannes Tesfaye",
    studentId: "STU005",
    grade: "Grade 9",
    feeType: "Library Fee",
    total: 500,
    paid: 200,
    dueDate: "2026-10-15",
  },
];

const getStatus = (fee) => {
  if (fee.paid >= fee.total) return "Paid";
  if (new Date(fee.dueDate) < new Date("2026-10-31")) {
    return "Overdue";
  }
  return fee.paid > 0 ? "Partial" : "Unpaid";
};

const money = (amount) =>
  `ETB ${Number(amount).toLocaleString()}`;

export default function AccountantStudentFees() {
  const [fees, setFees] = useState(initialFees);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);

  const [form, setForm] = useState({
    student: "",
    studentId: "",
    grade: "Grade 9",
    feeType: "Tuition Fee",
    total: "",
    paid: "0",
    dueDate: "",
  });

  const totalFees = fees.reduce((sum, f) => sum + f.total, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paid, 0);
  const balance = totalFees - totalPaid;

  const filteredFees = fees.filter((fee) => {
    const matchesSearch =
      fee.student.toLowerCase().includes(search.toLowerCase()) ||
      fee.studentId.toLowerCase().includes(search.toLowerCase());

    const matchesGrade =
      gradeFilter === "All" || fee.grade === gradeFilter;

    const matchesStatus =
      statusFilter === "All" || getStatus(fee) === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const openAddModal = () => {
    setSelectedFee(null);
    setForm({
      student: "",
      studentId: "",
      grade: "Grade 9",
      feeType: "Tuition Fee",
      total: "",
      paid: "0",
      dueDate: "",
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const total = Number(form.total);
    const paid = Number(form.paid);

    if (
      !form.student.trim() ||
      !form.studentId.trim() ||
      !form.dueDate ||
      total <= 0 ||
      paid < 0 ||
      paid > total
    ) {
      alert("Please enter valid fee information.");
      return;
    }

    if (selectedFee) {
      setFees((prev) =>
        prev.map((fee) =>
          fee.id === selectedFee.id
            ? { ...fee, ...form, total, paid }
            : fee
        )
      );
    } else {
      setFees((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...form,
          total,
          paid,
        },
      ]);
    }

    setShowModal(false);
  };

  const handleEdit = (fee) => {
    setSelectedFee(fee);
    setForm({
      ...fee,
      total: String(fee.total),
      paid: String(fee.paid),
    });
    setShowModal(true);
  };

  const exportCSV = () => {
    const header = [
      "Student",
      "Student ID",
      "Grade",
      "Fee Type",
      "Total",
      "Paid",
      "Balance",
      "Due Date",
      "Status",
    ];

    const rows = filteredFees.map((f) => [
      f.student,
      f.studentId,
      f.grade,
      f.feeType,
      f.total,
      f.paid,
      f.total - f.paid,
      f.dueDate,
      getStatus(f),
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-fees.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="accountant-fees-page">
      <div className="fees-heading">
        <div>
          <span className="fees-eyebrow">FINANCE MANAGEMENT</span>
          <h2>Student Fees</h2>
          <p>Manage student fee records and payment balances.</p>
        </div>

        <div className="fees-actions">
          <button className="fees-export-btn" onClick={exportCSV}>
            <Download size={17} /> Export CSV
          </button>
          <button className="fees-add-btn" onClick={openAddModal}>
            <Plus size={18} /> Add Fee Record
          </button>
        </div>
      </div>

      <div className="row g-3 fees-summary">
        <div className="col-md-4">
          <motion.div
            className="fees-stat-card total"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="fees-stat-icon"><Wallet /></div>
            <span>Total Fees</span>
            <h3>{money(totalFees)}</h3>
            <small>All recorded student fees</small>
          </motion.div>
        </div>

        <div className="col-md-4">
          <motion.div
            className="fees-stat-card paid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="fees-stat-icon"><CheckCircle /></div>
            <span>Total Paid</span>
            <h3>{money(totalPaid)}</h3>
            <small>Payments received</small>
          </motion.div>
        </div>

        <div className="col-md-4">
          <motion.div
            className="fees-stat-card balance"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="fees-stat-icon"><Clock /></div>
            <span>Outstanding Balance</span>
            <h3>{money(balance)}</h3>
            <small>Remaining amount</small>
          </motion.div>
        </div>
      </div>

      <div className="fees-table-card">
        <div className="fees-table-heading">
          <div>
            <h4>Student Fee Records</h4>
            <p>Search and filter student payments</p>
          </div>
          <span className="fees-record-count">
            {filteredFees.length} Records
          </span>
        </div>

        <div className="fees-filters">
          <div className="fees-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search student or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="fees-filter-select">
            <Filter size={17} />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <select
            className="fees-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table fees-table align-middle">
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>Fee Type</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredFees.map((fee) => {
                const status = getStatus(fee);

                return (
                  <tr key={fee.id}>
                    <td>
                      <div className="fees-student-name">
                        <div className="fees-avatar">
                          {fee.student.charAt(0)}
                        </div>
                        <div>
                          <strong>{fee.student}</strong>
                          <small>{fee.studentId}</small>
                        </div>
                      </div>
                    </td>
                    <td>{fee.grade}</td>
                    <td>{fee.feeType}</td>
                    <td>{money(fee.total)}</td>
                    <td className="fees-paid-text">{money(fee.paid)}</td>
                    <td className="fees-balance-text">
                      {money(fee.total - fee.paid)}
                    </td>
                    <td>{fee.dueDate}</td>
                    <td>
                      <span className={`fees-status ${status.toLowerCase()}`}>
                        {status === "Paid" && <CheckCircle size={13} />}
                        {status === "Overdue" && <AlertCircle size={13} />}
                        {status === "Partial" && <Clock size={13} />}
                        {status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="fees-action-btn"
                        title="View details"
                        onClick={() => setSelectedFee(fee)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        className="fees-action-btn edit"
                        title="Edit record"
                        onClick={() => handleEdit(fee)}
                      >
                        <Edit size={17} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan="9" className="fees-empty">
                    <Users size={30} />
                    <p>No student fee records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fees-modal-overlay">
          <div className="fees-modal">
            <div className="fees-modal-heading">
              <div>
                <h4>{selectedFee ? "Edit Fee Record" : "Add Fee Record"}</h4>
                <p>Enter student fee information</p>
              </div>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Student Name</label>
              <input
                required
                value={form.student}
                onChange={(e) =>
                  setForm({ ...form, student: e.target.value })
                }
                placeholder="Enter student name"
              />

              <label>Student ID</label>
              <input
                required
                value={form.studentId}
                onChange={(e) =>
                  setForm({ ...form, studentId: e.target.value })
                }
                placeholder="Enter student ID"
              />

              <div className="fees-form-row">
                <div>
                  <label>Grade</label>
                  <select
                    value={form.grade}
                    onChange={(e) =>
                      setForm({ ...form, grade: e.target.value })
                    }
                  >
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                    <option>Grade 12</option>
                  </select>
                </div>
                <div>
                  <label>Fee Type</label>
                  <select
                    value={form.feeType}
                    onChange={(e) =>
                      setForm({ ...form, feeType: e.target.value })
                    }
                  >
                    <option>Tuition Fee</option>
                    <option>Registration Fee</option>
                    <option>Library Fee</option>
                    <option>Other Fee</option>
                  </select>
                </div>
              </div>

              <div className="fees-form-row">
                <div>
                  <label>Total Fee (ETB)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.total}
                    onChange={(e) =>
                      setForm({ ...form, total: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label>Amount Paid (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.paid}
                    onChange={(e) =>
                      setForm({ ...form, paid: e.target.value })
                    }
                  />
                </div>
              </div>

              <label>Due Date</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
                }
              />

              <div className="fees-modal-actions">
                <button
                  type="button"
                  className="fees-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="fees-save-btn">
                  {selectedFee ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedFee && !showModal && (
        <div className="fees-modal-overlay">
          <div className="fees-modal">
            <div className="fees-modal-heading">
              <div>
                <h4>Fee Details</h4>
                <p>{selectedFee.student}</p>
              </div>
              <button onClick={() => setSelectedFee(null)}>
                <X />
              </button>
            </div>
            <div className="fees-detail-list">
              <p><strong>Student ID:</strong> {selectedFee.studentId}</p>
              <p><strong>Grade:</strong> {selectedFee.grade}</p>
              <p><strong>Fee Type:</strong> {selectedFee.feeType}</p>
              <p><strong>Total Fee:</strong> {money(selectedFee.total)}</p>
              <p><strong>Paid:</strong> {money(selectedFee.paid)}</p>
              <p><strong>Balance:</strong> {money(selectedFee.total - selectedFee.paid)}</p>
              <p><strong>Due Date:</strong> {selectedFee.dueDate}</p>
              <p><strong>Status:</strong> {getStatus(selectedFee)}</p>
            </div>
            <button
              className="fees-save-btn w-100 mt-3"
              onClick={() => setSelectedFee(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
