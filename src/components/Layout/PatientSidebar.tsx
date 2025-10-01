import { useNavigate } from "react-router-dom";
import { Home, Calendar, TrendingUp, Gift, MessageCircle, User, LogOut, Mail } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PatientSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function PatientSidebar({ activeTab, onTabChange }: PatientSidebarProps) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isCollapsed = state === 'collapsed';

  const menuItems = [
    { id: "dashboard", title: "Dashboard", icon: Home },
    { id: "meal-plan", title: "Plano Alimentar", icon: Calendar },
    { id: "invitations", title: "Convites", icon: Mail },
    { id: "progress", title: "Progresso", icon: TrendingUp },
    { id: "rewards", title: "Recompensas", icon: Gift },
    { id: "chat", title: "Chat", icon: MessageCircle },
    { id: "profile", title: "Perfil", icon: User },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "text-center" : ""}>
            {isCollapsed ? "PAC" : "Paciente"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className="cursor-pointer"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut />
          <span>Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}