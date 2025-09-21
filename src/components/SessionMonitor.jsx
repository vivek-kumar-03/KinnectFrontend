import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const SessionMonitor = () => {
  const { authUser, checkAuth, handleSessionInvalidation } = useAuthStore();

  useEffect(() => {
    if (!authUser) return;

    // Check session validity every 15 seconds
    const interval = setInterval(async () => {
      try {
        await checkAuth();
      } catch (error) {
        if (error.response?.data?.sessionInvalidated) {
          handleSessionInvalidation();
        }
      }
    }, 15000); // 15 seconds

    // Check session when window gains focus
    const handleFocus = async () => {
      if (authUser) {
        try {
          await checkAuth();
        } catch (error) {
          if (error.response?.data?.sessionInvalidated) {
            handleSessionInvalidation();
          }
        }
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [authUser, checkAuth, handleSessionInvalidation]);

  return null; // This component doesn't render anything
};

export default SessionMonitor;