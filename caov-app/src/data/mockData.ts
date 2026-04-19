import type { NewsArticle, Match, Player, TechnicalStaff, Discipline, Sponsor, Product, GalleryImage, PalmaresEntry } from '../types';

// ============================================================
// Mock Disciplines
// ============================================================
export const mockDisciplines: Discipline[] = [
  { id: 'd1', name: 'Fútbol', category: 'General', is_active: true, schedules: 'Lunes, Miércoles y Viernes - 18:00hs a 20:00hs', created_at: '2024-01-01' },
  { id: 'd6', name: 'Vóley', category: 'General', is_active: true, schedules: 'Martes y Jueves - 20:00hs a 22:00hs', created_at: '2024-01-01' },
  { id: 'd7', name: 'Handball', category: 'General', is_active: true, schedules: 'Miércoles y Viernes - 19:30hs a 21:00hs', created_at: '2024-01-01' },
  { id: 'd4', name: 'Básquet', category: 'General', is_active: true, schedules: 'Martes, Jueves y Sábados - 18:30hs a 20:30hs', created_at: '2024-01-01' },
  { id: 'd8', name: 'Patín', category: 'General', is_active: true, schedules: 'Lunes y Miércoles - 17:00hs a 19:00hs', created_at: '2024-01-01' },
  { id: 'd9', name: 'Hockey sobre césped', category: 'General', is_active: true, schedules: 'Martes, Jueves y Sábados - 17:30hs a 19:30hs', created_at: '2024-01-01' },
];

// ============================================================
// Mock News
// ============================================================
export const mockNews: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Gran victoria en el clásico local: Oro Verde 3 - 1 Deportivo Centro',
    slug: 'victoria-clasico-local',
    excerpt: 'El equipo de primera división se impuso con autoridad en un estadio colmado de hinchas que celebraron una tarde histórica.',
    content: '<p>El equipo de primera división se impuso con autoridad...</p>',
    image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    category: 'Fútbol',
    is_published: true,
    published_at: '2026-04-14T20:00:00Z',
    created_at: '2026-04-14T20:00:00Z',
  },
  {
    id: 'n2',
    title: 'El básquet suma otro triunfo y se mete en los playoffs de la liga regional',
    slug: 'basquet-playoffs',
    excerpt: 'Tras una campaña impecable con 12 victorias en 14 encuentros, el equipo asegura su lugar entre los mejores cuatro.',
    content: '<p>El equipo de básquet continúa su gran campaña...</p>',
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    category: 'Básquet',
    is_published: true,
    published_at: '2026-04-12T18:00:00Z',
    created_at: '2026-04-12T18:00:00Z',
  },
  {
    id: 'n3',
    title: 'Apertura de inscripciones para las divisiones inferiores de fútbol 2026',
    slug: 'inscripciones-inferiores-2026',
    excerpt: 'El club abre sus puertas para que todos los niños y jóvenes puedan sumarse a la gran familia verde y blanca.',
    content: '<p>El Club Atlético Oro Verde abre inscripciones...</p>',
    image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    category: 'Institucional',
    is_published: true,
    published_at: '2026-04-10T10:00:00Z',
    created_at: '2026-04-10T10:00:00Z',
  },
  {
    id: 'n4',
    title: 'Cena anual de socios: Una noche para celebrar los 65 años del club',
    slug: 'cena-anual-socios',
    excerpt: 'El próximo sábado 26 de abril se realizará la tradicional cena de confraternidad en el salón principal.',
    content: '<p>Una noche especial para celebrar...</p>',
    image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    category: 'Institucional',
    is_published: true,
    published_at: '2026-04-08T14:00:00Z',
    created_at: '2026-04-08T14:00:00Z',
  },
  {
    id: 'n5',
    title: 'El vóley femenino debuta con triunfo en el torneo provincial',
    slug: 'voley-femenino-debut',
    excerpt: 'Excelente debut de nuestras chicas en la máxima competencia provincial. Ganaron los tres sets y apuntan al podio.',
    content: '<p>El equipo femenino de vóley...</p>',
    image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
    category: 'Vóley',
    is_published: true,
    published_at: '2026-04-06T19:00:00Z',
    created_at: '2026-04-06T19:00:00Z',
  },
  {
    id: 'n6',
    title: 'Nuevo acuerdo de sponsors: Bienvenida Distribuidora El Progreso',
    slug: 'nuevo-sponsor-el-progreso',
    excerpt: 'El club suma un nuevo aliado estratégico que refuerza el crecimiento institucional del C.A.O.V.',
    content: '<p>Con gran orgullo anunciamos...</p>',
    image_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80',
    category: 'Institucional',
    is_published: true,
    published_at: '2026-04-04T11:00:00Z',
    created_at: '2026-04-04T11:00:00Z',
  },
];

