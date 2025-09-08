import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
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

           {/* TinyMCE Rich Text Editor */}
           <div>
            <label className="block mb-1 text-sm font-medium">Text Body</label>
            <Editor
              apiKey={import.meta.env.VITE_TINYMCE || "rsdp3ewieqfweiwaea2dk4m6ekr8j1shedct4qe5lalxdl3w"}
              value={formData.textBody}
              onEditorChange={handleEditorChange}
              init={{
                height: 300,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
                ],
                toolbar: 'undo redo | blocks | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | emoticons ' +
                'removeformat | help | link image media table | code fullscreen',
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
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
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
