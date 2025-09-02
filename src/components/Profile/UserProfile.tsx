import { Edit, Scale, Activity, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface BiodataMetric {
  label: string;
  value: string;
  unit: string;
  trend?: 'up' | 'down';
  change?: string;
}

const biodataMetrics: BiodataMetric[] = [
  {
    label: 'Peso',
    value: '68.5',
    unit: 'kg',
    trend: 'down',
    change: '-2.1kg'
  },
  {
    label: 'IMC',
    value: '22.4',
    unit: '',
    trend: 'down',
    change: '-0.8'
  },
  {
    label: 'Gordura Corporal',
    value: '18.2',
    unit: '%',
    trend: 'down',
    change: '-3.1%'
  },
  {
    label: 'Massa Muscular',
    value: '42.8',
    unit: 'kg',
    trend: 'up',
    change: '+1.2kg'
  },
  {
    label: 'Água Corporal',
    value: '61.4',
    unit: '%',
    trend: 'up',
    change: '+2.1%'
  },
  {
    label: 'TMB',
    value: '1.485',
    unit: 'kcal',
    trend: 'up',
    change: '+45kcal'
  },
];

export const UserProfile = () => {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-primary text-primary-foreground shadow-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ana Silva</h2>
                <p className="opacity-90">Paciente desde Março 2024</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                    Plano Premium
                  </Badge>
                  <Badge className="bg-success/20 text-success-foreground border-success/30">
                    Ativa
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Goals */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Metas Atuais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Perda de Peso</span>
              <span className="font-medium">70% concluído</span>
            </div>
            <Progress value={70} className="h-2" />
            <p className="text-xs text-muted-foreground">Meta: perder 3kg em 45 dias</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Aderência à Dieta</span>
              <span className="font-medium">77% este mês</span>
            </div>
            <Progress value={77} className="h-2" />
            <p className="text-xs text-muted-foreground">Meta: manter 75% de aderência</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Hidratação</span>
              <span className="font-medium">85% hoje</span>
            </div>
            <Progress value={85} className="h-2" />
            <p className="text-xs text-muted-foreground">Meta: 2.5L de água por dia</p>
          </div>
        </CardContent>
      </Card>

      {/* Bioimpedance Data */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Bioimpedância - Última Avaliação
          </CardTitle>
          <p className="text-sm text-muted-foreground">12 de Dezembro, 2024</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {biodataMetrics.map((metric, index) => (
              <div key={index} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  {metric.trend && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        metric.trend === 'up' 
                          ? 'text-success border-success/20' 
                          : 'text-primary border-primary/20'
                      }`}
                    >
                      {metric.change}
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold">{metric.value}</span>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Informações de Saúde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Dados Pessoais</h4>
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Idade:</span> 32 anos</p>
                <p><span className="text-muted-foreground">Altura:</span> 1.65m</p>
                <p><span className="text-muted-foreground">Tipo Sanguíneo:</span> O+</p>
                <p><span className="text-muted-foreground">Atividade:</span> Moderada</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Restrições e Alergias</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Intolerância à Lactose</Badge>
                <Badge variant="outline">Alergia a Nozes</Badge>
              </div>
              
              <h4 className="font-medium mt-4">Suplementação</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Vitamina D</Badge>
                <Badge variant="secondary">Ômega 3</Badge>
                <Badge variant="secondary">Whey Protein</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};