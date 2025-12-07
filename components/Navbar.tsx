
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { LogOut, LayoutDashboard, User, Settings, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  logoSize: number;
  logoAlignment: 'left' | 'center';
  logoMarginLeft?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, logoSize, logoAlignment, logoMarginLeft = 0 }) => {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    onNavigate(path);
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    onLogout();
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isCenter = logoAlignment === 'center';

  const NavLinks = () => (
    <div className="flex items-center gap-6">
       <button 
          onClick={() => handleNavigate('/')} 
          className="text-gray-600 hover:text-brand-600 font-medium transition-colors text-sm uppercase tracking-wide"
        >
          Home
      </button>
      <button 
          onClick={() => handleNavigate('/courses')} 
          className="text-gray-600 hover:text-brand-600 font-medium transition-colors text-sm uppercase tracking-wide"
        >
          Corsi
      </button>
    </div>
  );

  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* --- LEFT SECTION --- */}
          <div className={`flex items-center ${isCenter ? 'flex-1 justify-start' : 'gap-8'}`}>
            
            {/* Logo (If Left) */}
            {!isCenter && (
                 <div 
                    className="cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
                    style={{ marginLeft: `${logoMarginLeft}px` }}
                    onClick={() => handleNavigate('/')}
                >
                    <img 
                    src="https://res.cloudinary.com/dhj0ztos6/image/upload/v1764867375/mwa_trasparente_thl6fk.png" 
                    alt="MWA Logo" 
                    style={{ height: `${logoSize}px` }} 
                    className="w-auto object-contain"
                    />
                </div>
            )}

            {/* Nav Links (Desktop) */}
            <div className="hidden md:block">
                <NavLinks />
            </div>
          </div>

          {/* --- CENTER SECTION (Logo Only) --- */}
          {isCenter && (
            <div 
                className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer transition-opacity hover:opacity-80 z-20"
                onClick={() => handleNavigate('/')}
            >
                <img 
                src="https://res.cloudinary.com/dhj0ztos6/image/upload/v1764867375/mwa_trasparente_thl6fk.png" 
                alt="MWA Logo" 
                style={{ height: `${logoSize}px` }} 
                className="w-auto object-contain"
                />
            </div>
          )}

          {/* --- RIGHT SECTION (Actions) --- */}
          <div className={`flex items-center justify-end gap-6 ${isCenter ? 'flex-1' : ''}`}>
             
             {/* Cart (Desktop) */}
             <button 
                onClick={() => handleNavigate('/cart')}
                className="relative hidden md:flex items-center justify-center p-2 text-gray-600 hover:text-brand-600 transition-colors group"
                title="Carrello"
            >
                <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 text-xs font-bold leading-none text-white bg-red-600 rounded-full border-2 border-white">
                    {totalItems}
                    </span>
                )}
            </button>

            {/* User Menu (Desktop) */}
            <div className="hidden md:block relative" ref={userMenuRef}>
                {user ? (
                    <div>
                        <button 
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-3 focus:outline-none group"
                        >
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{user.full_name || 'Studente'}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 border border-brand-200 shadow-sm group-hover:ring-2 group-hover:ring-brand-200 transition-all">
                                <User className="h-5 w-5" />
                            </div>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black ring-opacity-5">
                                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase">Account</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                </div>

                                {user.is_admin && (
                                    <>
                                        <button onClick={() => handleNavigate('/admin')} className="w-full text-left px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 flex items-center font-semibold transition-colors">
                                            <Settings className="h-4 w-4 mr-2" /> Admin Dashboard
                                        </button>
                                        <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                    </>
                                )}
                                <button onClick={() => handleNavigate('/dashboard')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 flex items-center transition-colors">
                                    <LayoutDashboard className="h-4 w-4 mr-2" /> I Miei Corsi
                                </button>
                                <button onClick={() => handleNavigate('/cart')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 flex items-center transition-colors">
                                    <ShoppingCart className="h-4 w-4 mr-2" /> Carrello ({totalItems})
                                </button>
                                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors">
                                    <LogOut className="h-4 w-4 mr-2" /> Esci
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => handleNavigate('/login')}
                            className="text-gray-600 hover:text-brand-600 font-medium text-sm transition-colors"
                        >
                            Accedi
                        </button>
                        <button 
                            onClick={() => handleNavigate('/register')}
                            className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transform hover:-translate-y-0.5"
                        >
                            Inizia Ora
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Toggle */}
             <div className="flex md:hidden items-center gap-4">
                <button 
                  onClick={() => handleNavigate('/cart')}
                  className="relative p-2 text-gray-600"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </button>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-gray-700 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto z-40 animate-in slide-in-from-top-2">
            <div className="px-4 py-6 space-y-4">
                <button onClick={() => handleNavigate('/')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium border border-transparent hover:border-gray-200 transition-all">Home</button>
                <button onClick={() => handleNavigate('/courses')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium border border-transparent hover:border-gray-200 transition-all">Corsi</button>
                
                <div className="border-t border-gray-100 my-2"></div>
                
                {user ? (
                    <>
                        <div className="px-4 py-2 bg-gray-50 rounded-lg mx-2 mb-2">
                            <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                         {user.is_admin && (
                            <button onClick={() => handleNavigate('/admin')} className="w-full text-left px-4 py-3 rounded-lg bg-purple-50 text-purple-700 font-medium flex items-center">
                                <Settings className="h-4 w-4 mr-2" /> Pannello Admin
                            </button>
                        )}
                        <button onClick={() => handleNavigate('/dashboard')} className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 font-medium flex items-center">
                            <LayoutDashboard className="h-4 w-4 mr-2" /> I Miei Corsi
                        </button>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 font-medium flex items-center">
                            <LogOut className="h-4 w-4 mr-2" /> Esci
                        </button>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-4 px-4 pt-2">
                        <button onClick={() => handleNavigate('/login')} className="w-full py-3 rounded-lg font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">Accedi</button>
                        <button onClick={() => handleNavigate('/register')} className="w-full py-3 rounded-lg font-bold text-white bg-brand-600 shadow-md">Registrati</button>
                    </div>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};
