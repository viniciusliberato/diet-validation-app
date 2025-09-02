import { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface MealValidation {
  id: string;
  type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  feedback?: string;
  score?: number;
}

const mealTypes = [
  { id: 'breakfast', label: 'Café da Manhã', time: '07:00-09:00' },
  { id: 'lunch', label: 'Almoço', time: '12:00-14:00' },
  { id: 'snack', label: 'Lanche', time: '15:00-17:00' },
  { id: 'dinner', label: 'Jantar', time: '19:00-21:00' },
];

export const MealUpload = () => {
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [todayMeals, setTodayMeals] = useState<MealValidation[]>([
    {
      id: '1',
      type: 'breakfast',
      image: '/placeholder.svg',
      status: 'approved',
      timestamp: new Date(),
      score: 95,
      feedback: 'Excelente! Todas as proteínas e fibras estão presentes.'
    }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!selectedMealType) {
      toast({
        title: "Selecione o tipo de refeição",
        description: "Por favor, escolha qual refeição você está registrando.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Simular validação por IA
    setTimeout(() => {
      const newMeal: MealValidation = {
        id: Date.now().toString(),
        type: selectedMealType as any,
        image: URL.createObjectURL(file),
        status: 'pending',
        timestamp: new Date(),
      };
      
      setTodayMeals(prev => [...prev, newMeal]);
      
      // Simular resposta da IA após alguns segundos
      setTimeout(() => {
        setTodayMeals(prev => prev.map(meal => 
          meal.id === newMeal.id 
            ? { 
                ...meal, 
                status: Math.random() > 0.3 ? 'approved' : 'rejected',
                score: Math.floor(Math.random() * 30) + 70,
                feedback: Math.random() > 0.3 
                  ? 'Refeição aprovada! Composição adequada para sua dieta.' 
                  : 'Alguns alimentos não estão de acordo com seu plano. Verifique as porções.'
              }
            : meal
        ));
      }, 3000);
      
      setIsUploading(false);
      setSelectedMealType('');
      
      toast({
        title: "Foto enviada!",
        description: "Nossa IA está analisando sua refeição...",
      });
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-success/10 text-success border-success/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Registrar Refeição
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mealTypes.map((meal) => (
              <Button
                key={meal.id}
                variant={selectedMealType === meal.id ? "default" : "outline"}
                onClick={() => setSelectedMealType(meal.id)}
                className="h-auto flex flex-col gap-1 p-3"
              >
                <span className="font-medium text-sm">{meal.label}</span>
                <span className="text-xs opacity-70">{meal.time}</span>
              </Button>
            ))}
          </div>
          
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Tire uma foto da sua refeição</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Nossa IA irá analisar se está de acordo com seu plano alimentar
            </p>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !selectedMealType}
              className="bg-gradient-primary hover:shadow-primary transition-all"
            >
              {isUploading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Fotografar Refeição
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Meals */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle>Refeições de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayMeals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma refeição registrada hoje
              </p>
            ) : (
              todayMeals.map((meal) => (
                <div key={meal.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                  <img
                    src={meal.image}
                    alt="Refeição"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {mealTypes.find(m => m.id === meal.type)?.label}
                      </h4>
                      <Badge className={getStatusColor(meal.status)}>
                        {getStatusIcon(meal.status)}
                        <span className="ml-1">
                          {meal.status === 'approved' ? 'Aprovada' : 
                           meal.status === 'rejected' ? 'Rejeitada' : 'Analisando'}
                        </span>
                      </Badge>
                      {meal.score && (
                        <Badge variant="outline">{meal.score}% Match</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {meal.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    
                    {meal.feedback && (
                      <p className="text-sm">{meal.feedback}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};