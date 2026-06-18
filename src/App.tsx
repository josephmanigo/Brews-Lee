import React, { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartPanel } from './components/CartPanel';
import { ToastContainer } from './components/ToastContainer';
import { FlyingItemAnimation } from './components/FlyingItemAnimation';

import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { StoryPage } from './pages/StoryPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { InfoPage } from './pages/InfoPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';

// Scroll to top on route change
const ScrollToTop = () => {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
};

export default function App() {
  const [location] = useLocation();
  const isAuthPage = location === '/login' || location === '/signup' || location === '/update-password';

  return (
    <AppProvider>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        {!isAuthPage && <Navbar />}
        <CartPanel />
        <ToastContainer />
        <FlyingItemAnimation />
        

        <main className="flex-grow">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/menu" component={MenuPage} />
            <Route path="/story" component={StoryPage} />
            <Route path="/checkout" component={CheckoutPage} />
            <Route path="/login"><AuthPage mode="login" /></Route>
            <Route path="/signup"><AuthPage mode="signup" /></Route>
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/update-password" component={UpdatePasswordPage} />
            <Route path="/auth/callback" component={AuthCallbackPage} />
            <Route path="/sourcing"><InfoPage title="Sourcing" /></Route>
            <Route path="/contact"><InfoPage title="Contact Us" /></Route>
            <Route path="/privacy"><InfoPage title="Privacy Policy" /></Route>
            <Route path="/terms"><InfoPage title="Terms of Service" /></Route>
            <Route path="/shipping"><InfoPage title="Shipping & Returns" /></Route>
            
            {/* 404 Fallback */}
            <Route>
              <div className="min-h-screen flex items-center justify-center bg-[#fcfaf5]">
                <div className="text-center">
                  <h1 className="font-serif text-6xl text-[#0d1b14] mb-4">404</h1>
                  <p className="font-sans text-[#0d1b14]/60 mb-8">Page not found.</p>
                </div>
              </div>
            </Route>
          </Switch>
        </main>
        
        {!isAuthPage && <Footer />}
      </div>
    </AppProvider>
  );
}
