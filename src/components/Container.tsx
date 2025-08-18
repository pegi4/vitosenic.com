import React from 'react';

type ContainerProps = {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
};

export default function Container({ children, wide = false, className = '' }: ContainerProps) {
  return (
    <div className={`${wide ? 'container-wide' : 'container-narrow'} ${className}`}>
      {children}
    </div>
  );
}
