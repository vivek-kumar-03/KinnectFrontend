import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!formData.username.trim()) return toast.error("Username is required");
    if (formData.username.length < 3 || formData.username.length > 30) {
      return toast.error("Username must be between 3 and 30 characters");
    }
    
    // Validate username format (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      return toast.error("Username can only contain letters, numbers, and underscores");
    }
    
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email) return toast.error("Email is required");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return toast.error("Please enter a valid email address");
    
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      const result = await signup(formData);
      // If signup was successful and requires OTP verification, redirect to OTP page
      if (result && result.requiresOTP) {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      }
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
          
          {/* Header - Better alignment */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2 group">
              <Logo size="lg" />
              <h1 className="text-2xl font-bold mt-4" style={{ color: 'white' }}>Create Account</h1>
              <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Join the conversation instantly</p>
            </div>
          </div>

          {/* Signup Form - Better spacing and alignment */}
          <div className="rounded-2xl p-6 shadow-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    type="text"
                    className="input w-full pl-10 py-3"
                    placeholder="john_doe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    style={{ 
                      backgroundColor: 'var(--background)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Username must be 3-30 characters, letters, numbers, and underscores only
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    type="text"
                    className="input w-full pl-10 py-3"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    style={{ 
                      backgroundColor: 'var(--background)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    type="email"
                    className="input w-full pl-10 py-3"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ 
                      backgroundColor: 'var(--background)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input w-full pl-10 pr-10 py-3"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

              <div className="alert" style={{ backgroundColor: 'var(--surface-hover)', borderColor: 'var(--border)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                    !
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Email Verification Required</p>
                    <p style={{ color: 'var(--text-secondary)' }}>We'll send a 6-digit verification code to your email. Please enter it to verify your account.</p>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn w-full text-base py-3 shadow-lg hover:shadow-xl" 
                disabled={isSigningUp}
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold underline underline-offset-2 hover:opacity-80" style={{ color: 'white' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden sm:block order-1">
        <AuthImagePattern
          title={"Create Account"}
          subtitle={"Sign up with your username, email and password to start chatting."}
        />
      </div>
    </div>
  );
};

export default SignUpPage;