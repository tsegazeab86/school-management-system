// Demonstration records only. Seeded once, only when localStorage key is empty.
const mk = (code, name, category, grades, periods, credit, icon, color, description) => ({
  id: `sub_${code.toLowerCase()}`,
  code, name, category, description, icon, color,
  status: 'Active',
  curriculumType: 'National',
  creditHours: credit,
  weeklyPeriods: periods,
  annualPeriods: periods * 34,
  assessmentType: 'Continuous + Final',
  passingMark: 50,
  maxMark: 100,
  grades,
  objectives: [],
  topics: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  history: [{ at: '2026-01-01T00:00:00.000Z', action: 'Sample record created' }],
});

const all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const sampleSubjects = [
  mk('ENG', 'English', 'Core', all, 5, 4, 'Languages', '#2563EB', 'English language and literature.'),
  mk('MAT', 'Mathematics', 'Core', all, 6, 5, 'Calculator', '#6366F1', 'Numeracy, algebra, geometry and calculus.'),
  mk('AMH', 'Amharic', 'Core', all, 5, 4, 'BookOpen', '#0D9488', 'Amharic language and literature.'),
  mk('PHY', 'Physics', 'Core', [9, 10, 11, 12], 4, 3, 'Atom', '#2563EB', 'Mechanics, electricity and waves.'),
  mk('CHE', 'Chemistry', 'Core', [9, 10, 11, 12], 4, 3, 'FlaskConical', '#0D9488', 'Matter, reactions and organic chemistry.'),
  mk('BIO', 'Biology', 'Core', [9, 10, 11, 12], 4, 3, 'Dna', '#16A34A', 'Living organisms and ecology.'),
  mk('ICT', 'Information Technology', 'Core', [7, 8, 9, 10, 11, 12], 3, 2, 'Monitor', '#6366F1', 'Computing fundamentals and digital literacy.'),
  mk('HIS', 'History', 'Core', [7, 8, 9, 10, 11, 12], 3, 2, 'Landmark', '#B45309', 'Ethiopian and world history.'),
  mk('GEO', 'Geography', 'Core', [7, 8, 9, 10, 11, 12], 3, 2, 'Globe', '#0891B2', 'Physical and human geography.'),
  mk('CIV', 'Civics', 'Core', [5, 6, 7, 8, 9, 10, 11, 12], 2, 2, 'Scale', '#7C3AED', 'Civic and ethical education.'),
  mk('AGR', 'Agriculture', 'Elective', [9, 10], 2, 1, 'Sprout', '#16A34A', 'Crop and animal production basics.'),
  mk('ART', 'Art', 'Elective', [1, 2, 3, 4, 5, 6, 7, 8], 2, 1, 'Palette', '#DB2777', 'Visual arts and design.'),
  mk('PE', 'Physical Education', 'Core', all, 2, 1, 'Dumbbell', '#EA580C', 'Fitness, sport and health.'),
];