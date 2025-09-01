import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'default' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'default',
  width = '100%',
  height = '1rem',
  ...props
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 rounded animate-pulse';
  
  const variantClasses = {
    default: 'rounded',
    circle: 'rounded-full',
    text: 'h-4 rounded',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: variant === 'text' ? '1em' : (typeof height === 'number' ? `${height}px` : height),
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    />
  );
};

export { Skeleton };
export default Skeleton;
