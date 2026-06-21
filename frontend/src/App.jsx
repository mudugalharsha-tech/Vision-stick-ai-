import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar        from './components/NavBar';
import Footer        from './components/Footer';
import { ToastContainer } from './components/Toast';
import { HomePage, FeaturesPage, HowItWorks }  from './pages/PublicPages';
import DashboardPage from './pages/DashboardPage';
import './styles/global.css';

function Layout({ children }) {
  return (
    <>
      <NavBar />
      <main className="main-content">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ToastContainer />
      <Routes>
        <Route path="/"             element={<Layout><HomePage /></Layout>} />
        <Route path="/features"     element={<Layout><FeaturesPage /></Layout>} />
        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/detect"       element={<Layout><DashboardPage /></Layout>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
