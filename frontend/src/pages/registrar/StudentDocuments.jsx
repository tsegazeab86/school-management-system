
import { useMemo, useRef, useState } from "react";
import {
  Search, Upload, FileText, FileImage, FileCheck2,
  Clock3, AlertCircle, Download, Eye, Trash2, X,
  CheckCircle2, XCircle, FolderOpen, Plus, Filter
} from "lucide-react";
import "../../styles/registrar/StudentDocuments.css";

const initialDocuments = [
  {
    id: 1,
    studentId: "STU001",
    studentName: "Abebe Kebede",
    documentName: "Birth Certificate.pdf",
    type: "Birth Certificate",
    date: "2026-10-20",
    status: "Verified",
    fileUrl: "",
  },
  {
    id: 2,
    studentId: "STU002",
    studentName: "Martha Tadesse",
    documentName: "Previous Report.pdf",
    type: "Academic Report",
    date: "2026-10-22",
    status: "Pending",
    fileUrl: "",
  },
  {
    id: 3,
    studentId: "STU003",
    studentName: "Dawit Getachew",
    documentName: "Student Photo.jpg",
    type: "Student Photo",
    date: "2026-10-23",
    status: "Rejected",
    fileUrl: "",
  },
  {
    id: 4,
    studentId: "STU004",
    studentName: "Selamawit Alemu",
    documentName: "Transfer Letter.pdf",
    type: "Transfer Letter",
    date: "2026-10-25",
    status: "Pending",
    fileUrl: "",
  },
];

const studentOptions = [
  { id: "STU001", name: "Abebe Kebede" },
  { id: "STU002", name: "Martha Tadesse" },
  { id: "STU003", name: "Dawit Getachew" },
  { id: "STU004", name: "Selamawit Alemu" },
  { id: "STU005", name: "Bereket Tesfaye" },
];

const documentTypes = [
  "Birth Certificate",
  "Student Photo",
  "Academic Report",
  "Transfer Letter",
  "Medical Document",
  "Parent ID",
  "Other",
];

