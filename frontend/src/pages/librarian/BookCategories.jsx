
import   { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  FolderOpen,
  BookOpen,
  Edit,
  Trash2,
  X,
  Save,
  Tag,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "./BookCategories.css";

const initialCategories = [
  {
    id: 1,
    name: "Computer Science",
    code: "CS",
    description: "Programming, computers, software and technology.",
    bookCount: 35,
    status: "Active",
  },
  {
    id: 2,
    name: "Mathematics",
    code: "MATH",
    description: "Algebra, geometry, statistics and mathematics.",
    bookCount: 42,
    status: "Active",
  },
  {
    id: 3,
    name: "Science",
    code: "SCI",
    description: "Physics, chemistry and general science books.",
    bookCount: 28,
    status: "Active",
  },
  {
    id: 4,
    name: "Language",
    code: "LANG",
    description: "English, grammar and other language books.",
    bookCount: 31,
    status: "Active",
  },
  {
    id: 5,
    name: "History",
    code: "HIST",
    description: "World history and historical studies.",
    bookCount: 18,
    status: "Active",
  },
  {
    id: 6,
    name: "Biology",
    code: "BIO",
    description: "Life sciences and biological studies.",
    bookCount: 20,
    status: "Inactive",
  },
];

const emptyForm = {
  name: "",
  code: "",
  description: "",
};

export default function BookCategories() {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const filteredCategories = categories.filter((category) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      category.name.toLowerCase().includes(keyword) ||
      category.code.toLowerCase().includes(keyword) ||
      category.description.toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "All" || category.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalBooks = categories.reduce(
    (sum, category) => sum + category.bookCount,
    0
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      code: category.code,
      description: category.description,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const description = form.description.trim();

    if (!name || !code) {
      setError("Category name and code are required.");
      return;
    }

    const duplicate = categories.some(
      (category) =>
        category.id !== editingId &&
        (category.name.toLowerCase() === name.toLowerCase() ||
          category.code.toLowerCase() === code.toLowerCase())
    );

    if (duplicate) {
      setError("A category with this name or code already exists.");
      return;
    }

    if (editingId) {
      setCategories((previous) =>
        previous.map((category) =>
          category.id === editingId
            ? { ...category, name, code, description }
            : category
        )
      );
    } else {
      setCategories((previous) => [
        ...previous,
        {
          id: Date.now(),
          name,
          code,
          description,
          bookCount: 0,
          status: "Active",
        },
      ]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const toggleStatus = (id) => {
    setCategories((previous) =>
      previous.map((category) =>
        category.id === id
          ? {
              ...category,
              status:
                category.status === "Active" ? "Inactive" : "Active",
            }
          : category
      )
    );
  };

  const deleteCategory = (category) => {
    if (category.bookCount > 0) {
      window.alert(
        "This category contains books. Reassign or remove those books before deleting it."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (confirmed) {
      setCategories((previous) =>
        previous.filter((item) => item.id !== category.id)
      );
    }
  };

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div>
          <span className="categories-eyebrow">LIBRARY MANAGEMENT</span>
          <h2>Book Categories</h2>
          <p>Organize library books into clear categories.</p>
        </div>

        <button className="categories-add-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="categories-stats">
        <motion.div
          className="categories-stat-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="categories-stat-icon purple">
            <FolderOpen size={22} />
          </div>
          <div>
            <span>Total Categories</span>
            <h3>{categories.length}</h3>
            <small>All library categories</small>
          </div>
        </motion.div>

        <motion.div
          className="categories-stat-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="categories-stat-icon blue">
            <BookOpen size={22} />
          </div>
          <div>
            <span>Total Books</span>
            <h3>{totalBooks}</h3>
            <small>Across all categories</small>
          </div>
        </motion.div>

        <motion.div
          className="categories-stat-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <div className="categories-stat-icon green">
            <CheckCircle size={22} />
          </div>
          <div>
            <span>Active Categories</span>
            <h3>
              {categories.filter((item) => item.status === "Active").length}
            </h3>
            <small>Available for book assignment</small>
          </div>
        </motion.div>
      </div>

      <section className="categories-card">
        <div className="categories-section-heading">
          <div>
            <h3>All Categories</h3>
            <p>Manage and organize your library collection.</p>
          </div>
          <span className="categories-count">
            {filteredCategories.length} categories
          </span>
        </div>

        <div className="categories-toolbar">
          <div className="categories-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search category name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="categories-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="categories-grid">
          {filteredCategories.map((category, index) => (
            <motion.div
              className="category-item-card"
              key={category.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <div className="category-card-top">
                <div className="category-icon">
                  <FolderOpen size={22} />
                </div>
                <span
                  className={`category-status ${
                    category.status.toLowerCase()
                  }`}
                >
                  {category.status}
                </span>
              </div>

              <div className="category-card-content">
                <h3>{category.name}</h3>
                <span className="category-code">
                  <Tag size={13} />
                  {category.code}
                </span>
                <p>{category.description || "No description provided."}</p>
              </div>

              <div className="category-book-count">
                <BookOpen size={17} />
                <strong>{category.bookCount}</strong>
                <span>Books</span>
              </div>

              <div className="category-card-actions">
                <button
                  className="category-edit-btn"
                  onClick={() => openEditModal(category)}
                >
                  <Edit size={14} />
                  Edit
                </button>

                <button
                  className="category-toggle-btn"
                  onClick={() => toggleStatus(category.id)}
                >
                  {category.status === "Active" ? "Deactivate" : "Activate"}
                </button>

                <button
                  className="category-delete-btn"
                  title="Delete category"
                  onClick={() => deleteCategory(category)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="categories-empty">
              <FolderOpen size={35} />
              <strong>No categories found</strong>
              <p>Try another search or add a new category.</p>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div
          className="categories-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="categories-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="categories-modal-header">
              <div>
                <span>LIBRARY MANAGEMENT</span>
                <h3>{editingId ? "Edit Category" : "Add New Category"}</h3>
              </div>

              <button
                className="categories-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="categories-form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="categories-form-group">
                <label>Category Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CS"
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value })
                  }
                  required
                />
              </div>

              <div className="categories-form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  placeholder="Write a short category description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {error && (
                <div className="categories-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="categories-modal-actions">
                <button
                  type="button"
                  className="categories-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="categories-save-btn">
                  <Save size={16} />
                  {editingId ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
