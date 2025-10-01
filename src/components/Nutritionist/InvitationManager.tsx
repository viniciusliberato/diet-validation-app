import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Clock, CheckCircle, XCircle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();
  
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: "Código copiado!",
        description: "O código foi copiado para a área de transferência",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código",
        variant: "destructive",
      });
    }
  };
  
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

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const historicalInvitations = invitations.filter(inv => inv.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Active Invitation Codes - Destacado */}
      {pendingInvitations.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Códigos de Convite Ativos
            </CardTitle>
            <CardDescription>
              Compartilhe estes códigos com seus pacientes para que eles possam aceitar o convite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingInvitations.map((invitation) => (
                <Card key={invitation.id} className="bg-background">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Paciente</p>
                        <p className="font-semibold">@{invitation.patient_username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Código</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-muted px-3 py-2 rounded text-lg font-mono font-bold tracking-wider">
                            {invitation.invitation_code}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(invitation.invitation_code)}
                          >
                            {copiedCode === invitation.invitation_code ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Expira em {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send New Invitation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Convidar Novo Paciente
          </CardTitle>
          <CardDescription>
            Digite o nome de usuário do paciente. Um código será gerado automaticamente.
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
                onChange={(e) => setNewPatientUsername(e.target.value.toLowerCase())}
                onKeyPress={(e) => e.key === 'Enter' && onSendInvitation()}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Digite exatamente como o paciente se cadastrou
              </p>
            </div>
            <Button onClick={onSendInvitation} className="mt-6">
              Enviar Convite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historical Invitations */}
      {historicalInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Convites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historicalInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">@{invitation.patient_username}</h3>
                    <p className="text-sm text-muted-foreground">
                      Código: {invitation.invitation_code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(invitation.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {invitations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum convite enviado ainda</p>
            <p className="text-sm text-muted-foreground">
              Comece enviando um convite para um paciente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}