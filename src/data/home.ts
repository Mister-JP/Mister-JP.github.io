type HomeWritingKind = 'case-study' | 'method';

export interface HomeCollectionConfig {
  limit: number;
  slugs?: string[];
}

export interface HomeWritingGroupConfig {
  kind: HomeWritingKind;
  limit: number;
  slugs?: string[];
}

export interface HomeCompositionConfig {
  featuredProjects: HomeCollectionConfig;
  selectedWriting: {
    groups: HomeWritingGroupConfig[];
  };
  featuredTools: HomeCollectionConfig;
}

export const homeComposition: HomeCompositionConfig = {
  featuredProjects: {
    limit: 3,
    slugs: [
      'microscopy-benchmark-pipeline',
      'architecture-diagram-composer',
      'experiment-reproducibility-framework',
    ],
  },
  selectedWriting: {
    groups: [
      {
        kind: 'case-study',
        limit: 2,
        slugs: ['bsccm-first-baseline', 'future-case-study-placeholder'],
      },
      {
        kind: 'method',
        limit: 2,
        slugs: ['reproducible-experiment-stack', 'experiment-observability'],
      },
    ],
  },
  featuredTools: {
    limit: 2,
    slugs: ['procedural-architecture-composer', 'future-tool-placeholder'],
  },
};
