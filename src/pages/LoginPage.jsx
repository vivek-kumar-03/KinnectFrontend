import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "", // Single field for username or email
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();
  const location = useLocation();

  const validateForm = () => {
    if (!formData.identifier) return toast.error("Username or email is required");
    if (!formData.password) return toast.error("Password is required");
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) {
      // Pass the identifier (which can be username or email) and password to login
      await login({ identifier: formData.identifier, password: formData.password });
    }
  };

  // Check for verification status in URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');

    if (verified === 'true') {
      toast.success("Email verified successfully! You can now log in.");
    } else if (verified === 'false' && error === 'verification_failed') {
      toast.error("Email verification failed. Please try again.");
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col sm:grid sm:grid-cols-2" style={{ background: 'linear-gradient(to bottom right, var(--primary), var(--secondary))' }}>
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 order-2 sm:order-1 min-h-screen sm:min-h-0">
        <div className="w-full max-w-md space-y-6 pt-8 sm:pt-8">
          {/* Back Button */}
          <div className="mb-4 relative z-50">
            <BackButton 
              to="/signup" 
              label="Back to Signup" 
              className="text-base-100 hover:bg-white/10 border-white/20"
            />
          </div>
          
          {/* Header - Better alignment */}
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-2 group">
              <Logo size="lg" />
              <h1 className="text-2xl font-bold mt-4" style={{ color: 'white' }}>Welcome Back</h1>
              <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Sign in to your account</p>
            </div>
          </div>

          {/* Login Form - Better spacing and alignment */}
          <div className="rounded-2xl p-6 shadow-2xl border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    type="text"
                    className="input w-full pl-10 py-3"
                    placeholder="Enter username or email"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
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
              </div>

              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="btn w-full text-base py-3 shadow-lg hover:shadow-xl" 
                disabled={isLoggingIn}
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold underline underline-offset-2 hover:opacity-80" style={{ color: 'white' }}>
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden sm:block order-1">
        <AuthImagePattern
          title={"Welcome back!"}
          subtitle={"Sign in with your username or email and password to start chatting."}
        />
      </div>
    </div>
  );
};
export default LoginPage;