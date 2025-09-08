import { useState, useMemo } from "react";
import { Search, Filter, Download, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { LessonModal } from "../Modals/LessonModal";
import { ConfirmDeleteModal } from "../Modals/ConfirmDeleteModal";
import { useNavigate } from "react-router";

interface CoursesSectionProps {
  setActiveSection?: (section: string) => void;
}


export const Lessons = ({ setActiveSection }: CoursesSectionProps) => {
  const [lessons, setLessons] = useState([
    { id: 1, name: "Introduction to Web Development", contentCount: 5, order: 1, createdAt: "2024-09-01", course: "Web Development" },
    { id: 2, name: "JavaScript Basics", contentCount: 8, order: 2, createdAt: "2024-09-03", course: "JavaScript" },
    { id: 3, name: "React Fundamentals", contentCount: 10, order: 3, createdAt: "2024-09-05", course: "React" },
    { id: 4, name: "Node.js Essentials", contentCount: 6, order: 4, createdAt: "2024-09-06", course: "Node.js" },
    { id: 5, name: "CSS Styling", contentCount: 4, order: 5, createdAt: "2024-09-07", course: "CSS" },
  ]);

  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      setLessons((prev) => prev.filter((lesson) => lesson.id !== deleteId));
    }
  };

    const navigate = useNavigate();
  
  
    const handleLessonClick = (lessonId: number) => {
      if (setActiveSection) {
        setActiveSection('contents');
      } else {
        navigate(`/lessons/${lessonId}`);
      }
    };


  const courses = ["Web Development", "JavaScript", "React", "CSS", "Node.js"];

  // 🔍 Filtering and searching
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch = lesson.name.toLowerCase().includes(search.toLowerCase());
      const matchesCourse = filterCourse ? lesson.course === filterCourse : true;
      return matchesSearch && matchesCourse;
    });
  }, [lessons, search, filterCourse]);

  // 📄 Pagination
  const totalPages = Math.ceil(filteredLessons.length / itemsPerPage);
  const paginatedLessons = filteredLessons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 💾 Save lesson (create/update)
  const handleSave = (lesson: any) => {
    if (editingLesson) {
      setLessons((prev) =>
        prev.map((l) => (l.id === editingLesson.id ? { ...l, ...lesson } : l))
      );
    } else {
      setLessons((prev) => [
        ...prev,
        { id: prev.length + 1, ...lesson, contentCount: 0, createdAt: new Date().toISOString() },
      ]);
    }
    setEditingLesson(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Lessons Management</h1>
        <button
          onClick={() => {
            setEditingLesson(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Lesson
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center border rounded-lg px-3 py-2 w-64">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 outline-none text-sm"
          />
        </div>

        <div className="flex items-center border rounded-lg px-3 py-2">
          <Filter size={18} className="text-gray-400 mr-2" />
          <select
            value={filterCourse}
            onChange={(e) => {
              setFilterCourse(e.target.value);
              setCurrentPage(1);
            }}
            className="outline-none text-sm bg-transparent"
          >
            <option value="">All Courses</option>
            {courses.map((course, idx) => (
              <option key={idx} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <button className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Lesson Name</th>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Course</th>
              <th className="px-6 py-3">Contents</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedLessons.map((lesson) => (
              <tr key={lesson.id}>
                <td className="px-6 py-4">{lesson.name}</td>
                <td className="px-6 py-4 text-center">{lesson.order}</td>
                <td className="px-6 py-4">{lesson.course}</td>
                <td className="px-6 py-4 text-center">{lesson.contentCount}</td>
                <td className="px-6 py-4">
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 flex gap-3">
                  <button className="text-blue-600 hover:text-blue-900" onClick={() => handleLessonClick(lesson.id)}>
                    <Eye size={16} />
                  </button>
                  <button
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => {
                      setEditingLesson(lesson);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDelete(lesson.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {paginatedLessons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No lessons found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
          >
            Prev
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-lg text-sm ${
                  currentPage === page ? "bg-blue-600 text-white" : ""
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <LessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingLesson}
        courses={courses}
      />

       {/* Delete Confirmation Modal */}
       <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
      />
    </div>
  );
};
