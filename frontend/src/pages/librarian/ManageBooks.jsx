
import { useMemo, useState } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Filter,
  Download,
  Library,
  Layers,
  CheckCircle2,
  AlertCircle,
  BookCopy,
} from "lucide-react";
import "./ManageBooks.css";

const initialBooks = [
  {
    id: 1,
    isbn: "9780262046305",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    category: "Computer Science",
    publisher: "MIT Press",
    year: "2022",
    quantity: 20,
    available: 14,
  },
  {
    id: 2,
    isbn: "9780132350884",
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Programming",
    publisher: "Prentice Hall",
    year: "2008",
    quantity: 15,
    available: 8,
  },
  {
    id: 3,
    isbn: "9780073523323",
    title: "Database System Concepts",
    author: "Abraham Silberschatz",
    category: "Database",
    publisher: "McGraw Hill",
    year: "2019",
    quantity: 18,
    available: 12,
  },
  {
    id: 4,
    isbn: "9780133594140",
    title: "Operating System Concepts",
    author: "Abraham Silberschatz",
    category: "Computer Science",
    publisher: "Wiley",
    year: "2018",
    quantity: 12,
    available: 5,
  },
  {
    id: 5,
    isbn: "9780132126953",
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    category: "Networking",
    publisher: "Pearson",
    year: "2011",
    quantity: 10,
    available: 10,
  },
  {
    id: 6,
    isbn: "9780131103627",
    title: "The C Programming Language",
    author: "Brian W. Kernighan",
    category: "Programming",
    publisher: "Prentice Hall",
    year: "1988",
    quantity: 14,
    available: 6,
  },
  {
    id: 7,
    isbn: "9780201633610",
    title: "Design Patterns",
    author: "Erich Gamma",
    category: "Software Engineering",
    publisher: "Addison-Wesley",
    year: "1994",
    quantity: 8,
    available: 0,
  },
];

const emptyForm = {
  isbn: "",
  title: "",
  author: "",
  category: "Computer Science",
  publisher: "",
  year: "",
  quantity: "",
  available: "",
};

