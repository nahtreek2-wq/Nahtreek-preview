import {runtimeConfig} from '../config/runtime';

export const API_BASES = runtimeConfig.apiBaseUrl ? [runtimeConfig.apiBaseUrl] : [];
export const API_BASE = API_BASES[0];
export const SOCKET_BASE = API_BASE?.replace(/\/api\/v1$/, '');
export const isApiConfigured = API_BASES.length > 0;
