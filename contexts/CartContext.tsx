
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course } from '../types';
import { trackAddToCart } from '../services/metaPixel';

interface CartContextType {
  items: Course[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Course[]>([]);

  // Carica dal localStorage all'avvio
  useEffect(() => {
    const savedCart = localStorage.getItem('mwa_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Errore parsing carrello", e);
      }
    }
  }, []);

  // Salva nel localStorage ad ogni modifica
  useEffect(() => {
    localStorage.setItem('mwa_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (course: Course) => {
    setItems((prev) => {
      if (prev.find(c => c.id === course.id)) return prev;
      
      // Track Pixel Event
      trackAddToCart([course.id], course.price);
      
      return [...prev, course];
    });
  };

  const removeFromCart = (courseId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== courseId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (courseId: string) => {
    return items.some(item => item.id === courseId);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, totalItems: items.length }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
