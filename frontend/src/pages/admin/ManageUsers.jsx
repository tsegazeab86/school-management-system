import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Users,
  UserCheck,
  UserX,
  Download,
  ShieldCheck,
} from "lucide-react";
import "../../styles/admin/ManageUsers.css";

const initialUsers = [
  {
    id: 1,
    name: "Abebe Kebede",
    email: "abebe@school.com",
    phone: "0912345678",
    role: "Administrator",
    status: "Active",
  },
  {
    id: 2,
    name: "Martha Alemu",
    email: "martha@school.com",
    phone: "0923456789",
    role: "Teacher",
    status: "Active",
  },
  {
    id: 3,
    name: "Dawit Bekele",
    email: "dawit@school.com",
    phone: "0934567890",
    role: "Student",
    status: "Active",
  },
  {
    id: 4,
    name: "Selamawit Tesfaye",
    email: "selam@school.com",
    phone: "0945678901",
    role: "Parent",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Yohannes Tadesse",
    email: "yohannes@school.com",
    phone: "0956789012",
    role: "Accountant",
    status: "Active",
  },
  {
    id: 6,
    name: "Hana Getachew",
    email: "hana@school.com",
    phone: "0967890123",
    role: "Librarian",
    status: "Active",
  },
];

const roles = [
  "Administrator",
  "Teacher",
  "Student",
  "Parent",
  "Accountant",
  "Librarian",
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "Student",
  status: "Active",
};

function ManageUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        user.name.toLowerCase().includes(searchText) ||
        user.email.toLowerCase().includes(searchText) ||
        user.phone.includes(searchText);

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
    setEditingId(user.id);
    setError("");
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailExists = users.some(
      (user) =>
        user.email.toLowerCase() === form.email.trim().toLowerCase() &&
        user.id !== editingId
    );

    if (emailExists) {
      setError("This email address is already registered.");
      return;
    }

    if (editingId) {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === editingId
            ? { ...form, id: editingId }
            : user
        )
      );
    } else {
      setUsers((previous) => [
        ...previous,
        {
          ...form,
          id: Date.now(),
        },
      ]);
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user account?"
    );

    if (confirmed) {
      setUsers((previous) =>
        previous.filter((user) => user.id !== id)
      );
    }
  };

  const toggleStatus = (id) => {
    setUsers((previous) =>
      previous.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Role", "Status"];

    const rows = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.phone,
      user.role,
      user.status,
    ]);

    const csv = [headers, ...rows]
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
    link.download = "school-users.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const getRoleClass = (role) => {
    return role.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <p className="users-breadcrumb">Administrator / Users</p>
          <h1>Manage Users</h1>
          <p className="users-subtitle">
            Manage user accounts, roles, and access status.
          </p>
        </div>

        <button className="users-primary-btn" onClick={openAddForm}>
          <Plus size={18} />
          Add New User
        </button>
      </div>

      {/* Statistics */}
      <div className="users-stats">
        <div className="users-stat-card">
          <div className="users-stat-icon purple">
            <Users size={23} />
          </div>
          <div>
            <p>Total Users</p>
            <h2>{users.length}</h2>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon green">
            <UserCheck size={23} />
          </div>
          <div>
            <p>Active Users</p>
            <h2>{activeUsers}</h2>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon orange">
            <UserX size={23} />
          </div>
          <div>
            <p>Inactive Users</p>
            <h2>{inactiveUsers}</h2>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon blue">
            <ShieldCheck size={23} />
          </div>
          <div>
            <p>User Roles</p>
            <h2>{roles.length}</h2>
          </div>
        </div>
      </div>

      {/* User table */}
      <div className="users-content">
        <div className="users-toolbar">
          <div className="users-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="users-filter"
          >
            <option value="All">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="users-filter"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button className="users-export-btn" onClick={exportCSV}>
            <Download size={17} />
            Export CSV
          </button>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Access</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{user.phone || "Not provided"}</td>

                    <td>
                      <span className={`user-role ${getRoleClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`user-status ${
                          user.status === "Active" ? "active" : "inactive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className={`user-toggle ${
                          user.status === "Active" ? "enabled" : "disabled"
                        }`}
                        onClick={() => toggleStatus(user.id)}
                      >
                        {user.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>

                    <td>
                      <div className="user-actions">
                        <button
                          title="View user"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Edit user"
                          onClick={() => openEditForm(user)}
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          title="Delete user"
                          className="user-delete-action"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="users-empty">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="users-footer">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Add and Edit Modal */}
      {showForm && (
        <div className="users-modal-overlay">
          <div className="users-modal">
            <div className="users-modal-header">
              <div>
                <h2>{editingId ? "Edit User" : "Add New User"}</h2>
                <p>Enter the user account information.</p>
              </div>

              <button
                className="users-close-btn"
                onClick={() => setShowForm(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="users-form-grid">
                <div className="users-form-group">
                  <label>Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="users-form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@school.com"
                    required
                  />
                </div>

                <div className="users-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="09XXXXXXXX"
                  />
                </div>

                <div className="users-form-group">
                  <label>User Role *</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="users-form-group">
                  <label>Account Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              {error && <p className="users-form-error">{error}</p>}

              <div className="users-modal-actions">
                <button
                  type="button"
                  className="users-cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="users-save-btn">
                  {editingId ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {selectedUser && (
        <div className="users-modal-overlay">
          <div className="users-modal users-details-modal">
            <div className="users-modal-header">
              <div>
                <h2>User Details</h2>
                <p>Account information and assigned role.</p>
              </div>

              <button
                className="users-close-btn"
                onClick={() => setSelectedUser(null)}
              >
                <X size={21} />
              </button>
            </div>

            <div className="users-details-avatar">
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>

            <h3 className="users-details-name">{selectedUser.name}</h3>

            <div className="users-details-list">
              <p>
                <span>Email</span>
                <strong>{selectedUser.email}</strong>
              </p>
              <p>
                <span>Phone</span>
                <strong>{selectedUser.phone || "Not provided"}</strong>
              </p>
              <p>
                <span>Role</span>
                <strong>{selectedUser.role}</strong>
              </p>
              <p>
                <span>Status</span>
                <strong>{selectedUser.status}</strong>
              </p>
            </div>

            <button
              className="users-save-btn users-details-close"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;