// ============================================================
// Mock Matches
// ============================================================
export const mockMatches: Match[] = [
  {
    id: 'm1',
    discipline_id: 'd1',
    discipline: mockDisciplines[0],
    opponent_name: 'Atlético Crespo',
    match_date: '2026-04-20T16:00:00Z',
    location: 'local',
    venue_name: 'Estadio Municipal',
    result: 'Pendiente',
    is_featured: true,
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'm2',
    discipline_id: 'd4',
    discipline: mockDisciplines[3],
    opponent_name: 'Deportivo Seguí',
    match_date: '2026-04-19T20:00:00Z',
    location: 'visitante',
    venue_name: 'Club Deportivo Seguí',
    result: 'Pendiente',
    is_featured: false,
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'm3',
    discipline_id: 'd6',
    discipline: mockDisciplines[5],
    opponent_name: 'Unión Colón',
    match_date: '2026-04-21T19:00:00Z',
    location: 'local',
    venue_name: 'Polideportivo CAOV',
    result: 'Pendiente',
    is_featured: false,
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'm4',
    discipline_id: 'd1',
    discipline: mockDisciplines[0],
    opponent_name: 'Deportivo Centro',
    match_date: '2026-04-14T17:00:00Z',
    location: 'local',
    venue_name: 'Estadio Municipal',
    result: '3-1',
    is_featured: false,
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'm5',
    discipline_id: 'd4',
    discipline: mockDisciplines[3],
    opponent_name: 'Racing Club Paraná',
    match_date: '2026-04-12T20:30:00Z',
    location: 'local',
    venue_name: 'Polideportivo CAOV',
    result: '78-65',
    is_featured: false,
    created_at: '2026-04-01T00:00:00Z',
  },
];

