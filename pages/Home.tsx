
import React, { useMemo } from 'react';
import { Course, UserProfile, LandingPageConfig } from '../types';
import { CheckCircle, ArrowRight, ShieldCheck, Zap, Database, Layout, Target, Cpu, Layers, Users, Lock, Quote, Star, Award, Smartphone, MessageCircle, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  courses: Course[];
  onCourseSelect: (courseId: string) => void;
  user?: UserProfile | null;
  // Riceviamo l'intera configurazione
  landingConfig?: LandingPageConfig;
}

// DEFAULT CONFIGURATION (Contenuto esatto dell'immagine)
const DEFAULT_CONFIG: LandingPageConfig = {
  announcement_bar: {
    text: '🎉 Offerta lancio: Tutti i corsi al 50% di sconto per i primi 100 iscritti!',
    is_visible: false,
    is_sticky: false,
    type: 'static',
    bg_color: '#fbbf24', // Amber 400
    text_color: '#1e3a8a' // Blue 900
  },
  hero: {
    title: 'Costruiamo piattaforme e sistemi digitali',
    subtitle: 'Senza Software a Pagamento',
    cta_primary: 'Scopri i corsi disponibili',
    cta_secondary: 'Inizia da quello che ti serve',
    image_url: '', 
    show_badges: true
  },
  about_section: {
    title: 'Perché nasce Moise Web Academy',
    subtitle: 'LA NOSTRA MISSIONE',
    text: "Siamo Moise Web Academy. Negli ultimi anni abbiamo costruito piattaforme AI, siti web dinamici, automazioni, landing page e campagne pubblicitarie per decine di progetti reali.\nNel mercato della formazione c'è una cosa che ci ha sempre dato fastidio:",
    mission_points: [
        "I corsi che promettono soldi veloci",
        "I “guru” che non hanno mai creato nulla",
        "Le lezioni che obbligano a comprare tool da 30–100€/mese"
    ],
    image_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    quote: '"Non vi promettiamo guadagni facili, vi diamo competenze reali."',
    quote_author: 'DANIEL MOISE',
    is_visible: true
  },
  features_section: {
    title: 'Cosa imparerete con noi',
    subtitle: 'Competenze tecniche verticali, divise per obiettivi.',
    is_visible: true,
    cards: [
      { 
          icon: 'Cpu', 
          title: 'AI & Sviluppo Low-Code', 
          desc: 'Google AI Studio (Zero Costi)\nDatabase Supabase\nDeploy su Vercel\nGestione Domini & DNS' 
      },
      { 
          icon: 'Layout', 
          title: 'Landing Page & Siti Web', 
          desc: 'Elementor (versione base)\nStruttura & Copy\nTemplate pronti all\'uso\nOttimizzazione Mobile' 
      },
      { 
          icon: 'Zap', 
          title: 'Automazioni a Costo Zero', 
          desc: 'Notifiche intelligenti\nEmail automatiche\nWebhook Make/N8N\nAPI Integration' 
      },
      { 
          icon: 'Target', 
          title: 'Pubblicità & Ads', 
          desc: 'Meta Ads (FB/IG)\nTikTok Ads\nStrategie E-commerce\nLead Generation' 
      }
    ]
  },
  testimonials_section: {
    title: 'Cosa dicono i nostri studenti',
    subtitle: 'Storie di successo reali',
    is_visible: true,
    reviews: [
        { name: 'Marco Rossi', role: 'Freelance Developer', text: 'Ho risparmiato centinaia di euro in abbonamenti software grazie a questo corso.', avatar: '' },
        { name: 'Giulia Bianchi', role: 'Imprenditrice', text: 'Finalmente un approccio pratico e senza giri di parole. Consigliatissimo.', avatar: '' }
    ]
  },
  usp_section: {
    title: 'Perché siamo diversi dagli altri corsi',
    is_visible: true,
    items: [
      { title: 'TUTTO SENZA SPESE EXTRA', desc: 'Ogni corso è pensato per lavorare con AI a costo zero.' },
      { title: 'Lezioni pratiche, non teoria', desc: 'Ogni modulo contiene schermate reali e processi passo-passo.' },
      { title: 'Nessuna fuffa', desc: 'Non vi promettiamo guadagni, vi diamo competenze tecniche solide.' },
      { title: 'Prezzi onesti', desc: 'Ogni corso lo pagate singolarmente. Niente abbonamenti.' }
    ]
  },
  cta_section: {
    title: 'Iniziate a costruire qualcosa di reale.',
    subtitle: 'Usate l’AI a costo zero, create progetti veri e portate le vostre competenze al livello successivo.',
    button_text: 'Guarda tutti i corsi',
    is_visible: true
  },
  footer: {
      text: 'Moise Web Academy',
      copyright: 'Tutti i diritti riservati.',
      is_visible: true
  }
};

