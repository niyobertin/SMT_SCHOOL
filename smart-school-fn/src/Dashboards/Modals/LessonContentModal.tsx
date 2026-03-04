import { useState, useEffect } from "react";
import TipTapEditor from "../../components/common/TipTapEditor";
import { X } from "lucide-react";
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
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-5xl h-[min(90vh,900px)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {initialData ? "Edit Lesson Content" : "Add Lesson Content"}
          </h2>
          <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Content Body</label>
            <TipTapEditor
              content={formData.textBody || ""}
              onChange={(newContent: string) => {
                setFormData((prev) => ({ ...prev, textBody: newContent }));
              }}
              placeholder="Write your lesson content here..."
              minHeight="350px"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Video", name: "fileVideo", accept: "video/*" },
              { label: "Audio", name: "fileAudio", accept: "audio/*" },
              { label: "PDF", name: "filePDF", accept: "application/pdf" },
              { label: "Image", name: "fileImage", accept: "image/*" },
            ].map((file) => (
              <div key={file.name} className="flex flex-col">
                <label className="block mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{file.label}</label>
                <label className="flex items-center justify-center border border-dashed border-slate-200 rounded-xl p-2 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 cursor-pointer transition-all">
                  <span className="text-xs font-semibold text-slate-600 truncate max-w-full">
                    {formData[file.name as keyof typeof formData] ? (formData[file.name as keyof typeof formData] as File).name : 'Clip...'}
                  </span>
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
          {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight">{error}</p>}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Content"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};