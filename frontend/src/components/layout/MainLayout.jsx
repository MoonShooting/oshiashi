import React, { useState } from 'react';
import Navbar from './NavBar';
import Sidebar from './Sidebar';
import styles from '../../styles/MainLayout.module.css';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className={styles.layout}>
      <Navbar onMenuClick={toggleSidebar} />
      <div className={styles.container}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
