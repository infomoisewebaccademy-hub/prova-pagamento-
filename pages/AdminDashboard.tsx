
import React, { useState, useEffect } from 'react';
import { Course, UserProfile, PlatformSettings, LandingPageConfig } from '../types';
import { Plus, Edit2, Trash2, Search, DollarSign, BookOpen, Clock, Eye, Lock, Unlock, Loader, Settings, Image, LayoutTemplate, Activity, HelpCircle, Terminal, AlignLeft, AlignCenter, MoveHorizontal, Sparkles, Wand2, X, MessageCircle, Megaphone, Target, ListOrdered, Book, Pin, Type, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { GoogleGenAI } from "@google/genai";

// Configurazione Default aggiornata
const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
  announcement_bar: {
    text: '🚀 Novità: Accedi subito ai corsi e inizia a creare progetti reali.',
    is_visible: true,
    is_sticky: false,
    type: 'static',
    bg_color: '#fbbf24',
    text_color: '#1e3a8a'
  },
  hero: {
    title: 'Imparate a creare piattaforme, siti web AI-powered e sistemi digitali completi',
    subtitle: 'Senza usare software a pagamento, senza abbonamenti e senza crediti AI.',
    text: 'MWA vi insegna le stesse competenze che usiamo ogni giorno...',
    cta_primary: 'Scopri i corsi disponibili',
    cta_secondary: 'Inizia subito',
    image_url: '', 
    show_badges: true
  },
  about_section: {
    title: 'Perché nasce Moise Web Academy',
    subtitle: 'LA NOSTRA MISSIONE',
    text: "Siamo Moise Web Academy. Negli ultimi anni abbiamo costruito piattaforme AI, siti web dinamici, automazioni, landing page e campagne pubblicitarie per decine di progetti reali.",
    mission_points: [
        "I corsi che promettono soldi veloci",
        "I “guru” che non hanno mai creato nulla",
        "Le lezioni che obbligano a comprare tool da 30–100€/mese"
    ],
    image_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1',
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
  target_section: {
    title: 'A chi è dedicata',
    is_visible: true,
    items: ['Freelance', 'Creator', 'Imprenditori']
  },
  process_section: {
    title: 'Come funziona',
    is_visible: true,
    steps: [{title: 'Scegli', desc: 'Trova il corso'}, {title: 'Acquista', desc: 'Accesso a vita'}]
  },
  testimonials_section: {
    title: 'Dicono di noi',
    subtitle: 'Recensioni',
    is_visible: true,
    reviews: [
        { name: 'Studente 1', role: 'Dev', text: 'Corso ottimo!' }
    ]
  },
  usp_section: {
    title: 'Perché noi?',
    items: [{ title: 'Qualità', desc: 'Solo il meglio.' }],
    is_visible: true
  },
  cta_section: {
    title: 'Inizia oggi',
    subtitle: 'Non aspettare oltre',
    button_text: 'Vai ai corsi',
    is_visible: true
  },
  footer: {
      text: 'Moise Web Academy',
      copyright: 'Tutti i diritti riservati.',
      is_visible: true
  }
};

interface AdminDashboardProps {
  courses: Course[];
  user: UserProfile;
  onDelete: (id: string) => void;
  onRefresh: () => Promise<void>;
  currentSettings: PlatformSettings;
  onUpdateSettings: (newSettings: PlatformSettings) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ courses, user, onDelete, onRefresh, currentSettings, onUpdateSettings }) => {
  const navigate = useNavigate();
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Settings States
  const [localSettings, setLocalSettings] = useState<PlatformSettings>(currentSettings);
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig>(currentSettings.landing_page_config || DEFAULT_LANDING_CONFIG);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  // Default tab is now 'courses' so you can see them immediately
  const [activeTab, setActiveTab] = useState<'courses' | 'general' | 'landing_manual' | 'landing_ai'>('courses');

  const FONT_OPTIONS = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Poppins',
    'Lato',
    'Montserrat',
    'Oswald',
    'Raleway',
    'Merriweather',
    'Playfair Display'
  ];

  // Sync props to state
  useEffect(() => {
    setLocalSettings(currentSettings);
    if (currentSettings.landing_page_config) {
        setLandingConfig({
            ...DEFAULT_LANDING_CONFIG, // Ensure all keys exist
            ...currentSettings.landing_page_config,
            hero: { ...DEFAULT_LANDING_CONFIG.hero, ...currentSettings.landing_page_config.hero }, // Deep merge hero for text field
            announcement_bar: { ...DEFAULT_LANDING_CONFIG.announcement_bar, ...currentSettings.landing_page_config.announcement_bar },
            about_section: { 
                ...DEFAULT_LANDING_CONFIG.about_section, 
                ...currentSettings.landing_page_config.about_section,
                mission_points: currentSettings.landing_page_config.about_section.mission_points || DEFAULT_LANDING_CONFIG.about_section.mission_points
            },
            features_section: { ...DEFAULT_LANDING_CONFIG.features_section, ...currentSettings.landing_page_config.features_section },
            target_section: { ...(DEFAULT_LANDING_CONFIG.target_section || {}), ...(currentSettings.landing_page_config.target_section || {}) } as any,
            process_section: { ...(DEFAULT_LANDING_CONFIG.process_section || {}), ...(currentSettings.landing_page_config.process_section || {}) } as any,
        });
    }
  }, [currentSettings]);

  // --- HELPER FOR LIST UPDATES ---
  const handleFeatureUpdate = (idx: number, field: string, value: string) => {
    const newCards = [...landingConfig.features_section.cards];
    newCards[idx] = { ...newCards[idx], [field]: value };
    setLandingConfig({ ...landingConfig, features_section: { ...landingConfig.features_section, cards: newCards } });
  };
  const addFeature = () => {
    const newCards = [...landingConfig.features_section.cards, { icon: 'Star', title: 'Nuovo Punto', desc: 'Punto 1\nPunto 2\nPunto 3' }];
    setLandingConfig({ ...landingConfig, features_section: { ...landingConfig.features_section, cards: newCards } });
  };
  const removeFeature = (idx: number) => {
    const newCards = landingConfig.features_section.cards.filter((_, i) => i !== idx);
    setLandingConfig({ ...landingConfig, features_section: { ...landingConfig.features_section, cards: newCards } });
  };

  const handleUspUpdate = (idx: number, field: string, value: string) => {
    const newItems = [...landingConfig.usp_section.items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setLandingConfig({ ...landingConfig, usp_section: { ...landingConfig.usp_section, items: newItems } });
  };
  const addUsp = () => {
    const newItems = [...landingConfig.usp_section.items, { title: 'Nuovo Vantaggio', desc: 'Spiegazione...' }];
    setLandingConfig({ ...landingConfig, usp_section: { ...landingConfig.usp_section, items: newItems } });
  };
  const removeUsp = (idx: number) => {
    const newItems = landingConfig.usp_section.items.filter((_, i) => i !== idx);
    setLandingConfig({ ...landingConfig, usp_section: { ...landingConfig.usp_section, items: newItems } });
  };

  // --- MISSION POINTS HELPERS ---
  const handleMissionPointUpdate = (idx: number, value: string) => {
      const newPoints = [...(landingConfig.about_section.mission_points || [])];
      newPoints[idx] = value;
      setLandingConfig({ ...landingConfig, about_section: { ...landingConfig.about_section, mission_points: newPoints } });
  };
  const addMissionPoint = () => {
      const newPoints = [...(landingConfig.about_section.mission_points || []), "Nuovo punto negativo"];
      setLandingConfig({ ...landingConfig, about_section: { ...landingConfig.about_section, mission_points: newPoints } });
  };
  const removeMissionPoint = (idx: number) => {
      const newPoints = (landingConfig.about_section.mission_points || []).filter((_, i) => i !== idx);
      setLandingConfig({ ...landingConfig, about_section: { ...landingConfig.about_section, mission_points: newPoints } });
  };

  // --- TARGET SECTION HELPERS ---
  const handleTargetUpdate = (idx: number, value: string) => {
      const currentSection = landingConfig.target_section || { title: '', items: [], is_visible: true };
      const newItems = [...currentSection.items];
      newItems[idx] = value;
      setLandingConfig({ ...landingConfig, target_section: { ...currentSection, items: newItems } });
  };
  const addTarget = () => {
      const currentSection = landingConfig.target_section || { title: '', items: [], is_visible: true };
      setLandingConfig({ ...landingConfig, target_section: { ...currentSection, items: [...currentSection.items, 'Nuovo Target'] } });
  };
  const removeTarget = (idx: number) => {
      const currentSection = landingConfig.target_section || { title: '', items: [], is_visible: true };
      const newItems = currentSection.items.filter((_, i) => i !== idx);
      setLandingConfig({ ...landingConfig, target_section: { ...currentSection, items: newItems } });
  };

  // --- PROCESS SECTION HELPERS ---
  const handleProcessUpdate = (idx: number, field: string, value: string) => {
      const currentSection = landingConfig.process_section || { title: '', steps: [], is_visible: true };
      const newSteps = [...currentSection.steps];
      newSteps[idx] = { ...newSteps[idx], [field]: value };
      setLandingConfig({ ...landingConfig, process_section: { ...currentSection, steps: newSteps } });
  };
  const addProcessStep = () => {
      const currentSection = landingConfig.process_section || { title: '', steps: [], is_visible: true };
      setLandingConfig({ ...landingConfig, process_section: { ...currentSection, steps: [...currentSection.steps, { title: 'Nuovo Step', desc: '...' }] } });
  };
  const removeProcessStep = (idx: number) => {
      const currentSection = landingConfig.process_section || { title: '', steps: [], is_visible: true };
      const newSteps = currentSection.steps.filter((_, i) => i !== idx);
      setLandingConfig({ ...landingConfig, process_section: { ...currentSection, steps: newSteps } });
  };

  // --- TESTIMONIALS HELPERS ---
  const handleReviewUpdate = (idx: number, field: string, value: string) => {
    const newReviews = [...landingConfig.testimonials_section.reviews];
    newReviews[idx] = { ...newReviews[idx], [field]: value };
    setLandingConfig({ ...landingConfig, testimonials_section: { ...landingConfig.testimonials_section, reviews: newReviews } });
  };
  const addReview = () => {
    const newReviews = [...landingConfig.testimonials_section.reviews, { name: 'Nuovo Utente', role: 'Studente', text: 'Ottima esperienza!' }];
    setLandingConfig({ ...landingConfig, testimonials_section: { ...landingConfig.testimonials_section, reviews: newReviews } });
  };
  const removeReview = (idx: number) => {
    const newReviews = landingConfig.testimonials_section.reviews.filter((_, i) => i !== idx);
    setLandingConfig({ ...landingConfig, testimonials_section: { ...landingConfig.testimonials_section, reviews: newReviews } });
  };


  // --- AI GENERATION LOGIC ---
  const handleAiGeneration = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = ai.models.generateContent({ 
            model: "gemini-2.5-flash",
            contents: `You are a CMS AI Assistant. Modify the JSON config for a Landing Page.
                CURRENT JSON: ${JSON.stringify(landingConfig, null, 2)}
                USER REQUEST: "${aiPrompt}"
                INSTRUCTIONS: Return ONLY valid JSON. Keep structure. Modify title, text, cards, items, announcement_bar, testimonials, target_section, process_section etc.`
        });

        const result = await model;
        const responseText = result.response.text;
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const newConfig = JSON.parse(jsonStr);

        setLandingConfig(newConfig);
        alert("✨ Configurazione generata! Clicca su 'Salva Modifiche' per applicare.");
        setActiveTab('landing_manual'); 

    } catch (error: any) {
        console.error("AI Error:", error);
        alert("Errore AI: " + error.message);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
        const finalSettings = {
            ...localSettings,
            landing_page_config: landingConfig
        };
        await onUpdateSettings(finalSettings);
        alert("Impostazioni salvate con successo!"); 
    } catch (error: any) {
         const errorMessage = error?.message || String(error);
         alert("Errore salvataggio: " + errorMessage);
    } finally {
        setIsSavingSettings(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestione Piattaforma</h1>
                <p className="text-gray-500 mt-1">Gestisci contenuti, design e intelligenza artificiale.</p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => setShowHelp(!showHelp)}
                    className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all flex items-center"
                >
                    <Terminal className="h-5 w-5 mr-2" /> Comandi Utili
                </button>
                <button 
                    onClick={() => navigate('/admin/course/new')}
                    className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" /> Crea Nuovo Corso
                </button>
            </div>
        </div>

        {/* --- HELP PANEL --- */}
        {showHelp && (
            <div className="bg-slate-900 text-slate-200 p-6 rounded-xl mb-8 shadow-xl border border-slate-700 font-mono text-sm relative">
                <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><Settings className="h-5 w-5"/></button>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center"><Terminal className="mr-2 h-5 w-5"/> Comandi SQL Necessari</h3>
                
                <div className="bg-black p-4 rounded border border-slate-700 mb-4">
                    <p className="text-gray-400 mb-2">// Per abilitare l'editing completo della Landing Page, esegui questo nel SQL Editor:</p>
                    <code className="text-green-400 select-all block mb-4">
                        ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS landing_page_config jsonb;
                    </code>
                    <p className="text-gray-400 mb-2">// Per abilitare la selezione del Font dinamico:</p>
                    <code className="text-blue-400 select-all block">
                        ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS font_family text DEFAULT 'Inter';
                    </code>
                </div>
            </div>
        )}

        {/* --- TABS NAVIGATION --- */}
        <div className="flex border-b border-gray-200 mb-6 space-x-6 overflow-x-auto">
            <button 
                onClick={() => setActiveTab('courses')}
                className={`pb-4 font-bold text-sm border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'courses' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Book className="h-4 w-4 mr-2" /> Gestione Corsi
            </button>
            <button 
                onClick={() => setActiveTab('landing_manual')}
                className={`pb-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'landing_manual' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Editor Home Page
            </button>
            <button 
                onClick={() => setActiveTab('landing_ai')}
                className={`pb-4 font-bold text-sm border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'landing_ai' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                <Sparkles className="h-4 w-4 mr-2" /> AI Magic Editor
            </button>
            <button 
                onClick={() => setActiveTab('general')}
                className={`pb-4 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'general' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Impostazioni
            </button>
        </div>

        {/* --- TAB CONTENT: COURSES MANAGEMENT --- */}
        {activeTab === 'courses' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {/* Card "Crea Nuovo" */}
                <div 
                    onClick={() => navigate('/admin/course/new')}
                    className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 transition-all group min-h-[350px]"
                >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                        <Plus className="h-8 w-8 text-gray-400 group-hover:text-brand-600" />
                    </div>
                    <span className="font-bold text-lg text-gray-500 group-hover:text-brand-700">Aggiungi Nuovo Corso</span>
                </div>

                {/* Course Cards */}
                {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                        <div className="relative h-48 overflow-hidden">
                             <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                             <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                {course.level}
                             </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                            <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                                <span className="flex items-center"><BookOpen className="h-4 w-4 mr-1"/> {course.lessons_content?.length || course.lessons} Lezioni</span>
                                <span className="font-bold text-gray-900">€{course.price}</span>
                            </div>
                            
                            <div className="mt-auto grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => navigate(`/admin/course/${course.id}`)}
                                    className="flex items-center justify-center px-4 py-2 border border-brand-200 text-brand-700 rounded-lg hover:bg-brand-50 font-medium transition-colors"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" /> Modifica
                                </button>
                                <button 
                                    onClick={() => onDelete(course.id)}
                                    className="flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Elimina
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        )}

        {/* --- TAB CONTENT: GENERAL --- */}
        {activeTab === 'general' && (
             <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center"><Settings className="mr-2 h-5 w-5"/>Impostazioni Base</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Altezza Logo ({localSettings.logo_height}px)</label>
                        <input 
                            type="range" min="30" max="200" 
                            value={localSettings.logo_height} 
                            onChange={(e) => setLocalSettings({...localSettings, logo_height: Number(e.target.value)})}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                        />
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2">Meta Pixel ID</label>
                         <input 
                            type="text" 
                            value={localSettings.meta_pixel_id || ''}
                            onChange={(e) => setLocalSettings({...localSettings, meta_pixel_id: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                            placeholder="Es. 1234567890..."
                        />
                     </div>
                     
                     {/* FONT SELECTION */}
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Type className="h-4 w-4 mr-2"/> Font Piattaforma (Google Fonts)
                         </label>
                         <select 
                            value={localSettings.font_family || 'Inter'}
                            onChange={(e) => setLocalSettings({...localSettings, font_family: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-white"
                         >
                            {FONT_OPTIONS.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                         </select>
                         <p className="text-xs text-gray-500 mt-2">
                             Il font verrà scaricato automaticamente da Google Fonts e applicato a tutta la piattaforma.
                         </p>
                     </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveSettings} disabled={isSavingSettings} className="px-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 flex items-center">
                        {isSavingSettings ? 'Salvataggio...' : 'Salva Impostazioni'}
                    </button>
                </div>
             </div>
        )}

        {/* --- TAB CONTENT: AI MAGIC EDITOR --- */}
        {activeTab === 'landing_ai' && (
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-xl shadow-2xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-12 -mt-12 blur-3xl"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6">
                        <Sparkles className="h-8 w-8 text-yellow-300" />
                    </div>
                    <h2 className="text-3xl font-black mb-4">Descrivi la tua Landing Page ideale</h2>
                    <p className="text-indigo-200 mb-8 text-lg">
                        L'AI modificherà per te Hero, Features, Testimonianze e Avvisi.
                    </p>

                    <textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Es: 'Vendi corsi di yoga. Colori rilassanti. Cambia il target in persone stressate e il processo in 3 step semplici.'"
                        className="w-full h-32 bg-white/10 border border-indigo-400/30 rounded-xl p-4 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none text-lg"
                    />

                    <button 
                        onClick={handleAiGeneration}
                        disabled={isAiLoading || !aiPrompt}
                        className="mt-6 px-8 py-4 bg-yellow-400 text-purple-900 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20 flex items-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAiLoading ? (
                            <><Loader className="h-6 w-6 animate-spin mr-2" /> Generazione in corso...</>
                        ) : (
                            <><Wand2 className="h-6 w-6 mr-2" /> Genera Modifiche con AI</>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* --- TAB CONTENT: MANUAL EDITOR (EXPANDED) --- */}
        {activeTab === 'landing_manual' && (
            <div className="space-y-8">
                
                {/* 0. ANNOUNCEMENT BAR */}
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm relative group">
                    <div className="flex justify-between mb-4">
                         <h3 className="text-lg font-bold text-yellow-800 uppercase tracking-wider flex items-center">
                            <Megaphone className="h-5 w-5 mr-2"/> Avviso (Announcement Bar)
                         </h3>
                         <div className="flex gap-4">
                             <label className="flex items-center text-sm font-bold text-yellow-900 cursor-pointer bg-yellow-100/50 px-3 py-1 rounded-lg hover:bg-yellow-100">
                                 <input type="checkbox" checked={landingConfig.announcement_bar?.is_sticky ?? false} onChange={(e) => setLandingConfig({...landingConfig, announcement_bar: {...landingConfig.announcement_bar, is_sticky: e.target.checked}})} className="mr-2 h-4 w-4 accent-yellow-600" /> 
                                 <Pin className="h-4 w-4 mr-1"/> Fisso in alto
                            </label>
                             <label className="flex items-center text-sm font-bold text-gray-600 cursor-pointer">
                                 <input type="checkbox" checked={landingConfig.announcement_bar?.is_visible ?? false} onChange={(e) => setLandingConfig({...landingConfig, announcement_bar: {...landingConfig.announcement_bar, is_visible: e.target.checked}})} className="mr-2 h-5 w-5 accent-yellow-600" /> Visibile
                            </label>
                         </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <input type="text" placeholder="Testo Avviso" value={landingConfig.announcement_bar?.text || ''} onChange={(e) => setLandingConfig({...landingConfig, announcement_bar: {...landingConfig.announcement_bar, text: e.target.value}})} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1">Tipo Animazione</label>
                             <select 
                                value={landingConfig.announcement_bar?.type || 'static'} 
                                onChange={(e) => setLandingConfig({...landingConfig, announcement_bar: {...landingConfig.announcement_bar, type: e.target.value as any}})}
                                className="w-full border p-2 rounded bg-white"
                             >
                                 <option value="static">Statico (Fermo)</option>
                                 <option value="marquee">Infinity (Scorrevole)</option>
                             </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Sfondo</label>
                                <input type="color" value={landingConfig.announcement_bar?.bg_color || '#fbbf24'} onChange={(e) => setLandingConfig({...landingConfig, announcement_bar: {...landingConfig.announcement_bar, bg_color: e.target.value}})} className="w-full h-10 border p-1 rounded cursor-pointer" />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Testo</label>
                                <input type="color" value={landingConfig.announcement_bar?.text_color || '#1e3a8a'} onChange={(e) => setLandingConfig({...landingConfig, announcement_bar: {...landingConfig.announcement_bar, text_color: e.target.value}})} className="w-full h-10 border p-1 rounded cursor-pointer" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* 1. HERO EDITOR */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group">
                    <h3 className="text-lg font-bold mb-4 text-brand-600 uppercase tracking-wider">1. Hero Section</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Titolo H1" value={landingConfig.hero.title} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, title: e.target.value}})} className="border p-2 rounded md:col-span-2" />
                        <input type="text" placeholder="Sottotitolo colorato" value={landingConfig.hero.subtitle} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, subtitle: e.target.value}})} className="border p-2 rounded md:col-span-2" />
                        <textarea rows={3} placeholder="Testo descrittivo" value={landingConfig.hero.text || ''} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, text: e.target.value}})} className="border p-2 rounded md:col-span-2" />
                        <input type="text" placeholder="Testo Bottone Primario" value={landingConfig.hero.cta_primary} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, cta_primary: e.target.value}})} className="border p-2 rounded" />
                        <input type="text" placeholder="Testo Bottone Secondario" value={landingConfig.hero.cta_secondary} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, cta_secondary: e.target.value}})} className="border p-2 rounded" />
                        <input type="text" placeholder="URL Immagine Sfondo" value={landingConfig.hero.image_url} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, image_url: e.target.value}})} className="border p-2 rounded md:col-span-2" />
                        <label className="flex items-center text-sm font-bold text-gray-600">
                             <input type="checkbox" checked={landingConfig.hero.show_badges} onChange={(e) => setLandingConfig({...landingConfig, hero: {...landingConfig.hero, show_badges: e.target.checked}})} className="mr-2 h-5 w-5 accent-brand-600" /> Mostra Badge "Zero Fuffa"
                        </label>
                    </div>
                </div>

                {/* 2. ABOUT EDITOR */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between mb-4">
                         <h3 className="text-lg font-bold text-brand-600 uppercase tracking-wider">2. Chi Siamo</h3>
                         <input type="checkbox" checked={landingConfig.about_section.is_visible} onChange={(e) => setLandingConfig({...landingConfig, about_section: {...landingConfig.about_section, is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                    </div>
                    <div className="space-y-3">
                         <input type="text" value={landingConfig.about_section.title} onChange={(e) => setLandingConfig({...landingConfig, about_section: {...landingConfig.about_section, title: e.target.value}})} className="w-full border p-2 rounded" placeholder="Titolo" />
                         <input type="text" value={landingConfig.about_section.subtitle} onChange={(e) => setLandingConfig({...landingConfig, about_section: {...landingConfig.about_section, subtitle: e.target.value}})} className="w-full border p-2 rounded" placeholder="Badge (es. LA NOSTRA MISSIONE)" />
                         <textarea rows={4} value={landingConfig.about_section.text} onChange={(e) => setLandingConfig({...landingConfig, about_section: {...landingConfig.about_section, text: e.target.value}})} className="w-full border p-2 rounded" placeholder="Testo principale..." />
                         
                         {/* Mission Points Editor */}
                         <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                             <label className="block text-xs font-bold text-gray-500 mb-2">Lista dei "Contro" (X Rossa)</label>
                             <div className="space-y-2">
                                {(landingConfig.about_section.mission_points || []).map((point, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input type="text" value={point} onChange={(e) => handleMissionPointUpdate(idx, e.target.value)} className="flex-1 border p-1 rounded text-sm" />
                                        <button onClick={() => removeMissionPoint(idx)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="h-4 w-4"/></button>
                                    </div>
                                ))}
                                <button onClick={addMissionPoint} className="text-sm text-brand-600 font-bold flex items-center hover:underline mt-2"><Plus className="h-4 w-4 mr-1"/> Aggiungi Punto</button>
                             </div>
                         </div>

                         <input type="text" value={landingConfig.about_section.image_url} onChange={(e) => setLandingConfig({...landingConfig, about_section: {...landingConfig.about_section, image_url: e.target.value}})} className="w-full border p-2 rounded" placeholder="URL Immagine" />
                         <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={landingConfig.about_section.quote} onChange={(e) => setLandingConfig({...landingConfig, about_section: {...landingConfig.about_section, quote: e.target.value}})} className="border p-2 rounded" placeholder="Citazione" />
                            <input type="text" value={landingConfig.about_section.quote_author} onChange={(e) => setLandingConfig({...landingConfig, about_section: {...landingConfig.about_section, quote_author: e.target.value}})} className="border p-2 rounded" placeholder="Autore" />
                         </div>
                    </div>
                </div>

                {/* 3. FEATURES EDITOR (LIST) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between mb-4">
                         <h3 className="text-lg font-bold text-brand-600 uppercase tracking-wider">3. Cosa Imparerete</h3>
                         <input type="checkbox" checked={landingConfig.features_section.is_visible} onChange={(e) => setLandingConfig({...landingConfig, features_section: {...landingConfig.features_section, is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                    </div>
                    <input type="text" value={landingConfig.features_section.title} onChange={(e) => setLandingConfig({...landingConfig, features_section: {...landingConfig.features_section, title: e.target.value}})} className="w-full border p-2 rounded mb-2" placeholder="Titolo Sezione" />
                    <input type="text" value={landingConfig.features_section.subtitle} onChange={(e) => setLandingConfig({...landingConfig, features_section: {...landingConfig.features_section, subtitle: e.target.value}})} className="w-full border p-2 rounded mb-4" placeholder="Sottotitolo" />

                    <div className="space-y-6 mt-6">
                        {landingConfig.features_section.cards.map((card, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-xl p-6 bg-gray-50 relative group">
                                <button onClick={() => removeFeature(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2 bg-white rounded-full border border-gray-100 shadow-sm"><Trash2 className="h-4 w-4"/></button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Icon & Title */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                                                Icona (Lucide)
                                                <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="ml-2 text-brand-600 normal-case font-normal inline-flex items-center hover:underline">
                                                    Lista Icone <ExternalLink className="h-3 w-3 ml-1"/>
                                                </a>
                                            </label>
                                            <input type="text" value={card.icon} onChange={(e) => handleFeatureUpdate(idx, 'icon', e.target.value)} className="w-full border p-2 rounded text-sm font-mono bg-white" placeholder="Es. Cpu, Zap, Target..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Titolo Card</label>
                                            <input type="text" value={card.title} onChange={(e) => handleFeatureUpdate(idx, 'title', e.target.value)} className="w-full border p-2 rounded font-bold bg-white" placeholder="Titolo" />
                                        </div>
                                    </div>
                                    
                                    {/* List Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide text-green-600">
                                            Lista (Vai a capo per nuova spunta)
                                        </label>
                                        <textarea 
                                            rows={5}
                                            value={card.desc} 
                                            onChange={(e) => handleFeatureUpdate(idx, 'desc', e.target.value)} 
                                            className="w-full border p-2 rounded text-sm bg-white" 
                                            placeholder="Ogni riga diventerà un punto con la spunta verde." 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addFeature} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-brand-600 font-bold flex items-center justify-center hover:bg-brand-50 hover:border-brand-200 transition-colors">
                            <Plus className="h-5 w-5 mr-2"/> Aggiungi Nuova Card
                        </button>
                    </div>
                </div>
                
                {/* 4. TARGET SECTION (A CHI E' RIVOLTO) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between mb-4">
                         <h3 className="text-lg font-bold text-brand-600 uppercase tracking-wider flex items-center">
                            <Target className="h-5 w-5 mr-2"/> A chi è rivolto
                         </h3>
                         <input type="checkbox" checked={landingConfig.target_section?.is_visible ?? true} onChange={(e) => setLandingConfig({...landingConfig, target_section: {...(landingConfig.target_section || {title:'', items:[], is_visible: true}), is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                    </div>
                    <input type="text" value={landingConfig.target_section?.title || ''} onChange={(e) => setLandingConfig({...landingConfig, target_section: {...(landingConfig.target_section || {items:[], is_visible: true}), title: e.target.value}})} className="w-full border p-2 rounded mb-4" placeholder="Titolo Sezione" />
                    
                    <div className="space-y-2">
                        {(landingConfig.target_section?.items || []).map((item, idx) => (
                             <div key={idx} className="flex gap-2 mb-2">
                                <input 
                                    type="text" 
                                    value={item}
                                    onChange={e => handleTargetUpdate(idx, e.target.value)}
                                    className="flex-1 border p-2 rounded text-sm"
                                    placeholder="Es. Freelance..."
                                />
                                <button onClick={() => removeTarget(idx)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="h-4 w-4"/></button>
                             </div>
                        ))}
                        <button onClick={addTarget} className="text-sm text-brand-600 font-bold flex items-center hover:underline"><Plus className="h-4 w-4 mr-1"/> Aggiungi Target</button>
                    </div>
                </div>

                {/* 5. PROCESS SECTION (COME FUNZIONA) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between mb-4">
                         <h3 className="text-lg font-bold text-brand-600 uppercase tracking-wider flex items-center">
                            <ListOrdered className="h-5 w-5 mr-2"/> Come Funziona
                         </h3>
                         <input type="checkbox" checked={landingConfig.process_section?.is_visible ?? true} onChange={(e) => setLandingConfig({...landingConfig, process_section: {...(landingConfig.process_section || {title:'', steps:[]}), is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                    </div>
                    <input type="text" value={landingConfig.process_section?.title || ''} onChange={(e) => setLandingConfig({...landingConfig, process_section: {...(landingConfig.process_section || {steps:[], is_visible: true}), title: e.target.value}})} className="w-full border p-2 rounded mb-4" placeholder="Titolo Sezione" />

                    <div className="space-y-4">
                        {(landingConfig.process_section?.steps || []).map((step, idx) => (
                            <div key={idx} className="flex gap-2 items-start border p-3 rounded bg-gray-50">
                                <span className="bg-gray-200 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-1">{idx + 1}</span>
                                <div className="flex-1 space-y-2">
                                    <input type="text" value={step.title} onChange={(e) => handleProcessUpdate(idx, 'title', e.target.value)} className="w-full border p-1 rounded font-bold" placeholder="Titolo Step" />
                                    <input type="text" value={step.desc} onChange={(e) => handleProcessUpdate(idx, 'desc', e.target.value)} className="w-full border p-1 rounded text-sm" placeholder="Descrizione" />
                                </div>
                                <button onClick={() => removeProcessStep(idx)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                        <button onClick={addProcessStep} className="text-sm text-brand-600 font-bold flex items-center hover:underline"><Plus className="h-4 w-4 mr-1"/> Aggiungi Step</button>
                    </div>
                </div>

                {/* 6. TESTIMONIALS EDITOR */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between mb-4">
                         <h3 className="text-lg font-bold text-brand-600 uppercase tracking-wider flex items-center">
                            <MessageCircle className="h-5 w-5 mr-2"/> Testimonianze
                         </h3>
                         <input type="checkbox" checked={landingConfig.testimonials_section?.is_visible ?? true} onChange={(e) => setLandingConfig({...landingConfig, testimonials_section: {...landingConfig.testimonials_section, is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                    </div>
                    <input type="text" value={landingConfig.testimonials_section?.title || ''} onChange={(e) => setLandingConfig({...landingConfig, testimonials_section: {...landingConfig.testimonials_section, title: e.target.value}})} className="w-full border p-2 rounded mb-2" placeholder="Titolo Sezione" />
                    <input type="text" value={landingConfig.testimonials_section?.subtitle || ''} onChange={(e) => setLandingConfig({...landingConfig, testimonials_section: {...landingConfig.testimonials_section, subtitle: e.target.value}})} className="w-full border p-2 rounded mb-4" placeholder="Sottotitolo" />

                    <div className="space-y-4">
                        {(landingConfig.testimonials_section?.reviews || []).map((review, idx) => (
                            <div key={idx} className="flex gap-2 items-start border p-3 rounded bg-gray-50">
                                <div className="flex-1 space-y-2">
                                    <div className="flex gap-2">
                                        <input type="text" value={review.name} onChange={(e) => handleReviewUpdate(idx, 'name', e.target.value)} className="w-1/2 border p-1 rounded font-bold" placeholder="Nome" />
                                        <input type="text" value={review.role} onChange={(e) => handleReviewUpdate(idx, 'role', e.target.value)} className="w-1/2 border p-1 rounded text-sm" placeholder="Ruolo" />
                                    </div>
                                    <textarea rows={2} value={review.text} onChange={(e) => handleReviewUpdate(idx, 'text', e.target.value)} className="w-full border p-1 rounded text-sm" placeholder="Recensione..." />
                                </div>
                                <button onClick={() => removeReview(idx)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                        <button onClick={addReview} className="text-sm text-brand-600 font-bold flex items-center hover:underline"><Plus className="h-4 w-4 mr-1"/> Aggiungi Recensione</button>
                    </div>
                </div>

                {/* 7. USP EDITOR (LIST) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <div className="flex justify-between mb-4">
                         <h3 className="text-lg font-bold text-brand-600 uppercase tracking-wider">7. Perché Noi (USP)</h3>
                         <input type="checkbox" checked={landingConfig.usp_section.is_visible} onChange={(e) => setLandingConfig({...landingConfig, usp_section: {...landingConfig.usp_section, is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                    </div>
                    <input type="text" value={landingConfig.usp_section.title} onChange={(e) => setLandingConfig({...landingConfig, usp_section: {...landingConfig.usp_section, title: e.target.value}})} className="w-full border p-2 rounded mb-4" placeholder="Titolo Sezione" />

                     <div className="space-y-4">
                        {landingConfig.usp_section.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start border p-3 rounded bg-gray-50">
                                <div className="flex-1 space-y-2">
                                    <input type="text" value={item.title} onChange={(e) => handleUspUpdate(idx, 'title', e.target.value)} className="w-full border p-1 rounded font-bold" placeholder="Vantaggio" />
                                    <input type="text" value={item.desc} onChange={(e) => handleUspUpdate(idx, 'desc', e.target.value)} className="w-full border p-1 rounded text-sm" placeholder="Descrizione" />
                                </div>
                                <button onClick={() => removeUsp(idx)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="h-4 w-4"/></button>
                            </div>
                        ))}
                        <button onClick={addUsp} className="text-sm text-brand-600 font-bold flex items-center hover:underline"><Plus className="h-4 w-4 mr-1"/> Aggiungi Vantaggio</button>
                    </div>
                </div>

                 {/* 8. CTA SECTION */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between mb-4">
                         <h3 className="text-lg font-bold text-brand-600 uppercase tracking-wider">8. Call To Action Finale</h3>
                         <input type="checkbox" checked={landingConfig.cta_section.is_visible} onChange={(e) => setLandingConfig({...landingConfig, cta_section: {...landingConfig.cta_section, is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                    </div>
                    <div className="space-y-3">
                         <input type="text" value={landingConfig.cta_section.title} onChange={(e) => setLandingConfig({...landingConfig, cta_section: {...landingConfig.cta_section, title: e.target.value}})} className="w-full border p-2 rounded" placeholder="Titolo" />
                         <input type="text" value={landingConfig.cta_section.subtitle} onChange={(e) => setLandingConfig({...landingConfig, cta_section: {...landingConfig.cta_section, subtitle: e.target.value}})} className="w-full border p-2 rounded" placeholder="Sottotitolo" />
                         <input type="text" value={landingConfig.cta_section.button_text} onChange={(e) => setLandingConfig({...landingConfig, cta_section: {...landingConfig.cta_section, button_text: e.target.value}})} className="w-full border p-2 rounded" placeholder="Testo Bottone" />
                    </div>
                </div>

                 {/* 9. FOOTER */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                     <div className="flex justify-between mb-4">
                         <h3 className="text-lg font-bold text-brand-600 uppercase tracking-wider">9. Footer</h3>
                         <input type="checkbox" checked={landingConfig.footer?.is_visible ?? true} onChange={(e) => setLandingConfig({...landingConfig, footer: {...(landingConfig.footer || {text:'', copyright:''}), is_visible: e.target.checked}})} className="h-5 w-5 accent-brand-600" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input type="text" value={landingConfig.footer?.text || ''} onChange={(e) => setLandingConfig({...landingConfig, footer: {...(landingConfig.footer || {copyright:'', is_visible: true}), text: e.target.value}})} className="border p-2 rounded" placeholder="Testo Brand (es. Moise Academy)" />
                         <input type="text" value={landingConfig.footer?.copyright || ''} onChange={(e) => setLandingConfig({...landingConfig, footer: {...(landingConfig.footer || {text:'', is_visible: true}), copyright: e.target.value}})} className="border p-2 rounded" placeholder="Copyright (es. Tutti i diritti...)" />
                    </div>
                </div>

                <div className="fixed bottom-6 right-6 z-40">
                    <button onClick={handleSaveSettings} disabled={isSavingSettings} className="px-8 py-4 bg-brand-600 text-white rounded-full font-bold hover:bg-brand-700 shadow-2xl shadow-brand-500/50 flex items-center text-lg transform hover:scale-105 transition-all">
                        <Settings className="mr-2 h-5 w-5" /> Salva Modifiche
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
