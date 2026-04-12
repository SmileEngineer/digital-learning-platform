export type SiteNavigationUniversity = {
  id: string;
  name: string;
  semesters?: boolean;
};

export type SiteNavigationState = {
  id: string;
  name: string;
  universities: SiteNavigationUniversity[];
};

export type SiteNavigationConfig = {
  courses: SiteNavigationState[];
  ebooks: SiteNavigationState[];
};

export type SiteModuleCategoryConfig = {
  course: string[];
  ebook: string[];
  physicalBook: string[];
  liveClass: string[];
  practiceExam: string[];
};

export type HomeBannerContent = {
  eyebrow: string;
  title: string;
  description: string;
};

export const DEFAULT_HOME_BANNER: HomeBannerContent = {
  eyebrow: 'Kantri by Awareness, Honest by Conscience.',
  title: 'An anonymous voice on a mission to simplify the law for the common people.',
  description: 'A sincere desire to build responsible citizens with strong values is my credential.',
};

const DEFAULT_COURSE_NAVIGATION: SiteNavigationState[] = [
  {
    id: 'telangana',
    name: 'Telangana',
    universities: [
      { id: 'kakatiya-university', name: 'Kakatiya University', semesters: true },
      { id: 'osmania-university', name: 'Osmania University', semesters: true },
      { id: 'palamuru-university', name: 'Palamuru University', semesters: false },
      { id: 'satavahana-university', name: 'Satavahana University', semesters: false },
      { id: 'telangana-university', name: 'Telangana University', semesters: false },
      { id: 'mahatma-gandhi-university', name: 'Mahatma Gandhi University', semesters: false },
    ],
  },
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    universities: [
      { id: 'andhra-university', name: 'Andhra University', semesters: false },
      { id: 'acharya-nagarjuna-university', name: 'Acharya Nagarjuna University', semesters: false },
      { id: 'adikavi-nannaya-university', name: 'Adikavi Nannaya University', semesters: false },
      { id: 'andhra-kesari-university', name: 'Andhra Kesari University', semesters: false },
      {
        id: 'damodaram-sanjivayya-national-law-university',
        name: 'Damodaram Sanjivayya National Law University',
        semesters: false,
      },
      { id: 'kl-university', name: 'KL University', semesters: false },
      { id: 'krishna-university', name: 'Krishna University', semesters: false },
      { id: 'rayalaseema-university', name: 'Rayalaseema University', semesters: false },
      { id: 'sri-krishnadevaraya-university', name: 'Sri Krishnadevaraya University', semesters: false },
      {
        id: 'sri-padmavati-mahila-visva-vidyalayam',
        name: 'Sri Padmavati Mahila Visva Vidyalayam',
        semesters: false,
      },
      { id: 'sri-venkateswara-university', name: 'Sri Venkateswara University', semesters: false },
      { id: 'vikrama-simhapuri-university', name: 'Vikrama Simhapuri University', semesters: false },
      { id: 'yogi-vemana-university', name: 'Yogi Vemana University', semesters: false },
    ],
  },
  {
    id: 'lawcet',
    name: 'LAWCET',
    universities: [
      { id: 'ap-lawcet', name: 'AP LAWCET', semesters: false },
      { id: 'ts-lawcet', name: 'TS LAWCET', semesters: false },
    ],
  },
  {
    id: 'clat',
    name: 'CLAT',
    universities: [{ id: 'clat', name: 'CLAT', semesters: false }],
  },
  {
    id: 'aibe',
    name: 'AIBE',
    universities: [{ id: 'aibe', name: 'AIBE', semesters: false }],
  },
  {
    id: 'bare-acts',
    name: 'Bare Acts',
    universities: [{ id: 'bare-acts', name: 'Bare Acts', semesters: false }],
  },
];

export const DEFAULT_SITE_NAVIGATION: SiteNavigationConfig = {
  courses: DEFAULT_COURSE_NAVIGATION,
  ebooks: DEFAULT_COURSE_NAVIGATION,
};

export const DEFAULT_MODULE_CATEGORIES: SiteModuleCategoryConfig = {
  course: ['LLB 3 YDC', 'LAWCET', 'CLAT', 'AIBE', 'Bare Acts'],
  ebook: ['eBooks', 'Exam Prep', 'Bare Acts'],
  physicalBook: ['Bookstore', 'Exam Prep', 'Bare Acts'],
  liveClass: ['Live Classes', 'Revision Sessions'],
  practiceExam: ['Practice Exams', 'Mock Tests'],
};

function isNavigationUniversity(value: unknown): value is SiteNavigationUniversity {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { name?: unknown }).name === 'string' &&
    ((value as { semesters?: unknown }).semesters === undefined ||
      typeof (value as { semesters?: unknown }).semesters === 'boolean')
  );
}

function isNavigationState(value: unknown): value is SiteNavigationState {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { name?: unknown }).name === 'string' &&
    Array.isArray((value as { universities?: unknown }).universities) &&
    (value as { universities: unknown[] }).universities.every(isNavigationUniversity)
  );
}

export function parseNavigationConfig(value: unknown): SiteNavigationConfig {
  if (!value || typeof value !== 'object') return DEFAULT_SITE_NAVIGATION;
  const courses = (value as { courses?: unknown }).courses;
  const ebooks = (value as { ebooks?: unknown }).ebooks;
  return {
    courses: Array.isArray(courses) && courses.every(isNavigationState) ? courses : DEFAULT_SITE_NAVIGATION.courses,
    ebooks: Array.isArray(ebooks) && ebooks.every(isNavigationState) ? ebooks : DEFAULT_SITE_NAVIGATION.ebooks,
  };
}

function parseStringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const next = value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
  return next.length > 0 ? next : fallback;
}

export function parseModuleCategories(value: unknown): SiteModuleCategoryConfig {
  if (!value || typeof value !== 'object') return DEFAULT_MODULE_CATEGORIES;
  return {
    course: parseStringList((value as { course?: unknown }).course, DEFAULT_MODULE_CATEGORIES.course),
    ebook: parseStringList((value as { ebook?: unknown }).ebook, DEFAULT_MODULE_CATEGORIES.ebook),
    physicalBook: parseStringList(
      (value as { physicalBook?: unknown }).physicalBook,
      DEFAULT_MODULE_CATEGORIES.physicalBook
    ),
    liveClass: parseStringList(
      (value as { liveClass?: unknown }).liveClass,
      DEFAULT_MODULE_CATEGORIES.liveClass
    ),
    practiceExam: parseStringList(
      (value as { practiceExam?: unknown }).practiceExam,
      DEFAULT_MODULE_CATEGORIES.practiceExam
    ),
  };
}

export function parseHomeBanner(value: {
  eyebrow?: unknown;
  title?: unknown;
  description?: unknown;
} | null | undefined): HomeBannerContent {
  return {
    eyebrow:
      typeof value?.eyebrow === 'string' && value.eyebrow.trim()
        ? value.eyebrow.trim()
        : DEFAULT_HOME_BANNER.eyebrow,
    title:
      typeof value?.title === 'string' && value.title.trim()
        ? value.title.trim()
        : DEFAULT_HOME_BANNER.title,
    description:
      typeof value?.description === 'string' && value.description.trim()
        ? value.description.trim()
        : DEFAULT_HOME_BANNER.description,
  };
}
