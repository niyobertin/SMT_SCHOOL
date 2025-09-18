export const LessonSkeleton = () => (
    <div className="p-6 animate-pulse">
        <div className="flex items-start">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div className="ml-4 flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded-md ml-4"></div>
        </div>
    </div>
);

export const HeaderSkeleton = () => (
    <div className="mb-8 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-48 w-full bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="flex space-x-4">
            <div className="h-6 w-24 bg-gray-200 rounded"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
        </div>
    </div>
);