'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  fetchPublicSiteConfig,
  type PublicSiteConfig,
} from '@/lib/platform-api';
import {
  DEFAULT_HOME_BANNER,
  DEFAULT_MODULE_CATEGORIES,
  DEFAULT_SITE_NAVIGATION,
  type SiteModuleCategoryConfig,
  type SiteNavigationConfig,
} from '@/lib/site-config-defaults';
import { setModuleCategoriesOverride, setNavigationConfigOverride } from '@/lib/navCatalog';

type SiteConfigContextValue = {
  config: PublicSiteConfig;
  loading: boolean;
  refreshConfig: () => Promise<void>;
};

const defaultConfig: PublicSiteConfig = {
  scroller: {
    enabled: true,
    message: 'Site is under construction. No orders will be fulfilled at this time.',
  },
  homeBanner: DEFAULT_HOME_BANNER,
  navigation: DEFAULT_SITE_NAVIGATION,
  moduleCategories: DEFAULT_MODULE_CATEGORIES,
};

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

function applyConfigOverrides(config: PublicSiteConfig) {
  setNavigationConfigOverride(config.navigation);
  setModuleCategoriesOverride(config.moduleCategories);
}

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PublicSiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  async function refreshConfig() {
    const nextConfig = await fetchPublicSiteConfig();
    applyConfigOverrides(nextConfig);
    setConfig(nextConfig);
  }

  useEffect(() => {
    applyConfigOverrides(defaultConfig);
    let cancelled = false;

    refreshConfig()
      .catch(() => {
        if (!cancelled) {
          applyConfigOverrides(defaultConfig);
          setConfig(defaultConfig);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      config,
      loading,
      refreshConfig,
    }),
    [config, loading]
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig(): SiteConfigContextValue {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within SiteConfigProvider');
  }
  return context;
}

export function useModuleCategories(): SiteModuleCategoryConfig {
  return useSiteConfig().config.moduleCategories;
}

export function useNavigationConfig(): SiteNavigationConfig {
  return useSiteConfig().config.navigation;
}
