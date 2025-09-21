import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Loader2, CheckCircle, AlertCircle, Mail, RotateCcw } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import OTPInput from "../components/OTPInput";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

const VerifyOTPPage = () => {
  const [status, setStatus] = useState("waiting"); // waiting, verifying, success, error
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    
    if (!emailParam) {
      setStatus("error");
      setMessage("No email provided for verification.");
      return;
    }
    
    setEmail(emailParam);
  }, [location.search]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (status !== "waiting") return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPComplete = async (otp) => {
    if (!email || !otp) return;
    
    setIsLoading(true);
    setStatus("verifying");
    setMessage("Verifying your OTP...");
    
    try {
      const response = await axiosInstance.post("/auth/verify-otp", { email, otp });
      
      if (response.data.verified) {
        setStatus("success");
        setMessage(response.data.message);
        toast.success(response.data.message);
      } else {
        setStatus("error");
        setMessage(response.data.message || "Invalid OTP. Please try again.");
        toast.error(response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Failed to verify OTP. Please try again.");
      toast.error(error.response?.data?.message || "Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;
    
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.post("/auth/resend-otp", { email });
      toast.success(response.data.message);
      setCountdown(600); // Reset countdown to 10 minutes
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex flex-col sm:grid sm:grid-cols-2" style={{ background: 'linear-gradient(to bottom right, var(--primary), var(--secondary))' }}>
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 order-2 sm:order-1 min-h-screen sm:min-h-0">
        <div className="w-full max-w-md space-y-6 pt-8 sm:pt-8">
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2 group">
              <Logo size="lg" />
              <h1 className="text-2xl font-bold mt-4" style={{ color: 'white' }}>Email Verification</h1>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="text-center space-y-4">
              {status === "waiting" && (
                <>
                  <div className="space-y-2">
                    <p style={{ color: 'var(--text-primary)' }}>Enter the 6-digit code sent to</p>
                    <p className="font-semibold text-lg" style={{ color: 'var(--primary)' }}>{email}</p>
                  </div>
                  
                  <div className="py-4">
                    <OTPInput 
                      length={6} 
                      onOTPComplete={handleOTPComplete} 
                      isLoading={isLoading}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Expires in: <span className="font-semibold" style={{ color: 'var(--primary)' }}>{formatTime(countdown)}</span>
                    </div>
                    <button
                      onClick={handleResendOTP}
                      disabled={isLoading || countdown > 0}
                      className="flex items-center gap-1 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed py-2 px-3 rounded-lg"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--surface-hover)' }}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Resend OTP
                    </button>
                  </div>
                  
                  {countdown === 0 && (
                    <div className="alert" style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                        <span style={{ color: 'var(--text-primary)' }}>OTP has expired. Please resend a new OTP.</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {status === "verifying" && (
                <>
                  <Loader2 className="h-12 w-12 animate-spin mx-auto" style={{ color: 'var(--primary)' }} />
                  <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{message}</p>
                </>
              )}

              {status === "success" && (
                <>
                  <CheckCircle className="h-12 w-12 mx-auto" style={{ color: 'var(--success)' }} />
                  <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{message}</p>
                  <button
                    onClick={handleLoginRedirect}
                    className="btn w-full mt-4 py-3"
                    style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  >
                    Go to Login
                  </button>
                </>
              )}

              {status === "error" && (
                <>
                  <AlertCircle className="h-12 w-12 mx-auto" style={{ color: 'var(--error)' }} />
                  <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{message}</p>
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={handleLoginRedirect}
                      className="btn w-full py-3"
                      style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                      Go to Login
                    </button>
                    <button
                      onClick={handleSignupRedirect}
                      className="btn w-full py-3"
                      style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                    >
                      Back to Signup
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block order-1">
        <AuthImagePattern
          title="Verify Your Email"
          subtitle="We've sent a 6-digit verification code to your email address. Please enter it below to verify your account."
        />
      </div>
    </div>
  );
};

export default VerifyOTPPage;