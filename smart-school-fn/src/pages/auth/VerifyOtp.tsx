import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyUser } from "../../redux/features/auth";
import { Toast } from "primereact/toast";
import type { AppDispatch, RootState } from "../../redux/stores";

export default function VerifyOtp() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [activeInput, setActiveInput] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  console.log(activeInput);

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

    // Move to next input or submit if last input
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
      toast.current?.show({
        severity: 'error',
        summary: 'Verification Failed',
        detail: 'Failed to verify your account. Please try again.',
        life: 3000,
      });
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <Toast ref={toast} position="top-right" />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-2">
          Verify Your Account
        </h2>
        <p className="text-gray-600 text-center mb-6">
          We've sent a verification code to {email}
        </p>

        <div className="flex justify-center gap-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {inputRefs.current[index] = el}}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={() => setActiveInput(index)}
              className="w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        <div className="text-center mb-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive a code?{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => {
                toast.current?.show({
                  severity: 'info',
                  summary: 'Code Resent',
                  detail: 'A new verification code has been sent',
                  life: 3000,
                });
              }}
            >
              Resend Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
