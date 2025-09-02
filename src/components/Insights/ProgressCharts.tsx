import { Line, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Target } from 'lucide-react';

const weeklyData = [
  { day: 'Seg', meals: 4, target: 4, adherence: 100 },
  { day: 'Ter', meals: 3, target: 4, adherence: 75 },
  { day: 'Qua', meals: 4, target: 4, adherence: 100 },
  { day: 'Qui', meals: 2, target: 4, adherence: 50 },
  { day: 'Sex', meals: 4, target: 4, adherence: 100 },
  { day: 'Sáb', meals: 3, target: 4, adherence: 75 },
  { day: 'Dom', meals: 4, target: 4, adherence: 100 },
];

const monthlyProgress = [
  { week: 'Sem 1', completed: 85, target: 75 },
  { week: 'Sem 2', completed: 92, target: 75 },
  { week: 'Sem 3', completed: 78, target: 75 },
  { week: 'Sem 4', completed: 88, target: 75 },
];

const adherenceData = [
  { name: 'Cumprido', value: 77, color: 'hsl(var(--success))' },
  { name: 'Não Cumprido', value: 23, color: 'hsl(var(--muted))' },
];

const mealTypeData = [
  { type: 'Café da Manhã', approved: 28, rejected: 2 },
  { type: 'Almoço', approved: 25, rejected: 5 },
  { type: 'Lanche', approved: 22, rejected: 8 },
  { type: 'Jantar', approved: 27, rejected: 3 },
];

export const ProgressCharts = () => {
  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-success text-success-foreground shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Taxa de Sucesso</p>
                <p className="text-2xl font-bold">77%</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-primary text-primary-foreground shadow-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Dias Consecutivos</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meta Mensal</p>
                <p className="text-2xl font-bold">85%</p>
              </div>
              <Target className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Adherence Chart */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle>Aderência Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <div className="grid grid-cols-7 gap-2 h-full">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex-1 flex flex-col-reverse w-full max-w-12">
                    <div 
                      className="bg-primary rounded-t transition-all duration-500"
                      style={{ 
                        height: `${(day.meals / day.target) * 100}%`,
                        minHeight: day.meals > 0 ? '8px' : '0px'
                      }}
                    />
                  </div>
                  <Badge 
                    variant={day.adherence === 100 ? "default" : day.adherence >= 75 ? "secondary" : "destructive"}
                    className="mt-2 text-xs"
                  >
                    {day.adherence}%
                  </Badge>
                  <span className="text-xs text-muted-foreground mt-1">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Progress */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle>Progresso Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyProgress.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{week.week}</span>
                  <span className="font-medium">{week.completed}%</span>
                </div>
                <div className="relative">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary transition-all duration-500"
                      style={{ width: `${week.completed}%` }}
                    />
                  </div>
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-accent border-2 border-background rounded-full"
                    style={{ left: `${week.target}%` }}
                    title={`Meta: ${week.target}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Adherence Pie Chart */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader>
            <CardTitle>Taxa de Aderência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="relative w-32 h-32">
                {/* Simple circular progress */}
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="hsl(var(--success))"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 * (1 - 0.77)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">77%</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full" />
                <span className="text-sm">Cumprido</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded-full" />
                <span className="text-sm">Não Cumprido</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Type Performance */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader>
            <CardTitle>Performance por Refeição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mealTypeData.map((meal, index) => {
                const total = meal.approved + meal.rejected;
                const percentage = (meal.approved / total) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{meal.type}</span>
                      <span className="font-medium">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-success transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{meal.approved} aprovadas</span>
                      <span>{meal.rejected} rejeitadas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};