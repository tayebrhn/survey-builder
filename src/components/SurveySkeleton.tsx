export const SurveySkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans animate-pulse">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header Skeleton */}
        <div className="bg-gray-200 p-6">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex border-b border-gray-200">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 py-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="p-8">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
