
import React, { useState } from 'react';
import { Course, UserProfile } from '../types';
import { CheckCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface CoursesPageProps {
  courses: Course[];
  onCourseSelect: (courseId: string) => void;
  user?: UserProfile | null;
}

// Componente Card estratto per gestire lo stato "Espanso/Ridotto" singolarmente
const CourseCard: React.FC<{ 
    course: Course; 
    onCourseSelect: (id: string) => void; 
    user?: UserProfile | null 
}> = ({ course, onCourseSelect, user }) => {
    const { addToCart, isInCart } = useCart();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // Configurazione lunghezza massima anteprima
    const MAX_PREVIEW_LENGTH = 120;
    
    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(course);
    };

    const isPurchased = user?.purchased_courses.includes(course.id);
    const inCart = isInCart(course.id);
    
    // Logica per troncare il testo
    const shouldTruncate = course.description.length > MAX_PREVIEW_LENGTH;
    
    // Testo da mostrare: usa whitespace-pre-wrap per mantenere gli a capo
    const descriptionText = isExpanded || !shouldTruncate
        ? course.description
        : course.description.slice(0, MAX_PREVIEW_LENGTH).trim() + "...";

    return (
        <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 flex flex-col h-full group hover:border-brand-500 transition-all duration-300 shadow-xl">
            
            <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => onCourseSelect(course.id)}>
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-400 uppercase tracking-wide border border-slate-700">
                    {course.level}
                </div>
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 cursor-pointer group-hover:text-brand-400 transition-colors" onClick={() => onCourseSelect(course.id)}>{course.title}</h3>
                
                {/* AREA DESCRIZIONE */}
                <div className="mb-6 flex-1">
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap transition-all">
                        {descriptionText}
                    </p>
                    {shouldTruncate && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="text-brand-400 text-xs font-bold mt-2 hover:text-white uppercase tracking-wider transition-colors focus:outline-none"
                        >
                            {isExpanded ? "Mostra meno" : "Leggi tutto"}
                        </button>
                    )}
                </div>
                
                <div className="space-y-3 mb-8">
                    {course.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center text-sm text-slate-300">
                            <CheckCircle className="h-4 w-4 text-brand-500 mr-2 flex-shrink-0" />
                            {feat}
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-700 flex items-center justify-between gap-3">
                    <div>
                        <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">Investimento</span>
                        <span className="text-2xl font-bold text-white">€{course.price}</span>
                    </div>
                    
                    {isPurchased ? (
                    <button 
                        onClick={() => onCourseSelect(course.id)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex-1 shadow-lg shadow-green-900/20"
                    >
                        Vai al Corso
                    </button>
                    ) : (
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => {
                                if (inCart) navigate('/cart');
                                else handleAddToCart(e);
                            }}
                            className={`p-3 rounded-lg font-semibold transition-colors border ${inCart ? 'bg-brand-900 border-brand-500 text-brand-400' : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-brand-500 hover:text-white'}`}
                            title={inCart ? "Vai al carrello" : "Aggiungi al carrello"}
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => onCourseSelect(course.id)}
                            className="bg-white text-slate-900 px-4 py-3 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                        >
                            Dettagli
                        </button>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const CoursesPage: React.FC<CoursesPageProps> = ({ courses, onCourseSelect, user }) => {
  return (
    <div className="pt-32 min-h-screen bg-slate-900 pb-20 font-sans text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header della pagina corsi */}
        <div className="text-center mb-16 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-brand-400 font-semibold text-xs sm:text-sm mb-6 uppercase tracking-wider shadow-lg">
              <span className="flex h-2 w-2 bg-brand-500 rounded-full animate-pulse"></span>
              Catalogo Completo
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Scegli il tuo percorso
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Accesso a vita. Aggiornamenti inclusi. Nessun abbonamento.
            </p>
            
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600 rounded-full blur-[150px] opacity-10 -z-10"></div>
        </div>

        {/* Griglia Corsi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
                <CourseCard 
                    key={course.id} 
                    course={course} 
                    onCourseSelect={onCourseSelect} 
                    user={user} 
                />
            ))}
        </div>
      </div>
    </div>
  );
};
