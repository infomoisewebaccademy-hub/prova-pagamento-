
import React, { useState, useEffect } from 'react';
import { Course, Lesson } from '../types';
import { Save, ArrowLeft, Trash, Plus, Image as ImageIcon, Layout, DollarSign, Video, PlayCircle, GripVertical, X, Book, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface AdminEditCourseProps {
  courses: Course[];
  onSave: (course: Course) => void;
}

export const AdminEditCourse: React.FC<AdminEditCourseProps> = ({ courses, onSave }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    description: '',
    price: 0,
    discounted_price: 0,
    image: '',
    level: 'Principiante',
    features: [''],
    lessons: 0,
    duration: '',
    lessons_content: []
  });

  // Stato per gestire errore caricamento immagine
  const [imgError, setImgError] = useState(false);
  
  // Stato per la nuova lezione che si sta aggiungendo
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({ title: '', description: '', videoUrl: '' });
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      const courseToEdit = courses.find(c => c.id === id);
      if (courseToEdit) {
        setFormData({
            ...courseToEdit,
            lessons_content: courseToEdit.lessons_content || [],
            discounted_price: courseToEdit.discounted_price || 0
        });
      }
    } else {
        setFormData({
            title: '',
            description: '',
            price: 0,
            discounted_price: 0,
            image: 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 100),
            level: 'Principiante',
            features: [''],
            lessons: 0,
            duration: '',
            lessons_content: []
        });
    }
  }, [id, courses, isNew]);

  useEffect(() => {
    setImgError(false);
  }, [formData.image]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.price === undefined) return;
    
    // Validazione base
    if (formData.discounted_price && formData.discounted_price >= formData.price) {
        alert("Attenzione: Il prezzo fedeltà deve essere inferiore al prezzo standard.");
        return;
    }

    // Aggiorna il contatore lezioni automatico
    const finalLessonsCount = formData.lessons_content?.length || formData.lessons || 0;

    const courseToSave = {
      ...formData,
      id: isNew ? `course_${Date.now()}` : id,
      features: formData.features?.filter(f => f.trim() !== '') || [],
      lessons: finalLessonsCount, // Sincronizza il numero lezioni
      discounted_price: formData.discounted_price || null // Se 0 salva come null
    } as Course;
    
    onSave(courseToSave);
    navigate('/admin');
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...(formData.features || []), ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  // --- LESSON MANAGEMENT ---

  const addLesson = () => {
    if (!newLesson.title) return;
    const lesson: Lesson = {
        id: `lesson_${Date.now()}`,
        title: newLesson.title || 'Nuova Lezione',
        description: newLesson.description || '',
        videoUrl: newLesson.videoUrl || '',
        duration: '10:00' // Default placeholder
    };
    
    setFormData({
        ...formData,
        lessons_content: [...(formData.lessons_content || []), lesson]
    });
    setNewLesson({ title: '', description: '', videoUrl: '' });
    setIsAddingLesson(false);
  };

  const removeLesson = (index: number) => {
    const updated = [...(formData.lessons_content || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, lessons_content: updated });
  };

  const updateLesson = (index: number, field: keyof Lesson, value: string) => {
    const updated = [...(formData.lessons_content || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, lessons_content: updated });
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 pb-20">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 sticky top-20 z-30 bg-gray-50/95 backdrop-blur py-4 border-b border-gray-200">
            <div className="flex items-center">
                <button 
                    type="button" 
                    onClick={() => navigate('/admin')}
                    className="mr-4 p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isNew ? 'Crea Nuovo Corso' : 'Modifica Corso'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isNew ? 'Compila i campi per creare un nuovo prodotto.' : `Modifica dettagli per: ${formData.title}`}
                    </p>
                </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
                <button 
                    type="button" 
                    onClick={() => navigate('/admin')}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                >
                    Annulla
                </button>
                <button 
                    type="submit" 
                    className="flex-1 sm:flex-none px-6 py-3 bg-brand-600 text-white rounded-lg font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-colors flex items-center justify-center"
                >
                    <Save className="h-5 w-5 mr-2" />
                    {isNew ? 'Pubblica Corso' : 'Salva Modifiche'}
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* General Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Layout className="h-5 w-5 mr-2 text-brand-600" /> Informazioni Generali
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo del Corso</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-lg"
                                placeholder="Es. Master in React..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione Completa</label>
                            <textarea 
                                rows={8}
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                placeholder="Descrivi cosa impareranno gli studenti... Puoi usare 'invio' per andare a capo."
                            />
                        </div>
                    </div>
                </div>

                {/* LESSONS MANAGEMENT */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <Video className="h-5 w-5 mr-2 text-brand-600" /> Piano di Studi ({formData.lessons_content?.length || 0})
                        </h2>
                        {!isAddingLesson && (
                            <button 
                                type="button" 
                                onClick={() => setIsAddingLesson(true)}
                                className="text-sm bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg font-bold hover:bg-brand-100 transition-colors flex items-center"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Aggiungi Lezione
                            </button>
                        )}
                    </div>

                    {/* New Lesson Form */}
                    {isAddingLesson && (
                        <div className="bg-brand-50/50 border border-brand-100 rounded-lg p-4 mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-sm text-brand-800">Nuova Lezione</h4>
                                <button type="button" onClick={() => setIsAddingLesson(false)}><X className="h-4 w-4 text-gray-400 hover:text-gray-600"/></button>
                            </div>
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="Titolo Lezione (es. Introduzione)" 
                                    className="w-full border border-gray-300 rounded p-2 text-sm"
                                    value={newLesson.title}
                                    onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                                />
                                <input 
                                    type="text" 
                                    placeholder="URL Video (es. https://vimeo.com/...)" 
                                    className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
                                    value={newLesson.videoUrl}
                                    onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})}
                                />
                                <textarea 
                                    placeholder="Breve descrizione (opzionale)" 
                                    className="w-full border border-gray-300 rounded p-2 text-sm"
                                    rows={2}
                                    value={newLesson.description}
                                    onChange={e => setNewLesson({...newLesson, description: e.target.value})}
                                />
                                <button 
                                    type="button" 
                                    onClick={addLesson}
                                    disabled={!newLesson.title}
                                    className="w-full bg-brand-600 text-white py-2 rounded font-bold text-sm hover:bg-brand-700 disabled:opacity-50"
                                >
                                    Conferma Aggiunta
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Lessons List */}
                    <div className="space-y-3">
                        {(!formData.lessons_content || formData.lessons_content.length === 0) && !isAddingLesson && (
                            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg">
                                Nessuna lezione inserita.
                            </div>
                        )}
                        
                        {formData.lessons_content?.map((lesson, idx) => (
                            <div key={idx} className="border border-gray-100 rounded-lg p-4 bg-gray-50/30 group hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 text-gray-300 cursor-move">
                                        <GripVertical className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">
                                                {idx + 1}
                                            </span>
                                            <input 
                                                type="text" 
                                                value={lesson.title}
                                                onChange={e => updateLesson(idx, 'title', e.target.value)}
                                                className="font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-brand-500 focus:ring-0 outline-none w-full"
                                            />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={lesson.videoUrl}
                                            onChange={e => updateLesson(idx, 'videoUrl', e.target.value)}
                                            placeholder="Incolla qui l'URL del video..."
                                            className="text-xs text-gray-500 w-full bg-transparent border border-transparent hover:border-gray-200 rounded p-1 outline-none focus:bg-white focus:border-brand-200 font-mono"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeLesson(idx)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Sidebar Settings Column */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Price & Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-40">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-brand-600" /> Prezzi & Offerte
                    </h2>
                    
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prezzo Standard (€)</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                                className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none font-bold text-lg"
                            />
                         </div>

                         <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                             <label className="block text-sm font-bold text-purple-800 mb-1 flex items-center">
                                 <Sparkles className="h-3 w-3 mr-1" /> Prezzo Fedeltà (Clienti)
                             </label>
                             <p className="text-xs text-purple-600 mb-2 leading-tight">
                                Prezzo speciale per chi ha già acquistato altri corsi. Lascia 0 per disattivare.
                             </p>
                             <input 
                                type="number" 
                                min="0"
                                step="0.01"
                                value={formData.discounted_price || 0}
                                onChange={e => setFormData({...formData, discounted_price: Number(e.target.value)})}
                                className="block w-full border border-purple-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-purple-700"
                            />
                         </div>

                         <hr className="border-gray-100" />

                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Livello</label>
                            <select 
                              value={formData.level}
                              onChange={e => setFormData({...formData, level: e.target.value as any})}
                              className="block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                            >
                              <option>Principiante</option>
                              <option>Intermedio</option>
                              <option>Avanzato</option>
                            </select>
                         </div>

                         <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Durata</label>
                                <input 
                                  type="text"
                                  value={formData.duration}
                                  onChange={e => setFormData({...formData, duration: e.target.value})}
                                  className="block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lezioni (Auto)</label>
                                <input 
                                  type="number"
                                  disabled
                                  value={formData.lessons_content?.length || 0}
                                  className="block w-full bg-gray-50 border border-gray-200 text-gray-500 rounded-lg p-2 text-sm outline-none"
                                />
                             </div>
                         </div>
                    </div>
                </div>

                {/* Features (Bullets) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Book className="h-5 w-5 mr-2 text-brand-600" /> Caratteristiche (Home)
                    </h2>
                    <div className="space-y-3">
                        {formData.features?.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    value={feat}
                                    onChange={e => updateFeature(idx, e.target.value)}
                                    className="flex-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                                    placeholder="Punto chiave..."
                                />
                                <button type="button" onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600">
                                    <Trash className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={addFeature} 
                            className="text-xs text-brand-600 font-bold flex items-center hover:text-brand-800"
                        >
                            <Plus className="h-3 w-3 mr-1" /> Aggiungi
                        </button>
                    </div>
                </div>

                {/* Image Upload/Link */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <ImageIcon className="h-5 w-5 mr-2 text-brand-600" /> Copertina
                    </h2>
                    <input 
                        type="text"
                        value={formData.image}
                        onChange={e => setFormData({...formData, image: e.target.value})}
                        className="block w-full border rounded-lg p-2 text-xs mb-3"
                        placeholder="URL Immagine..."
                    />
                    <div className={`relative w-full h-32 bg-gray-50 rounded-lg overflow-hidden border flex items-center justify-center ${imgError ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                        {formData.image && !imgError ? (
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                        ) : (
                            <ImageIcon className="h-8 w-8 text-gray-300" />
                        )}
                    </div>
                </div>

            </div>
        </div>
      </form>
    </div>
  );
};
