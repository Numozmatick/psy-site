export const getPublicConfig = key => typeof window !== 'undefined' ? window.LAHTINKA_CONFIG?.[key] : undefined;