function ManageBooks() {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewBook, setViewBook] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const categories = [
    "All",
    ...new Set(books.map((book) => book.category)),
  ];

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const query = search.toLowerCase();

      const matchesSearch =
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" || book.category === categoryFilter;

      const matchesAvailability =
        availabilityFilter === "All" ||
        (availabilityFilter === "Available" && book.available > 0) ||
        (availabilityFilter === "Out of Stock" && book.available === 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [books, search, categoryFilter, availabilityFilter]);

  const totalBooks = books.reduce((sum, book) => sum + book.quantity, 0);
  const availableBooks = books.reduce((sum, book) => sum + book.available, 0);
  const borrowedBooks = totalBooks - availableBooks;

  const openAddModal = () => {
    setSelectedBook(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setForm({
      ...book,
      quantity: String(book.quantity),
      available: String(book.available),
    });
    setFormError("");
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveBook = (e) => {
    e.preventDefault();

    const quantity = Number(form.quantity);
    const available = Number(form.available);

    if (
      !form.isbn.trim() ||
      !form.title.trim() ||
      !form.author.trim() ||
      !form.publisher.trim() ||
      !form.year.trim()
    ) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setFormError("Quantity must be a positive whole number.");
      return;
    }

    if (
      !Number.isInteger(available) ||
      available < 0 ||
      available > quantity
    ) {
      setFormError("Available quantity must be between 0 and total quantity.");
      return;
    }

    const normalizedBook = {
      ...form,
      isbn: form.isbn.trim(),
      title: form.title.trim(),
      author: form.author.trim(),
      publisher: form.publisher.trim(),
      year: form.year.trim(),
      quantity,
      available,
    };

    if (selectedBook) {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === selectedBook.id
            ? { ...normalizedBook, id: selectedBook.id }
            : book
        )
      );
    } else {
      const duplicate = books.some((book) => book.isbn === normalizedBook.isbn);

      if (duplicate) {
        setFormError("A book with this ISBN already exists.");
        return;
      }

      setBooks((prev) => [
        { ...normalizedBook, id: Date.now() },
        ...prev,
      ]);
    }

    setShowModal(false);
    setForm(emptyForm);
    setSelectedBook(null);
  };

  const handleDeleteBook = (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.title}"?`
    );

    if (confirmed) {
      setBooks((prev) => prev.filter((item) => item.id !== book.id));
    }
  };

  const exportCSV = () => {
    const headers = [
      "ISBN",
      "Title",
      "Author",
      "Category",
      "Publisher",
      "Year",
      "Quantity",
      "Available",
    ];

    const rows = filteredBooks.map((book) => [
      book.isbn,
      book.title,
      book.author,
      book.category,
      book.publisher,
      book.year,
      book.quantity,
      book.available,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "library-books.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="manage-books-page">
      {/* Page Header */}
      <div className="mb-page-header">
        <div>
          <div className="mb-breadcrumb">
            <Library size={15} />
            <span>Library</span>
            <span>/</span>
            <span>Manage Books</span>
          </div>
          <h1>Manage Books</h1>
          <p>Add, organize, update and manage your library collection.</p>
        </div>

        <div className="mb-header-buttons">
          <button className="mb-export-btn" onClick={exportCSV}>
            <Download size={17} />
            Export CSV
          </button>

          <button className="mb-add-btn" onClick={openAddModal}>
            <Plus size={18} />
            Add New Book
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-stats-grid">
        <div className="mb-stat-card">
          <div className="mb-stat-icon blue">
            <BookOpen size={23} />
          </div>
          <div>
            <span>Total Book Copies</span>
            <h2>{totalBooks.toLocaleString()}</h2>
            <small>Across all categories</small>
          </div>
        </div>

        <div className="mb-stat-card">
          <div className="mb-stat-icon green">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <span>Available Copies</span>
            <h2>{availableBooks.toLocaleString()}</h2>
            <small>Ready for borrowing</small>
          </div>
        </div>

        <div className="mb-stat-card">
          <div className="mb-stat-icon purple">
            <BookCopy size={23} />
          </div>
          <div>
            <span>Borrowed Copies</span>
            <h2>{borrowedBooks.toLocaleString()}</h2>
            <small>Currently with students</small>
          </div>
        </div>

        <div className="mb-stat-card">
          <div className="mb-stat-icon orange">
            <Layers size={23} />
          </div>
          <div>
            <span>Book Titles</span>
            <h2>{books.length}</h2>
            <small>Unique registered titles</small>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="mb-content-card">
        <div className="mb-table-heading">
          <div>
            <h2>All Books</h2>
            <p>Manage your registered library books.</p>
          </div>
          <span className="mb-total-badge">
            {filteredBooks.length} Books
          </span>
        </div>

        {/* Filters */}
        <div className="mb-filters">
          <div className="mb-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search title, author or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mb-filter-control">
            <Filter size={16} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>

          <select
            className="mb-availability-filter"
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Table */}
        <div className="mb-table-wrapper">
          <table className="mb-books-table">
            <thead>
              <tr>
                <th>Book Information</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Publisher</th>
                <th>Quantity</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div className="mb-book-info">
                      <div className="mb-book-cover">
                        <BookOpen size={21} />
                      </div>
                      <div>
                        <strong>{book.title}</strong>
                        <small>By {book.author}</small>
                      </div>
                    </div>
                  </td>

                  <td>{book.isbn}</td>

                  <td>
                    <span className="mb-category-tag">{book.category}</span>
                  </td>

                  <td>{book.publisher}</td>
                  <td className="mb-quantity">{book.quantity}</td>
                  <td className="mb-available">{book.available}</td>

                  <td>
                    <span
                      className={`mb-stock-status ${
                        book.available > 0 ? "in-stock" : "out-stock"
                      }`}
                    >
                      {book.available > 0 ? "Available" : "Out of Stock"}
                    </span>
                  </td>

                  <td>
                    <div className="mb-action-buttons">
                      <button
                        title="View details"
                        onClick={() => setViewBook(book)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        title="Edit book"
                        className="edit"
                        onClick={() => openEditModal(book)}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        title="Delete book"
                        className="delete"
                        onClick={() => handleDeleteBook(book)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan="8" className="mb-no-results">
                    <BookOpen size={30} />
                    <strong>No books found</strong>
                    <span>Try changing your search or filters.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mb-table-footer">
          Showing {filteredBooks.length} of {books.length} book titles
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="mb-modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="mb-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-modal-header">
              <div>
                <h2>{selectedBook ? "Edit Book" : "Add New Book"}</h2>
                <p>
                  {selectedBook
                    ? "Update the book information."
                    : "Enter the details to register a new book."}
                </p>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBook}>
              <div className="mb-form-grid">
                <div className="mb-form-group">
                  <label>Book Title *</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div className="mb-form-group">
                  <label>ISBN *</label>
                  <input
                    name="isbn"
                    value={form.isbn}
                    onChange={handleFormChange}
                    placeholder="Enter ISBN"
                    required
                  />
                </div>

                <div className="mb-form-group">
                  <label>Author *</label>
                  <input
                    name="author"
                    value={form.author}
                    onChange={handleFormChange}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="mb-form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                  >
                    <option>Computer Science</option>
                    <option>Programming</option>
                    <option>Database</option>
                    <option>Networking</option>
                    <option>Software Engineering</option>
                    <option>Mathematics</option>
                    <option>Science</option>
                    <option>Literature</option>
                    <option>History</option>
                  </select>
                </div>

                <div className="mb-form-group">
                  <label>Publisher *</label>
                  <input
                    name="publisher"
                    value={form.publisher}
                    onChange={handleFormChange}
                    placeholder="Enter publisher"
                    required
                  />
                </div>

                <div className="mb-form-group">
                  <label>Publication Year *</label>
                  <input
                    name="year"
                    type="number"
                    min="1000"
                    max="2100"
                    value={form.year}
                    onChange={handleFormChange}
                    placeholder="e.g. 2024"
                    required
                  />
                </div>

                <div className="mb-form-group">
                  <label>Total Quantity *</label>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleFormChange}
                    placeholder="Total copies"
                    required
                  />
                </div>

                <div className="mb-form-group">
                  <label>Available Quantity *</label>
                  <input
                    name="available"
                    type="number"
                    min="0"
                    value={form.available}
                    onChange={handleFormChange}
                    placeholder="Available copies"
                    required
                  />
                </div>
              </div>

              {formError && (
                <div className="mb-form-error">
                  <AlertCircle size={17} />
                  {formError}
                </div>
              )}

              <div className="mb-modal-footer">
                <button
                  type="button"
                  className="mb-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="mb-save-btn">
                  <CheckCircle2 size={17} />
                  {selectedBook ? "Save Changes" : "Add Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {viewBook && (
        <div className="mb-modal-overlay" onClick={() => setViewBook(null)}>
          <div className="mb-modal mb-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mb-modal-header">
              <div>
                <h2>Book Details</h2>
                <p>Complete information about this book.</p>
              </div>
              <button onClick={() => setViewBook(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="mb-details-cover">
              <BookOpen size={38} />
              <h3>{viewBook.title}</h3>
              <span>{viewBook.author}</span>
            </div>

            <div className="mb-details-grid">
              <div><small>ISBN</small><strong>{viewBook.isbn}</strong></div>
              <div><small>Category</small><strong>{viewBook.category}</strong></div>
              <div><small>Publisher</small><strong>{viewBook.publisher}</strong></div>
              <div><small>Publication Year</small><strong>{viewBook.year}</strong></div>
              <div><small>Total Quantity</small><strong>{viewBook.quantity}</strong></div>
              <div><small>Available Copies</small><strong>{viewBook.available}</strong></div>
              <div><small>Borrowed Copies</small><strong>{viewBook.quantity - viewBook.available}</strong></div>
              <div>
                <small>Availability</small>
                <strong>{viewBook.available > 0 ? "Available" : "Out of Stock"}</strong>
              </div>
            </div>

            <div className="mb-modal-footer">
              <button className="mb-cancel-btn" onClick={() => setViewBook(null)}>
                Close
              </button>
              <button
                className="mb-save-btn"
                onClick={() => {
                  setViewBook(null);
                  openEditModal(viewBook);
                }}
              >
                <Edit size={16} /> Edit Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBooks;
