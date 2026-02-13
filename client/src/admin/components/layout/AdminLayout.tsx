import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '@/admin/stores/useUIStore';
import { useAuthStore } from '@/admin/stores/useAuthStore';

const AdminLayout = () => {
  const { sidebarCollapsed } = useUIStore();
  const desktopMargin = sidebarCollapsed ? 80 : 280;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Sidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: desktopMargin }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="admin-main-content flex flex-col min-h-screen"
      >
        {/* Demo Admin Banner */}
        {useAuthStore.getState().admin?.role === 'demo_admin' && (
          <div className="bg-blue-600 text-white text-center py-2 px-4 text-sm font-medium shadow-md relative z-30">
            You are currently in View-Only mode. Changes cannot be saved in this demo environment.
          </div>
        )}
        <Header />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
};

export default AdminLayout;
