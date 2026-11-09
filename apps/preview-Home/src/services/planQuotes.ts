import {useEffect, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import type {EngineerRequestDto} from '@nahtreek/types';
import {api} from './apiClient';
import {isApiConfigured} from './config';
import {queryKeys} from './queries';
import type {ConsultationPayload} from '../components/ConsultationSheet';

export type PlanDraft = {
  id: string;
  title: string;
  summary: string;
  projectType: string;
  version: number;
};

export function usePlanDraft(planId?: string) {
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  useEffect(() => {
    if (!planId || !isApiConfigured) {
      setDraft(null);
      return;
    }
    let live = true;
    api
      .get<PlanDraft>(`/ai/plans/${planId}`)
      .then(plan => {
        if (live) setDraft(plan);
      })
      .catch(() => {
        if (live) setDraft(null);
      });
    return () => {
      live = false;
    };
  }, [planId]);
  return draft;
}

export function planSheetPrefill(draft: PlanDraft | null) {
  if (!draft) return undefined;
  return {
    title: draft.title,
    description: draft.summary.slice(0, 500),
  };
}

/** Creates an engineer request from an AI plan, then refreshes request lists. */
export function usePlanQuoteRequest() {
  const client = useQueryClient();
  return async (planId: string, payload: ConsultationPayload & {engineerProfileId: string}) => {
    const created = await api.post<EngineerRequestDto>(`/ai/plans/${planId}/quote-request`, payload);
    void client.invalidateQueries({queryKey: queryKeys.requests});
    return created;
  };
}
