interface SkeletonCardProps {
  variant?: 'feed' | 'explore';
}

export const SkeletonCard = ({ variant = 'feed' }: SkeletonCardProps) => {
  if (variant === 'explore') {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 animate-pulse">
        {/* Image skeleton - aspect ratio 3/4 */}
        <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient" />
        
        {/* Info section */}
        <div className="p-3 space-y-2">
          {/* Title */}
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient rounded w-3/4" />
          
          {/* Username */}
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient rounded w-1/2" />
          
          {/* Stats */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-3">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient rounded w-12" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient rounded w-12" />
            </div>
            <div className="h-4 w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Feed variant (masonry style)
  return (
    <div className="break-inside-avoid">
      {/* Image skeleton - variable heights for masonry effect */}
      <div 
        className="relative rounded-[2.5rem] overflow-hidden mb-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient"
        style={{ height: `${300 + Math.random() * 200}px` }} // Random heights like real images
      >
        {/* Decorative skeleton circles */}
        <div className="absolute top-4 left-4 w-8 h-8 bg-white/20 rounded-full" />
        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full" />
      </div>

      {/* Bottom info */}
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient rounded w-20" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient rounded w-8" />
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-gradient rounded w-8" />
        </div>
      </div>
    </div>
  );
};
