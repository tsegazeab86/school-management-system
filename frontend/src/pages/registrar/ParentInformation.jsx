
import { useEffect, useMemo, useState } from "react";
import {
    Users,
    UserPlus,
    Search,
    Eye,
    Edit,
    Trash2,
    X,
    Save,
    Upload,
    Phone,
    Mail,
    MapPin,
    User,
    Heart,
    AlertTriangle,
} from "lucide-react";

import {
    getParents,
    saveParents,
} from "../../utils/registrar/parentStorage";

import "../../styles/registrar/ParentInformation.css";

const initialParents = [
    {
        id: 1,
        name: "Abebe Kebede",
        phone: "0912345678",
        email: "abebe@example.com",
        relationship: "Father",
        address: "Injibara",
        photo: "",
    },
    {
        id: 2,
        name: "Almaz Tesfaye",
        phone: "0923456789",
        email: "almaz@example.com",
        relationship: "Mother",
        address: "Injibara",
        photo: "",
    },
    {
        id: 3,
        name: "Mekdes Worku",
        phone: "0934567890",
        email: "mekdes@example.com",
        relationship: "Guardian",
        address: "Bahir Dar",
        photo: "",
    },
];

const emptyForm = {
    name: "",
    phone: "",
    email: "",
    relationship: "",
    address: "",
    photo: "",
};

