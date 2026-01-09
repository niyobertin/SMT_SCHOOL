import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, RefreshCcw } from "lucide-react";
import { verifyUser } from "../../redux/features/auth";
import { Toast } from "primereact/toast";
import type { AppDispatch, RootState } from "../../redux/stores";

export default function VerifyOtp() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error && toast.current) {
      toast.current.show({
        severity: 'error',
        summary: 'Verification Failed',
        detail: error,
        life: 3000,
      });
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value && !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    } else if (index === 5 && value) {
      handleSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      setActiveInput(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('').slice(0, 6);
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')].slice(0, 6));
      setActiveInput(Math.min(5, pastedData.length - 1));
      inputRefs.current[Math.min(5, pastedData.length - 1)]?.focus();
    }
  };

  const handleSubmit = async () => {
    const verificationCode = otp.join('');
    if (verificationCode.length !== 6) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Incomplete Code',
        detail: 'Please enter all 6 digits',
        life: 3000,
      });
      return;
    }

    try {
      await dispatch(verifyUser(parseInt(verificationCode))).unwrap();
      toast.current?.show({
        severity: 'success',
        summary: 'Verification Successful',
        detail: 'Your account verified successfully',
        life: 3000,
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#6cb9cc] overflow-hidden font-outfit">
      {/* Background depth effect matching ExamLogin */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6cb9cc] via-[#7fd1e3] to-[#5da3b5]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white opacity-10 rounded-full blur-[100px] -ml-48 -mb-48" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/login" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
        </Link>
      </div>

      <Toast ref={toast} position="top-right" />

      <div className="relative w-full max-w-[420px] z-10 pt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Overlapping Avatar matching ExamLogin */}
          <div className="absolute left-1/2 -top-12 -translate-x-1/2 z-20">
            <div className="w-24 h-24 bg-[#1a7ea5] rounded-full flex items-center justify-center border-4 border-[#6cb9cc] shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Card matching ExamLogin */}
          <div className="bg-white pt-14 pb-8 px-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] relative">
            <div className="text-center mb-6">
              <h2 className="text-2xl text-gray-500 font-light tracking-wide italic uppercase">
                Verify Account
              </h2>
              <p className="text-xs text-gray-400 mt-1 italic font-light">
                Code sent to <span className="text-[#1a7ea5] font-normal">{email || "your device"}</span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    onFocus={() => setActiveInput(index)}
                    className={`w-10 h-10 md:w-12 md:h-12 bg-[#eeeeee] border border-gray-200 text-center text-xl text-gray-600 focus:outline-none transition-all rounded-sm focus:ring-1 focus:ring-[#1a7ea5]`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#1a7ea5] hover:bg-[#156d8f] text-white py-2.5 text-lg font-medium transition-colors shadow-md rounded-[2px]"
              >
                {loading ? "Verifying..." : "Verify Account"}
              </button>

              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-gray-400 font-light italic text-center">
                  Didn't receive a code?{' '}
                  <button
                    type="button"
                    className="text-[#1a7ea5] hover:underline font-normal flex items-center gap-1 inline-flex"
                    onClick={() => {
                      toast.current?.show({
                        severity: 'info',
                        summary: 'Code Resent',
                        detail: 'A new verification code has been sent',
                        life: 3000,
                      });
                    }}
                  >
                    <RefreshCcw size={12} />
                    Resend Now
                  </button>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
