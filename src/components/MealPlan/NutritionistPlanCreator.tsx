import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Users, Calendar, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MealSchedule {
  day_of_week: number;
  meal_type: string;
  scheduled_time: string;
  expected_foods: string[];
  portion_notes: string;
  calories_target: number;
}

interface Patient {
  user_id: string;
  username: string;
  full_name: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Café da Manhã' },
  { value: 'lunch', label: 'Almoço' },
  { value: 'snack', label: 'Lanche' },
  { value: 'dinner', label: 'Jantar' }
];

export const NutritionistPlanCreator = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetCompliance, setTargetCompliance] = useState(80);
  const [mealSchedules, setMealSchedules] = useState<MealSchedule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      // Fetch patients associated with this nutritionist
      const { data: relationships, error: relationshipError } = await supabase
        .from('nutritionist_patients')
        .select('patient_id')
        .eq('nutritionist_id', user?.id);

      if (relationshipError) throw relationshipError;

      if (!relationships || relationships.length === 0) {
        setPatients([]);
        return;
      }

      // Fetch profiles for these patients
      const patientIds = relationships.map(r => r.patient_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', patientIds);

      if (profilesError) throw profilesError;

      const patientList = profiles?.map(p => ({
        user_id: p.user_id,
        username: p.username || '',
        full_name: p.full_name || ''
      })) || [];

      setPatients(patientList);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de pacientes.",
        variant: "destructive",
      });
    }
  };

  const addMealSchedule = () => {
    setMealSchedules([...mealSchedules, {
      day_of_week: 0,
      meal_type: 'breakfast',
      scheduled_time: '08:00',
      expected_foods: [],
      portion_notes: '',
      calories_target: 0
    }]);
  };

  const updateMealSchedule = (index: number, field: keyof MealSchedule, value: any) => {
    const updated = [...mealSchedules];
    updated[index] = { ...updated[index], [field]: value };
    setMealSchedules(updated);
  };

  const removeMealSchedule = (index: number) => {
    setMealSchedules(mealSchedules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !planName || !startDate || !endDate || mealSchedules.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create the nutrition plan
      const { data: planData, error: planError } = await supabase
        .from('nutrition_plans')
        .insert({
          nutritionist_id: user?.id,
          patient_id: selectedPatient,
          plan_name: planName,
          start_date: startDate,
          end_date: endDate,
          target_compliance_percentage: targetCompliance
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create meal schedules
      const schedulesToInsert = mealSchedules.map(schedule => ({
        nutrition_plan_id: planData.id,
        ...schedule
      }));

      const { error: schedulesError } = await supabase
        .from('daily_meal_schedules')
        .insert(schedulesToInsert);

      if (schedulesError) throw schedulesError;

      toast({
        title: "Plano criado com sucesso!",
        description: `O plano alimentar "${planName}" foi criado para o paciente.`,
      });

      // Reset form
      setSelectedPatient('');
      setPlanName('');
      setStartDate('');
      setEndDate('');
      setTargetCompliance(80);
      setMealSchedules([]);

    } catch (error: any) {
      console.error('Error creating nutrition plan:', error);
      toast({
        title: "Erro ao criar plano",
        description: error.message || "Não foi possível criar o plano alimentar.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Criar Plano Alimentar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Selecionar Paciente</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.user_id} value={patient.user_id}>
                        {patient.full_name} (@{patient.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="planName">Nome do Plano</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Ex: Plano de Emagrecimento 45 dias"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Compliance Target */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-primary" />
                  Meta de Cumprimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="targetCompliance">
                    Porcentagem de cumprimento esperada: {targetCompliance}%
                  </Label>
                  <Input
                    id="targetCompliance"
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={targetCompliance}
                    onChange={(e) => setTargetCompliance(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Meta: Cumprir {targetCompliance}% do plano alimentar durante o período estabelecido.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Meal Schedules */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-primary" />
                    Cronograma de Refeições
                  </CardTitle>
                  <Button type="button" onClick={addMealSchedule} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Refeição
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {mealSchedules.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma refeição adicionada ainda. Clique em "Adicionar Refeição" para começar.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {mealSchedules.map((schedule, index) => (
                      <Card key={index} className="border-dashed">
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label>Dia da Semana</Label>
                              <Select 
                                value={schedule.day_of_week.toString()} 
                                onValueChange={(value) => updateMealSchedule(index, 'day_of_week', parseInt(value))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {DAYS_OF_WEEK.map((day) => (
                                    <SelectItem key={day.value} value={day.value.toString()}>
                                      {day.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Tipo de Refeição</Label>
                              <Select 
                                value={schedule.meal_type} 
                                onValueChange={(value) => updateMealSchedule(index, 'meal_type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {MEAL_TYPES.map((meal) => (
                                    <SelectItem key={meal.value} value={meal.value}>
                                      {meal.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Horário</Label>
                              <Input
                                type="time"
                                value={schedule.scheduled_time}
                                onChange={(e) => updateMealSchedule(index, 'scheduled_time', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Calorias (meta)</Label>
                              <Input
                                type="number"
                                value={schedule.calories_target}
                                onChange={(e) => updateMealSchedule(index, 'calories_target', parseInt(e.target.value) || 0)}
                                placeholder="Ex: 400"
                              />
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <Label>Alimentos Esperados (um por linha)</Label>
                            <Textarea
                              value={schedule.expected_foods.join('\n')}
                              onChange={(e) => updateMealSchedule(index, 'expected_foods', e.target.value.split('\n').filter(f => f.trim()))}
                              placeholder="Ex:&#10;Aveia&#10;Banana&#10;Leite desnatado"
                              rows={4}
                            />
                          </div>

                          <div className="space-y-2 mb-4">
                            <Label>Observações sobre Porções</Label>
                            <Textarea
                              value={schedule.portion_notes}
                              onChange={(e) => updateMealSchedule(index, 'portion_notes', e.target.value)}
                              placeholder="Ex: 1 xícara de aveia, 1 banana média..."
                              rows={2}
                            />
                          </div>

                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeMealSchedule(index)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Criar Plano Alimentar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};