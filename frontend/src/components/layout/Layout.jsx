import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ activeTab, setActiveTab, children }) {
  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Navbar activeTab={activeTab} />
        <div className="page-content">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;

