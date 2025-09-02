import { Check, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DayStatus {
  date: Date;
  status: 'completed' | 'partial' | 'missed' | 'today';
  mealsCompleted: number;
  totalMeals: number;
  adherenceRate: number;
}

const generateWeekData = (): DayStatus[] => {
  const today = new Date();
  const weekData: DayStatus[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const isToday = i === 0;
    const mealsCompleted = isToday ? 2 : Math.floor(Math.random() * 5);
    const totalMeals = 4;
    const adherenceRate = (mealsCompleted / totalMeals) * 100;
    
    let status: DayStatus['status'];
    if (isToday) {
      status = 'today';
    } else if (adherenceRate >= 75) {
      status = 'completed';
    } else if (adherenceRate >= 25) {
      status = 'partial';
    } else {
      status = 'missed';
    }
    
    weekData.push({
      date,
      status,
      mealsCompleted,
      totalMeals,
      adherenceRate
    });
  }
  
  return weekData;
};

export const WeeklyCalendar = () => {
  const weekData = generateWeekData();
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-success" />;
      case 'partial':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'missed':
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-primary" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 border-success/20';
      case 'partial':
        return 'bg-warning/10 border-warning/20';
      case 'missed':
        return 'bg-destructive/10 border-destructive/20';
      default:
        return 'bg-primary/10 border-primary/20';
    }
  };

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader>
        <CardTitle>Esta Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekData.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-muted-foreground mb-2">
                {day.date.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </div>
              <div className="text-xs font-medium mb-2">
                {day.date.getDate()}
              </div>
              <div className={`
                w-12 h-12 mx-auto rounded-lg border-2 flex items-center justify-center
                ${getStatusColor(day.status)}
                transition-all duration-200 hover:scale-105
              `}>
                {getStatusIcon(day.status)}
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {day.mealsCompleted}/{day.totalMeals}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="w-3 h-3 bg-success rounded-full" />
            <span>Completo</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="w-3 h-3 bg-warning rounded-full" />
            <span>Parcial</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="w-3 h-3 bg-destructive rounded-full" />
            <span>Perdido</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span>Hoje</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};