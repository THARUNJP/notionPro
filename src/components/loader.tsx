import React from 'react';

interface SkeletonLoaderProps {
  count?: number; // number of rows
  columns?: number; // number of columns, default 6
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 5, columns = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, rowIdx) => (
        <tr key={rowIdx} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default SkeletonLoader;
