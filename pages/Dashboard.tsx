
import React, { useState } from 'react';
import { Course, UserProfile } from '../types';
import { PlayCircle, Book, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: UserProfile;
  courses: Course[];
  onRefresh: () => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, courses, onRefresh }) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter courses the user has purchased
  const myCourses = courses.filter(c => user.purchased_courses.includes(c.id));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500); // Visual delay
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Bentornato, {user.full_name || 'Studente'}!</h1>
                <p className="text-gray-500 mt-1">Ecco i tuoi progressi di apprendimento.</p>
            </div>
            
            <button 
              onClick={handleRefresh}
              className="flex items-center text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg transition-colors"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Aggiornamento...' : 'Verifica nuovi acquisti'}
            </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 text-sm font-medium mb-1">Corsi Attivi</div>
                <div className="text-3xl font-bold text-gray-900">{myCourses.length}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 text-sm font-medium mb-1">Ore Completate</div>
                <div className="text-3xl font-bold text-gray-900">12.5</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 text-sm font-medium mb-1">Certificati</div>
                <div className="text-3xl font-bold text-gray-900">0</div>
            </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6">I Tuoi Corsi</h2>

        {myCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Book className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Non hai ancora acquistato corsi</h3>
                <p className="text-gray-500 mb-6">Esplora il catalogo per iniziare la tua carriera.</p>
                <div className="flex flex-col gap-2 items-center">
                    <button 
                        onClick={() => navigate('/')} 
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                    >
                        Vai al Catalogo
                    </button>
                    <p className="text-xs text-gray-400 mt-4">
                        Hai appena acquistato? Clicca su "Verifica nuovi acquisti" in alto a destra.
                    </p>
                </div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {myCourses.map(course => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/course/${course.id}`)}>
                        <div className="relative h-40 overflow-hidden">
                             <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                             <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <PlayCircle className="h-12 w-12 text-white" />
                             </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                <div className="bg-green-500 h-2 rounded-full" style={{width: '0%'}}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mb-6">
                                <span>Inizia ora</span>
                                <span>{course.lessons} Lezioni</span>
                            </div>
                            <button className="mt-auto w-full bg-brand-50 text-brand-700 py-2 rounded-lg font-medium hover:bg-brand-100 transition-colors">
                                Accedi al Corso
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};
