import { useState } from 'react';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  detectedFoods: string[];
  missingFoods: string[];
  feedback: string;
  nutritionalMatch: number;
  estimatedCalories?: number;
}

interface MealValidatorProps {
  imageFile?: File;
  mealType: string;
  expectedFoods: string[];
  onValidationComplete: (result: ValidationResult) => void;
}

export const MealValidator = ({ 
  imageFile, 
  mealType, 
  expectedFoods, 
  onValidationComplete 
}: MealValidatorProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const callAIValidation = async (): Promise<ValidationResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-meal', {
        body: {
          mealType,
          expectedFoods,
          imageDescription: imageFile?.name || 'Imagem de uma refeição'
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('AI validation error:', error);
      throw new Error('Erro ao validar refeição com IA');
    }
  };

  const handleValidation = async () => {
    if (!imageFile) return;
    
    setIsValidating(true);
    
    try {
      const result = await callAIValidation();
      setValidationResult(result);
      onValidationComplete(result);
      
      toast({
        title: result.isValid ? "Refeição validada!" : "Refeição analisada",
        description: result.feedback,
        variant: result.isValid ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar a refeição. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (isValidating) {
    return (
      <Card className="bg-gradient-card shadow-soft">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div>
              <h3 className="font-semibold mb-2">Analisando sua refeição...</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Nossa IA está identificando os alimentos e comparando com seu plano
              </p>
              <Progress value={66} className="w-48" />  
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (validationResult) {
    return (
      <Card className={`shadow-soft ${
        validationResult.isValid 
          ? 'bg-success/5 border-success/20' 
          : 'bg-warning/5 border-warning/20'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${
              validationResult.isValid ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'
            }`}>
              {validationResult.isValid ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">
                  {validationResult.isValid ? 'Refeição Aprovada!' : 'Refeição Precisa de Ajustes'}
                </h3>
                <Badge variant={validationResult.isValid ? "default" : "secondary"}>
                  {validationResult.confidence}% Match
                </Badge>
              </div>
              
              <p className="text-sm mb-4">{validationResult.feedback}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Alimentos Detectados
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {validationResult.detectedFoods.map((food, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {validationResult.missingFoods.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                      <Info className="w-4 h-4 text-warning" />
                      Sugestões
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {validationResult.missingFoods.map((food, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          + {food}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardContent className="p-6 text-center">
        <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">Pronto para Validar</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Clique para analisar se sua refeição está de acordo com o plano
        </p>
        <Button onClick={handleValidation} disabled={!imageFile}>
          Validar com IA
        </Button>
      </CardContent>
    </Card>
  );
};