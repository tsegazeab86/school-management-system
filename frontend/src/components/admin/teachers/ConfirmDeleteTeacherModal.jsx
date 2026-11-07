import { AlertCircle, Trash2, X } from "lucide-react";

import TeacherAvatar from "./TeacherAvatar";

function ConfirmDeleteTeacherModal({
  teacher,
  onCancel,
  onConfirm,
  error,
}) {
  if (!teacher) {
    return null;
  }

  return (
    <div
      className="admin-teachers-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="admin-teachers-modal admin-teachers-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-teachers-delete-title"
      >
        <div className="admin-teachers-modal-header">
          <div>
            <h2 id="admin-teachers-delete-title">Delete Teacher</h2>
            <p>This action permanently removes the teacher profile.</p>
          </div>

          <button
            type="button"
            className="admin-teachers-icon-btn"
            onClick={onCancel}
            aria-label="Close delete confirmation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-teachers-modal-body">
          <div className="admin-teachers-confirm-summary">
            <TeacherAvatar teacher={teacher} size="lg" />
            <div>
              <strong>{teacher.fullName}</strong>
              <span>
                {teacher.teacherId}
                {teacher.department ? ` · ${teacher.department}` : ""}
              </span>
            </div>
          </div>

          <div className="admin-teachers-confirm-warning">
            <AlertCircle size={18} />
            <p>
              This permanently deletes <strong>{teacher.fullName}</strong>{" "}
              from the teacher directory. The action cannot be undone.
              Student, parent, staff, and user account records are not
              affected.
            </p>
          </div>

          {error && (
            <div className="admin-teachers-form-alert">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="admin-teachers-modal-footer">
          <button
            type="button"
            className="admin-teachers-btn admin-teachers-btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="admin-teachers-btn admin-teachers-btn-danger"
            onClick={onConfirm}
          >
            <Trash2 size={16} />
            Delete Teacher
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteTeacherModal;
