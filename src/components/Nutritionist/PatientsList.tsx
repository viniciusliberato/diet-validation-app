import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

interface PatientsListProps {
  patients: Patient[];
}

export function PatientsList({ patients }: PatientsListProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <Card key={patient.id} className="cursor-pointer hover:shadow-lg transition-all">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-foreground flex items-center justify-center text-white font-semibold">
                  {patient.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-lg">{patient.full_name}</CardTitle>
                  <CardDescription>@{patient.username}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{patient.email}</p>
                <p className="text-xs text-muted-foreground">
                  Paciente desde {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                </p>
                <Button className="w-full mt-4">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {patients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum paciente ainda</p>
            <p className="text-sm text-muted-foreground">Envie convites para começar a acompanhar seus pacientes</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}