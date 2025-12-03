
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  color = "bg-yellow-400", 
  className = "",
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${color} 
        text-white font-bold py-4 px-8 rounded-3xl 
        shadow-[0_6px_0_rgba(0,0,0,0.2)] 
        active:shadow-none
        active:translate-y-1.5 
        transition-all duration-150 
        flex items-center justify-center gap-3
        disabled:opacity-50 disabled:cursor-not-allowed
        text-xl md:text-2xl
        mx-auto
        ${className}
      `}
    >
      {children}
    </button>
  );
};
