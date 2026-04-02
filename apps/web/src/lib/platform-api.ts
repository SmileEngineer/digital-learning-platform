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
  liveClassStatus?: string;
  cancellationReason?: string;
  registeredEmailRequired?: boolean;
  meetingProvider?: string;
  joinWindowMinutes?: number;
  validityLabel?: string;
  curriculum: Array<{ title?: string; lectures?: number; duration?: string }>;
};

export type LiveClassNotification = {
  id: string;
  kind: string;
  title: string;
  message: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type EbookReaderPage = {
  pageNumber: number;
  title: string;
  body: string;
  imageUrl?: string | null;
};

export type EbookReaderData = {
  item: CatalogItem;
  hasAccess: boolean;
  previewOnly: boolean;
  pages: EbookReaderPage[];
  watermarkText: string;
  qrValue: string | null;
  downloadAllowed: boolean;
  downloadConfirmationMessage: string | null;
  protection: {
    disableRightClick: boolean;
    blockDevtoolsShortcuts: boolean;
    singleDeviceNotice: boolean;
  };
};

export type AdminEbook = CatalogItem & {
  status: 'draft' | 'published';
  readersCount: number;
  createdAt: string;
  updatedAt: string;
  downloadConfirmationMessage: string | null;
  pageContents: EbookReaderPage[];
};

export type AdminEbookInput = {
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  authorName: string;
  category: string;
  fileFormat: string;
  previewCount: number;
  downloadEnabled: boolean;
  status: 'draft' | 'published';
  tags: string[];
  downloadConfirmationMessage: string | null;
  pageContents: Array<{
    title: string;
    body: string;
    imageUrl?: string | null;
  }>;
};

export type DeliveryCheck = {
  pinCode: string;
  available: boolean;
  carrier: string;
  city: string | null;
  state: string | null;
  estimatedDays: number | null;
  message: string;
  trackingBaseUrl: string;
};

export type AdminBook = CatalogItem & {
  status: 'draft' | 'published';
  stock: number;
  isbn?: string | null;
  shippingNotes?: string | null;
  galleryImages: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminBookInput = {
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  authorName: string;
  category: string;
  stockQuantity: number;
  status: 'draft' | 'published';
  tags: string[];
  isbn: string | null;
  shippingNotes: string | null;
  galleryImages: string[];
};

export type PracticeExamQuestion = {
  id: string;
  type: 'multiple_choice' | 'single_select' | 'fill_blank';
  prompt: string;
  imageUrl?: string | null;
  options: Array<{
    id: string;
    text: string;
    imageUrl?: string | null;
  }>;
  points: number;
};

export type AdminPracticeExamQuestion = PracticeExamQuestion & {
  correctAnswers: string[];
};

export type AdminPracticeExam = CatalogItem & {
  status: 'draft' | 'published';
  attemptsTaken: number;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  passingScore: number;
  questions: AdminPracticeExamQuestion[];
  createdAt: string;
  updatedAt: string;
  security: {
    disableRightClick: boolean;
    blockDevtoolsShortcuts: boolean;
    hideCorrectAnswers: boolean;
  };
};

export type AdminPracticeExamInput = {
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  instructorName: string;
  category: string;
  timeLimitMinutes: number;
  attemptsAllowed: number;
  passingScore: number;
  status: 'draft' | 'published';
  tags: string[];
  questions: Array<{
    type: 'multiple_choice' | 'single_select' | 'fill_blank';
    prompt: string;
    imageUrl?: string | null;
    options: Array<{
      id: string;
      text: string;
      imageUrl?: string | null;
    }>;
    correctAnswers: string[];
    points: number;
  }>;
};

export type AdminCoupon = {
  id: string;
  code: string;
  discountType: 'percent' | 'flat' | 'free';
  amount: number;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  usageLimit: number | null;
  usedCount: number;
  applicableTypes: string[];
  applicableSlugs: string[];
  applicableEmails: string[];
  createdAt: string;
};

export type AdminCouponInput = {
  code: string;
  discountType: 'percent' | 'flat' | 'free';
  amount: number;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  usageLimit: number | null;
  applicableTypes: string[];
  applicableSlugs: string[];
  applicableEmails: string[];
};

export type AdminArticle = CatalogItem & {
  status: 'draft' | 'published';
  author?: string;
  featured: boolean;
  content: string;
  videoLinks: string[];
  publishedAt: string | null;
};

export type AdminArticleInput = {
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
  authorName: string;
  category: string;
  status: 'draft' | 'published';
  featured: boolean;
  tags: string[];
  content: string;
  videoLinks: string[];
  publishedAt: string | null;
};

export type AdminAnalyticsSummary = {
  totals: {
    revenue: number;
    users: number;
    activeUsers: number;
    newRegistrations: number;
    liveClassAttendance: number;
  };
  revenueByModule: Array<{ module: string; revenue: number }>;
  dailySales: Array<{ label: string; orders: number; revenue: number }>;
  monthlySales: Array<{ label: string; orders: number; revenue: number }>;
  popularCourses: Array<{ slug: string; title: string; students: number }>;
  orderBreakdown: Array<{ module: string; orders: number; revenue: number }>;
  bookOrdersByLocation: Array<{ city: string; state: string; orders: number }>;
  couponUsage: Array<{ code: string; usedCount: number; usageLimit: number | null }>;
  traffic: {
    liveVisitors: number;
    dailyVisitors: number;
    monthlyVisitors: number;
    sources: Array<{ source: string; visits: number }>;
    mostViewedPages: Array<{ path: string; views: number }>;
  };
};

export type SiteSettings = {
  homeScrollerEnabled: boolean;
  homeScrollerMessage: string;
};

export type AdminUserAccess = {
  id: string;
  email: string;
  name: string;
  role: 'staff' | 'admin' | 'super_admin';
  permissions: string[];
  createdAt: string;
};

export type PracticeExamAttemptSummary = {
  id: string;
  attemptNumber: number;
  status: 'in_progress' | 'submitted' | 'auto_submitted';
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  autoSubmitted: boolean;
};

export type LearnerPracticeExamSession = {
  attempt: PracticeExamAttemptSummary & {
    answers: Record<string, unknown>;
  };
  item: CatalogItem;
  remainingAttempts: number | null;
  questions: PracticeExamQuestion[];
  security: {
    disableRightClick: boolean;
    blockDevtoolsShortcuts: boolean;
    hideCorrectAnswers: boolean;
  };
};

export type LearnerPracticeExamHistory = {
  item: CatalogItem;
  remainingAttempts: number | null;
  attempts: PracticeExamAttemptSummary[];
  activeAttempt: PracticeExamAttemptSummary | null;
};

export type PracticeExamResult = {
  id: string;
  title: string;
  attemptNumber: number;
  status: 'submitted' | 'auto_submitted';
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  submittedAt: string;
  autoSubmitted: boolean;
  remainingAttempts: number | null;
  certificateIssued: boolean;
};

export type AdminShipment = {
  id: string;
  orderId: string;
  orderNumber: string;
  itemId: string;
  itemSlug: string;
  itemTitle: string;
  quantity: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shipmentStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  consignmentNumber: string | null;
  carrier: string;
  trackingUrl: string | null;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine: string;
    city: string | null;
    state: string | null;
    pinCode: string;
  };
  deliveryAvailable: boolean;
  adminNotes: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminLiveClass = CatalogItem & {
  meetingUrl?: string;
  spotsTotal?: number;
  enrolledCount: number;
  refundedCount: number;
  refundInitiatedAt?: string;
  lastRescheduledAt?: string;
};

export type AdminLiveClassInput = {
  slug?: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  instructorName: string;
  category: string;
  durationLabel: string;
  durationMinutes: number;
  scheduledAt: string;
  spotsTotal: number | null;
  meetingUrl: string;
  meetingProvider: string;
  status: 'scheduled' | 'rescheduled' | 'cancelled' | 'completed';
  joinWindowMinutes: number;
  registeredEmailRequired: boolean;
  tags: string[];
  agenda: Array<{ title: string; duration?: string }>;
  cancellationReason: string | null;
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
  shipping: {
    required: boolean;
    deliveryAvailable?: boolean;
    carrier?: string;
    city?: string | null;
    state?: string | null;
    estimatedDays?: number | null;
    pinCode?: string;
    message?: string;
    trackingBaseUrl?: string;
  };
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
  carrier?: string | null;
  trackingUrl?: string | null;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  pinCode?: string | null;
  deliveredAt?: string | null;
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

async function patchJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as T;
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  if (!res.ok) throw new Error(await readError(res));
  return res.text();
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

export async function fetchArticleDetail(slug: string): Promise<AdminArticle> {
  const data = await getJson<{ item: AdminArticle }>(`/api/platform/catalog/articles/${encodeURIComponent(slug)}`);
  return data.item;
}

export async function trackSiteVisit(input: { path: string; referrer?: string | null }): Promise<void> {
  await postJson('/api/platform/catalog/track-visit', input);
}

export async function fetchDeliveryCheck(slug: string, pinCode: string): Promise<DeliveryCheck> {
  return getJson(
    `/api/platform/catalog/delivery-check?slug=${encodeURIComponent(slug)}&pinCode=${encodeURIComponent(pinCode)}`
  );
}

export async function fetchPracticeExamHistory(slug: string): Promise<LearnerPracticeExamHistory> {
  return getJson(`/api/platform/learner/practice-exams/${encodeURIComponent(slug)}/history`);
}

export async function startPracticeExam(slug: string): Promise<LearnerPracticeExamSession> {
  return postJson(`/api/platform/learner/practice-exams/${encodeURIComponent(slug)}/start`, {});
}

export async function submitPracticeExam(
  slug: string,
  input: {
    attemptId: string;
    answers: Record<string, unknown>;
  }
): Promise<{ result: PracticeExamResult }> {
  return postJson(`/api/platform/learner/practice-exams/${encodeURIComponent(slug)}/submit`, input);
}

export async function fetchEbookPreview(slug: string): Promise<EbookReaderData> {
  return getJson(`/api/platform/catalog/ebooks/${encodeURIComponent(slug)}/reader`);
}

export async function fetchPurchasedEbookReader(slug: string): Promise<EbookReaderData> {
  return getJson(`/api/platform/learner/ebooks/${encodeURIComponent(slug)}/reader`);
}

export async function requestEbookDownload(slug: string): Promise<EbookReaderData & { filename: string }> {
  return postJson(`/api/platform/learner/ebooks/${encodeURIComponent(slug)}/download`, {});
}

export async function fetchNotifications(): Promise<LiveClassNotification[]> {
  const data = await getJson<{ notifications: LiveClassNotification[] }>('/api/platform/learner/notifications');
  return data.notifications;
}

export async function joinLiveClass(slug: string): Promise<{
  ok: true;
  title: string;
  joinUrl: string;
  provider: string;
  registeredEmail: string | null;
  opensAt: string;
  closesAt: string;
}> {
  return postJson(`/api/platform/learner/live-classes/${encodeURIComponent(slug)}/join`, {});
}

export async function fetchAdminLiveClasses(): Promise<AdminLiveClass[]> {
  const data = await getJson<{ items: AdminLiveClass[] }>('/api/platform/admin/live-classes');
  return data.items;
}

export async function fetchAdminBooks(): Promise<AdminBook[]> {
  const data = await getJson<{ items: AdminBook[] }>('/api/platform/admin/books');
  return data.items;
}

export async function fetchAdminCoupons(): Promise<AdminCoupon[]> {
  const data = await getJson<{ items: AdminCoupon[] }>('/api/platform/admin/coupons');
  return data.items;
}

export async function createAdminCoupon(input: AdminCouponInput): Promise<AdminCoupon> {
  const data = await postJson<{ item: AdminCoupon }>('/api/platform/admin/coupons', input);
  return data.item;
}

export async function updateAdminCoupon(id: string, input: AdminCouponInput): Promise<AdminCoupon> {
  const data = await patchJson<{ item: AdminCoupon }>(`/api/platform/admin/coupons/${encodeURIComponent(id)}`, input);
  return data.item;
}

export async function fetchAdminArticles(): Promise<AdminArticle[]> {
  const data = await getJson<{ items: AdminArticle[] }>('/api/platform/admin/articles');
  return data.items;
}

export async function fetchAdminArticle(id: string): Promise<AdminArticle> {
  const data = await getJson<{ item: AdminArticle }>(`/api/platform/admin/articles/${encodeURIComponent(id)}`);
  return data.item;
}

export async function createAdminArticle(input: AdminArticleInput): Promise<AdminArticle> {
  const data = await postJson<{ item: AdminArticle }>('/api/platform/admin/articles', input);
  return data.item;
}

export async function updateAdminArticle(id: string, input: AdminArticleInput): Promise<AdminArticle> {
  const data = await patchJson<{ item: AdminArticle }>(`/api/platform/admin/articles/${encodeURIComponent(id)}`, input);
  return data.item;
}

export async function fetchAdminAnalytics(): Promise<AdminAnalyticsSummary> {
  return getJson('/api/platform/admin/analytics/summary');
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const data = await getJson<{ settings: SiteSettings }>('/api/platform/admin/settings/site');
  return data.settings;
}

export async function updateSiteSettings(input: SiteSettings): Promise<SiteSettings> {
  const data = await patchJson<{ settings: SiteSettings }>('/api/platform/admin/settings/site', input);
  return data.settings;
}

export async function fetchAdminUsersAccess(): Promise<{
  items: AdminUserAccess[];
  permissions: string[];
}> {
  return getJson('/api/platform/admin/admin-users');
}

export async function createAdminUserAccess(input: {
  email: string;
  name: string;
  password: string;
  role: 'staff' | 'admin' | 'super_admin';
  permissions: string[];
}): Promise<AdminUserAccess> {
  const data = await postJson<{ item: AdminUserAccess }>('/api/platform/admin/admin-users', input);
  return data.item;
}

export async function updateAdminUserAccess(
  id: string,
  input: {
    email: string;
    name: string;
    password?: string;
    role: 'staff' | 'admin' | 'super_admin';
    permissions: string[];
  }
): Promise<AdminUserAccess> {
  const data = await patchJson<{ item: AdminUserAccess }>(
    `/api/platform/admin/admin-users/${encodeURIComponent(id)}`,
    input
  );
  return data.item;
}

export async function fetchAdminPracticeExams(): Promise<AdminPracticeExam[]> {
  const data = await getJson<{ items: AdminPracticeExam[] }>('/api/platform/admin/practice-exams');
  return data.items;
}

export async function fetchAdminPracticeExam(id: string): Promise<AdminPracticeExam> {
  const data = await getJson<{ item: AdminPracticeExam }>(
    `/api/platform/admin/practice-exams/${encodeURIComponent(id)}`
  );
  return data.item;
}

export async function createAdminPracticeExam(input: AdminPracticeExamInput): Promise<AdminPracticeExam> {
  const data = await postJson<{ item: AdminPracticeExam }>('/api/platform/admin/practice-exams', input);
  return data.item;
}

export async function updateAdminPracticeExam(
  id: string,
  input: AdminPracticeExamInput
): Promise<AdminPracticeExam> {
  const data = await patchJson<{ item: AdminPracticeExam }>(
    `/api/platform/admin/practice-exams/${encodeURIComponent(id)}`,
    input
  );
  return data.item;
}

export async function fetchAdminBook(id: string): Promise<AdminBook> {
  const data = await getJson<{ item: AdminBook }>(`/api/platform/admin/books/${encodeURIComponent(id)}`);
  return data.item;
}

export async function createAdminBook(input: AdminBookInput): Promise<AdminBook> {
  const data = await postJson<{ item: AdminBook }>('/api/platform/admin/books', input);
  return data.item;
}

export async function updateAdminBook(id: string, input: AdminBookInput): Promise<AdminBook> {
  const data = await patchJson<{ item: AdminBook }>(`/api/platform/admin/books/${encodeURIComponent(id)}`, input);
  return data.item;
}

export async function fetchAdminShipments(): Promise<AdminShipment[]> {
  const data = await getJson<{ items: AdminShipment[] }>('/api/platform/admin/orders/shipments');
  return data.items;
}

export async function updateAdminShipment(
  id: string,
  input: {
    shipmentStatus: AdminShipment['shipmentStatus'];
    consignmentNumber?: string | null;
    trackingUrl?: string | null;
    adminNotes?: string | null;
  }
): Promise<AdminShipment> {
  const data = await patchJson<{ item: AdminShipment }>(
    `/api/platform/admin/orders/shipments/${encodeURIComponent(id)}`,
    input
  );
  return data.item;
}

export async function exportAdminShipmentsCsv(): Promise<string> {
  return getText('/api/platform/admin/orders/shipments/export');
}

export async function fetchAdminEbooks(): Promise<AdminEbook[]> {
  const data = await getJson<{ items: AdminEbook[] }>('/api/platform/admin/ebooks');
  return data.items;
}

export async function fetchAdminEbook(id: string): Promise<AdminEbook> {
  const data = await getJson<{ item: AdminEbook }>(`/api/platform/admin/ebooks/${encodeURIComponent(id)}`);
  return data.item;
}

export async function createAdminEbook(input: AdminEbookInput): Promise<AdminEbook> {
  const data = await postJson<{ item: AdminEbook }>('/api/platform/admin/ebooks', input);
  return data.item;
}

export async function updateAdminEbook(id: string, input: AdminEbookInput): Promise<AdminEbook> {
  const data = await patchJson<{ item: AdminEbook }>(`/api/platform/admin/ebooks/${encodeURIComponent(id)}`, input);
  return data.item;
}

export async function createAdminLiveClass(input: AdminLiveClassInput): Promise<AdminLiveClass> {
  const data = await postJson<{ item: AdminLiveClass }>('/api/platform/admin/live-classes', input);
  return data.item;
}

export async function updateAdminLiveClass(id: string, input: AdminLiveClassInput): Promise<{
  item: AdminLiveClass;
  notifiedUsers: number;
}> {
  return patchJson(`/api/platform/admin/live-classes/${encodeURIComponent(id)}`, input);
}

export async function refundAdminLiveClass(id: string): Promise<{
  ok: true;
  refundedUsers: number;
  item: AdminLiveClass;
}> {
  return postJson(`/api/platform/admin/live-classes/${encodeURIComponent(id)}/refund`, {});
}
