import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useDocumentTitle from '@/hooks/useDocumentTitle';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Redirects requests from schools.* subdomain into the /schools/* route tree
 * so the same SPA bundle serves both hosts.
 */
const useSchoolsSubdomainRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const host = window.location.hostname;
    if (!host.startsWith('schools.')) return;
    if (pathname.startsWith('/schools')) return;

    let target = '/schools';
    if (pathname === '/') target = '/schools';
    else if (pathname === '/admin' || pathname.startsWith('/admin/')) target = `/schools${pathname}`;
    else if (pathname.startsWith('/dashboard')) target = `/schools${pathname}`;
    else if (pathname.startsWith('/onboarding')) target = '/schools/onboarding';
    else target = `/schools${pathname}`;

    navigate(`${target}${search}${hash}`, { replace: true });
  }, [pathname, search, hash, navigate]);
};

const PageWrapper: React.FC<PageWrapperProps> = ({ children, title }) => {
  useDocumentTitle(title);
  const { pathname } = useLocation();
  useSchoolsSubdomainRedirect();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
};

export default PageWrapper;
