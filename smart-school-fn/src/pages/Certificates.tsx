import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Download, ExternalLink, Search, Shield, Calendar, CheckCircle, AlertCircle, QrCode, User, Percent, Hash } from "lucide-react";
import api from "../redux/api/api";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Certificate {
  id: string;
  certificationId: string;
  certificationName: string | null;
  certificateNumber: string;
  score: number;
  issuedAt: string;
  pdfUrl: string | null;
  qrCode: string | null;
  status: string;
}

export const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyNumber, setVerifyNumber] = useState("");
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await api.get("/certificates/my");
      if (response.data.status === "success") {
        setCertificates(response.data.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyNumber.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const response = await api.get(`/certificates/verify/${verifyNumber.trim()}`);
      setVerifyResult(response.data);
    } catch (err: any) {
      setVerifyResult({
        status: "error",
        valid: false,
        message: err.response?.data?.message || "Certificate not found",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-100 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">My Certificates</h1>
            <p className="text-slate-500 font-medium mt-2">View, download, and verify your earned certificates</p>
          </div>
          <div className="flex items-center gap-3 bg-[#1a7ea5]/5 px-4 py-2 rounded-xl border border-[#1a7ea5]/10">
            <Award className="w-5 h-5 text-[#1a7ea5]" />
            <span className="text-sm font-bold text-[#1a7ea5]">{certificates.length} Certificate{certificates.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Certificate Verification */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-[#1a7ea5]" />
            <h2 className="text-lg font-bold text-slate-900">Verify a Certificate</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={verifyNumber}
              onChange={(e) => setVerifyNumber(e.target.value)}
              placeholder="Enter certificate number (e.g., JER-XXXX-XXXX)"
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-[#1a7ea5]/10 focus:border-[#1a7ea5] transition-all"
            />
            <button
              onClick={handleVerify}
              disabled={verifying || !verifyNumber.trim()}
              className="px-6 py-3 bg-[#1a7ea5] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#156d8f] transition-all disabled:opacity-50 flex items-center gap-2 justify-center"
            >
              <Search size={16} />
              {verifying ? "Verifying..." : "Verify"}
            </button>
          </div>
          {verifyResult && (
            <div className={`mt-4 p-4 rounded-xl border ${verifyResult.valid ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex items-center gap-2">
                {verifyResult.valid ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                )}
                <span className={`font-bold text-sm ${verifyResult.valid ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {verifyResult.valid ? 'Certificate is valid' : verifyResult.message || 'Certificate not found or invalid'}
                </span>
              </div>
              {verifyResult.valid && verifyResult.data && (
                <div className="mt-3 text-sm text-slate-600 space-y-1">
                  <p><span className="font-medium">Issued to:</span> {verifyResult.data.fullName}</p>
                  <p><span className="font-medium">Certification:</span> {verifyResult.data.certificationName || verifyResult.data.certificationId}</p>
                  <p><span className="font-medium">Score:</span> {verifyResult.data.score}%</p>
                  <p><span className="font-medium">Certificate #:</span> {verifyResult.data.certificateNumber}</p>
                  <p><span className="font-medium">Issued:</span> {new Date(verifyResult.data.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Certificates List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100">
                <Skeleton height={24} width={200} className="mb-3" />
                <Skeleton height={16} width={300} className="mb-2" />
                <Skeleton height={16} width={150} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-6 rounded-r-2xl">
            <p className="text-sm font-bold text-rose-800">{error}</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6">
              <Award size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Certificates Yet</h3>
            <p className="text-slate-400 font-medium">Complete courses and pass exams to earn certificates.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 bg-[#1a7ea5]/10 rounded-xl flex items-center justify-center text-[#1a7ea5] shrink-0">
                      <Award size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900">{cert.certificationName || cert.certificationId}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                          <Calendar size={14} />
                          {new Date(cert.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                          <Percent size={12} />
                          {cert.score}%
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Hash size={10} />
                          {cert.certificateNumber}
                        </span>
                      </div>
                      {cert.qrCode && (
                        <div className="flex items-center gap-2 mt-2">
                          <QrCode size={14} className="text-[#1a7ea5]" />
                          <a
                            href={cert.qrCode}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-[#1a7ea5] hover:underline"
                          >
                            Verify Online
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedCert(selectedCert?.id === cert.id ? null : cert)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      Details
                    </button>
                    {cert.pdfUrl && (
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#1a7ea5] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#156d8f] transition-all flex items-center gap-2"
                      >
                        <Download size={14} />
                        Download
                      </a>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedCert?.id === cert.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-600">User:</span>
                        <span className="font-bold text-slate-900">You</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-600">Certification:</span>
                        <span className="font-bold text-slate-900">{cert.certificationName || cert.certificationId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Percent size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-600">Score:</span>
                        <span className="font-bold text-slate-900">{cert.score}%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-600">Issue Date:</span>
                        <span className="font-bold text-slate-900">
                          {new Date(cert.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Hash size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-600">Certificate #:</span>
                        <span className="font-bold text-slate-900">{cert.certificateNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <QrCode size={14} className="text-slate-400" />
                        <span className="font-medium text-slate-600">QR Code:</span>
                        {cert.qrCode ? (
                          <a
                            href={cert.qrCode}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#1a7ea5] hover:underline text-sm"
                          >
                            {cert.qrCode}
                          </a>
                        ) : (
                          <span className="text-slate-400">Not available</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CertificatesPage;