function ParentInformation() {
    const [parents, setParents] = useState(() => {
        const savedParents = getParents();

        return savedParents.length > 0
            ? savedParents
            : initialParents;
    });

    const [search, setSearch] = useState("");
    const [relationshipFilter, setRelationshipFilter] = useState("All");

    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const [editingParent, setEditingParent] = useState(null);
    const [selectedParent, setSelectedParent] = useState(null);
    const [deleteParent, setDeleteParent] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [message, setMessage] = useState("");
    const [formError, setFormError] = useState("");

    // Save initial data if localStorage is empty
    useEffect(() => {
        if (getParents().length === 0) {
            saveParents(initialParents);
        }
    }, []);

    // Listen for parent data added from Student Registration
    useEffect(() => {
        const updateParents = () => {
            setParents(getParents());
        };

        window.addEventListener("parentsUpdated", updateParents);

        return () => {
            window.removeEventListener(
                "parentsUpdated",
                updateParents
            );
        };
    }, []);

    // Statistics
    const totalParents = parents.length;

    const totalMothers = parents.filter(
        (parent) => parent.relationship === "Mother"
    ).length;

    const totalFathers = parents.filter(
        (parent) => parent.relationship === "Father"
    ).length;

    const totalGuardians = parents.filter(
        (parent) =>
            parent.relationship === "Guardian" ||
            parent.relationship === "Other"
    ).length;

    // Search and filter
    const filteredParents = useMemo(() => {
        return parents.filter((parent) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                (parent.name || "").toLowerCase().includes(searchValue) ||
                (parent.phone || "").toLowerCase().includes(searchValue) ||
                (parent.email || "").toLowerCase().includes(searchValue);

            const matchesRelationship =
                relationshipFilter === "All" ||
                parent.relationship === relationshipFilter;

            return matchesSearch && matchesRelationship;
        });
    }, [parents, search, relationshipFilter]);

    // Open add form
    const handleAdd = () => {
        setEditingParent(null);
        setForm(emptyForm);
        setFormError("");
        setShowForm(true);
    };

    // Open edit form
    const handleEdit = (parent) => {
        setEditingParent(parent);

        setForm({
            name: parent.name || "",
            phone: parent.phone || "",
            email: parent.email || "",
            relationship: parent.relationship || "",
            address: parent.address || "",
            photo: parent.photo || "",
        });

        setFormError("");
        setShowForm(true);
    };

    // Form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setFormError("");
    };

    // Upload parent photo
    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFormError("Please select an image file.");
            e.target.value = "";
            return;
        }

        if (file.size > 1024 * 1024) {
            setFormError("Photo must be 1 MB or smaller.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setForm((prev) => ({
                ...prev,
                photo: reader.result,
            }));
        };

        reader.readAsDataURL(file);
    };

    // Save parent
    const handleSave = (e) => {
        e.preventDefault();

        if (
            !form.name.trim() ||
            !form.phone.trim() ||
            !form.relationship
        ) {
            setFormError(
                "Name, phone and relationship are required."
            );
            return;
        }

        if (!/^\+?[0-9]{9,15}$/.test(form.phone.trim())) {
            setFormError("Please enter a valid phone number.");
            return;
        }

        if (
            form.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ) {
            setFormError("Please enter a valid email address.");
            return;
        }

        const duplicate = parents.find(
            (parent) =>
                parent.phone === form.phone.trim() &&
                parent.id !== editingParent?.id
        );

        if (duplicate) {
            setFormError(
                "A parent with this phone number already exists."
            );
            return;
        }

        let updatedParents;

        if (editingParent) {
            updatedParents = parents.map((parent) =>
                parent.id === editingParent.id
                    ? {
                        ...parent,
                        ...form,
                        name: form.name.trim(),
                        phone: form.phone.trim(),
                    }
                    : parent
            );
        } else {
            updatedParents = [
                ...parents,
                {
                    ...form,
                    id: Date.now(),
                    name: form.name.trim(),
                    phone: form.phone.trim(),
                },
            ];
        }

        saveParents(updatedParents);
        setParents(updatedParents);

        setShowForm(false);
        setEditingParent(null);
        setForm(emptyForm);
        setFormError("");

        setMessage(
            editingParent
                ? "Parent information updated successfully."
                : "Parent information added successfully."
        );
    };

    // View parent details
    const handleView = (parent) => {
        setSelectedParent(parent);
        setShowDetails(true);
    };

    // Open delete confirmation
    const handleDeleteClick = (parent) => {
        setDeleteParent(parent);
        setShowDelete(true);
    };

    // Confirm delete
    const confirmDelete = () => {
        if (!deleteParent) return;

        const updatedParents = parents.filter(
            (parent) => parent.id !== deleteParent.id
        );

        saveParents(updatedParents);
        setParents(updatedParents);

        setShowDelete(false);
        setDeleteParent(null);

        setMessage("Parent information deleted successfully.");
    };

    const closeMessage = () => {
        setMessage("");
    };

    return (
        <div className="parent-page">

            {/* Page Heading */}
            <div className="parent-heading">
                <div>
                    <h2>Parent Information</h2>
                    <p>
                        Manage parent and guardian contact information.
                    </p>
                </div>

                <button
                    type="button"
                    className="parent-add-btn"
                    onClick={handleAdd}
                >
                    <UserPlus size={18} />
                    Add Parent
                </button>
            </div>

            {/* Success Message */}
            {message && (
                <div className="parent-message">
                    <span>{message}</span>

                    <button
                        type="button"
                        onClick={closeMessage}
                        aria-label="Close message"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* Statistics */}
            <div className="parent-stat-grid">
                <div className="parent-stat-card">
                    <div className="parent-stat-icon">
                        <Users size={23} />
                    </div>
                    <div>
                        <h3>{totalParents}</h3>
                        <p>Total Parents</p>
                    </div>
                </div>

                <div className="parent-stat-card">
                    <div className="parent-stat-icon mother-icon">
                        <User size={23} />
                    </div>
                    <div>
                        <h3>{totalMothers}</h3>
                        <p>Mothers</p>
                    </div>
                </div>

                <div className="parent-stat-card">
                    <div className="parent-stat-icon father-icon">
                        <User size={23} />
                    </div>
                    <div>
                        <h3>{totalFathers}</h3>
                        <p>Fathers</p>
                    </div>
                </div>

                <div className="parent-stat-card">
                    <div className="parent-stat-icon guardian-icon">
                        <Heart size={23} />
                    </div>
                    <div>
                        <h3>{totalGuardians}</h3>
                        <p>Guardians / Other</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="parent-toolbar">
                <div className="parent-search">
                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search parent name, phone or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={relationshipFilter}
                    onChange={(e) =>
                        setRelationshipFilter(e.target.value)
                    }
                >
                    <option value="All">All Relationships</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Parent Table */}
            <div className="parent-table-card">
                <div className="parent-table-title">
                    <h3>Parents and Guardians</h3>
                    <p>
                        View and manage registered parent information.
                    </p>
                </div>

                <div className="parent-table-wrap">
                    <table className="parent-table">
                        <thead>
                            <tr>
                                <th>Parent / Guardian</th>
                                <th>Contact Information</th>
                                <th>Address</th>
                                <th>Relationship</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredParents.length > 0 ? (
                                filteredParents.map((parent) => (
                                    <tr key={parent.id}>
                                        <td>
                                            <div className="parent-name-cell">
                                                <div className="parent-avatar">
                                                    {parent.photo ? (
                                                        <img
                                                            src={parent.photo}
                                                            alt={parent.name}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    ) : (
                                                        (parent.name || "?")
                                                            .charAt(0)
                                                            .toUpperCase()
                                                    )}
                                                </div>

                                                <strong>
                                                    {parent.name}
                                                </strong>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="parent-contact">
                                                <span>
                                                    <Phone size={14} />
                                                    {parent.phone}
                                                </span>

                                                <span>
                                                    <Mail size={14} />
                                                    {parent.email || "No email"}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="parent-address">
                                                <MapPin size={14} />
                                                {parent.address || "Not provided"}
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`parent-relation ${
                                                    (parent.relationship || "")
                                                        .toLowerCase()
                                                }`}
                                            >
                                                {parent.relationship}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="parent-actions">
                                                <button
                                                    type="button"
                                                    title="View"
                                                    onClick={() =>
                                                        handleView(parent)
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Edit"
                                                    onClick={() =>
                                                        handleEdit(parent)
                                                    }
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete"
                                                    title="Delete"
                                                    onClick={() =>
                                                        handleDeleteClick(parent)
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="parent-empty"
                                    >
                                        No parent records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add / Edit Modal */}
            {showForm && (
                <div
                    className="parent-modal-overlay"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowForm(false);
                        }
                    }}
                >
                    <div className="parent-modal">
                        <div className="parent-modal-header">
                            <div>
                                <h3>
                                    {editingParent
                                        ? "Edit Parent"
                                        : "Add New Parent"}
                                </h3>

                                <p>
                                    Enter parent or guardian information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                aria-label="Close"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            {/* Photo */}
                            <div className="parent-photo-section">
                                <label className="parent-photo-upload">
                                    {form.photo ? (
                                        <img
                                            src={form.photo}
                                            alt="Parent preview"
                                        />
                                    ) : (
                                        <span className="parent-photo-placeholder">
                                            <Upload size={25} />
                                            Upload Photo
                                        </span>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                    />
                                </label>

                                <div className="parent-photo-help">
                                    <strong>Parent Photo</strong>
                                    <p>
                                        Upload a profile image.
                                        Maximum file size: 1 MB.
                                    </p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="parent-form-grid">
                                <div className="parent-form-group">
                                    <label>Full Name *</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div className="parent-form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleFormChange}
                                        placeholder="09XXXXXXXX"
                                        required
                                    />
                                </div>

                                <div className="parent-form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleFormChange}
                                        placeholder="example@email.com"
                                    />
                                </div>

                                <div className="parent-form-group">
                                    <label>Relationship *</label>
                                    <select
                                        name="relationship"
                                        value={form.relationship}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">
                                            Select relationship
                                        </option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Guardian">Guardian</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="parent-form-group">
                                    <label>Address</label>
                                    <input
                                        name="address"
                                        value={form.address}
                                        onChange={handleFormChange}
                                        placeholder="Enter address"
                                    />
                                </div>
                            </div>

                            {formError && (
                                <p className="parent-form-error">
                                    {formError}
                                </p>
                            )}

                            <div className="parent-modal-actions">
                                <button
                                    type="button"
                                    className="parent-cancel"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="parent-save"
                                >
                                    <Save size={16} />
                                    {editingParent
                                        ? "Update Parent"
                                        : "Save Parent"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Parent Details Modal */}
            {showDetails && selectedParent && (
                <div className="parent-modal-overlay">
                    <div className="parent-modal">
                        <div className="parent-modal-header">
                            <div>
                                <h3>Parent Details</h3>
                                <p>Complete parent information.</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowDetails(false)}
                                aria-label="Close"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <div className="parent-details-profile">
                            <div className="parent-details-avatar">
                                {selectedParent.photo ? (
                                    <img
                                        src={selectedParent.photo}
                                        alt={selectedParent.name}
                                    />
                                ) : (
                                    (selectedParent.name || "?")
                                        .charAt(0)
                                        .toUpperCase()
                                )}
                            </div>

                            <h3>{selectedParent.name}</h3>

                            <span>{selectedParent.relationship}</span>
                        </div>

                        <div className="parent-detail-list">
                            <div>
                                <Phone size={17} />
                                <span>Phone</span>
                                <strong>{selectedParent.phone}</strong>
                            </div>

                            <div>
                                <Mail size={17} />
                                <span>Email</span>
                                <strong>
                                    {selectedParent.email || "Not provided"}
                                </strong>
                            </div>

                            <div>
                                <MapPin size={17} />
                                <span>Address</span>
                                <strong>
                                    {selectedParent.address || "Not provided"}
                                </strong>
                            </div>

                            <div>
                                <Heart size={17} />
                                <span>Relation</span>
                                <strong>{selectedParent.relationship}</strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="parent-details-close"
                            onClick={() => setShowDetails(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDelete && deleteParent && (
                <div className="parent-modal-overlay">
                    <div className="parent-delete-modal">
                        <div className="parent-delete-icon">
                            <AlertTriangle size={27} />
                        </div>

                        <h3>Delete Parent?</h3>

                        <p>
                            Are you sure you want to delete
                            {" "}
                            <strong>{deleteParent.name}</strong>
                            {" "}?
                            This action cannot be undone.
                        </p>

                        <div className="parent-modal-actions">
                            <button
                                type="button"
                                className="parent-cancel"
                                onClick={() => {
                                    setShowDelete(false);
                                    setDeleteParent(null);
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="parent-delete-confirm"
                                onClick={confirmDelete}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ParentInformation;
