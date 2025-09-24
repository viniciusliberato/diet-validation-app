import { useState, useEffect, useRef } from 'react';
import { Camera, Clock, Check, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealSchedule {
  id: string;
  day_of_week: number;
  meal_type: string;
  scheduled_time: string;
  expected_foods: string[];
  portion_notes?: string;
  calories_target?: number;
}

interface MealValidation {
  id: string;
  daily_schedule_id: string;
  validation_date: string;
  validation_status: string;
  confidence_score?: number;
  ai_feedback?: string;
  image_url?: string;
}

interface NutritionPlan {
  id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  schedules: MealSchedule[];
  validations: MealValidation[];
}

const DAYS_OF_WEEK = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

const MEAL_TYPES = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  snack: 'Lanche',
  dinner: 'Jantar'
};

export const PatientMealPlan = () => {
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<{ scheduleId: string; date: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNutritionPlan();
    }
  }, [user]);

  const fetchNutritionPlan = async () => {
    try {
      // Fetch active nutrition plan for the patient
      const { data: plans, error: planError } = await supabase
        .from('nutrition_plans')
        .select('*')
        .eq('patient_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (planError) throw planError;
      
      if (!plans || plans.length === 0) {
        setNutritionPlan(null);
        return;
      }

      const plan = plans[0];

      // Fetch meal schedules for this plan
      const { data: schedules, error: schedulesError } = await supabase
        .from('daily_meal_schedules')
        .select('*')
        .eq('nutrition_plan_id', plan.id)
        .order('day_of_week', { ascending: true });

      if (schedulesError) throw schedulesError;

      // Fetch existing validations for current week
      const weekStart = startOfWeek(selectedWeek);
      const weekEnd = addDays(weekStart, 6);

      const { data: validations, error: validationsError } = await supabase
        .from('meal_validations')
        .select('*')
        .eq('nutrition_plan_id', plan.id)
        .gte('validation_date', format(weekStart, 'yyyy-MM-dd'))
        .lte('validation_date', format(weekEnd, 'yyyy-MM-dd'));

      if (validationsError) throw validationsError;

      setNutritionPlan({
        id: plan.id,
        plan_name: plan.plan_name,
        start_date: plan.start_date,
        end_date: plan.end_date,
        schedules: schedules || [],
        validations: validations || []
      });

    } catch (error) {
      console.error('Error fetching nutrition plan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu plano alimentar.",
        variant: "destructive",
      });
    }
  };

  const handleMealClick = (scheduleId: string, dayOfWeek: number) => {
    const weekStart = startOfWeek(selectedWeek);
    const targetDate = addDays(weekStart, dayOfWeek);
    const dateString = format(targetDate, 'yyyy-MM-dd');
    
    setSelectedMeal({ scheduleId, date: dateString });
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedMeal || !nutritionPlan) return;

    setIsUploading(true);

    try {
      // Find the meal schedule
      const schedule = nutritionPlan.schedules.find(s => s.id === selectedMeal.scheduleId);
      if (!schedule) throw new Error('Schedule not found');

      // Create image description for AI validation
      const imageDescription = `Foto de ${MEAL_TYPES[schedule.meal_type as keyof typeof MEAL_TYPES]} tirada pelo paciente`;

      // Call the meal validation function
      const { data, error } = await supabase.functions.invoke('validate-meal', {
        body: {
          mealType: MEAL_TYPES[schedule.meal_type as keyof typeof MEAL_TYPES],
          expectedFoods: schedule.expected_foods,
          imageDescription
        }
      });

      if (error) throw error;

      // Save the validation result
      const { error: insertError } = await supabase
        .from('meal_validations')
        .insert({
          nutrition_plan_id: nutritionPlan.id,
          daily_schedule_id: selectedMeal.scheduleId,
          patient_id: user?.id,
          validation_date: selectedMeal.date,
          image_url: URL.createObjectURL(file), // In production, this would be uploaded to storage
          image_description: imageDescription,
          validation_status: data.isValid ? 'approved' : 'rejected',
          confidence_score: data.confidence / 100,
          ai_feedback: data.feedback,
          detected_foods: data.detectedFoods,
          missing_foods: data.missingFoods,
          nutritional_match: data.nutritionalMatch / 100,
          calories_estimated: data.estimatedCalories
        });

      if (insertError) throw insertError;

      toast({
        title: data.isValid ? "Refeição Aprovada!" : "Refeição Rejeitada",
        description: data.feedback,
        variant: data.isValid ? "default" : "destructive",
      });

      // Refresh the plan to show the new validation
      await fetchNutritionPlan();

    } catch (error: any) {
      console.error('Error validating meal:', error);
      toast({
        title: "Erro na validação",
        description: error.message || "Não foi possível validar a refeição.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedMeal(null);
    }
  };

  const getMealValidation = (scheduleId: string, dayOfWeek: number) => {
    if (!nutritionPlan) return null;
    
    const weekStart = startOfWeek(selectedWeek);
    const targetDate = addDays(weekStart, dayOfWeek);
    const dateString = format(targetDate, 'yyyy-MM-dd');
    
    return nutritionPlan.validations.find(v => 
      v.daily_schedule_id === scheduleId && v.validation_date === dateString
    );
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

  if (!nutritionPlan) {
    return (
      <Card className="bg-gradient-card shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nenhum plano alimentar ativo</h3>
          <p className="text-muted-foreground text-center">
            Você ainda não possui um plano alimentar ativo. Entre em contato com seu nutricionista.
          </p>
        </CardContent>
      </Card>
    );
  }

  const weekStart = startOfWeek(selectedWeek);

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        className="hidden"
      />

      {/* Plan Header */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {nutritionPlan.plan_name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Período: {format(new Date(nutritionPlan.start_date), 'dd/MM/yyyy', { locale: ptBR })} até {format(new Date(nutritionPlan.end_date), 'dd/MM/yyyy', { locale: ptBR })}
          </p>
        </CardHeader>
      </Card>

      {/* Weekly Navigation */}
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Semana de {format(weekStart, 'dd/MM/yyyy', { locale: ptBR })}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
              const daySchedules = nutritionPlan.schedules.filter(s => s.day_of_week === dayIndex);
              
              return (
                <div key={dayIndex} className="space-y-2">
                  <h4 className="font-medium text-center text-sm">{dayName}</h4>
                  <div className="space-y-2">
                    {daySchedules.map((schedule) => {
                      const validation = getMealValidation(schedule.id, dayIndex);
                      
                      return (
                        <div
                          key={schedule.id}
                          className="border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleMealClick(schedule.id, dayIndex)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">
                              {MEAL_TYPES[schedule.meal_type as keyof typeof MEAL_TYPES]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {schedule.scheduled_time.slice(0, 5)}
                            </span>
                          </div>
                          
                          <div className="text-xs text-muted-foreground mb-2">
                            {schedule.expected_foods.slice(0, 2).join(', ')}
                            {schedule.expected_foods.length > 2 && '...'}
                          </div>
                          
                          {validation ? (
                            <Badge className={`${getStatusColor(validation.validation_status)} text-xs`}>
                              {getStatusIcon(validation.validation_status)}
                              <span className="ml-1">
                                {validation.validation_status === 'approved' ? 'OK' : 
                                 validation.validation_status === 'rejected' ? 'Erro' : 'Analisando'}
                              </span>
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Camera className="w-3 h-3" />
                              Clique para fotografar
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {isUploading && (
        <Card className="bg-gradient-card shadow-soft">
          <CardContent className="flex items-center justify-center py-6">
            <Clock className="w-6 h-6 animate-spin mr-2" />
            <span>Analisando sua refeição com IA...</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};