function StudentDocuments() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    studentId: "",
    type: "",
    file: null,
  });

  const filteredDocuments = useMemo(() => {
    const query = search.toLowerCase().trim();

    return documents.filter((document) => {
      const matchesSearch =
        document.studentName.toLowerCase().includes(query) ||
        document.studentId.toLowerCase().includes(query) ||
        document.documentName.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || document.status === statusFilter;

      const matchesType =
        typeFilter === "All" || document.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [documents, search, statusFilter, typeFilter]);

  const verifiedCount = documents.filter(
    (document) => document.status === "Verified"
  ).length;

  const pendingCount = documents.filter(
    (document) => document.status === "Pending"
  ).length;

  const rejectedCount = documents.filter(
    (document) => document.status === "Rejected"
  ).length;

  const updateForm = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleUpload = (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.studentId || !form.type || !form.file) {
      setMessage("Please select a student, document type and file.");
      return;
    }

    const student = studentOptions.find(
      (item) => item.id === form.studentId
    );

    const newDocument = {
      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      documentName: form.file.name,
      type: form.type,
      date: new Date().toISOString().slice(0, 10),
      status: "Pending",
      fileUrl: URL.createObjectURL(form.file),
    };

    setDocuments((previous) => [newDocument, ...previous]);
    setForm({ studentId: "", type: "", file: null });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowUpload(false);
    setMessage("Document uploaded successfully. It is awaiting verification.");
  };

  const updateDocumentStatus = (id, status) => {
    setDocuments((previous) =>
      previous.map((document) =>
        document.id === id ? { ...document, status } : document
      )
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setDocuments((previous) =>
      previous.filter((document) => document.id !== deleteTarget.id)
    );

    if (deleteTarget.fileUrl) {
      URL.revokeObjectURL(deleteTarget.fileUrl);
    }

    setDeleteTarget(null);
    setMessage("Document deleted successfully.");
  };

  const getFileIcon = (name) => {
    return /\.(png|jpg|jpeg|webp)$/i.test(name)
      ? <FileImage size={21} />
      : <FileText size={21} />;
  };

  return (
    <div className="documents-page">
      <div className="documents-heading">
        <div>
          <h2>Student Documents</h2>
          <p>Upload, review and manage student records and documents.</p>
        </div>

        <button
          className="documents-upload-main-btn"
          onClick={() => {
            setMessage("");
            setShowUpload(true);
          }}
        >
          <Plus size={18} />
          Upload Document
        </button>
      </div>

      <div className="documents-stats">
        <div className="documents-stat-card">
          <div className="documents-stat-icon purple"><FolderOpen /></div>
          <div>
            <span>Total Documents</span>
            <h3>{documents.length}</h3>
          </div>
        </div>

        <div className="documents-stat-card">
          <div className="documents-stat-icon green"><FileCheck2 /></div>
          <div>
            <span>Verified</span>
            <h3>{verifiedCount}</h3>
          </div>
        </div>

        <div className="documents-stat-card">
          <div className="documents-stat-icon orange"><Clock3 /></div>
          <div>
            <span>Pending Review</span>
            <h3>{pendingCount}</h3>
          </div>
        </div>

        <div className="documents-stat-card">
          <div className="documents-stat-icon red"><AlertCircle /></div>
          <div>
            <span>Rejected</span>
            <h3>{rejectedCount}</h3>
          </div>
        </div>
      </div>

      {message && (
        <div className="documents-message">
          <CheckCircle2 size={17} />
          {message}
          <button onClick={() => setMessage("")} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="documents-content-card">
        <div className="documents-card-heading">
          <div>
            <h3>Document Records</h3>
            <p>View and manage uploaded student documents.</p>
          </div>
          <span>{filteredDocuments.length} Records</span>
        </div>

        <div className="documents-toolbar">
          <div className="documents-search">
            <Search size={18} />
            <input
              placeholder="Search student, ID or document..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="documents-filter">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="documents-filter">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="All">All Types</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="documents-table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Student</th>
                <th>Document Type</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((document) => (
                  <tr key={document.id}>
                    <td>
                      <div className="documents-file-cell">
                        <div className="documents-file-icon">
                          {getFileIcon(document.documentName)}
                        </div>
                        <div>
                          <strong>{document.documentName}</strong>
                          <small>{document.studentId}</small>
                        </div>
                      </div>
                    </td>

                    <td>{document.studentName}</td>
                    <td>{document.type}</td>
                    <td>{document.date}</td>

                    <td>
                      <span className={`documents-status ${
                        document.status.toLowerCase()
                      }`}>
                        {document.status}
                      </span>
                    </td>

                    <td>
                      <div className="documents-actions">
                        {document.fileUrl && (
                          <>
                            <a
                              className="documents-action-btn view"
                              href={document.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              title="View document"
                            >
                              <Eye size={16} />
                            </a>

                            <a
                              className="documents-action-btn download"
                              href={document.fileUrl}
                              download={document.documentName}
                              title="Download document"
                            >
                              <Download size={16} />
                            </a>
                          </>
                        )}

                        {document.status === "Pending" && (
                          <>
                            <button
                              className="documents-action-btn approve"
                              title="Verify document"
                              onClick={() =>
                                updateDocumentStatus(document.id, "Verified")
                              }
                            >
                              <CheckCircle2 size={16} />
                            </button>

                            <button
                              className="documents-action-btn reject"
                              title="Reject document"
                              onClick={() =>
                                updateDocumentStatus(document.id, "Rejected")
                              }
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        <button
                          className="documents-action-btn delete"
                          title="Delete document"
                          onClick={() => setDeleteTarget(document)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="documents-empty">
                    <FolderOpen size={32} />
                    <strong>No documents found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showUpload && (
        <div
          className="documents-modal-overlay"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="documents-upload-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="documents-upload-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="documents-modal-close"
              onClick={() => setShowUpload(false)}
              aria-label="Close upload form"
            >
              <X size={19} />
            </button>

            <div className="documents-modal-icon">
              <Upload size={25} />
            </div>

            <h3 id="documents-upload-title">Upload Student Document</h3>
            <p className="documents-modal-subtitle">
              Select a student and add their document.
            </p>

            <form onSubmit={handleUpload}>
              <label className="documents-form-field">
                Student
                <select
                  value={form.studentId}
                  onChange={(event) =>
                    updateForm("studentId", event.target.value)
                  }
                  required
                >
                  <option value="">Choose Student</option>
                  {studentOptions.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} — {student.id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="documents-form-field">
                Document Type
                <select
                  value={form.type}
                  onChange={(event) => updateForm("type", event.target.value)}
                  required
                >
                  <option value="">Choose Document Type</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="documents-file-drop">
                <Upload size={25} />
                <strong>
                  {form.file ? form.file.name : "Choose a file to upload"}
                </strong>
                <span>PDF, JPG, JPEG or PNG · Maximum 5 MB</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    updateForm("file", event.target.files?.[0] || null)
                  }
                />
              </label>

              <div className="documents-upload-actions">
                <button
                  type="button"
                  className="documents-cancel-btn"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="documents-submit-btn">
                  <Upload size={16} />
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="documents-modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="documents-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="documents-delete-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="documents-modal-close"
              onClick={() => setDeleteTarget(null)}
              aria-label="Close delete dialog"
            >
              <X size={19} />
            </button>

            <div className="documents-delete-icon">
              <Trash2 size={26} />
            </div>

            <h3 id="documents-delete-title">Delete This Document?</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.documentName}</strong> belonging to{" "}
              <strong>{deleteTarget.studentName}</strong>?
              This action cannot be undone.
            </p>

            <div className="documents-delete-details">
              <span>Student ID</span>
              <strong>{deleteTarget.studentId}</strong>
              <span>Document Type</span>
              <strong>{deleteTarget.type}</strong>
            </div>

            <div className="documents-delete-actions">
              <button
                className="documents-cancel-btn"
                onClick={() => setDeleteTarget(null)}
              >
                Keep Document
              </button>
              <button
                className="documents-confirm-delete"
                onClick={confirmDelete}
              >
                <Trash2 size={16} />
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDocuments;
