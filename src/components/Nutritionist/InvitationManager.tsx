import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Invitation {
  id: string;
  patient_username: string;
  invitation_code: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface InvitationManagerProps {
  invitations: Invitation[];
  onSendInvitation: () => void;
  newPatientUsername: string;
  setNewPatientUsername: (value: string) => void;
}

export function InvitationManager({ 
  invitations, 
  onSendInvitation, 
  newPatientUsername, 
  setNewPatientUsername 
}: InvitationManagerProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Aceito</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Convidar Novo Paciente
          </CardTitle>
          <CardDescription>
            Digite o nome de usuário do paciente para enviar um convite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="username">Nome de usuário do paciente</Label>
              <Input
                id="username"
                placeholder="Ex: joao123"
                value={newPatientUsername}
                onChange={(e) => setNewPatientUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSendInvitation()}
              />
            </div>
            <Button onClick={onSendInvitation} className="mt-6">
              Enviar Convite
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {invitations.map((invitation) => (
          <Card key={invitation.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">@{invitation.patient_username}</h3>
                  <p className="text-sm text-muted-foreground">
                    Código: <code className="bg-muted px-2 py-1 rounded">{invitation.invitation_code}</code>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enviado em {new Date(invitation.created_at).toLocaleDateString('pt-BR')} • 
                    Expira em {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(invitation.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {invitations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum convite enviado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}