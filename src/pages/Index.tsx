import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/Layout/MainLayout";
import { PatientInvitations } from "@/components/Patient/PatientInvitations";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PatientSidebar } from "@/components/Layout/PatientSidebar";
import { DashboardStats } from "@/components/Dashboard/DashboardStats";
import { WeeklyCalendar } from "@/components/Dashboard/WeeklyCalendar";
import { PatientMealPlan } from "@/components/MealPlan/PatientMealPlan";
import { ProgressCharts } from "@/components/Insights/ProgressCharts";
import { RewardsSystem } from "@/components/Rewards/RewardsSystem";
import { ChatSystem } from "@/components/Chat/ChatSystem";
import { UserProfile } from "@/components/Profile/UserProfile";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, loading, navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setUserProfile(profile);
      
      // Redirect nutritionists to their dashboard
      if (profile?.user_type === 'nutritionist') {
        navigate('/nutritionist');
        return;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <WeeklyCalendar />
          </div>
        );
      case 'meal-plan':
        return <PatientMealPlan />;
      case 'invitations':
        return <PatientInvitations />;
      case 'progress':
        return <ProgressCharts />;
      case 'rewards':
        return <RewardsSystem />;
      case 'chat':
        return <ChatSystem />;
      case 'profile':
        return <UserProfile />;
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
      'meal-plan': 'Plano Alimentar',
      invitations: 'Convites',
      progress: 'Progresso e Insights',
      rewards: 'Sistema de Recompensas',
      chat: 'Chat com Nutricionista',
      profile: 'Perfil do Paciente',
    };
    return titles[activeTab as keyof typeof titles] || 'Dashboard';
  };

  // Show enhanced layout for patients with sidebar
  if (userProfile?.user_type === 'patient') {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-secondary/10">
          <PatientSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold ml-4">{getPageTitle()}</h1>
            </header>
            
            <main className="flex-1 p-6 overflow-auto">
              {renderContent()}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return <MainLayout />;
};

export default Index;
