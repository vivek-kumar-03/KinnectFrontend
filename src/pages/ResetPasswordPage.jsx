import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getTokenFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get("token");
  };

  const validateForm = () => {
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const token = getTokenFromUrl();
    if (!token) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/auth/reset-password", { token, password });
      toast.success(response.data.message);
      setIsSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col sm:grid sm:grid-cols-2" style={{ background: 'linear-gradient(to bottom right, var(--primary), var(--secondary))' }}>
        <div className="flex flex-col justify-center items-center p-4 sm:p-6 order-2 sm:order-1 min-h-screen sm:min-h-0">
          <div className="w-full max-w-md space-y-6 pt-8 sm:pt-8">
            <div className="text-center mb-6">
              <div className="flex flex-col items-center gap-2 group">
                <Logo size="lg" />
                <h1 className="text-2xl font-bold mt-4" style={{ color: 'white' }}>Password Reset!</h1>
              </div>
            </div>

            <div className="rounded-2xl p-6 shadow-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="text-center space-y-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-hover)' }}>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Password Changed Successfully</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    Your password has been updated. You can now log in with your new password.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="btn w-full py-3"
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:block order-1">
          <AuthImagePattern
            title="Password Reset Complete"
            subtitle="Your account is now secured with a new password. Sign in to continue chatting."
          />
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold mt-4" style={{ color: 'white' }}>Reset Password</h1>
              <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Create a new password for your account
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input w-full pl-10 pr-10 py-3"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ 
                      backgroundColor: 'var(--background)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Password must be at least 6 characters long
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
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden sm:block order-1">
        <AuthImagePattern
          title="Create New Password"
          subtitle="Choose a strong password to keep your account secure."
        />
      </div>
    </div>
  );
};

export default ResetPasswordPage;