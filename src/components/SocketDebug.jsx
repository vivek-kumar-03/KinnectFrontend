import { useAuthStore } from '../store/useAuthStore';

const SocketDebug = () => {
  const { authUser, socket } = useAuthStore();

  if (!authUser) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs">
      <div>User: {authUser.username}</div>
      <div>Tab: {socket?.tabId?.slice(-8)}</div>
      <div>Connected: {socket?.isConnected() ? '✅' : '❌'}</div>
    </div>
  );
};

export default SocketDebug;