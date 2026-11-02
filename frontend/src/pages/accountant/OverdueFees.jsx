
import   { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Wallet,
  Users,
//   CalendarDays,
  Search,
  Download,
  Eye,
  Bell,
  X,
  Filter,
  Phone,
  Clock,
} from "lucide-react";
import "./OverdueFees.css";

const initialRecords = [
  {
    id: 1,
    studentId: "STU001",
    studentName: "Abebe Kebede",
    grade: "Grade 9",
    feeType: "Tuition Fee",
    totalFee: 12000,
    paidAmount: 5000,
    dueDate: "2026-10-05",
    reminderStatus: "Not Sent",
    phone: "0911000001",
  },
  {
    id: 2,
    studentId: "STU002",
    studentName: "Hana Tesfaye",
    grade: "Grade 10",
    feeType: "Tuition Fee",
    totalFee: 15000,
    paidAmount: 7000,
    dueDate: "2026-10-08",
    reminderStatus: "Sent",
    phone: "0911000002",
  },
  {
    id: 3,
    studentId: "STU003",
    studentName: "Dawit Alemu",
    grade: "Grade 8",
    feeType: "Library Fee",
    totalFee: 2000,
    paidAmount: 0,
    dueDate: "2026-09-25",
    reminderStatus: "Not Sent",
    phone: "0911000003",
  },
  {
    id: 4,
    studentId: "STU004",
    studentName: "Mekdes Girma",
    grade: "Grade 11",
    feeType: "Tuition Fee",
    totalFee: 18000,
    paidAmount: 10000,
    dueDate: "2026-10-12",
    reminderStatus: "Sent",
    phone: "0911000004",
  },
  {
    id: 5,
    studentId: "STU005",
    studentName: "Yonas Bekele",
    grade: "Grade 12",
    feeType: "Exam Fee",
    totalFee: 3000,
    paidAmount: 0,
    dueDate: "2026-09-18",
    reminderStatus: "Not Sent",
    phone: "0911000005",
  },
  {
    id: 6,
    studentId: "STU006",
    studentName: "Selamawit Tadesse",
    grade: "Grade 9",
    feeType: "Tuition Fee",
    totalFee: 12000,
    paidAmount: 4000,
    dueDate: "2026-10-15",
    reminderStatus: "Sent",
    phone: "0911000006",
  },
];

const money = (value) =>
  `ETB ${Number(value || 0).toLocaleString("en-US")}`;

const getBalance = (record) =>
  Math.max(0, Number(record.totalFee) - Number(record.paidAmount));

const getDaysOverdue = (date) => {
  const due = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today - due) / 86400000));
};

