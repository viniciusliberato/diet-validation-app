import { useState } from 'react';
import { Navigation } from './Navigation';
import { DashboardStats } from '../Dashboard/DashboardStats';
import { WeeklyCalendar } from '../Dashboard/WeeklyCalendar';
import { MealUpload } from '../Meals/MealUpload';
import { ProgressCharts } from '../Insights/ProgressCharts';
import { RewardsSystem } from '../Rewards/RewardsSystem';
import { ChatSystem } from '../Chat/ChatSystem';
import { UserProfile } from '../Profile/UserProfile';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <WeeklyCalendar />
          </div>
        );
      case 'meals':
        return <MealUpload />;
      case 'progress':
        return <ProgressCharts />;
      case 'rewards':
        return <RewardsSystem />;
      case 'chat':
        return <ChatSystem />;
      case 'profile':
        return <UserProfile />;
      case 'store':
        return <RewardsSystem />; // Using rewards for now
      default:
        return (
          <div className="space-y-6">
            <DashboardStats />
            <WeeklyCalendar />
          </div>
        );
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      meals: 'Registro de Refeições',
      progress: 'Progresso e Insights',
      rewards: 'Sistema de Recompensas',
      store: 'Loja de Pontos',
      chat: 'Chat com Nutricionista',
      profile: 'Perfil do Paciente',
    };
    return titles[activeTab as keyof typeof titles] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        "md:ml-20", // Desktop sidebar width
        "pt-16 md:pt-0" // Mobile header height
      )}>
        <div className="container mx-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso nutricional e conquiste suas metas
            </p>
          </div>

          {/* Content */}
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainLayout;