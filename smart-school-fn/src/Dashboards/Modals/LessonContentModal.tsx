import { useState, useEffect, useRef } from "react";
import JoditEditor from "jodit-react";
import "react-quill-new/dist/quill.snow.css";
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
type LessonContentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: FormData) => void;
  initialData?: any;
  isLoading?: boolean;
  isSuccess?: boolean;
};

export const LessonContentModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading = false,
  isSuccess = false,
}: LessonContentModalProps) => {
  const editor = useRef(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    textBody: "",
    order: 1,
    fileVideo: null as File | null,
    fileAudio: null as File | null,
    filePDF: null as File | null,
    fileImage: null as File | null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData?.title,
        textBody: initialData?.textBody,
        order: initialData?.order,
        fileVideo: null,
        fileAudio: null,
        filePDF: null,
        fileImage: null,
      });
    }
  }, [initialData]);



  useEffect(() => {
    if (isSuccess && !isLoading) {
      onClose();
    }
  }, [isSuccess, isLoading, onClose]);

  const handleCloseModal = () => {
    onClose();
    setFormData({
      title: "",
      textBody: "",
      order: 1,
      fileVideo: null,
      fileAudio: null,
      filePDF: null,
      fileImage: null,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files, value } = e.target;
    if (files) {
      if (name === "filePDF" && files[0].size > MAX_PDF_SIZE) {
        setError("PDF file size exceeds the maximum limit of 10 MB.");
        return;
      }
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // const handleEditorChange = (newContent: string) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     textBody: newContent,
  //   }));
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const uploadData = new FormData();
    uploadData.append("title", formData.title);
    uploadData.append("textBody", formData.textBody);
    uploadData.append("order", formData.order.toString());

    if (formData.fileVideo) uploadData.append("fileVideo", formData.fileVideo);
    if (formData.fileAudio) uploadData.append("fileAudio", formData.fileAudio);
    if (formData.filePDF) uploadData.append("filePDF", formData.filePDF);
    if (formData.fileImage) uploadData.append("fileImage", formData.fileImage);

    onSave(uploadData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700/70 backdrop-blur-sm z-50 overflow-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl h-[600px] overflow-y-auto">
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
            <JoditEditor
              ref={editor}
              value={formData.textBody}
              onBlur={(newContent) => {
                setFormData((prev) => ({ ...prev, textBody: newContent }));
              }}
              config={{
                readonly: false,
                height: 400,
                placeholder: "Write your lesson content here...",
                toolbarAdaptive: false,
              }}
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
                  <span className="text-gray-600">{file.icon}</span>
                  <input
                    type="file"
                    name={file.name}
                    accept={file.accept}
                    onChange={handleChange}
                  />
                </label>
              </div>
            ))}
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}


          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};