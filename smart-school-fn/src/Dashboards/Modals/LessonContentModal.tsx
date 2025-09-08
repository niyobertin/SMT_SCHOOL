import { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type LessonContentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: any) => void;
  initialData?: any;
};

export const LessonContentModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: LessonContentModalProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    textBody: initialData?.textBody || "",
    order: initialData?.order || 1,
    fileVideo: null as File | null,
    fileAudio: null as File | null,
    filePDF: null as File | null,
    fileImage: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files, value } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditorChange = (content: string) => {
    setFormData({ ...formData, textBody: content });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700/70 backdrop-blur-sm z-50 overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Lesson Content" : "Add Lesson Content"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block mb-1 text-sm font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* React Quill Rich Text Editor */}
          <div>
            <label className="block mb-1 text-sm font-medium">Text Body</label>
            <ReactQuill
              value={formData.textBody}
              onChange={handleEditorChange}
              className="bg-white rounded-lg"
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ color: [] }, { background: [] }],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["blockquote", "code-block"],
                  ["link", "image", "video"],
                  ["clean"],
                ],
              }}
              formats={[
                "header",
                "bold",
                "italic",
                "underline",
                "strike",
                "color",
                "background",
                "list",
                "bullet",
                "blockquote",
                "code-block",
                "link",
                "image",
                "video",
              ]}
            />
          </div>

          {/* Order */}
          <div>
            <label className="block mb-1 text-sm font-medium">Order</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Video", name: "fileVideo", accept: "video/*", icon: "🎬" },
              { label: "Audio", name: "fileAudio", accept: "audio/*", icon: "🎵" },
              { label: "PDF", name: "filePDF", accept: "application/pdf", icon: "📄" },
              { label: "Image", name: "fileImage", accept: "image/*", icon: "🖼️" },
            ].map((file) => (
              <div key={file.name} className="flex flex-col">
                <label className="block mb-1 text-sm font-medium">{file.label}</label>
                <label className="flex items-center justify-between border rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                  <span className="text-gray-600">{file.icon} Choose {file.label}</span>
                  <input
                    type="file"
                    name={file.name}
                    accept={file.accept}
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
