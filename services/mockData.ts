import { Course } from '../types';

export const COURSES: Course[] = [
  {
    id: 'course_1',
    title: 'Master Frontend Development',
    description: 'Diventa un esperto di React, TypeScript e Modern UI/UX. Il corso definitivo per lanciare la tua carriera.',
    price: 97.00,
    image: 'https://picsum.photos/800/600?random=1',
    features: ['150+ Lezioni', 'Progetti Reali', 'Certificato Incluso', 'Mentoring 1:1'],
    lessons: 152,
    duration: '45 Ore',
    level: 'Avanzato'
  },
  {
    id: 'course_2',
    title: 'Digital Marketing Pro',
    description: 'Impara a vendere qualsiasi cosa online. Facebook Ads, Google Ads e strategie di Funnel.',
    price: 49.00,
    image: 'https://picsum.photos/800/600?random=2',
    features: ['Strategie 2024', 'Case Studies', 'Template Copywriting', 'Accesso Community'],
    lessons: 84,
    duration: '22 Ore',
    level: 'Intermedio'
  },
  {
    id: 'course_3',
    title: 'AI & Machine Learning Start',
    description: 'Introduzione pratica all\'Intelligenza Artificiale. Python, TensorFlow e basi di Neural Networks.',
    price: 129.00,
    image: 'https://picsum.photos/800/600?random=3',
    features: ['Python da Zero', 'Esercizi Pratici', 'Progetti AI', 'Supporto H24'],
    lessons: 60,
    duration: '30 Ore',
    level: 'Principiante'
  }
];