import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside
      className="h-full w-20 lg:w-80 border-r border-base-300 
    flex flex-col transition-all duration-200 bg-base-100"
    >
      {/* Header */}
      <div className="border-b border-base-300 w-full p-4 lg:p-5 bg-base-100">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-base-content" />
          <span className="font-semibold hidden lg:block text-base-content">Friends</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <div className="skeleton h-4 w-32"></div>
        </div>
        
        {/* Friend Management Buttons */}
        <div className="flex items-center justify-center lg:justify-start gap-2 mt-3">
          <div className="skeleton w-8 h-8 rounded-lg"></div>
          <div className="skeleton w-8 h-8 rounded-lg"></div>
          <div className="skeleton w-8 h-8 rounded-lg"></div>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-3 flex-1 bg-base-100">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 mx-2 mb-2 flex items-center gap-3 rounded-xl">
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-12 rounded-full" />
            </div>

            {/* User info skeleton - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;