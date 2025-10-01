import { useNavigate } from "react-router-dom";
import { Users, Calendar, UserPlus, BarChart3, LogOut, Home } from "lucide-react";
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

interface NutritionistSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function NutritionistSidebar({ activeTab, onTabChange }: NutritionistSidebarProps) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isCollapsed = state === 'collapsed';

  const menuItems = [
    { id: "overview", title: "Visão Geral", icon: Home },
    { id: "patients", title: "Pacientes", icon: Users },
    { id: "plans", title: "Criar Planos", icon: Calendar },
    { id: "invitations", title: "Convites", icon: UserPlus },
    { id: "reports", title: "Relatórios", icon: BarChart3 },
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
            {isCollapsed ? "NUT" : "Nutricionista"}
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