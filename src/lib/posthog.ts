import posthogLib from 'posthog-js';

const isClient = typeof window !== 'undefined';

if (isClient && !posthogLib.__loaded) {
  posthogLib.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',
    // Privacy: mask all user-entered values in session recordings so that
    // phone numbers, names, notes and OTP codes are never sent to PostHog.
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: 'input,textarea,select',
    },
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