export default function OverdueFees() {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [reminderFilter, setReminderFilter] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [reminderRecord, setReminderRecord] = useState(null);
  const [reminderNote, setReminderNote] = useState("");

  const totalOverdue = records.reduce(
    (sum, item) => sum + getBalance(item),
    0
  );

  const studentsWithOverdue = records.filter(
    (item) => getBalance(item) > 0
  ).length;

  const remindersSent = records.filter(
    (item) => item.reminderStatus === "Sent"
  ).length;

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.studentName.toLowerCase().includes(searchValue) ||
        item.studentId.toLowerCase().includes(searchValue) ||
        item.feeType.toLowerCase().includes(searchValue);

      const matchesGrade =
        gradeFilter === "All" || item.grade === gradeFilter;

      const matchesReminder =
        reminderFilter === "All" ||
        item.reminderStatus === reminderFilter;

      return (
        getBalance(item) > 0 &&
        matchesSearch &&
        matchesGrade &&
        matchesReminder
      );
    });
  }, [records, search, gradeFilter, reminderFilter]);

  const openReminder = (record) => {
    setReminderRecord(record);
    setReminderNote("");
  };

  const saveReminder = (e) => {
    e.preventDefault();

    setRecords((previous) =>
      previous.map((item) =>
        item.id === reminderRecord.id
          ? { ...item, reminderStatus: "Sent" }
          : item
      )
    );

    setReminderRecord(null);
    setReminderNote("");
  };

  const exportCSV = () => {
    const headers = [
      "Student ID",
      "Student Name",
      "Grade",
      "Fee Type",
      "Total Fee",
      "Paid Amount",
      "Outstanding Balance",
      "Due Date",
      "Days Overdue",
      "Reminder Status",
    ];

    const rows = filteredRecords.map((item) => [
      item.studentId,
      item.studentName,
      item.grade,
      item.feeType,
      item.totalFee,
      item.paidAmount,
      getBalance(item),
      item.dueDate,
      getDaysOverdue(item.dueDate),
      item.reminderStatus,
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
    link.download = "overdue-fees.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overdue-page container-fluid">
      <div className="overdue-header d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div>
          <h2>Overdue Fees</h2>
          <p>Monitor unpaid student fees and follow up on outstanding balances.</p>
        </div>

        <button className="overdue-export-btn" onClick={exportCSV}>
          <Download size={17} /> Export CSV
        </button>
      </div>

      <div className="row g-3 overdue-stats">
        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="overdue-stat-card">
            <div className="overdue-stat-icon red">
              <Wallet size={23} />
            </div>
            <span>Total Outstanding</span>
            <h3>{money(totalOverdue)}</h3>
            <small>Unpaid fee balance</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="overdue-stat-card">
            <div className="overdue-stat-icon orange">
              <Users size={23} />
            </div>
            <span>Students with Balance</span>
            <h3>{studentsWithOverdue}</h3>
            <small>Students with unpaid fees</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="overdue-stat-card">
            <div className="overdue-stat-icon blue">
              <Bell size={23} />
            </div>
            <span>Reminders Sent</span>
            <h3>{remindersSent}</h3>
            <small>Records marked as reminded</small>
          </motion.div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <motion.div whileHover={{ y: -5 }} className="overdue-stat-card">
            <div className="overdue-stat-icon purple">
              <AlertCircle size={23} />
            </div>
            <span>Not Reminded</span>
            <h3>{records.filter((item) => item.reminderStatus === "Not Sent").length}</h3>
            <small>Awaiting follow-up</small>
          </motion.div>
        </div>
      </div>

      <div className="overdue-notice">
        <AlertCircle size={19} />
        <div>
          <strong>Outstanding fee reminder</strong>
          <p>
            Review unpaid balances and follow up according to your school's
            fee collection policy.
          </p>
        </div>
      </div>

      <div className="overdue-table-card">
        <div className="overdue-table-heading">
          <div>
            <h4>Students with Outstanding Fees</h4>
            <p>View balances and record follow-up reminders.</p>
          </div>
          <span className="overdue-count">
            {filteredRecords.length} records
          </span>
        </div>

        <div className="row g-3 overdue-filters">
          <div className="col-12 col-lg-5">
            <div className="overdue-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search student name, ID or fee type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <select
              className="form-select"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <select
              className="form-select"
              value={reminderFilter}
              onChange={(e) => setReminderFilter(e.target.value)}
            >
              <option value="All">All Reminders</option>
              <option value="Sent">Reminder Sent</option>
              <option value="Not Sent">Not Sent</option>
            </select>
          </div>

          <div className="col-12 col-lg-1">
            <button
              className="overdue-reset-btn"
              title="Reset filters"
              onClick={() => {
                setSearch("");
                setGradeFilter("All");
                setReminderFilter("All");
              }}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table overdue-table align-middle">
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>Fee Type</th>
                <th>Due Date</th>
                <th>Days Late</th>
                <th>Outstanding</th>
                <th>Reminder</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="overdue-student-cell">
                      <div className="overdue-avatar">
                        {item.studentName.charAt(0)}
                      </div>
                      <div>
                        <strong>{item.studentName}</strong>
                        <small>{item.studentId}</small>
                      </div>
                    </div>
                  </td>
                  <td>{item.grade}</td>
                  <td>{item.feeType}</td>
                  <td>{item.dueDate}</td>
                  <td>
                    <span className="overdue-days">
                      <Clock size={13} />
                      {getDaysOverdue(item.dueDate)} days
                    </span>
                  </td>
                  <td className="overdue-amount">
                    {money(getBalance(item))}
                  </td>
                  <td>
                    <span
                      className={`overdue-reminder-status ${
                        item.reminderStatus === "Sent" ? "sent" : "not-sent"
                      }`}
                    >
                      {item.reminderStatus}
                    </span>
                  </td>
                  <td>
                    <div className="overdue-actions">
                      <button
                        title="View details"
                        onClick={() => setSelectedRecord(item)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Record reminder"
                        className="remind"
                        onClick={() => openReminder(item)}
                      >
                        <Bell size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="8" className="overdue-empty">
                    No overdue fee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedRecord && (
          <div
            className="overdue-modal-backdrop"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div
              className="overdue-modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="overdue-modal-header">
                <div>
                  <h4>Student Fee Details</h4>
                  <p>Outstanding fee information.</p>
                </div>
                <button onClick={() => setSelectedRecord(null)}>
                  <X size={21} />
                </button>
              </div>

              <div className="overdue-detail-list">
                <div><span>Student Name</span><strong>{selectedRecord.studentName}</strong></div>
                <div><span>Student ID</span><strong>{selectedRecord.studentId}</strong></div>
                <div><span>Grade</span><strong>{selectedRecord.grade}</strong></div>
                <div><span>Fee Type</span><strong>{selectedRecord.feeType}</strong></div>
                <div><span>Total Fee</span><strong>{money(selectedRecord.totalFee)}</strong></div>
                <div><span>Paid Amount</span><strong>{money(selectedRecord.paidAmount)}</strong></div>
                <div><span>Outstanding Balance</span><strong className="detail-balance">{money(getBalance(selectedRecord))}</strong></div>
                <div><span>Due Date</span><strong>{selectedRecord.dueDate}</strong></div>
                <div><span>Days Overdue</span><strong>{getDaysOverdue(selectedRecord.dueDate)} days</strong></div>
                <div><span>Reminder Status</span><strong>{selectedRecord.reminderStatus}</strong></div>
                <div><span>Parent Contact</span><strong>{selectedRecord.phone}</strong></div>
              </div>

              <div className="overdue-modal-footer">
                <button
                  className="overdue-cancel-btn"
                  onClick={() => setSelectedRecord(null)}
                >
                  Close
                </button>
                <button
                  className="overdue-reminder-btn"
                  onClick={() => {
                    setSelectedRecord(null);
                    openReminder(selectedRecord);
                  }}
                >
                  <Bell size={16} /> Record Reminder
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {reminderRecord && (
          <div className="overdue-modal-backdrop">
            <motion.div
              className="overdue-modal reminder-modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="overdue-modal-header">
                <div>
                  <h4>Record Fee Reminder</h4>
                  <p>{reminderRecord.studentName} · {reminderRecord.studentId}</p>
                </div>
                <button onClick={() => setReminderRecord(null)}>
                  <X size={21} />
                </button>
              </div>

              <div className="reminder-student-summary">
                <span>Outstanding Balance</span>
                <strong>{money(getBalance(reminderRecord))}</strong>
                <small>
                  <Phone size={14} /> {reminderRecord.phone}
                </small>
              </div>

              <form onSubmit={saveReminder}>
                <label htmlFor="reminderNote">Follow-up note</label>
                <textarea
                  id="reminderNote"
                  className="form-control"
                  rows="4"
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  placeholder="Enter how and when the reminder was communicated..."
                  required
                />

                <div className="overdue-modal-footer">
                  <button
                    type="button"
                    className="overdue-cancel-btn"
                    onClick={() => setReminderRecord(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="overdue-reminder-btn">
                    <Bell size={16} /> Save Reminder Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
