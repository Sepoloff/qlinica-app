export const SERVICES = [
  { id: 1, name: 'Fisioterapia', icon: '🦴', desc: 'Reabilitação e tratamento de lesões', duration: '50 min', price: '45€' },
  { id: 2, name: 'Osteopatia', icon: '🤲', desc: 'Terapia manual holística', duration: '60 min', price: '55€' },
  { id: 3, name: 'Pilates Clínico', icon: '🧘', desc: 'Exercícios terapêuticos guiados', duration: '50 min', price: '35€' },
  { id: 4, name: 'Massagem Terapêutica', icon: '💆', desc: 'Alívio de tensão muscular', duration: '45 min', price: '40€' },
  { id: 5, name: 'Terapia da Fala', icon: '🗣️', desc: 'Reabilitação da comunicação', duration: '45 min', price: '40€' },
  { id: 6, name: 'Nutrição', icon: '🥗', desc: 'Planos alimentares personalizados', duration: '40 min', price: '50€' },
];

export const THERAPISTS = [
  { id: 1, name: 'Dra. Ana Silva', specialty: 'Fisioterapia Desportiva', rating: 4.9, reviews: 127, available: true, avatar: 'AS' },
  { id: 2, name: 'Dr. Pedro Santos', specialty: 'Osteopatia', rating: 4.8, reviews: 98, available: true, avatar: 'PS' },
  { id: 3, name: 'Dra. Marta Oliveira', specialty: 'Pilates Clínico', rating: 4.7, reviews: 85, available: false, avatar: 'MO' },
  { id: 4, name: 'Dr. João Costa', specialty: 'Fisioterapia Geral', rating: 4.9, reviews: 142, available: true, avatar: 'JC' },
];

export const BOOKINGS = [
  { id: 1, service: 'Fisioterapia', therapist: 'Dra. Ana Silva', date: '20 Mar 2026', time: '10:00', location: 'Sala 2', status: 'upcoming' },
  { id: 2, service: 'Pilates Clínico', therapist: 'Dra. Marta Oliveira', date: '25 Mar 2026', time: '14:30', location: 'Sala 4', status: 'upcoming' },
  { id: 3, service: 'Osteopatia', therapist: 'Dr. Pedro Santos', date: '10 Mar 2026', time: '09:00', location: 'Sala 1', status: 'past' },
  { id: 4, service: 'Massagem Terapêutica', therapist: 'Dr. João Costa', date: '2 Mar 2026', time: '16:00', location: 'Sala 3', status: 'cancelled' },
];
