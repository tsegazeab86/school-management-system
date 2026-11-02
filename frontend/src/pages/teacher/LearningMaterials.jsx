
import { useMemo, useRef, useState } from "react";
import {
    Search,
    Plus,
    BookOpen,
    FileText,
    FileImage,
    FileSpreadsheet,
    Presentation,
    Download,
    Trash2,
    Edit,
    Eye,
    Upload,
    Link,
    X,
    FolderOpen,
    Filter,
    ExternalLink,
    File,
} from "lucide-react";

import "./LearningMaterials.css";

const initialMaterials = [
    {
        id: 1,
        title: "Introduction to Mathematics",
        description: "Basic mathematics concepts for Grade 10 students.",
        category: "Notes",
        className: "Grade 10A",
        type: "PDF",
        fileName: "mathematics-notes.pdf",
        size: "2.4 MB",
        date: "2026-10-20",
        url: "",
        fileUrl: "",
    },
    {
        id: 2,
        title: "Computer Science Chapter 1",
        description: "Introduction to computer science and computers.",
        category: "Lecture",
        className: "Grade 10B",
        type: "PPT",
        fileName: "computer-science.pptx",
        size: "4.1 MB",
        date: "2026-10-22",
        url: "",
        fileUrl: "",
    },
    {
        id: 3,
        title: "English Grammar Exercises",
        description: "Grammar exercises and practice questions.",
        category: "Assignment",
        className: "Grade 11A",
        type: "DOC",
        fileName: "english-exercises.docx",
        size: "1.2 MB",
        date: "2026-10-24",
        url: "",
        fileUrl: "",
    },
    {
        id: 4,
        title: "Physics Diagrams",
        description: "Important diagrams for physics lessons.",
        category: "Images",
        className: "Grade 11B",
        type: "IMAGE",
        fileName: "physics-diagrams.png",
        size: "1.8 MB",
        date: "2026-10-25",
        url: "",
        fileUrl: "",
    },
];

const emptyForm = {
    title: "",
    description: "",
    category: "Notes",
    className: "Grade 10A",
    url: "",
};

function getFileType(fileName = "") {
    const extension = fileName.split(".").pop().toLowerCase();

    if (extension === "pdf") return "PDF";

    if (["doc", "docx"].includes(extension)) return "DOC";

    if (["ppt", "pptx"].includes(extension)) return "PPT";

    if (["xls", "xlsx", "csv"].includes(extension)) return "EXCEL";

    if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
        return "IMAGE";
    }

    return "FILE";
}

function getFileIcon(type) {
    switch (type) {
        case "PDF":
        case "DOC":
            return FileText;
        case "PPT":
            return Presentation;
        case "EXCEL":
            return FileSpreadsheet;
        case "IMAGE":
            return FileImage;
        default:
            return File;
    }
}