// ============================================================
// Mock Players
// ============================================================
export const mockPlayers: Player[] = [
  { id: 'p1', discipline_id: 'd1', discipline: mockDisciplines[0], full_name: 'Sebastián Romero', position: 'Arquero', shirt_number: 1, photo_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'p2', discipline_id: 'd1', discipline: mockDisciplines[0], full_name: 'Rodrigo Méndez', position: 'Defensor', shirt_number: 4, photo_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'p3', discipline_id: 'd1', discipline: mockDisciplines[0], full_name: 'Lucas Fernández', position: 'Defensor', shirt_number: 5, photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'p4', discipline_id: 'd1', discipline: mockDisciplines[0], full_name: 'Ezequiel Torres', position: 'Mediocampista', shirt_number: 8, photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'p5', discipline_id: 'd1', discipline: mockDisciplines[0], full_name: 'Mateo Álvarez', position: 'Mediocampista', shirt_number: 10, photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'p6', discipline_id: 'd1', discipline: mockDisciplines[0], full_name: 'Franco Giménez', position: 'Delantero', shirt_number: 9, photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'p7', discipline_id: 'd4', discipline: mockDisciplines[3], full_name: 'Nicolás Pérez', position: 'Base', shirt_number: 7, photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'p8', discipline_id: 'd4', discipline: mockDisciplines[3], full_name: 'Agustín Molina', position: 'Ala', shirt_number: 12, photo_url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'p9', discipline_id: 'd6', discipline: mockDisciplines[5], full_name: 'Valentina Cruz', position: 'Armadora', shirt_number: 3, photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'p10', discipline_id: 'd6', discipline: mockDisciplines[5], full_name: 'Camila Ríos', position: 'Central', shirt_number: 6, photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
];

// ============================================================
// Mock Technical Staff
// ============================================================
export const mockStaff: TechnicalStaff[] = [
  { id: 'st1', discipline_id: 'd1', discipline: mockDisciplines[0], full_name: 'Carlos Bianchi', role: 'Director Técnico', photo_url: 'https://images.unsplash.com/photo-1544723795-3ca315cadc88?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'st2', discipline_id: 'd1', discipline: mockDisciplines[0], full_name: 'Miguel Ángel', role: 'Ayudante de Campo', is_archived: false, created_at: '2024-01-01' },
  { id: 'st3', discipline_id: 'd1', discipline: mockDisciplines[0], full_name: 'Julio Santella', role: 'Preparador Físico', is_archived: false, created_at: '2024-01-01' },
  { id: 'st4', discipline_id: 'd4', discipline: mockDisciplines[3], full_name: 'Sergio Hernández', role: 'Entrenador Jefe', photo_url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=500&fit=crop&q=80', is_archived: false, created_at: '2024-01-01' },
  { id: 'st5', discipline_id: 'd6', discipline: mockDisciplines[5], full_name: 'Julio Velasco', role: 'Entrenador Principal', is_archived: false, created_at: '2024-01-01' },
];
// ============================================================
// Mock Sponsors
// ============================================================
export const mockSponsors: Sponsor[] = [
  { id: 's1', name: 'Distribuidora El Progreso', logo_url: 'https://placehold.co/180x80/1a7a3c/ffffff?text=El+Progreso', website_url: '#', tier: 'principal', is_active: true, sort_order: 1, created_at: '2024-01-01' },
  { id: 's2', name: 'Ferretería San Martín', logo_url: 'https://placehold.co/160x80/0f5228/ffffff?text=Ferretería+SM', website_url: '#', tier: 'oficial', is_active: true, sort_order: 2, created_at: '2024-01-01' },
  { id: 's3', name: 'Agro Oro Verde', logo_url: 'https://placehold.co/160x80/2eaa56/ffffff?text=Agro+OV', website_url: '#', tier: 'oficial', is_active: true, sort_order: 3, created_at: '2024-01-01' },
  { id: 's4', name: 'Panadería Don Roberto', logo_url: 'https://placehold.co/140x80/1a7a3c/ffffff?text=Pnad.+Roberto', website_url: '#', tier: 'colaborador', is_active: true, sort_order: 4, created_at: '2024-01-01' },
  { id: 's5', name: 'Electricidad Sur', logo_url: 'https://placehold.co/140x80/0f5228/ffffff?text=Elec.+Sur', website_url: '#', tier: 'colaborador', is_active: true, sort_order: 5, created_at: '2024-01-01' },
  { id: 's6', name: 'Veterinaria Del Campo', logo_url: 'https://placehold.co/140x80/2eaa56/ffffff?text=Vet.+Campo', website_url: '#', tier: 'colaborador', is_active: true, sort_order: 6, created_at: '2024-01-01' },
];

// ============================================================
// Mock Products
// ============================================================
export const mockProducts: Product[] = [
  { id: 'pr1', name: 'Camiseta Titular 2026', description: 'Camiseta oficial del Club. Verde con franjas blancas. Talle S a XXL.', price: 18500, image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&q=80', category: 'camisetas', whatsapp_link: 'https://wa.me/5493000000000?text=Quiero+la+Camiseta+Titular+2026', is_available: true, created_at: '2024-01-01' },
  { id: 'pr2', name: 'Camiseta Alternativa 2026', description: 'Camiseta blanca con detalles verdes. Talle S a XXL.', price: 18500, image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&q=80', category: 'camisetas', whatsapp_link: 'https://wa.me/5493000000000?text=Quiero+la+Camiseta+Alternativa+2026', is_available: true, created_at: '2024-01-01' },
  { id: 'pr3', name: 'Short Oficial', description: 'Short verde oficial del club. Talle único ajustable.', price: 9500, image_url: 'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=500&q=80', category: 'shorts', whatsapp_link: 'https://wa.me/5493000000000?text=Quiero+el+Short+Oficial', is_available: true, created_at: '2024-01-01' },
  { id: 'pr4', name: 'Buzo con Capucha', description: 'Buzo oficial de invierno con capucha y escudo bordado.', price: 22000, image_url: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=500&q=80', category: 'accesorios', whatsapp_link: 'https://wa.me/5493000000000?text=Quiero+el+Buzo', is_available: true, created_at: '2024-01-01' },
  { id: 'pr5', name: 'Gorra C.A.O.V.', description: 'Gorra bordada con el escudo oficial. Regulable.', price: 7500, image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80', category: 'accesorios', whatsapp_link: 'https://wa.me/5493000000000?text=Quiero+la+Gorra', is_available: true, created_at: '2024-01-01' },
  { id: 'pr6', name: 'Botines Personalizados', description: 'Botines con escudo del club grabado. Disponibles en varios talles.', price: 35000, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', category: 'accesorios', whatsapp_link: 'https://wa.me/5493000000000?text=Quiero+los+Botines', is_available: false, created_at: '2024-01-01' },
];

// ============================================================
// Mock Gallery
// ============================================================
export const mockGallery: GalleryImage[] = [
  { id: 'g1', title: 'Clásico local 2026', image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', event_name: 'Liga Regional 2026', created_at: '2026-04-14T00:00:00Z' },
  { id: 'g2', title: 'Entrenamiento de verano', image_url: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80', event_name: 'Pretemporada', created_at: '2026-02-01T00:00:00Z' },
  { id: 'g3', title: 'Final básquet 2025', image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80', event_name: 'Final Regional', created_at: '2025-12-01T00:00:00Z' },
  { id: 'g4', title: 'Cena anual socios', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80', event_name: 'Evento Institucional', created_at: '2025-11-15T00:00:00Z' },
  { id: 'g5', title: 'Vóley femenino en acción', image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80', event_name: 'Torneo Provincial', created_at: '2026-03-10T00:00:00Z' },
  { id: 'g6', title: 'Inauguración cancha sintética', image_url: 'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&q=80', event_name: 'Evento Institucional', created_at: '2025-09-01T00:00:00Z' },
  { id: 'g7', title: 'Festejo ascenso fútbol 2024', image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', event_name: 'Ascenso Liga', created_at: '2024-12-10T00:00:00Z' },
  { id: 'g8', title: 'Cancha en día de partido', image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80', event_name: 'Liga Regional 2026', created_at: '2026-04-07T00:00:00Z' },
];

// ============================================================
// Mock Palmarés
// ============================================================
export const mockPalmares: PalmaresEntry[] = [
  { id: 'pal1', title: 'Campeón Liga Regional', competition: 'Liga Regional de Fútbol', year: 2023, discipline: mockDisciplines[0], created_at: '2024-01-01' },
  { id: 'pal2', title: 'Subcampeón Provincial', competition: 'Torneo Provincial Amateur', year: 2022, discipline: mockDisciplines[0], created_at: '2024-01-01' },
  { id: 'pal3', title: 'Campeón Clausura', competition: 'Torneo Clausura Zona Norte', year: 2021, discipline: mockDisciplines[0], created_at: '2024-01-01' },
  { id: 'pal4', title: 'Campeón Apertura', competition: 'Torneo Apertura Zona Norte', year: 2019, discipline: mockDisciplines[0], created_at: '2024-01-01' },
  { id: 'pal5', title: 'Campeón Liga Regional', competition: 'Liga Regional de Básquet', year: 2024, discipline: mockDisciplines[3], created_at: '2024-01-01' },
  { id: 'pal6', title: 'Campeón Torneo Provincial', competition: 'Torneo Provincial de Vóley', year: 2023, discipline: mockDisciplines[5], created_at: '2024-01-01' },
  { id: 'pal7', title: 'Copa Integración', competition: 'Copa Integración Entrerriana', year: 2018, discipline: mockDisciplines[0], created_at: '2024-01-01' },
];
