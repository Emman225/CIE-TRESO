import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-zinc-900
        rounded-[24px] border border-zinc-200 dark:border-zinc-800
        shadow-sm
        ${hover ? 'hover:shadow-xl hover:border-primary/30 transition-all' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};

export default Card;
