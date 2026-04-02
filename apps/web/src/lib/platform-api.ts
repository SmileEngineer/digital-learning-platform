export type CatalogItemType =
  | 'course'
  | 'ebook'
  | 'physical_book'
  | 'live_class'
  | 'practice_exam'
  | 'article';

export type CatalogItem = {
  id: string;
  productId: string;
  slug: string;
  type: CatalogItemType;
  category?: string;
  title: string;
  description: string;
  image: string;
  coverImage: string;
  price: number;
  duration: string;
  students: number;
  rating?: number;
  tags: string[];
  instructor: string;
  pages?: number;
  format?: string;
  downloadAllowed?: boolean;
  previewAvailable?: boolean;
  previewCount?: number;
  scheduledAt?: string;
  date?: string;
  time?: string;
  spotsLeft?: number;
  questions?: number;
  timeLimit?: string;
  attempts?: number;
  passingScore?: number;
  author?: string;
  stock?: number;
  validityLabel?: string;
  curriculum: Array<{ title?: string; lectures?: number; duration?: string }>;
};

export type HomeHighlights = {
  featuredCourses: CatalogItem[];
  featuredEbooks: CatalogItem[];
  upcomingLiveClasses: CatalogItem[];
  featuredExams: CatalogItem[];
  featuredBooks: CatalogItem[];
  featuredArticles: CatalogItem[];
  stats: {
    courses: number;
    students: number;
    ebooks: number;
    successRate: number;
  };
  scroller: {
    enabled: boolean;
    message: string;
  };
};

export type CheckoutQuote = {
  item: CatalogItem;
  pricing: {
    quantity: number;
    subtotal: number;
    discount: number;
    total: number;
    currency: string;
  };
  coupon: { code: string; applied: boolean } | null;
  shipping: { required: boolean; deliveryAvailable?: boolean };
};

export type DashboardOverview = {
  user: { id: string; name: string; email: string; role: string };
  counts: { courses: number; ebooks: number; live_classes: number; exams: number };
  recentAccess: Array<{
    slug: string;
    title: string;
    type: string;
    image: string;
    progress: number;
    duration: string;
    expires: string;
  }>;
  upcomingLiveClasses: Array<{
    slug: string;
    title: string;
    date: string;
    time: string;
    countdown: string;
  }>;
  pendingOrders: Array<{
    title: string;
    status: string;
    consignmentNumber: string | null;
    orderedAt: string;
  }>;
};

export type LearnerLibraryItem = {
  slug: string;
  title: string;
  type: CatalogItemType;
  image: string;
  price: number;
  format?: string;
  pages?: number;
  previewAvailable: boolean;
  downloadAllowed: boolean;
  questions?: number;
  attemptsAllowed?: number;
  remainingAttempts?: number;
  passingScore?: number;
  duration: string;
  progress: number;
  accessExpiresAt: string | null;
  accessLabel: string;
  scheduledAt: string | null;
  date: string;
  time: string;
  meetingUrl?: string;
  metadata: Record<string, unknown>;
};

export type LearnerOrder = {
  itemTitle: string;
  itemSlug: string;
  itemType: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  consignmentNumber: string | null;
  createdAt: string;
};

async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    return data.error ?? res.statusText ?? 'Request failed';
  } catch {
    return res.statusText || 'Request failed';
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as T;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as T;
}

export async function fetchHomeHighlights(): Promise<HomeHighlights> {
  return getJson<HomeHighlights>('/api/platform/catalog/highlights');
}

export async function fetchCatalogItems(type: CatalogItemType): Promise<CatalogItem[]> {
  const data = await getJson<{ items: CatalogItem[] }>(`/api/platform/catalog/items?type=${type}`);
  return data.items;
}

export async function fetchCheckoutQuote(input: {
  product: string;
  couponCode?: string;
  quantity?: number;
  shipping?: {
    fullName?: string;
    email?: string;
    phone?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
}): Promise<CheckoutQuote> {
  return postJson<CheckoutQuote>('/api/platform/checkout/quote', input);
}

export async function purchaseCatalogItem(input: {
  product: string;
  couponCode?: string;
  quantity?: number;
  shipping?: {
    fullName?: string;
    email?: string;
    phone?: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
}): Promise<{ ok: true; orderId: string; orderNumber: string; total: number; item: CatalogItem; unlocked: boolean }> {
  return postJson('/api/platform/checkout/purchase', input);
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  return getJson<DashboardOverview>('/api/platform/learner/overview');
}

export async function fetchLearnerLibrary(type?: CatalogItemType): Promise<LearnerLibraryItem[]> {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  const data = await getJson<{ items: LearnerLibraryItem[] }>(`/api/platform/learner/library${query}`);
  return data.items;
}

export async function fetchLearnerOrders(): Promise<LearnerOrder[]> {
  const data = await getJson<{ orders: LearnerOrder[] }>('/api/platform/learner/orders');
  return data.orders;
}

export async function fetchLearnerAccess(slug: string): Promise<{
  hasAccess: boolean;
  access: {
    slug: string;
    title: string;
    type: string;
    accessExpiresAt: string | null;
    progressPercent: number;
    remainingAttempts: number | null;
  } | null;
}> {
  return getJson(`/api/platform/learner/access/${encodeURIComponent(slug)}`);
}

export async function fetchCatalogItem(slug: string): Promise<CatalogItem> {
  const data = await getJson<{ item: CatalogItem }>(`/api/platform/catalog/items/${encodeURIComponent(slug)}`);
  return data.item;
}
