import React, { useState } from 'react';
import { MadrasaProvider, useMadrasa } from './context/MadrasaContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginModal } from './components/auth/LoginModal';
import { ThemeSelectorModal } from './components/common/ThemeSelectorModal';
import { ThemeFloatingTrigger } from './components/common/ThemeFloatingTrigger';

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

const MainAppContent: React.FC = () => {
  const { currentRole, activePublicTab } = useMadrasa();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Noto_Serif_Bengali',serif]">
      {/* Top Header (Cleaned up, no cluttered stacked bars) */}
      <Header onOpenLogin={() => setIsLoginModalOpen(true)} />

      {/* Main Content Area Based on Current Role */}
      <main className="flex-1">
        {/* 1. PUBLIC PORTAL */}
        {currentRole === 'public' && (
          <div>
            {activePublicTab === 'home' && <PublicHome onOpenLogin={() => setIsLoginModalOpen(true)} />}
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
      </main>

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultTab={currentRole === 'public' ? 'student' : currentRole}
      />

      {/* Interactive Theme Selector Modal & Floating Quick Dots */}
      <ThemeSelectorModal />
      <ThemeFloatingTrigger />
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
