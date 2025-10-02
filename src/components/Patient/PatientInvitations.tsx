import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, UserCheck, Clock, AlertCircle } from 'lucide-react';

interface Invitation {
  id: string;
  patient_username: string;
  invitation_code: string;
  status: string;
  created_at: string;
  expires_at: string;
  nutritionist_id: string;
  nutritionist_profile?: {
    full_name: string;
    email: string;
  };
}

export function PatientInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user?.id)
        .single();

      if (!profile?.username) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('patient_invitations')
        .select(`
          *,
          nutritionist_profile:profiles!patient_invitations_nutritionist_id_fkey (
            full_name,
            email
          )
        `)
        .eq('patient_username', profile.username)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase.functions.invoke('accept-invitation', {
        body: { invitationId },
      });

      if (error) throw error;

      toast.success('Convite aceito! Agora você está sendo acompanhado por este nutricionista.');
      fetchInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Erro ao aceitar convite');
    }
  };

  const rejectInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('patient_invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId);

      if (error) throw error;

      toast.success('Convite rejeitado');
      fetchInvitations();
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Erro ao rejeitar convite');
    }
  };

  const acceptByCode = async () => {
    if (!inviteCode.trim()) {
      toast.error('Digite o código do convite');
      return;
    }

    try {
      const { data: invitation, error } = await supabase
        .from('patient_invitations')
        .select('*')
        .eq('invitation_code', inviteCode.trim().toUpperCase())
        .eq('status', 'pending')
        .single();

      if (error || !invitation) {
        toast.error('Código inválido ou convite não encontrado');
        return;
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        toast.error('Este convite expirou');
        return;
      }

      await acceptInvitation(invitation.id);
      setInviteCode('');
    } catch (error) {
      console.error('Error accepting invitation by code:', error);
      toast.error('Erro ao aceitar convite');
    }
  };

  if (loading) {
    return <div>Carregando convites...</div>;
  }

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Aceitar Convite por Código
          </CardTitle>
          <CardDescription>
            Digite o código que o nutricionista te enviou
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="invite-code">Código do Convite</Label>
              <Input
                id="invite-code"
                placeholder="Ex: ABC12345"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && acceptByCode()}
              />
            </div>
            <Button onClick={acceptByCode} className="mt-6">
              Aceitar
            </Button>
          </div>
        </CardContent>
      </Card>

      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Convites Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingInvitations.map((invitation) => (
              <div key={invitation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      {invitation.nutritionist_profile?.full_name || 'Nutricionista'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {invitation.nutritionist_profile?.email}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expira em {new Date(invitation.expires_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptInvitation(invitation.id)}
                    >
                      Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectInvitation(invitation.id)}
                    >
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Convites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {invitation.nutritionist_profile?.full_name || 'Nutricionista'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invitation.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={invitation.status === 'accepted' ? 'default' : 'secondary'}>
                    {invitation.status === 'accepted' ? 'Aceito' : 
                     invitation.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {invitations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum convite recebido</p>
            <p className="text-sm text-muted-foreground">
              Peça ao seu nutricionista para te enviar um convite
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}