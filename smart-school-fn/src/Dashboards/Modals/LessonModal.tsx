import { useState, useEffect } from "react";

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: any) => void;
  initialData?: any; 
  courses: string[];
  coursesLoading: boolean;
  coursesError: string | null;
  loading: boolean;
}

export const LessonModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  courses,
  coursesLoading,
  coursesError,
  loading,
}: LessonModalProps) => {
  const [lesson, setLesson] = useState({
    title: "",
    description: "",
    order: "",
    course: "",
  });

  useEffect(() => {
    if (initialData) {
      setLesson({
        title: initialData.title || "",
        description: initialData.description || "",
        order: initialData.order?.toString() || "",
        course: initialData.course || "",
      });
    } else {
      setLesson({ title: "", description: "", order: "", course: "" });
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLesson({ ...lesson, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...lesson,
      order: Number(lesson.order),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center bg-gray-700/70 backdrop-blur-sm justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Update Lesson" : "Create Lesson"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm">Lesson Title</label>
            <input
              type="text"
              name="title"
              value={lesson.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Description</label>
            <textarea
              name="description"
              value={lesson.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Order</label>
            <input
              type="number"
              name="order"
              value={lesson.order}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Course</label>
            <select
              name="course"
              value={lesson.course}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">{coursesLoading ? "Loading..." : "Select a course"}</option>
              { !coursesLoading && !coursesError ? courses.map((c, idx) => (
                <option key={idx} value={c}>
                  {c}
                </option>
              )) : <option value="">No courses available</option>}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {initialData ? (loading ? "Loading..." : "Update") : (loading ? "Loading..." : "Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
