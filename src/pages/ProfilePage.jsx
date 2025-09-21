import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import PageContainer from "../components/PageContainer";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <PageContainer 
      title="Profile" 
      subtitle="Your profile information"
      backTo="/"
      backLabel="Back to Chat"
      contentClassName="max-w-2xl"
    >
      <div className="space-y-8">
        {/* avatar upload section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={selectedImg || authUser.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-24 sm:size-32 rounded-full object-cover border-4 shadow-lg"
              style={{ borderColor: 'var(--border)' }}
            />
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-0 right-0 
                hover:scale-105
                p-2 rounded-full cursor-pointer 
                transition-all duration-200 shadow-lg
                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
              `}
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-sm text-center px-4" style={{ color: 'var(--text-secondary)' }}>
            {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="text-sm flex items-center gap-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
              <User className="w-4 h-4" />
              Username
            </div>
            <div className="input text-base-content py-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{authUser?.username}</div>
          </div>

          <div className="space-y-3">
            <div className="text-sm flex items-center gap-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
              <User className="w-4 h-4" />
              Full Name
            </div>
            <div className="input text-base-content py-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{authUser?.fullName}</div>
          </div>

          <div className="space-y-3">
            <div className="text-sm flex items-center gap-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <div className="input text-base-content py-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>{authUser?.email}</div>
          </div>
        </div>

        <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Member Since</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{authUser?.createdAt?.split("T")[0]}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span style={{ color: 'var(--text-secondary)' }}>Account Status</span>
              <span className="font-medium" style={{ color: 'var(--success)' }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
export default ProfilePage;