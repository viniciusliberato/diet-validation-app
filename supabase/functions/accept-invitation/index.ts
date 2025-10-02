import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRole) {
      return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";

    const supabase = createClient(supabaseUrl, serviceRole, {
      global: { headers: { Authorization: authHeader } },
    });

    const body = await req.json().catch(() => ({}));
    const { invitationId, invitationCode } = body as {
      invitationId?: string;
      invitationCode?: string;
    };

    // Identify current user
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch patient profile to get username
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("user_id, username")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileErr || !profile?.username) {
      return new Response(JSON.stringify({ error: "Perfil inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load invitation by id or code
    let invitation: any = null;
    if (invitationId) {
      const { data, error } = await supabase
        .from("patient_invitations")
        .select("*")
        .eq("id", invitationId)
        .eq("status", "pending")
        .limit(1);
      if (error) throw error;
      invitation = data?.[0];
    } else if (invitationCode) {
      const { data, error } = await supabase
        .from("patient_invitations")
        .select("*")
        .eq("invitation_code", String(invitationCode).toUpperCase())
        .eq("status", "pending")
        .limit(1);
      if (error) throw error;
      invitation = data?.[0];
    } else {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!invitation) {
      return new Response(JSON.stringify({ error: "Convite não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Convite expirado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only the intended username can accept this invite
    if (invitation.patient_username !== profile.username) {
      return new Response(JSON.stringify({ error: "Convite não pertence a este usuário" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Accept invitation
    const { error: updErr } = await supabase
      .from("patient_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    if (updErr) throw updErr;

    // Create relationship if not exists
    const { data: existing, error: existErr } = await supabase
      .from("nutritionist_patients")
      .select("id")
      .eq("nutritionist_id", invitation.nutritionist_id)
      .eq("patient_id", user.id)
      .limit(1);

    if (existErr) throw existErr;

    if (!existing || existing.length === 0) {
      const { error: relErr } = await supabase
        .from("nutritionist_patients")
        .insert({ nutritionist_id: invitation.nutritionist_id, patient_id: user.id });
      if (relErr) throw relErr;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("accept-invitation error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
