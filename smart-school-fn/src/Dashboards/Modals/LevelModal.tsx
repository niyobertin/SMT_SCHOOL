import { useState, useEffect } from "react";

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => void;
  initialData?: any;
  loading: boolean;
}

const emptyLevel = {
  title: "",
  description: "",
  order: "",
  price: "",
  currency: "RWF",
  isPublished: true,
  certificateEnabled: false,
  certificateTitle: "",
  certificateOrgName: "",
  certificateDescription: "",
  certificatePassingScoreOverride: "",
  certificateSignatureName: "",
};

export const LevelModal = ({ isOpen, onClose, onSave, initialData, loading }: LevelModalProps) => {
  const [level, setLevel] = useState(emptyLevel);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData) {
      setLevel({
        title: initialData.title || "",
        description: initialData.description || "",
        order: initialData.order?.toString() || "",
        price: initialData.price?.toString() || "",
        currency: initialData.currency || "RWF",
        isPublished: initialData.isPublished ?? true,
        certificateEnabled: initialData.certificateEnabled ?? false,
        certificateTitle: initialData.certificateTitle || "",
        certificateOrgName: initialData.certificateOrgName || "",
        certificateDescription: initialData.certificateDescription || "",
        certificatePassingScoreOverride: initialData.certificatePassingScoreOverride?.toString() || "",
        certificateSignatureName: initialData.certificateSignatureName || "",
      });
    } else {
      setLevel(emptyLevel);
    }
    setLogoFile(null);
    setSignatureFile(null);
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setLevel((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", level.title);
    formData.append("description", level.description);
    formData.append("order", level.order);
    formData.append("price", level.price || "0");
    formData.append("currency", level.currency);
    formData.append("isPublished", String(level.isPublished));
    formData.append("certificateEnabled", String(level.certificateEnabled));
    if (level.certificateEnabled) {
      formData.append("certificateTitle", level.certificateTitle);
      formData.append("certificateOrgName", level.certificateOrgName);
      formData.append("certificateDescription", level.certificateDescription);
      formData.append("certificatePassingScoreOverride", level.certificatePassingScoreOverride);
      formData.append("certificateSignatureName", level.certificateSignatureName);
      if (logoFile) formData.append("certificateLogo", logoFile);
      if (signatureFile) formData.append("certificateSignatureImage", signatureFile);
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center bg-gray-700/70 backdrop-blur-sm justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg my-auto">
        <h2 className="text-xl font-bold mb-4">{initialData ? "Update Level" : "Create Level"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block mb-1 text-sm">Level Title</label>
            <input
              type="text"
              name="title"
              value={level.title}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Level 1 — Foundations"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm">Description</label>
            <textarea
              name="description"
              value={level.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 text-sm">Order</label>
              <input
                type="number"
                name="order"
                value={level.order}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Price</label>
              <input
                type="number"
                name="price"
                value={level.price}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                min={0}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">Currency</label>
              <input
                type="text"
                name="currency"
                value={level.currency}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" checked={level.isPublished} onChange={handleChange} />
            Published (visible to students)
          </label>

          <div className="border-t pt-4">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                name="certificateEnabled"
                checked={level.certificateEnabled}
                onChange={handleChange}
              />
              Certificate Available
            </label>

            {level.certificateEnabled && (
              <div className="mt-3 space-y-3 pl-1">
                <div>
                  <label className="block mb-1 text-sm">Certificate Title</label>
                  <input
                    type="text"
                    name="certificateTitle"
                    value={level.certificateTitle}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g. Certificate of Completion — CPA Level 1"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Issuing Organization</label>
                  <input
                    type="text"
                    name="certificateOrgName"
                    value={level.certificateOrgName}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Certificate Description</label>
                  <textarea
                    name="certificateDescription"
                    value={level.certificateDescription}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Minimum Passing Score (%, optional override)</label>
                  <input
                    type="number"
                    name="certificatePassingScoreOverride"
                    value={level.certificatePassingScoreOverride}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Defaults to the exam's passing score"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Authorized Signature Name</label>
                  <input
                    type="text"
                    name="certificateSignatureName"
                    value={level.certificateSignatureName}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Organization Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Signature Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {initialData ? (loading ? "Loading..." : "Update") : loading ? "Loading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