function formatSize(bytes) {
    if (!bytes) return "External link";

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function LearningMaterials() {
    const [materials, setMaterials] = useState(initialMaterials);
    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    // const [selectedMaterial, setSelectedMaterial] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileError, setFileError] = useState("");

    const fileInputRef = useRef(null);

    const filteredMaterials = useMemo(() => {
        return materials.filter((item) => {
            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());

            const matchesClass =
                classFilter === "All" || item.className === classFilter;

            const matchesCategory =
                categoryFilter === "All" || item.category === categoryFilter;

            return matchesSearch && matchesClass && matchesCategory;
        });
    }, [materials, search, classFilter, categoryFilter]);

    const pdfCount = materials.filter((item) => item.type === "PDF").length;

    const linkCount = materials.filter((item) => item.url).length;

    const classCount = new Set(
        materials.map((item) => item.className)
    ).size;

    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setSelectedFile(null);
        setFileError("");
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);

        setForm({
            title: item.title,
            description: item.description,
            category: item.category,
            className: item.className,
            url: item.url || "",
        });

        setSelectedFile(null);
        setFileError("");
        setShowModal(true);
    };

    const updateField = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleFile = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
            setFileError("This file type is not supported.");
            setSelectedFile(null);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setFileError("File size must be less than 10MB.");
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
        setFileError("");
        setForm((previous) => ({ ...previous, url: "" }));
    };

    const saveMaterial = (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            alert("Please enter a material title.");
            return;
        }

        if (!selectedFile && !form.url.trim() && !editingId) {
            setFileError("Please upload a file or enter a resource URL.");
            return;
        }

        if (form.url && !/^https?:\/\//i.test(form.url)) {
            setFileError("Please enter a valid URL starting with http:// or https://.");
            return;
        }

        const oldItem = materials.find((item) => item.id === editingId);

        const newMaterial = {
            id: editingId || Date.now(),
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            className: form.className,
            type: selectedFile
                ? getFileType(selectedFile.name)
                : form.url
                    ? "LINK"
                    : oldItem?.type || "FILE",
            fileName: selectedFile?.name || (
                form.url ? "External resource" : oldItem?.fileName || ""
            ),
            size: selectedFile
                ? formatSize(selectedFile.size)
                : form.url
                    ? "External link"
                    : oldItem?.size || "",
            date: new Date().toISOString().slice(0, 10),
            url: form.url.trim(),
            fileUrl: selectedFile
                ? URL.createObjectURL(selectedFile)
                : form.url
                    ? ""
                    : oldItem?.fileUrl || "",
        };

        if (editingId) {
            setMaterials((previous) =>
                previous.map((item) =>
                    item.id === editingId ? newMaterial : item
                )
            );
        } else {
            setMaterials((previous) => [newMaterial, ...previous]);
        }

        setShowModal(false);
        setForm(emptyForm);
        setSelectedFile(null);
    };

    const deleteMaterial = (id) => {
        if (!window.confirm("Delete this learning material?")) return;

        setMaterials((previous) =>
            previous.filter((item) => item.id !== id)
        );
    };

    const openMaterial = (item) => {
        if (item.url) {
            window.open(item.url, "_blank", "noopener,noreferrer");
            return;
        }

        if (item.fileUrl) {
            window.open(item.fileUrl, "_blank", "noopener,noreferrer");
            return;
        }

        alert("This is sample material. Upload a real file to preview it.");
    };

    const downloadMaterial = (item) => {
        if (item.fileUrl) {
            const link = document.createElement("a");
            link.href = item.fileUrl;
            link.download = item.fileName || "learning-material";
            document.body.appendChild(link);
            link.click();
            link.remove();
            return;
        }

        if (item.url) {
            window.open(item.url, "_blank", "noopener,noreferrer");
            return;
        }

        alert("This is sample material. Upload a real file to download it.");
    };

    return (
        <div className="learning-page">

            {/* Header */}
            <div className="learning-header">
                <div>
                    <span className="learning-breadcrumb">
                        Teacher / Learning Materials
                    </span>

                    <h1>Learning Materials</h1>

                    <p>
                        Upload and share educational resources with your students.
                    </p>
                </div>

                <button
                    className="learning-add-btn"
                    onClick={openAddModal}
                >
                    <Plus size={19} />
                    Add Material
                </button>
            </div>

            {/* Statistics */}
            <div className="learning-stats">

                <div className="learning-stat-card">
                    <div className="learning-stat-icon purple">
                        <FolderOpen size={25} />
                    </div>
                    <div>
                        <span>Total Materials</span>
                        <h2>{materials.length}</h2>
                        <small>Available resources</small>
                    </div>
                </div>

                <div className="learning-stat-card">
                    <div className="learning-stat-icon red">
                        <FileText size={25} />
                    </div>
                    <div>
                        <span>PDF Documents</span>
                        <h2>{pdfCount}</h2>
                        <small>PDF learning notes</small>
                    </div>
                </div>

                <div className="learning-stat-card">
                    <div className="learning-stat-icon blue">
                        <Link size={25} />
                    </div>
                    <div>
                        <span>External Links</span>
                        <h2>{linkCount}</h2>
                        <small>Online resources</small>
                    </div>
                </div>

                <div className="learning-stat-card">
                    <div className="learning-stat-icon orange">
                        <BookOpen size={25} />
                    </div>
                    <div>
                        <span>Classes</span>
                        <h2>{classCount}</h2>
                        <small>Classes with materials</small>
                    </div>
                </div>

            </div>

            {/* Main content */}
            <div className="learning-content">

                <div className="learning-content-heading">
                    <div>
                        <h2>Resource Library</h2>
                        <p>Manage your uploaded educational materials.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="learning-filters">

                    <div className="learning-search">
                        <Search size={19} />
                        <input
                            placeholder="Search materials..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="learning-filter">
                        <Filter size={17} />
                        <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                        >
                            <option value="All">All Classes</option>
                            <option>Grade 10A</option>
                            <option>Grade 10B</option>
                            <option>Grade 11A</option>
                            <option>Grade 11B</option>
                        </select>
                    </div>

                    <div className="learning-filter">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option>Notes</option>
                            <option>Lecture</option>
                            <option>Assignment</option>
                            <option>Images</option>
                            <option>Other</option>
                        </select>
                    </div>

                </div>

                {/* Materials grid */}
                <div className="learning-grid">

                    {filteredMaterials.map((item) => {
                        const Icon = getFileIcon(item.type);

                        return (
                            <div className="learning-card" key={item.id}>

                                <div className={`learning-file-icon ${item.type.toLowerCase()}`}>
                                    {item.type === "LINK" ? (
                                        <ExternalLink size={29} />
                                    ) : (
                                        <Icon size={29} />
                                    )}
                                </div>

                                <div className="learning-card-top">
                                    <span className="learning-category">
                                        {item.category}
                                    </span>

                                    <span className="learning-file-type">
                                        {item.type}
                                    </span>
                                </div>

                                <h3>{item.title}</h3>

                                <p className="learning-description">
                                    {item.description}
                                </p>

                                <div className="learning-card-meta">
                                    <span>
                                        <BookOpen size={15} />
                                        {item.className}
                                    </span>

                                    <span>{item.size}</span>
                                </div>

                                <div className="learning-card-date">
                                    Added: {item.date}
                                </div>

                                <div className="learning-card-actions">

                                    <button
                                        className="learning-view-btn"
                                        onClick={() => {
                                            // setSelectedMaterial(item);
                                            openMaterial(item);
                                        }}
                                    >
                                        <Eye size={16} />
                                        Open
                                    </button>

                                    <button
                                        className="learning-download-btn"
                                        onClick={() => downloadMaterial(item)}
                                        title="Download"
                                    >
                                        <Download size={16} />
                                    </button>

                                    <button
                                        className="learning-edit-btn"
                                        onClick={() => openEditModal(item)}
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>

                                    <button
                                        className="learning-delete-btn"
                                        onClick={() => deleteMaterial(item.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>

                            </div>
                        );
                    })}

                    {filteredMaterials.length === 0 && (
                        <div className="learning-empty">
                            <FolderOpen size={42} />
                            <h3>No materials found</h3>
                            <p>Try another search or add a new material.</p>
                        </div>
                    )}

                </div>

                <div className="learning-results">
                    Showing {filteredMaterials.length} of {materials.length} materials
                </div>

            </div>

            {/* Add/Edit modal */}
            {showModal && (
                <div
                    className="learning-modal-overlay"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="learning-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="learning-modal-header">
                            <div>
                                <h2>{editingId ? "Edit Material" : "Upload Learning Material"}</h2>
                                <p>Add a document or share an online resource.</p>
                            </div>

                            <button onClick={() => setShowModal(false)}>
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={saveMaterial}>

                            <div className="learning-form-group">
                                <label>Material Title *</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={updateField}
                                    placeholder="Enter material title"
                                    required
                                />
                            </div>

                            <div className="learning-form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={updateField}
                                    placeholder="Describe this learning material..."
                                    rows="3"
                                />
                            </div>

                            <div className="learning-form-row">

                                <div className="learning-form-group">
                                    <label>Category</label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={updateField}
                                    >
                                        <option>Notes</option>
                                        <option>Lecture</option>
                                        <option>Assignment</option>
                                        <option>Images</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="learning-form-group">
                                    <label>Assign Class</label>
                                    <select
                                        name="className"
                                        value={form.className}
                                        onChange={updateField}
                                    >
                                        <option>Grade 10A</option>
                                        <option>Grade 10B</option>
                                        <option>Grade 11A</option>
                                        <option>Grade 11B</option>
                                    </select>
                                </div>

                            </div>

                            {/* File upload */}
                            <div className="learning-form-group">
                                <label>Upload Document / Image</label>

                                <div
                                    className="learning-upload-area"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={30} />

                                    <strong>
                                        {selectedFile
                                            ? selectedFile.name
                                            : "Click to upload a file"}
                                    </strong>

                                    <span>
                                        PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG (Max 10MB)
                                    </span>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp,.gif"
                                        onChange={handleFile}
                                        hidden
                                    />
                                </div>
                            </div>

                            <div className="learning-or">
                                <span>OR</span>
                            </div>

                            {/* External URL */}
                            <div className="learning-form-group">
                                <label>External Resource URL</label>

                                <div className="learning-url-input">
                                    <Link size={18} />

                                    <input
                                        name="url"
                                        type="url"
                                        value={form.url}
                                        onChange={updateField}
                                        placeholder="https://example.com/learning-resource"
                                    />
                                </div>

                                <small>
                                    Paste a link to Google Drive, YouTube or another resource.
                                    Make sure students have permission to access it.
                                </small>
                            </div>

                            {fileError && (
                                <p className="learning-file-error">{fileError}</p>
                            )}

                            <div className="learning-modal-footer">

                                <button
                                    type="button"
                                    className="learning-cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="learning-save-btn"
                                >
                                    {editingId ? "Update Material" : "Save Material"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}

export default LearningMaterials;
