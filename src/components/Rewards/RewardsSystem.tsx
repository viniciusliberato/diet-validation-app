import { Trophy, Star, Gift, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'Primeira Semana',
    description: 'Complete 7 dias consecutivos',
    points: 100,
    icon: <Trophy className="w-6 h-6" />,
    unlocked: true,
  },
  {
    id: '2',
    title: 'Consistência',
    description: 'Complete 21 dias em um mês',
    points: 300,
    icon: <Star className="w-6 h-6" />,
    unlocked: false,
    progress: 15,
    maxProgress: 21,
  },
  {
    id: '3',
    title: 'Perfeição',
    description: 'Tenha 100% de aderência por uma semana',
    points: 500,
    icon: <Zap className="w-6 h-6" />,
    unlocked: false,
    progress: 5,
    maxProgress: 7,
  },
];

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  image: string;
  discount: string;
}

const rewards: Reward[] = [
  {
    id: '1',
    title: 'Desconto Suplementos',
    description: '20% off em whey protein',
    points: 500,
    category: 'Suplementos',
    image: '/placeholder.svg',
    discount: '20%',
  },
  {
    id: '2',
    title: 'Academia Premium',
    description: '1 mês grátis na academia',
    points: 1200,
    category: 'Academia',
    image: '/placeholder.svg',
    discount: '100%',
  },
  {
    id: '3',
    title: 'Roupas Fitness',
    description: '15% off em roupas esportivas',
    points: 300,
    category: 'Vestuário',
    image: '/placeholder.svg',
    discount: '15%',
  },
];

export const RewardsSystem = () => {
  const currentPoints = 1340;

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <Card className="bg-gradient-primary text-primary-foreground shadow-primary">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{currentPoints.toLocaleString()}</h2>
              <p className="opacity-90">Pontos Disponíveis</p>
            </div>
            <Gift className="w-12 h-12 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border ${
                  achievement.unlocked
                    ? 'bg-success/5 border-success/20'
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      achievement.unlocked
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <Badge variant={achievement.unlocked ? "default" : "secondary"}>
                        +{achievement.points} pts
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    
                    {!achievement.unlocked && achievement.progress && achievement.maxProgress && (
                      <div className="space-y-1">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {achievement.progress} de {achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Store */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Loja de Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="border border-border rounded-lg overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={reward.image}
                    alt={reward.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                    {reward.discount} OFF
                  </Badge>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{reward.title}</h3>
                      <p className="text-xs text-muted-foreground">{reward.category}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {reward.points} pts
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {reward.description}
                  </p>
                  
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={currentPoints < reward.points}
                    variant={currentPoints >= reward.points ? "default" : "secondary"}
                  >
                    {currentPoints >= reward.points ? "Resgatar" : "Pontos Insuficientes"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};