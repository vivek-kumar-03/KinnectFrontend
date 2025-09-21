// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { LogOut, MessageSquare, Settings, User, Menu, X, ArrowLeft, Users, UserPlus, UserCheck } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import { useFriendStore } from "../store/useFriendStore";

const Navbar = () => {
  const { logout, authUser, onlineUsers } = useAuthStore();
  const { showOnlineOnly, setShowOnlineOnly } = useChatStore();
  const { friendRequests } = useFriendStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const showBackButton = location.pathname !== "/" && authUser;

  const handleBack = () => {
    if (location.pathname === "/profile" || location.pathname === "/settings") {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Ensure onlineUsers is an array to prevent errors
  const safeOnlineUsers = Array.isArray(onlineUsers) ? onlineUsers : [];

  return (
    <header className="fixed w-full top-0 z-[1000] border-b" 
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="container mx-auto px-3 sm:px-4 h-16">
        <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 transition-colors p-2 rounded-lg flex-shrink-0"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-hover)' }}
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:block text-sm">Back</span>
              </button>
            )}

            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all min-w-0">
              <Logo size="md" />
              <h1 className="text-xl font-bold hidden sm:block truncate" style={{ color: 'var(--primary)' }}>Kinnect</h1>
            </Link>

            {/* Show online only toggle - only show on chat pages */}
            {authUser && location.pathname === "/" && (
              <div className="hidden sm:flex items-center gap-2 ml-4">
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOnlineOnly}
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Show online only</span>
                </label>
                <span className="text-xs px-2 py-1 rounded-full" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--primary)' }}>
                  ({safeOnlineUsers.length - 1} online)
                </span>
              </div>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              to="/settings"
              className="transition-all duration-200 px-3 lg:px-4 py-2 flex items-center gap-1 rounded-lg"
              style={{ color: 'var(--text-primary)', backgroundColor: 'transparent' }}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link 
                  to="/profile" 
                  className="transition-all duration-200 px-3 lg:px-4 py-2 flex items-center gap-1 rounded-lg"
                  style={{ color: 'var(--text-primary)', backgroundColor: 'transparent' }}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline ml-1">Profile</span>
                </Link>

                <button 
                  className="transition-all duration-200 px-3 lg:px-4 py-2 flex items-center gap-1 rounded-lg"
                  style={{ backgroundColor: 'var(--error)', color: 'white' }}
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline ml-1">Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden transition-all duration-200 p-2 relative flex items-center justify-center rounded-lg"
            style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-hover)' }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {friendRequests && friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 backdrop-blur-sm shadow-lg border-b rounded-b-xl"
               style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex flex-col p-4 space-y-3">
              {/* Friend Management Section */}
              {authUser && location.pathname === "/" && (
                <div className="py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Friends</h3>
                    <label className="cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showOnlineOnly}
                        onChange={(e) => setShowOnlineOnly(e.target.checked)}
                        className="checkbox checkbox-sm"
                      />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Online only</span>
                    </label>
                  </div>
                  <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {safeOnlineUsers.length - 1} online
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Link 
                      to="/"
                      className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors relative"
                      style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-hover)' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Users className="w-5 h-5" />
                      <span className="text-xs">Friends</span>
                    </Link>
                    <Link 
                      to="/"
                      className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors relative"
                      style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-hover)' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserPlus className="w-5 h-5" />
                      <span className="text-xs">Add Friend</span>
                    </Link>
                    <Link 
                      to="/"
                      className="flex flex-col items-center gap-1 p-3 rounded-lg transition-colors relative"
                      style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-hover)' }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCheck className="w-5 h-5" />
                      {friendRequests && friendRequests.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {friendRequests.length}
                        </span>
                      )}
                      <span className="text-xs">Requests</span>
                    </Link>
                  </div>
                </div>
              )}

              <Link
                to="/settings"
                className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-hover)' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>

              {authUser && (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors"
                    style={{ color: 'var(--text-primary)', backgroundColor: 'var(--surface-hover)' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>

                  <button 
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors text-left w-full"
                    style={{ color: 'var(--error)', backgroundColor: 'var(--surface-hover)' }}
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;