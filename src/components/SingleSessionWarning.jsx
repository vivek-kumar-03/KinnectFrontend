import { useEffect, useState } from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';

const SingleSessionWarning = () => {
  const [show, setShow] = useState(false);
  const [conflictUser, setConflictUser] = useState(null);

  useEffect(() => {
    const handleStorageChange = (e) => {
      // Check for user session conflicts only
      if (e.key && e.key.startsWith('userSession_') && e.newValue) {
        const currentUser = JSON.parse(sessionStorage.getItem('authUser') || 'null');
        if (currentUser) {
          const userId = e.key.replace('userSession_', '');
          if (userId === currentUser._id) {
            const newSession = JSON.parse(e.newValue);
            if (newSession.sessionId !== currentUser.sessionId) {
              setConflictUser(currentUser.fullName || currentUser.username);
              setShow(true);
            }
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="text-yellow-500 w-6 h-6 mr-2" />
          <h3 className="text-lg font-semibold">Session Conflict</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          User {conflictUser} has logged in from another tab. Only one session per user is allowed.
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default SingleSessionWarning;