
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { UserProfile } from '../types';
import { Trash2, ArrowRight, ShoppingCart, Sparkles, Mail } from 'lucide-react';
import { createCheckoutSession } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { trackInitiateCheckout } from '../services/metaPixel';

interface CartProps {
  user: UserProfile | null;
}

export const Cart: React.FC<CartProps> = ({ user }) => {
  const { items, removeFromCart, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const calculateTotal = () => {
    return items.reduce((acc, course) => {
      // Se l'utente è loggato e ha già acquistato in passato (fedeltà), usa il prezzo scontato se presente
      const hasPurchases = user && user.purchased_courses.length > 0;
      const priceToUse = (hasPurchases && course.discounted_price) ? course.discounted_price : course.price;
      return acc + priceToUse;
    }, 0);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    // GUEST CHECKOUT: Non controlliamo più se l'utente esiste.
    // Se c'è un utente, passiamo il suo ID. Se no, passiamo null.

    try {
      setIsCheckingOut(true);
      const courseIds = items.map(c => c.id);
      const totalValue = calculateTotal();
      
      // Track Pixel Event
      trackInitiateCheckout(courseIds, totalValue);
      
      const userId = user ? user.id : undefined;
      const email = user ? user.email : undefined;

      const response = await createCheckoutSession(courseIds, userId, email);
      
      if (response && response.url) {
        clearCart(); 
        window.location.href = response.url;
      } else {
        throw new Error("URL di pagamento non ricevuto");
      }
    } catch (error: any) {
      console.error(error);
      alert("Errore durante il checkout: " + (error.message || "Riprova più tardi"));
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-gray-100 p-6 rounded-full mb-6">
          <ShoppingCart className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Il tuo carrello è vuoto</h2>
        <p className="text-gray-500 mb-8">Sembra che tu non abbia ancora aggiunto nessun corso.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30"
        >
          Esplora i Corsi
        </button>
      </div>
    );
  }

  const hasPurchases = user && user.purchased_courses.length > 0;

  return (
    <div className="pt-32 min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Il tuo Carrello</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Lista Elementi */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((course) => {
              const isDiscounted = hasPurchases && course.discounted_price && course.discounted_price > 0;
              const price = isDiscounted ? course.discounted_price! : course.price;
              
              return (
                <div key={course.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      {course.lessons} Lezioni • Livello {course.level}
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end min-w-[100px]">
                    <div className="font-bold text-xl text-gray-900">€{price.toFixed(2)}</div>
                    {isDiscounted && (
                       <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full mt-1 flex items-center">
                         <Sparkles className="h-3 w-3 mr-1" /> Fedeltà
                       </span>
                    )}
                    <button 
                      onClick={() => removeFromCart(course.id)}
                      className="text-red-500 hover:text-red-700 text-sm mt-3 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Rimuovi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Riepilogo Ordine */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sticky top-32">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Riepilogo Ordine</h2>
              
              <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotale ({items.length} corsi)</span>
                  <span>€{calculateTotal().toFixed(2)}</span>
                </div>
                {!user && (
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs flex items-start">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0"/>
                        Le credenziali d'accesso verranno inviate alla mail che userai per il pagamento.
                    </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-gray-900">Totale</span>
                <span className="text-3xl font-extrabold text-brand-600">€{calculateTotal().toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <>Elaborazione...</>
                ) : (
                  <>Procedi al Pagamento <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Checkout sicuro via Stripe. Account creato automaticamente.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
