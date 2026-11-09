import {useProfessionalDraft} from '../src/stores/professional';

describe('professional onboarding draft', () => {
  beforeEach(() => useProfessionalDraft.getState().resetDraft());

  it('keeps role selection and identity in one shared professional draft', () => {
    useProfessionalDraft.getState().selectType('CIVIL_ENGINEER');
    useProfessionalDraft.getState().saveIdentityDraft({
      displayName: 'Arun Kumar',
      city: 'Coimbatore',
    });

    expect(useProfessionalDraft.getState()).toMatchObject({
      professionalType: 'CIVIL_ENGINEER',
      displayName: 'Arun Kumar',
      city: 'Coimbatore',
    });
  });

  it('clears all role-specific draft state when setup is restarted', () => {
    useProfessionalDraft.getState().selectType('SERVICE_PROFESSIONAL');
    useProfessionalDraft.getState().saveIdentityDraft({
      displayName: 'Kannan Services',
      city: 'Chennai',
    });

    useProfessionalDraft.getState().resetDraft();

    expect(useProfessionalDraft.getState()).toMatchObject({
      professionalType: null,
      displayName: '',
      city: '',
    });
  });
});
