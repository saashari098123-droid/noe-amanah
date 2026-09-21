import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MadrasaProvider, useMadrasa } from './context/MadrasaContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginModal } from './components/auth/LoginModal';
import { ThemeSelectorModal } from './components/common/ThemeSelectorModal';

// Public Components
import { PublicHome } from './components/public/PublicHome';
import { PublicAbout } from './components/public/PublicAbout';
import { PublicDepartments } from './components/public/PublicDepartments';
import { PublicAdmission } from './components/public/PublicAdmission';
import { PublicNotices } from './components/public/PublicNotices';
import { PublicGallery } from './components/public/PublicGallery';
import { PublicResults } from './components/public/PublicResults';
import { PublicContact } from './components/public/PublicContact';

// Portal Components
import { StudentPortal } from './components/student/StudentPortal';
import { TeacherPortal } from './components/teacher/TeacherPortal';
import { AdminPortal } from './components/admin/AdminPortal';

import { UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { currentRole, activePublicTab } = useMadrasa();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginDefaultTab, setLoginDefaultTab] = useState<UserRole>('student');

  const handleOpenLogin = (tab?: UserRole) => {
    if (tab) {
      setLoginDefaultTab(tab);
    }
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Noto_Serif_Bengali',serif]">
      {/* Top Header */}
      <Header onOpenLogin={() => handleOpenLogin('student')} />

      {/* Main Content Area Based on Current Role */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRole === 'public' ? `public-${activePublicTab}` : `role-${currentRole}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* 1. PUBLIC PORTAL */}
            {currentRole === 'public' && (
              <div>
                {activePublicTab === 'home' && <PublicHome onOpenLogin={() => handleOpenLogin('student')} />}
                {activePublicTab === 'about' && <PublicAbout />}
                {activePublicTab === 'departments' && <PublicDepartments />}
                {activePublicTab === 'admission' && <PublicAdmission />}
                {activePublicTab === 'notices' && <PublicNotices />}
                {activePublicTab === 'gallery' && <PublicGallery />}
                {activePublicTab === 'results' && <PublicResults />}
                {activePublicTab === 'contact' && <PublicContact />}
              </div>
            )}

            {/* 2. STUDENT PORTAL */}
            {currentRole === 'student' && <StudentPortal />}

            {/* 3. TEACHER PORTAL */}
            {currentRole === 'teacher' && <TeacherPortal />}

            {/* 4. ADMIN PORTAL */}
            {currentRole === 'admin' && <AdminPortal />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onOpenLogin={handleOpenLogin} />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultTab={loginDefaultTab}
      />

      {/* Interactive Theme Selector Modal */}
      <ThemeSelectorModal />
    </div>
  );
};

export default function App() {
  return (
    <MadrasaProvider>
      <MainAppContent />
    </MadrasaProvider>
  );
}
