import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Navbar from '../components/Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, description }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  React.useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} - Hotstar`;
    } else {
      document.title = 'Hotstar - Watch Movies & TV Shows Online';
    }

    // Update meta description
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return (
    <div className="min-h-screen bg-primary-100 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
