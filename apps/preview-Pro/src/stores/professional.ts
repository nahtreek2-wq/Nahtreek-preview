import {create} from 'zustand';

export type ProfessionalType = 'CIVIL_ENGINEER' | 'SERVICE_PROFESSIONAL';

type ProfessionalDraft = {
  professionalType: ProfessionalType | null;
  displayName: string;
  city: string;
  selectType: (type: ProfessionalType) => void;
  saveIdentityDraft: (input: {displayName: string; city: string}) => void;
  resetDraft: () => void;
};

export const useProfessionalDraft = create<ProfessionalDraft>(set => ({
  professionalType: null,
  displayName: '',
  city: '',
  selectType: professionalType => set({professionalType}),
  saveIdentityDraft: input => set(input),
  resetDraft: () => set({professionalType: null, displayName: '', city: ''}),
}));
