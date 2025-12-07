
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration?: string;
  isFree?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  discounted_price?: number; // Prezzo per chi ha già acquistato
  image: string;
  features: string[];
  lessons: number;
  duration: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzato';
  videoUrl?: string; // Preview video
  lessons_content?: Lesson[]; // Nuova struttura dati
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  purchased_courses: string[]; // Array of Course IDs
}

// Configurazione completa della Landing Page modificabile
export interface LandingPageConfig {
  announcement_bar: {
    text: string;
    is_visible: boolean;
    is_sticky?: boolean; // Nuova opzione per rendere l'avviso fisso allo scroll
    type: 'static' | 'marquee';
    bg_color: string;
    text_color: string;
  };
  hero: {
    title: string;
    subtitle: string;
    text?: string; // Added optional text field
    cta_primary: string;
    cta_secondary: string;
    image_url?: string; // Background o Side Image
    show_badges: boolean;
  };
  about_section: {
    title: string;
    subtitle: string;
    text: string;
    mission_points?: string[]; // NUOVO: Lista dei "Contro" (X rosse)
    image_url: string;
    quote: string;
    quote_author: string;
    is_visible: boolean;
  };
  features_section: {
    title: string;
    subtitle: string;
    cards: Array<{ icon: string; title: string; desc: string }>;
    is_visible: boolean;
  };
  target_section?: { // Added optional target section
    title: string;
    items: string[];
    is_visible: boolean;
  };
  process_section?: { // Added optional process section
    title: string;
    steps: Array<{ title: string; desc: string }>;
    is_visible: boolean;
  };
  testimonials_section: {
    title: string;
    subtitle: string;
    is_visible: boolean;
    reviews: Array<{ name: string; role: string; text: string; avatar?: string }>;
  };
  usp_section: {
    title: string;
    items: Array<{ title: string; desc: string }>;
    is_visible: boolean;
  };
  cta_section: {
    title: string;
    subtitle: string;
    button_text: string;
    is_visible: boolean;
  };
  footer: {
      text: string;
      copyright: string;
      is_visible: boolean;
  }
}

export interface PlatformSettings {
  id: number;
  logo_height: number;
  logo_alignment?: 'left' | 'center';
  logo_margin_left?: number;
  meta_pixel_id?: string;
  font_family?: string; // Nuovo campo per il Font
  
  // Campi Legacy (mantenuti per retrocompatibilità, ma la logica si sposta su landing_page_config)
  home_hero_title?: string;
  home_hero_subtitle?: string;
  
  // Nuovo campo JSONB per la configurazione completa
  landing_page_config?: LandingPageConfig;
}

export enum AuthState {
  LOADING,
  AUTHENTICATED,
  UNAUTHENTICATED
}
