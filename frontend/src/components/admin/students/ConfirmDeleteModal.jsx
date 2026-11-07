import { AlertCircle, Trash2, X } from "lucide-react";

import StudentAvatar from "./StudentAvatar";

function ConfirmDeleteModal({
  student,
  onCancel,
  onConfirm,
  error,
}) {
  if (!student) {
    return null;
  }

  return (
    <div
      className="admin-students-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="admin-students-modal admin-students-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-students-delete-title"
      >
        <div className="admin-students-modal-header">
          <div>
            <h2 id="admin-students-delete-title">Delete Student</h2>
            <p>This action permanently removes the student profile.</p>
          </div>

          <button
            type="button"
            className="admin-students-icon-btn"
            onClick={onCancel}
            aria-label="Close delete confirmation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-students-modal-body">
          <div className="admin-students-confirm-summary">
            <StudentAvatar student={student} size="lg" />
            <div>
              <strong>{student.fullName}</strong>
              <span>
                {student.studentNumber} · {student.grade}
                {student.section ? ` - ${student.section}` : ""}
              </span>
            </div>
          </div>

          <div className="admin-students-confirm-warning">
            <AlertCircle size={18} />
            <p>
              The student profile and guardian details will be removed from
              this browser. Login accounts and other modules are not
              affected.
            </p>
          </div>

          {error && (
            <div className="admin-students-form-alert">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="admin-students-modal-footer">
          <button
            type="button"
            className="admin-students-btn admin-students-btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="admin-students-btn admin-students-btn-danger"
            onClick={onConfirm}
          >
            <Trash2 size={16} />
            Delete Student
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
