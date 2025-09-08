import { Plus, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CourseForm } from "../Modals/CourseForm";

interface CoursesSectionProps {
  setActiveSection?: (section: string) => void;
}

export const CoursesSection = ({ setActiveSection }: CoursesSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCourseClick = (courseId: number) => {
    if (setActiveSection) {
      setActiveSection('lessons');
    } else {
      navigate(`/courses/${courseId}/lessons`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Course
        </button>
      </div>

      {/* CourseForm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-700/70 backdrop-blur-sm flex items-center justify-center z-50 h-full">  
            <div className="p-6">
              <CourseForm onClose={handleCloseModal} />
            </div>
        </div>
      )}

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Courses</h3>
          <p className="text-2xl font-bold">156</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Published</h3>
          <p className="text-2xl font-bold text-green-600">142</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Draft</h3>
          <p className="text-2xl font-bold text-orange-600">14</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Lessons</h3> 
          <p className="text-2xl font-bold">25,847</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((course) => (
          <div
            key={course}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleCourseClick(course)}
          >
            <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                  Published
                </span>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle menu click
                  }}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
              <h3 className="font-semibold text-lg mb-2">Course Title {course}</h3>
              <p className="text-gray-600 text-sm mb-4">
                Brief description of the course content and objectives...
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>10 lessons</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
