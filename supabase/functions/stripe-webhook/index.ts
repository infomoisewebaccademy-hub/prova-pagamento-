
// FIX DEFINITIVO: Versioni bloccate (senza ^) per stabilità
import Stripe from 'npm:stripe@14.25.0'
import { createClient } from 'npm:@supabase/supabase-js@2.42.0'

declare const Deno: any;

console.log("Stripe Webhook Handler Loaded (Auto-Invite Mode)");

// Fix: Cast Deno to any to avoid TS errors
Deno.serve(async (req: Request) => {
  console.log(`➡️ WEBHOOK HIT: ${req.method} su ${req.url}`);

  if (req.method === 'OPTIONS') {
      return new Response('ok', { 
          headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
          } 
      })
  }

  if (req.method !== 'POST') {
      return new Response(`Webhook online. Send POST requests here.`, { status: 200 });
  }

  try {
    const signature = req.headers.get('Stripe-Signature');
    const body = await req.text(); 

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET');

    if (!stripeKey || !endpointSecret) {
        console.error("❌ ERRORE: Configurazione Stripe mancante su Supabase Secrets.");
        return new Response("Server Configuration Error", { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16', typescript: true });

    let event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature!, endpointSecret)
    } catch (err: any) {
      console.error(`❌ Webhook Signature Error: ${err.message}`)
      return new Response(`Webhook Signature Error: ${err.message}`, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      let userId = session.client_reference_id // Può essere null se Guest
      const guestEmail = session.customer_details?.email; // Email inserita su Stripe
      const guestName = session.customer_details?.name || 'Studente';

      console.log(`💳 Processando acquisto... RefID: ${userId}, Email: ${guestEmail}`);

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error("Mancano le chiavi di servizio Supabase.");
      }

      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      // --- LOGICA GESTIONE ACCOUNT GUEST (Con Invito Email) ---
      if (!userId && guestEmail) {
          console.log(`👤 Acquisto Guest rilevato per: ${guestEmail}. Preparo invito...`);
          
          try {
              // USIAMO INVITE USER BY EMAIL
              // Supabase invierà una mail template "User Invite" all'utente.
              // L'utente clicca, imposta la password e viene loggato.
              const { data: newUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(guestEmail, {
                data: { full_name: guestName }
              });

              if (newUser && newUser.user) {
                  userId = newUser.user.id;
                  console.log(`📧 Invito inviato con successo! UserID creato: ${userId}`);
              } else if (inviteError) {
                  console.log("ℹ️ Impossibile invitare (forse utente già registrato?):", inviteError.message);
                  
                  // Se l'utente esiste già, dobbiamo recuperare il suo ID per assegnargli l'acquisto.
                  // L'unico modo affidabile con le Edge Functions senza permessi SQL diretti complessi
                  // è cercare nella tabella profiles (se sincronizzata) o riprovare un lookup admin.
                  // Poiché non possiamo fare "getUserByEmail", proviamo a vedere se esiste in 'profiles'.
                  
                  const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('email', guestEmail)
                    .single();
                  
                  if (profile) {
                      userId = profile.id;
                      console.log(`✅ Utente esistente trovato nel DB: ${userId}`);
                  } else {
                      console.error("❌ ERRORE CRITICO: Utente esistente in Auth ma non trovato in Profiles. Impossibile assegnare corso.");
                      // Fallback estremo: non possiamo fare nulla se non abbiamo l'ID.
                  }
              }
          } catch (e) {
              console.error("Errore durante procedura invito:", e);
          }
      }

      // --- REGISTRAZIONE ACQUISTO ---
      if (userId) {
        const singleCourseId = session.metadata?.course_id;
        const multiCourseIds = session.metadata?.course_ids;

        let coursesToInsert: string[] = [];
        if (multiCourseIds) {
            coursesToInsert = multiCourseIds.split(',');
        } else if (singleCourseId) {
            coursesToInsert = [singleCourseId];
        }

        if (coursesToInsert.length > 0) {
            console.log(`📦 Inserimento acquisti per User ${userId}: ${coursesToInsert.join(', ')}`);
            
            const rows = coursesToInsert.map(cId => ({
                user_id: userId,
                course_id: cId.trim(),
                stripe_payment_id: session.id
            }));

            const { error } = await supabaseAdmin
              .from('purchases')
              .insert(rows);

            if (error) {
                console.error('❌ Errore Insert Supabase:', JSON.stringify(error))
            } else {
                console.log("🎉 Acquisti salvati con successo!")
                
                // Assicuriamoci che esista il profilo (caso in cui invite ha creato user ma trigger non è partito o altro)
                const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
                    id: userId,
                    email: guestEmail, 
                    full_name: guestName,
                    is_admin: false
                }, { onConflict: 'id' });
            }
        }
      } else {
          console.error("⚠️ IMPOSSIBILE ASSEGNARE ACQUISTO: UserId nullo.");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (err: any) {
    console.error(`❌ Server Error Globale: ${err.message}`)
    return new Response(`Server Error: ${err.message}`, { status: 200 })
  }
})
