import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useDocumentTitle from '@/hooks/useDocumentTitle';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, title }) => {
  useDocumentTitle(title);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
};

export default PageWrapper;