// Helper per mappare stringhe icona a componenti Lucide
const IconMap: Record<string, React.ElementType> = {
  Cpu, Layout, Zap, Target, ShieldCheck, Database, Layers, Users, Lock, Star, Award, Smartphone
};

// Colori specifici per le card (ordine: Blu, Viola, Arancio, Rosa)
const CARD_COLORS = [
    { bg: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'bg-orange-50', text: 'text-orange-600' },
    { bg: 'bg-pink-50', text: 'text-pink-600' },
];

export const Home: React.FC<HomeProps> = ({ courses, onCourseSelect, user, landingConfig }) => {
  const navigate = useNavigate();

  // Merge config with defaults
  const config = useMemo(() => {
    if (!landingConfig) return DEFAULT_CONFIG;
    
    // Check if the DB has old features data (less than 4 cards) and enforce defaults if so
    let featuresToUse = landingConfig.features_section;
    if (!featuresToUse || !featuresToUse.cards || featuresToUse.cards.length < 4) {
        featuresToUse = DEFAULT_CONFIG.features_section;
    }

    // Check if DB has old about section data (no mission points)
    let aboutToUse = landingConfig.about_section;
    if (!aboutToUse || !aboutToUse.mission_points || aboutToUse.mission_points.length === 0) {
        aboutToUse = { ...aboutToUse, mission_points: DEFAULT_CONFIG.about_section.mission_points };
    }

    return {
        ...DEFAULT_CONFIG,
        ...landingConfig,
        announcement_bar: { ...DEFAULT_CONFIG.announcement_bar, ...landingConfig.announcement_bar },
        hero: { ...DEFAULT_CONFIG.hero, ...landingConfig.hero },
        about_section: { ...DEFAULT_CONFIG.about_section, ...aboutToUse },
        features_section: { ...DEFAULT_CONFIG.features_section, ...featuresToUse },
        testimonials_section: { ...DEFAULT_CONFIG.testimonials_section, ...landingConfig.testimonials_section },
        usp_section: { ...DEFAULT_CONFIG.usp_section, ...landingConfig.usp_section },
        cta_section: { ...DEFAULT_CONFIG.cta_section, ...landingConfig.cta_section },
        footer: { ...DEFAULT_CONFIG.footer, ...landingConfig.footer }
    };
  }, [landingConfig]);

  const handleNavigateToCourses = () => {
    navigate('/courses');
  };

  const isSticky = config.announcement_bar.is_visible && config.announcement_bar.is_sticky;
  const heroPaddingClass = (config.announcement_bar.is_visible && !isSticky) 
    ? 'pt-20 lg:pt-32' 
    : 'pt-32 lg:pt-48';

  const titleParts = config.about_section.title.split("Moise Web Academy");
  const preTitle = titleParts[0] || "Perché nasce ";
  const brandTitle = "Moise Web Academy";

  return (
    <div className="flex flex-col min-h-screen font-sans">
      
      {/* ANNOUNCEMENT BAR */}
      {config.announcement_bar.is_visible && (
        <div 
            className={`w-full z-40 overflow-hidden ${isSticky ? 'fixed top-20 shadow-md' : 'relative mt-20'}`}
            style={{ backgroundColor: config.announcement_bar.bg_color, color: config.announcement_bar.text_color }}
        >
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    display: inline-block;
                    white-space: nowrap;
                    animation: marquee 20s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <div className={`py-3 px-4 font-bold text-center text-sm md:text-base ${config.announcement_bar.type === 'marquee' ? 'whitespace-nowrap overflow-hidden' : ''}`}>
                {config.announcement_bar.type === 'marquee' ? (
                     <div className="animate-marquee w-full">
                         <span className="mx-8">{config.announcement_bar.text}</span>
                         <span className="mx-8">{config.announcement_bar.text}</span>
                         <span className="mx-8">{config.announcement_bar.text}</span>
                     </div>
                ) : (
                    <p>{config.announcement_bar.text}</p>
                )}
            </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className={`relative pb-20 lg:pb-32 bg-slate-900 overflow-hidden text-white ${heroPaddingClass}`}>
        {config.hero.image_url ? (
           <>
             <div className="absolute inset-0 z-0">
               <img src={config.hero.image_url} alt="Hero Background" className="w-full h-full object-cover opacity-30" />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60"></div>
             </div>
           </>
        ) : (
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
             <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-600 rounded-full blur-[120px]"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900 rounded-full blur-[150px]"></div>
           </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {config.hero.show_badges && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-brand-400 font-semibold text-xs sm:text-sm mb-8 uppercase tracking-wider shadow-lg">
                <span className="flex h-2 w-2 bg-brand-500 rounded-full animate-pulse"></span>
                Zero Abbonamenti • Zero Crediti AI • Zero Tool a Pagamento
                </div>
            )}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 leading-tight">
              {config.hero.title}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400 block mt-2">
                {config.hero.subtitle}
              </span>
            </h1>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleNavigateToCourses}
                className="bg-brand-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-500 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center group"
              >
                {config.hero.cta_primary} <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              {config.hero.cta_secondary && (
                  <button 
                    onClick={handleNavigateToCourses}
                    className="bg-slate-800 text-white border border-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all flex items-center justify-center"
                  >
                    {config.hero.cta_secondary}
                  </button>
              )}
            </div>
            {config.hero.show_badges && (
                <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-brand-500" /> Zero fuffa</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-brand-500" /> Acquisto Singolo</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-brand-500" /> Accesso a Vita</div>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 1 - About / Mission */}
      {config.about_section.is_visible && (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                    
                    {/* LEFT COLUMN: Image & Quote Card */}
                    <div className="w-full lg:w-1/2 relative">
                        <div className="relative rounded-3xl overflow-hidden h-[600px] w-full shadow-lg">
                            <img 
                                src={config.about_section.image_url} 
                                alt="About Us" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-8 right-0 md:-right-12 w-[90%] md:w-[450px] bg-white p-8 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 z-20 mx-4 md:mx-0">
                            <Quote className="h-10 w-10 text-slate-900 mb-6 stroke-[1.5]" />
                            <p className="font-bold text-slate-900 text-xl md:text-2xl leading-snug italic mb-8">
                                {config.about_section.quote}
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">
                                    DM
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-wider">{config.about_section.quote_author}</p>
                                    <p className="text-xs text-slate-500 font-medium">Founder, Moise Web Academy</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Text & List */}
                    <div className="w-full lg:w-1/2 lg:pt-8">
                        <div className="inline-flex items-center px-3 py-1.5 rounded bg-blue-50 text-brand-600 font-bold text-xs uppercase tracking-widest mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mr-2"></span>
                            {config.about_section.subtitle}
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
                            {preTitle}
                            <span className="text-brand-600 block">{brandTitle}</span>
                        </h2>
                        <div className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                           {config.about_section.text.split("\n\n")[0]} 
                           {config.about_section.text.includes("fastidio") && !config.about_section.text.endsWith("fastidio:") && (
                               <p className="mt-4">Nel mercato della formazione c'è una cosa che ci ha sempre dato fastidio:</p>
                           )}
                        </div>
                        {config.about_section.mission_points && config.about_section.mission_points.length > 0 && (
                            <div className="bg-slate-50 rounded-2xl p-8 mb-10 border border-slate-100">
                                <ul className="space-y-4">
                                    {config.about_section.mission_points.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                                                <X className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
                                            </div>
                                            <span className="text-slate-700 font-medium text-lg leading-snug">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="flex gap-4 items-start pl-0">
                            <div className="w-1 self-stretch bg-brand-600 rounded-full"></div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 mb-2">Noi facciamo l’opposto.</h4>
                                <p className="text-slate-600 leading-relaxed">
                                    In questa Academy vi insegniamo a creare tutto ciò che serve nel digitale usando strumenti a <strong>costo zero</strong>. Non pagate abbonamenti. Non servono crediti AI. Zero spese nascoste.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      )}

      {/* SECTION 2 - Features Grid (RIDISEGNATA 1:1) */}
      {config.features_section.is_visible && (
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">{config.features_section.title}</h2>
                    <p className="text-xl text-slate-500">{config.features_section.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {config.features_section.cards.map((card, idx) => {
                        const IconComponent = IconMap[card.icon] || Star;
                        const colorTheme = CARD_COLORS[idx % CARD_COLORS.length];
                        const featuresList = card.desc.split('\n').filter(s => s.trim() !== '');

                        return (
                            <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] transition-all duration-300 h-full flex flex-col">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${colorTheme.bg}`}>
                                    <IconComponent className={`h-8 w-8 ${colorTheme.text}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">{card.title}</h3>
                                
                                <div className="space-y-4 mt-auto">
                                    {featuresList.map((item, i) => (
                                        <div key={i} className="flex items-start">
                                            <div className="mt-1 mr-3 flex-shrink-0">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            </div>
                                            <span className="text-slate-600 text-sm font-medium leading-relaxed">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </section>
      )}

      {/* SECTION 3 - Testimonials */}
      {config.testimonials_section.is_visible && (
        <section className="py-24 bg-white overflow-hidden border-t border-gray-100">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">{config.testimonials_section.subtitle}</span>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mt-2">{config.testimonials_section.title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {config.testimonials_section.reviews.map((review, idx) => (
                         <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative">
                             <Quote className="h-8 w-8 text-brand-200 absolute top-6 right-6" />
                             <p className="text-slate-600 text-lg mb-6 leading-relaxed italic">"{review.text}"</p>
                             <div className="flex items-center gap-4">
                                 <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl">
                                     {review.avatar ? (
                                         <img src={review.avatar} alt={review.name} className="w-full h-full rounded-full object-cover" />
                                     ) : (
                                         review.name.charAt(0)
                                     )}
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-slate-900">{review.name}</h4>
                                     <p className="text-xs text-brand-600 font-semibold uppercase">{review.role}</p>
                                 </div>
                             </div>
                         </div>
                    ))}
                </div>
             </div>
        </section>
      )}

      {/* SECTION 4 - USP */}
      {config.usp_section.is_visible && (
          <section className="py-20 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">{config.usp_section.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {config.usp_section.items.map((item, idx) => (
                        <div key={idx} className="flex gap-6 p-6 rounded-2xl hover:bg-white transition-colors border border-transparent hover:shadow-lg">
                            <div className="shrink-0">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </section>
      )}

      {/* SECTION 7 - CTA FINALE */}
      {config.cta_section.is_visible && (
        <section className="py-24 bg-brand-600 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-12 -mt-12 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full -ml-12 -mb-12 blur-3xl"></div>
            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                    {config.cta_section.title}
                </h2>
                <p className="text-xl md:text-2xl text-brand-100 mb-10 font-medium">
                    {config.cta_section.subtitle}
                </p>
                <div className="flex justify-center">
                    <button 
                        onClick={handleNavigateToCourses}
                        className="bg-white text-brand-600 px-10 py-5 rounded-xl font-bold text-xl hover:bg-slate-100 transition-all shadow-xl shadow-brand-800/20"
                    >
                        {config.cta_section.button_text}
                    </button>
                </div>
            </div>
        </section>
      )}

      {config.footer.is_visible && (
        <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-400 text-sm">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">MWA</span>
                    <span>{config.footer.text}</span>
                </div>
                <p>&copy; {new Date().getFullYear()} {config.footer.copyright}</p>
            </div>
        </footer>
      )}
    </div>
  );
};
