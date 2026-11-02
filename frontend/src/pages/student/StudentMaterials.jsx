
import   { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  FileText,
  FileSpreadsheet,
  FileImage,
  Download,
  Eye,
  X,
  CalendarDays,
  User,
  FolderOpen,
  Filter,
  BookMarked,
  File,
//   ExternalLink,
} from "lucide-react";
import "./StudentMaterials.css";

const materials = [
  {
    id: 1,
    title: "Introduction to React",
    subject: "Web Development",
    teacher: "Mr. Daniel",
    category: "Lecture Notes",
    type: "PDF",
    size: "2.4 MB",
    date: "2026-10-25",
    description: "Introduction to React, components, JSX, props, and state.",
    content: "React is a JavaScript library for building user interfaces. This material introduces React fundamentals and component-based development.",
    fileName: "Introduction_to_React.pdf",
    downloadUrl: "/materials/Introduction_to_React.pdf",
  },
  {
    id: 2,
    title: "Database Normalization",
    subject: "Database Systems",
    teacher: "Mrs. Hana",
    category: "Lecture Notes",
    type: "PDF",
    size: "1.8 MB",
    date: "2026-10-22",
    description: "Study database normalization from 1NF through 3NF.",
    content: "Learn about database normalization, functional dependencies, and how to organize relational database tables.",
    fileName: "Database_Normalization.pdf",
    downloadUrl: "/materials/Database_Normalization.pdf",
  },
  {
    id: 3,
    title: "Data Structures Presentation",
    subject: "Data Structures",
    teacher: "Mr. Samuel",
    category: "Presentation",
    type: "PPTX",
    size: "4.1 MB",
    date: "2026-10-20",
    description: "Slides covering arrays, linked lists, stacks, and queues.",
    content: "This presentation explains common data structures and their applications in programming.",
    fileName: "Data_Structures.pptx",
    downloadUrl: "/materials/Data_Structures.pptx",
  },
  {
    id: 4,
    title: "Computer Networks Chapter 1",
    subject: "Computer Networks",
    teacher: "Mrs. Selam",
    category: "E-Book",
    type: "PDF",
    size: "5.2 MB",
    date: "2026-10-18",
    description: "Fundamental concepts of computer networks.",
    content: "Learn network types, network topologies, communication models, and basic network devices.",
    fileName: "Computer_Networks.pdf",
    downloadUrl: "/materials/Computer_Networks.pdf",
  },
  {
    id: 5,
    title: "Java Programming Examples",
    subject: "Java Programming",
    teacher: "Mr. Daniel",
    category: "Practice",
    type: "DOCX",
    size: "900 KB",
    date: "2026-10-15",
    description: "Practical Java programming examples and exercises.",
    content: "This resource includes Java examples about variables, classes, methods, inheritance, and exception handling.",
    fileName: "Java_Examples.docx",
    downloadUrl: "/materials/Java_Examples.docx",
  },
  {
    id: 6,
    title: "SQL Practice Exercises",
    subject: "Database Systems",
    teacher: "Mrs. Hana",
    category: "Practice",
    type: "PDF",
    size: "1.2 MB",
    date: "2026-10-12",
    description: "Practice SQL queries, joins, and database operations.",
    content: "Practice SELECT, INSERT, UPDATE, DELETE, JOIN, and aggregate SQL queries.",
    fileName: "SQL_Practice.pdf",
    downloadUrl: "/materials/SQL_Practice.pdf",
  },
];

const categories = [
  "All",
  "Lecture Notes",
  "Presentation",
  "E-Book",
  "Practice",
];

function getFileIcon(type) {
  if (type === "PPTX") return FileImage;
  if (type === "DOCX") return FileSpreadsheet;
  if (type === "PDF") return FileText;
  return File;
}

