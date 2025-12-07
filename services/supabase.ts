
import { createClient } from '@supabase/supabase-js';

// ============================================================================================
// 🛑 AREA MODIFICHE - INCOLLA QUI I TUOI DATI 🛑
//
// Se non riesci a usare il file .env, modifica direttamente queste due righe qui sotto.
// Sostituisci il testo tra virgolette con i tuoi dati presi da Supabase Dashboard > Settings > API.
// ============================================================================================

const MY_SUPABASE_URL = "https://zplcjlyqmcayprettmqd.supabase.co"; // Es: "https://abcdefg.supabase.co"
const MY_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbGNqbHlxbWNheXByZXR0bXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NzA0MzgsImV4cCI6MjA4MDI0NjQzOH0.OfK1kbwc-3OBrvIIVFnnTeNCgSinVGAJiIy8jfvxjSA"; // Es: "eyJhbGciOiJIUzI1NiIsIn..."

// ============================================================================================
// NON TOCCARE NULLA SOTTO QUESTA LINEA
// ============================================================================================

const getUrl = () => {
    let url = '';
    // 1. Usa il valore incollato manualmente se presente e valido
    if (MY_SUPABASE_URL && !MY_SUPABASE_URL.includes("INCOLLA_QUI")) {
        url = MY_SUPABASE_URL;
    }
    // 2. Altrimenti prova a leggere dal sistema (per quando pubblichi su Vercel/Netlify)
    else if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        url = (import.meta as any).env.VITE_SUPABASE_URL || '';
    }
    
    // Sanificazione URL: Rimuove spazi e slash finale se presente
    if (url) {
        url = url.trim().replace(/\/$/, "");
    }
    return url;
};

const getKey = () => {
    let key = '';
    // 1. Usa il valore incollato manualmente se presente e valido
    if (MY_SUPABASE_KEY && !MY_SUPABASE_KEY.includes("INCOLLA_QUI")) {
        key = MY_SUPABASE_KEY;
    }
    // 2. Altrimenti prova a leggere dal sistema
    else if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        key = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';
    }
    
    if (key) {
        key = key.trim();
    }
    return key;
};

const finalUrl = getUrl();
const finalKey = getKey();

// Controllo errori
if (!finalUrl || finalUrl.includes("placeholder") || !finalKey) {
  console.error("🚨 ERRORE CRITICO: Supabase non è configurato.");
  console.error("Vai nel file 'services/supabase.ts' e incolla URL e KEY nelle prime righe.");
}

// Inizializza il client
export const supabase = createClient(
    finalUrl || 'https://placeholder.supabase.co', 
    finalKey || 'placeholder'
);

/**
 * Chiama la Edge Function 'create-checkout' usando fetch diretto.
 * Accetta un array di courseIds per supportare il carrello multiplo.
 * userId e email sono OPZIONALI per supportare il Guest Checkout.
 */
export const createCheckoutSession = async (courseIds: string[], userId?: string, email?: string) => {
    try {
        if (!finalUrl || finalUrl.includes('placeholder')) {
            throw new Error("URL Supabase non configurato correttamente. Controlla services/supabase.ts");
        }

        // Costruiamo manualmente l'URL della funzione
        const functionUrl = `${finalUrl}/functions/v1/create-checkout`;
        console.log(`🚀 Avvio pagamento per ${courseIds.length} corsi. Chiamata a: ${functionUrl}`);
        
        // Usiamo fetch nativo invece di supabase.functions.invoke
        const response = await fetch(functionUrl, {
            method: 'POST',
            mode: 'cors', // Assicuriamoci che CORS sia attivo
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                course_ids: courseIds, 
                user_id: userId || null, // Se null, il backend tratterà come Guest
                email: email || null // Se null, Stripe chiederà la mail
            })
        });

        // Gestione errori HTTP (es. 404, 500)
        if (!response.ok) {
            let errorText = "Errore sconosciuto";
            try {
                 const errorJson = await response.json();
                 errorText = errorJson.error || JSON.stringify(errorJson);
            } catch (e) {
                 errorText = await response.text();
            }
            
            console.error(`❌ Errore Server (${response.status}):`, errorText);
            throw new Error(`Errore Pagamento (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        if (!data || !data.url) {
            throw new Error("Il server non ha restituito l'URL di pagamento Stripe.");
        }

        console.log("✅ Sessione Stripe creata:", data.url);
        return data; 
    } catch (err: any) {
        console.error('❌ Errore creazione checkout (Frontend):', err);
        // Rilanciamo l'errore per mostrarlo all'utente
        throw err;
    }
};
