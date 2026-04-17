import posthogLib from 'posthog-js';

const isClient = typeof window !== 'undefined';

if (isClient && !posthogLib.__loaded) {
  posthogLib.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',
  });
}

export const posthog = isClient
  ? posthogLib
  : {
      capture: (_event: string, _properties?: Record<string, unknown>) => {
        void _event;
        void _properties;
      },
    };
