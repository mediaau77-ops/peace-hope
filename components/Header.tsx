import React from 'react';
import { Header as PublicHeader, HeaderFallback } from '../src/components/public/shared/Header';
import { SectionErrorBoundary } from './SectionErrorBoundary';
import { PublicSettings } from '../src/types/public';

interface HeaderProps {
  settings?: PublicSettings | null;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <SectionErrorBoundary sectionName="Header" fallback={<HeaderFallback />}>
      <PublicHeader {...props} />
    </SectionErrorBoundary>
  );
};

export default Header;
