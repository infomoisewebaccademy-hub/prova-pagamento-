
import React, { useState } from 'react';
import { Course, Lesson, UserProfile } from '../types';
import { Clock, Book, BarChart, Check, Lock, Play, PlayCircle, Sparkles, AlertCircle, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface CourseDetailProps {
  course: Course;
  onPurchase: () => void;
  isPurchased: boolean;
  onBack: () => void;
  user: UserProfile | null;
}

export const CourseDetail: React.FC<CourseDetailProps> = ({ course, onPurchase, isPurchased, onBack, user }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  // Se l'utente ha comprato il corso e clicca "Continua", mostra la prima lezione
  const startLearning = () => {
    if (course.lessons_content && course.lessons_content.length > 0) {
        setActiveLesson(course.lessons_content[0]);
        // Scroll to player
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert("Questo corso non ha ancora lezioni caricate dall'insegnante.");
    }
  };

  // LOGICA SCONTO FEDELTÀ
  // È considerato cliente fedele se ha almeno 1 corso acquistato
  const hasPreviousPurchases = user && user.purchased_courses.length > 0;
  // Lo sconto è applicabile se esiste, se l'utente è fedele e se non possiede già questo specifico corso
  const isDiscountAvailable = hasPreviousPurchases && course.discounted_price && course.discounted_price > 0 && !isPurchased;
  
  const finalPrice = isDiscountAvailable ? course.discounted_price : course.price;
  const inCart = isInCart(course.id);

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button onClick={onBack} className="mb-8 text-gray-500 hover:text-gray-900 font-medium flex items-center">
            ← Torna ai Corsi
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* VIDEO PLAYER AREA */}
                {isPurchased && activeLesson ? (
                    <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video relative group">
                        {activeLesson.videoUrl ? (
                             activeLesson.videoUrl.includes('youtube') || activeLesson.videoUrl.includes('youtu.be') ? (
                                <iframe 
                                    src={activeLesson.videoUrl.replace('watch?v=', 'embed/')} 
                                    className="w-full h-full" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                             ) : (
                                <video src={activeLesson.videoUrl} controls className="w-full h-full" />
                             )
                        ) : (
                            <div className="flex items-center justify-center h-full text-white/50">
                                <p>Video non disponibile per questa lezione</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <span className="text-brand-600 font-bold tracking-wider text-sm uppercase mb-2 block">{course.level}</span>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
                        {/* MODIFICA QUI: whitespace-pre-wrap mantiene spazi e a capo */}
                        <p className="text-xl text-gray-600 leading-relaxed whitespace-pre-wrap">{course.description}</p>
                    </div>
                )}

                {/* Lesson Info if playing */}
                {isPurchased && activeLesson && (
                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeLesson.title}</h2>
                        <p className="text-gray-600 whitespace-pre-wrap">{activeLesson.description}</p>
                    </div>
                )}

                {/* Meta Stats */}
                {!activeLesson && (
                    <div className="flex flex-wrap gap-6 py-6 border-y border-gray-200">
                        <div className="flex items-center text-gray-700">
                            <Clock className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="font-semibold">{course.duration}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Book className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="font-semibold">{course.lessons_content?.length || course.lessons} Lezioni</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <BarChart className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="font-semibold">Livello {course.level}</span>
                        </div>
                    </div>
                )}

                {/* Syllabus */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold mb-6">Programma del Corso</h2>
                    <div className="space-y-4">
                        {(!course.lessons_content || course.lessons_content.length === 0) ? (
                            <div className="text-center text-gray-400 py-4">Lezioni in arrivo...</div>
                        ) : (
                            course.lessons_content.map((lesson, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => isPurchased ? setActiveLesson(lesson) : null}
                                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                                        activeLesson?.id === lesson.id 
                                        ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-200' 
                                        : 'border-gray-100 hover:bg-gray-50'
                                    } ${!isPurchased && 'opacity-70'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded mr-4 font-bold text-sm ${activeLesson?.id === lesson.id ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {(idx + 1).toString().padStart(2, '0')}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${activeLesson?.id === lesson.id ? 'text-brand-900' : 'text-gray-900'}`}>{lesson.title}</h4>
                                                {lesson.description && <p className="text-xs text-gray-400 line-clamp-1">{lesson.description}</p>}
                                            </div>
                                        </div>
                                        {isPurchased ? (
                                            <PlayCircle className={`h-5 w-5 ${activeLesson?.id === lesson.id ? 'text-brand-600' : 'text-gray-400'}`} />
                                        ) : (
                                            <Lock className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Curriculum Features Preview (Only if not playing) */}
                {!activeLesson && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-2xl font-bold mb-6">Cosa Imparerai</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {course.features.map((feat, i) => (
                                <div key={i} className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                                    <span className="text-gray-600">{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sticky Sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky top-28 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {!activeLesson && (
                        <img src={course.image} alt="Preview" className="w-full h-48 object-cover" />
                    )}
                    <div className="p-8">
                        {!isPurchased && (
                             <div className="mb-6">
                                {isDiscountAvailable ? (
                                    <>
                                        <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-2 animate-pulse">
                                            <Sparkles className="h-3 w-3 mr-1" /> Offerta Fedeltà Attiva
                                        </div>
                                        <div className="flex items-end">
                                            <span className="text-4xl font-bold text-purple-600">€{finalPrice}</span>
                                            <span className="text-gray-400 ml-2 mb-1 line-through text-lg">€{course.price}</span>
                                        </div>
                                        <p className="text-xs text-purple-600 mt-2">
                                            Grazie per essere un nostro studente! Hai diritto a questo prezzo speciale.
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex items-end">
                                        <span className="text-4xl font-bold text-gray-900">€{course.price}</span>
                                        <span className="text-gray-400 ml-2 mb-1 line-through">€{course.price * 1.5}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {isPurchased ? (
                            !activeLesson ? (
                                <button 
                                    onClick={startLearning}
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all mb-4 shadow-lg shadow-green-500/20"
                                >
                                    <Play className="inline-block h-5 w-5 mr-2 mb-1" /> Inizia Corso
                                </button>
                            ) : (
                                <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-lg text-sm text-center font-bold border border-green-100">
                                    Stai guardando il corso
                                </div>
                            )
                        ) : (
                            <div className="space-y-3">
                                
                                <button 
                                    onClick={onPurchase}
                                    className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 mb-2 flex items-center justify-center"
                                >
                                    <Zap className="mr-2 h-5 w-5 fill-current" /> Acquista Subito
                                </button>

                                <button 
                                    onClick={() => {
                                        if (inCart) navigate('/cart');
                                        else addToCart(course);
                                    }}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center border-2 ${
                                        inCart 
                                        ? 'bg-green-50 border-green-200 text-green-600' 
                                        : 'bg-white border-brand-600 text-brand-600 hover:bg-brand-50'
                                    }`}
                                >
                                    {inCart ? (
                                        <>Nel Carrello <Check className="ml-2 h-5 w-5" /></>
                                    ) : (
                                        <>Aggiungi al Carrello <ShoppingCart className="ml-2 h-5 w-5" /></>
                                    )}
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-2 leading-tight">
                                    Non serve registrarsi ora. Riceverai le credenziali d'accesso via email subito dopo l'acquisto.
                                </p>
                            </div>
                        )}
                        
                        <div className="space-y-4 pt-6 mt-6 border-t border-gray-100">
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-600">Lezioni</span>
                                 <span className="font-bold text-gray-900">{course.lessons_content?.length || 0}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-600">Accesso illimitato</span>
                                 <span className="font-bold text-gray-900">Sì</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-gray-600">Certificato</span>
                                 <span className="font-bold text-gray-900">Sì</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
