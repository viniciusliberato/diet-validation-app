import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { NutritionistSidebar } from '../Layout/NutritionistSidebar';
import { Users, UserPlus, Calendar, BarChart3, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NutritionistPlanCreator } from '../MealPlan/NutritionistPlanCreator';
import { PatientsList } from './PatientsList';
import { InvitationManager } from './InvitationManager';

interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

interface Invitation {
  id: string;
  patient_username: string;
  invitation_code: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export function NutritionistDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [newPatientUsername, setNewPatientUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatients();
    fetchInvitations();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data: relationships, error: relationshipError } = await supabase
        .from('nutritionist_patients')
        .select('patient_id')
        .eq('nutritionist_id', user?.id);

      if (relationshipError) throw relationshipError;

      if (!relationships || relationships.length === 0) {
        setPatients([]);
        return;
      }

      // Fetch profiles for these patients
      const patientIds = relationships.map(r => r.patient_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, username, avatar_url, created_at')
        .in('user_id', patientIds);

      if (profilesError) throw profilesError;

      setPatients((profiles || []) as Patient[]);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pacientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_invitations')
        .select('*')
        .eq('nutritionist_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const sendInvitation = async () => {
    if (!newPatientUsername.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome de usuário do paciente",
        variant: "destructive",
      });
      return;
    }

    setSendingInvite(true);
    try {
      const username = newPatientUsername.trim().toLowerCase();
      const isValid = /^[a-z0-9._]{3,30}$/.test(username);
      if (!isValid) {
        toast({
          title: "Nome de usuário inválido",
          description: "Use apenas letras minúsculas, números, ponto e underline (3-30 caracteres).",
          variant: "destructive",
        });
        return;
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('patient_invitations')
        .select('id, status')
        .eq('nutritionist_id', user?.id)
        .eq('patient_username', username)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingInvitation) {
        toast({
          title: "Convite já existe",
          description: "Você já enviou um convite pendente para este paciente",
          variant: "destructive",
        });
        return;
      }

      // Send invitation
      const { error } = await supabase
        .from('patient_invitations')
        .insert({
          nutritionist_id: user?.id,
          patient_username: username,
          invitation_code: null
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Convite criado! Compartilhe o código gerado com o paciente.",
      });
      setNewPatientUsername('');
      await fetchInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const getPageTitle = () => {
    const titles = {
      overview: 'Visão Geral',
      patients: 'Pacientes',
      plans: 'Criar Planos',
      invitations: 'Convites',
      reports: 'Relatórios',
    };
    return titles[activeTab as keyof typeof titles] || 'Painel do Nutricionista';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patients.length}</div>
                <p className="text-xs text-muted-foreground">
                  {invitations.filter(i => i.status === 'pending').length} convites pendentes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Convites Ativos</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invitations.filter(i => i.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">
                  {invitations.filter(i => i.status === 'accepted').length} aceitos este mês
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Em desenvolvimento</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Adesão</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-muted-foreground">+2% em relação ao mês passado</p>
              </CardContent>
            </Card>
          </div>
        );
      case 'patients':
        return <PatientsList patients={patients} />;
      case 'plans':
        return <NutritionistPlanCreator />;
      case 'invitations':
        return (
          <InvitationManager 
            invitations={invitations}
            onSendInvitation={sendInvitation}
            newPatientUsername={newPatientUsername}
            setNewPatientUsername={setNewPatientUsername}
            sending={sendingInvite}
          />
        );
      case 'reports':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Análises</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta seção está em desenvolvimento. Em breve você poderá visualizar:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Relatórios de adesão aos planos alimentares</li>
                <li>Estatísticas de validação de refeições</li>
                <li>Progresso individual dos pacientes</li>
                <li>Análises comparativas</li>
              </ul>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (selectedPatientId) {
    const selectedPatient = patients.find(p => p.user_id === selectedPatientId);
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-secondary/10">
          <NutritionistSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1 flex flex-col">
            <header className="h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedPatientId(null)}
              >
                ← Voltar
              </Button>
              <h1 className="text-xl font-semibold ml-4">Acompanhamento - {selectedPatient?.full_name}</h1>
            </header>
            
            <main className="flex-1 p-6 overflow-auto">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Acompanhamento - {selectedPatient?.full_name}</h2>
                <p className="text-muted-foreground">Esta funcionalidade está em desenvolvimento</p>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <NutritionistSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
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