function StudentMaterials() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const term = search.toLowerCase();

      const matchesSearch =
        material.title.toLowerCase().includes(term) ||
        material.subject.toLowerCase().includes(term) ||
        material.teacher.toLowerCase().includes(term);

      const matchesCategory =
        category === "All" || material.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const handleDownload = (material) => {
    // The real download starts after the teacher uploads the file
    // to the backend and the downloadUrl points to that stored file.
    const link = document.createElement("a");
    link.href = material.downloadUrl;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="student-materials">
      {/* Header */}
      <motion.div
        className="sm-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <span className="sm-eyebrow">STUDENT PORTAL</span>
          <h1>Learning Materials</h1>
          <p>Access your lecture notes, presentations, e-books, and practice resources.</p>
        </div>

        <div className="sm-header-icon">
          <BookOpen size={35} />
        </div>
      </motion.div>

      {/* Statistics */}
      <div className="sm-stats">
        <motion.div className="sm-stat-card" whileHover={{ y: -5 }}>
          <div className="sm-stat-icon sm-blue">
            <FolderOpen size={23} />
          </div>
          <div>
            <span>Total Materials</span>
            <h2>{materials.length}</h2>
          </div>
        </motion.div>

        <motion.div className="sm-stat-card" whileHover={{ y: -5 }}>
          <div className="sm-stat-icon sm-purple">
            <FileText size={23} />
          </div>
          <div>
            <span>Lecture Notes</span>
            <h2>{materials.filter(m => m.category === "Lecture Notes").length}</h2>
          </div>
        </motion.div>

        <motion.div className="sm-stat-card" whileHover={{ y: -5 }}>
          <div className="sm-stat-icon sm-orange">
            <BookMarked size={23} />
          </div>
          <div>
            <span>E-Books</span>
            <h2>{materials.filter(m => m.category === "E-Book").length}</h2>
          </div>
        </motion.div>

        <motion.div className="sm-stat-card" whileHover={{ y: -5 }}>
          <div className="sm-stat-icon sm-green">
            <Download size={23} />
          </div>
          <div>
            <span>Practice Resources</span>
            <h2>{materials.filter(m => m.category === "Practice").length}</h2>
          </div>
        </motion.div>
      </div>

      {/* Search and category filter */}
      <div className="sm-toolbar">
        <div className="sm-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search materials, subjects, teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="sm-filter">
          <Filter size={18} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials list */}
      <div className="sm-section-heading">
        <div>
          <h2>Available Resources</h2>
          <p>{filteredMaterials.length} learning materials found</p>
        </div>
      </div>

      <div className="sm-grid">
        <AnimatePresence mode="popLayout">
          {filteredMaterials.map((material) => {
            const Icon = getFileIcon(material.type);

            return (
              <motion.div
                key={material.id}
                className="sm-material-card"
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
              >
                <div className="sm-card-top">
                  <div className="sm-file-icon">
                    <Icon size={27} />
                  </div>
                  <span className="sm-file-type">{material.type}</span>
                </div>

                <span className="sm-category">{material.category}</span>
                <h3>{material.title}</h3>
                <p className="sm-description">{material.description}</p>

                <div className="sm-details">
                  <div>
                    <BookOpen size={15} />
                    <span>{material.subject}</span>
                  </div>
                  <div>
                    <User size={15} />
                    <span>{material.teacher}</span>
                  </div>
                  <div>
                    <CalendarDays size={15} />
                    <span>{material.date}</span>
                  </div>
                </div>

                <div className="sm-card-footer">
                  <span>{material.size}</span>
                  <div className="sm-card-actions">
                    <button
                      className="sm-view-btn"
                      onClick={() => setSelectedMaterial(material)}
                      title="View details"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      className="sm-download-btn"
                      onClick={() => handleDownload(material)}
                      title="Download material"
                    >
                      <Download size={17} />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredMaterials.length === 0 && (
          <div className="sm-empty">
            <Search size={35} />
            <h3>No materials found</h3>
            <p>Try another search term or category.</p>
          </div>
        )}
      </div>

      {/* Material details modal */}
      <AnimatePresence>
        {selectedMaterial && (
          <motion.div
            className="sm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMaterial(null)}
          >
            <motion.div
              className="sm-modal"
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm-modal-header">
                <div>
                  <span>MATERIAL INFORMATION</span>
                  <h2>{selectedMaterial.title}</h2>
                </div>
                <button
                  className="sm-close"
                  onClick={() => setSelectedMaterial(null)}
                >
                  <X size={21} />
                </button>
              </div>

              <div className="sm-modal-body">
                <p>{selectedMaterial.content}</p>

                <div className="sm-modal-details">
                  <div>
                    <span>Subject</span>
                    <strong>{selectedMaterial.subject}</strong>
                  </div>
                  <div>
                    <span>Teacher</span>
                    <strong>{selectedMaterial.teacher}</strong>
                  </div>
                  <div>
                    <span>Category</span>
                    <strong>{selectedMaterial.category}</strong>
                  </div>
                  <div>
                    <span>File type</span>
                    <strong>{selectedMaterial.type}</strong>
                  </div>
                  <div>
                    <span>File size</span>
                    <strong>{selectedMaterial.size}</strong>
                  </div>
                  <div>
                    <span>Upload date</span>
                    <strong>{selectedMaterial.date}</strong>
                  </div>
                </div>

                <div className="sm-file-preview">
                  <FileText size={23} />
                  <div>
                    <strong>{selectedMaterial.fileName}</strong>
                    <span>{selectedMaterial.size}</span>
                  </div>
                </div>

                <button
                  className="sm-modal-download"
                  onClick={() => handleDownload(selectedMaterial)}
                >
                  <Download size={18} />
                  Download Material
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudentMaterials;
