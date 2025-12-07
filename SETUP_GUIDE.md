
# Guida Integrazione Stripe & Supabase (VS Code)

Segui questa guida sequenziale per attivare i pagamenti.

## 1. Prerequisiti
Apri il terminale di VS Code ed esegui:
```bash
npm install
```

## 2. Collegamento a Supabase
1.  **Login**:
    ```bash
    npx supabase login
    ```
2.  **Link al progetto cloud**:
    Trova il tuo Project ID su Supabase (es. `abcdefghijklm`) ed esegui:
    ```bash
    npx supabase link --project-ref IL_TUO_PROJECT_ID
    ```

## 3. Configurazione Segreti (Sicurezza)
Imposta le chiavi API di Stripe nel backend sicuro di Supabase.

1.  **Stripe Secret Key** (da [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)):
    ```bash
    npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
    ```

2.  **Stripe Webhook Secret** (Vedi punto 5):
    *Questo lo imposterai DOPO il deploy del webhook.*

## 4. Deploy del Backend (Edge Functions)
I file delle funzioni sono già nella cartella `supabase/functions`. Pubblicali con:

```bash
npx supabase functions deploy create-checkout --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
```
*(Nota: `--no-verify-jwt` serve per permettere chiamate pubbliche o gestite internamente, essenziale per i webhook)*

## 5. Attivazione Webhook Stripe
1.  Copia l'URL del webhook ottenuto dal deploy (es. `https://.../functions/v1/stripe-webhook`).
2.  Vai su [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks).
3.  Crea un nuovo endpoint incollando l'URL.
4.  Seleziona l'evento: `checkout.session.completed`.
5.  Salva e copia il "Signing Secret" (`whsec_...`).
6.  Impostalo su Supabase:
    ```bash
    npx supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...
    ```

## 6. Configurazione Frontend
Assicurati che il tuo file `.env` o le variabili d'ambiente di produzione (es. su Vercel/Netlify) abbiano:

```
VITE_SUPABASE_URL=https://IL_TUO_ID.supabase.co
VITE_SUPABASE_ANON_KEY=la_tua_chiave_anon_pubblica
```

## 7. Configurazione Database (SQL)
Vai su Supabase Dashboard > SQL Editor ed esegui questo script per creare la tabella degli acquisti:

```sql
create table purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  course_id text not null,
  stripe_payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table purchases enable row level security;

create policy "Users can view own purchases" 
on purchases for select 
using ( auth.uid() = user_id );

create policy "Service role inserts" 
on purchases for insert 
with check ( true );
```

## Risoluzione Problemi Comuni

**Errore: "Functions not found"**
Se VS Code non trova la cartella `supabase`, esegui `npx supabase init` (non sovrascrivere `config.toml` se non necessario).

**Errore 500 al pagamento**
Controlla i log delle funzioni su Supabase Dashboard > Edge Functions > Logs. Spesso è la `STRIPE_SECRET_KEY` mancante o errata.
