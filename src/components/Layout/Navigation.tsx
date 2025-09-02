import { useState } from 'react';
import { 
  Home, 
  Camera, 
  Trophy, 
  BarChart3, 
  User, 
  Store, 
  MessageCircle,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'meals', label: 'Refeições', icon: Camera },
  { id: 'progress', label: 'Progresso', icon: BarChart3 },
  { id: 'rewards', label: 'Recompensas', icon: Trophy },
  { id: 'store', label: 'Loja', icon: Store },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'profile', label: 'Perfil', icon: User },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-gradient-card border-r border-border shadow-medium z-40">
        <div className="flex flex-col items-center py-6 w-full">
          <div className="mb-8">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 w-full px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full h-12 p-0 relative group transition-smooth",
                    isActive && "bg-primary/10 text-primary"
                  )}
                  title={item.label}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive && "text-primary"
                  )} />
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                  )}
                </Button>
              );
            })}
          </div>
          
          <div className="mt-auto">
            <Button variant="ghost" size="sm" className="w-12 h-12 p-0">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-card border-b border-border shadow-medium z-50 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-primary">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <span className="font-semibold">NutriAI</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 p-0"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-16 bg-background/95 backdrop-blur-sm z-40">
            <div className="bg-gradient-card border-b border-border p-4">
              <div className="grid grid-cols-2 gap-3">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => {
                        onTabChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="h-14 flex flex-col gap-1 text-xs"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};