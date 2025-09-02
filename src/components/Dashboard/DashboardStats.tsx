import { TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  progress?: number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatCard = ({ title, value, subtitle, icon, progress, trend, className }: StatCardProps) => (
  <Card className={`bg-gradient-card shadow-soft hover:shadow-medium transition-smooth ${className}`}>
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {trend && (
              <TrendingUp className={`w-4 h-4 ${
                trend === 'up' ? 'text-success' : 
                trend === 'down' ? 'text-destructive' : 
                'text-muted-foreground'
              }`} />
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {progress !== undefined && (
            <div className="mt-3">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{progress}% da meta</p>
            </div>
          )}
        </div>
        <div className="text-primary/60">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Dias Cumpridos"
        value="23"
        subtitle="de 45 dias totais"
        icon={<Calendar className="w-6 h-6" />}
        progress={51}
        trend="up"
      />
      
      <StatCard
        title="Refeições Validadas"
        value="92"
        subtitle="de 120 refeições"
        icon={<Target className="w-6 h-6" />}
        progress={77}
        trend="up"
      />
      
      <StatCard
        title="Pontos Acumulados"
        value="1.340"
        subtitle="+120 esta semana"
        icon={<Award className="w-6 h-6" />}
        trend="up"
      />
      
      <StatCard
        title="Meta Atual"
        value="75%"
        subtitle="Adherência à dieta"
        icon={<TrendingUp className="w-6 h-6" />}
        progress={75}
        trend="up"
      />
    </div>
  );
};