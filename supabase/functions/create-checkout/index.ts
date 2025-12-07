
// FIX DEFINITIVO: Versioni bloccate (senza ^) per stabilità
import Stripe from 'npm:stripe@14.25.0'
import { createClient } from 'npm:@supabase/supabase-js@2.42.0'

declare const Deno: any;

console.log("Create Checkout Function Loaded v3.0 (Guest Support)");

// Fix: Cast Deno to any to avoid TS errors
Deno.serve(async (req: Request) => {
  // Headers CORS per permettere chiamate da qualsiasi frontend
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  // 1. Gestione Preflight CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parsing sicuro del body
    let body;
    try {
        body = await req.json()
    } catch (e) {
        throw new Error("Body della richiesta non valido o vuoto.")
    }

    console.log("📥 Payload ricevuto:", JSON.stringify(body));

    const { course_ids, course_id, user_id, email } = body;

    // --- NORMALIZZAZIONE INPUT (Array vs Singolo) ---
    // Gestiamo sia il vecchio formato (course_id) che il nuovo (course_ids)
    let finalIds: string[] = [];
    
    if (course_ids && Array.isArray(course_ids) && course_ids.length > 0) {
        finalIds = course_ids;
    } else if (course_id) {
        finalIds = [course_id];
    }

    if (finalIds.length === 0) {
        console.error("❌ Nessun ID corso trovato nel payload");
        throw new Error("ID corsi mancanti. Assicurati di aver aggiornato il frontend.");
    }
    
    // 2. CONFIGURAZIONE CLIENT SUPABASE
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Variabili SUPABASE mancanti lato server (SUPABASE_URL o SERVICE_ROLE).");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 3. RECUPERA CORSI DAL DB
    console.log(`🔎 Ricerca corsi nel DB: ${finalIds.join(', ')}`);
    
    const { data: courses, error: courseError } = await supabaseAdmin
        .from('courses')
        .select('*')
        .in('id', finalIds);

    if (courseError) {
        console.error("❌ Errore Query Supabase:", courseError);
        throw new Error("Errore database durante il recupero corsi.");
    }

    if (!courses || courses.length === 0) {
        console.error("❌ Nessun corso trovato per gli ID:", finalIds);
        throw new Error(`Corsi non trovati nel DB (IDs: ${finalIds.join(', ')}). Controlla se l'ID è corretto.`);
    }

    // 4. CHECK FEDELTÀ UTENTE (Solo se user_id è presente)
    let isLoyalCustomer = false;
    if (user_id) {
        try {
            const { count, error: purchaseError } = await supabaseAdmin
                .from('purchases')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user_id);

            if (!purchaseError && count !== null && count > 0) {
                isLoyalCustomer = true;
                console.log(`✅ Utente Fedele rilevato (${count} acquisti passati).`);
            }
        } catch (err) {
            console.error("Errore controllo storico acquisti:", err);
        }
    } else {
        console.log("👤 Utente Guest (Guest Checkout). Salto controllo fedeltà.");
    }

    // 5. PREPARA LINE ITEMS PER STRIPE
    const line_items = courses.map((course: any) => {
        let finalPrice = course.price;
        let pricingTier = 'Standard';

        // Logica sconto fedeltà (applicabile solo se l'utente era loggato)
        if (isLoyalCustomer && course.discounted_price && course.discounted_price > 0 && course.discounted_price < course.price) {
            finalPrice = course.discounted_price;
            pricingTier = 'Loyalty';
        }

        return {
            price_data: {
                currency: 'eur',
                product_data: {
                  name: course.title,
                  description: course.description ? course.description.substring(0, 100) : 'Corso Online',
                  images: course.image ? [course.image] : [],
                  metadata: {
                      course_id: course.id,
                      pricing_tier: pricingTier
                  }
                },
                unit_amount: Math.round(finalPrice * 100), // Centesimi
            },
            quantity: 1,
        };
    });

    // 6. CONFIGURAZIONE STRIPE
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
        throw new Error("STRIPE_SECRET_KEY non configurata nei Secrets.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    })

    const origin = req.headers.get('origin') || 'http://localhost:5173';

    // Metadata limit: 500 chars. Join IDs with comma.
    const metadataIds = finalIds.join(',');

    // 7. CONFIGURAZIONE SESSIONE
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: `${origin}/#/dashboard`, // Dopo l'acquisto, mandali alla dashboard (dovranno loggarsi con credenziali inviate via mail)
      cancel_url: `${origin}/#/cart`,
      metadata: {
        course_ids: metadataIds,
        type: 'multi_course_purchase'
      },
    };

    // Gestione Guest vs Logged In
    if (user_id) {
        sessionConfig.client_reference_id = user_id;
    }
    if (email) {
        sessionConfig.customer_email = email;
    } else {
        // Se non passiamo customer_email, Stripe la chiederà obbligatoriamente
        sessionConfig.customer_creation = 'if_required'; // Crea cliente Stripe se serve
    }

    // 8. CREA SESSIONE
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    )
  } catch (error: any) {
    const errorMsg = error.message || "Errore sconosciuto nel backend";
    console.error("❌ Errore Function:", errorMsg);
    
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400, 
      },
    )
  }
})
