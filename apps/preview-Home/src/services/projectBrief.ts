import {NativeModules} from 'react-native';

type Stage = {title: string; detail: string};

type ProjectBrief = {
  title: string;
  summary: string;
  stages: Stage[];
  checklist: string[];
  missingInformation: string[];
  safetyNote: string;
  clientName?: string;
  city?: string;
};

type ProjectBriefResult = {uri: string; fileName: string};

type ProjectBriefNativeModule = {
  createAndShare(payload: string): Promise<ProjectBriefResult>;
};

export async function createAndShareProjectBrief(
  brief: ProjectBrief,
): Promise<ProjectBriefResult> {
  const native = NativeModules.NahtreekProjectBrief as
    | ProjectBriefNativeModule
    | undefined;
  if (!native?.createAndShare) {
    throw new Error(
      'Project Brief export is unavailable in this app version. Install the latest NAHTREEK Home update and try again.',
    );
  }
  return native.createAndShare(
    JSON.stringify({
      ...brief,
      title: brief.title.slice(0, 120),
      summary: brief.summary.slice(0, 6000),
      clientName: brief.clientName?.slice(0, 120),
      city: brief.city?.slice(0, 120),
      stages: brief.stages.slice(0, 5).map(stage => ({
        title: stage.title.slice(0, 600),
        detail: stage.detail.slice(0, 6000),
      })),
      checklist: brief.checklist.slice(0, 7).map(item => item.slice(0, 6000)),
      missingInformation: brief.missingInformation
        .slice(0, 5)
        .map(item => item.slice(0, 6000)),
      safetyNote: brief.safetyNote.slice(0, 6000),
    }),
  );
}
