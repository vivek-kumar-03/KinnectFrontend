import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Mail, Loader2 } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email) {
      toast.error("Email is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(response.data.message);
      setIsSubmitted(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col sm:grid sm:grid-cols-2" style={{ background: 'linear-gradient(to bottom right, var(--primary), var(--secondary))' }}>
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 order-2 sm:order-1 min-h-screen sm:min-h-0">
        <div className="w-full max-w-md space-y-6 pt-8 sm:pt-8">
          {/* Back Button */}
          <div className="mb-4 relative z-50">
            <BackButton 
              to="/login" 
              label="Back to Login" 
              className="text-base-100 hover:bg-white/10 border-white/20"
            />
          </div>
          
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2 group">
              <Logo size="lg" />
              <h1 className="text-2xl font-bold mt-4" style={{ color: 'white' }}>
                {isSubmitted ? "Check Your Email" : "Forgot Password?"}
              </h1>
              <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {isSubmitted 
                  ? "We've sent password reset instructions to your email" 
                  : "Enter your email to receive reset instructions"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            {isSubmitted ? (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-hover)' }}>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Password Reset Email Sent</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    If an account with <span className="font-semibold">{email}</span> exists, 
                    you'll receive password reset instructions shortly.
                  </p>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Didn't receive the email? Check your spam folder or 
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="link ml-1"
                    style={{ color: 'var(--primary)' }}
                  >
                    try again
                  </button>
                </p>
                <Link to="/login" className="btn w-full" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="input w-full py-3"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ 
                      backgroundColor: 'var(--background)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text-primary)'
                    }}
                  />
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    We'll send password reset instructions to this email
                  </p>
                </div>

                <button 
                  type="submit" 
                  className="btn w-full text-base py-3 shadow-lg hover:shadow-xl" 
                  disabled={isSubmitting}
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="text-center">
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Remember your password?{" "}
              <Link to="/login" className="font-semibold underline underline-offset-2 hover:opacity-80" style={{ color: 'white' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden sm:block order-1">
        <AuthImagePattern
          title="Reset Your Password"
          subtitle="Don't worry, it happens to everyone. We'll help you get back into your account."
        />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;