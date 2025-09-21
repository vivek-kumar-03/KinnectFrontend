import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-xl backdrop-blur-sm transition-all duration-300`}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Chat bubble shape */}
        <div 
          className="absolute inset-0 rounded-xl transform rotate-45"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        />
        
        {/* Letter K representation */}
        <div 
          className={`font-bold relative z-10 ${textSizeClasses[size]}`}
          style={{ color: 'white' }}
        >
          K
        </div>
        
        {/* Connection dots */}
        <div 
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--success)' }}
        />
        <div 
          className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--warning)' }}
        />
      </div>
    </div>
  );
};

export default Logo;