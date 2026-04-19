import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="site-wrapper">
      <Header />
      <main className={isHome ? 'page page-hero' : 'page'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
