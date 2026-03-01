export type ContactKind = 'linkedin' | 'github' | 'email' | 'phone';

export interface ContactItem {
  kind: ContactKind;
  label: string;
  href: string;
  description: string;
}

export const contactItems: readonly ContactItem[] = [
  {
    kind: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jignasu-pathak/',
    description: 'Professional background, experience, and recent work.',
  },
  {
    kind: 'github',
    label: 'GitHub',
    href: 'https://github.com/Mister-JP',
    description: 'Projects, experiments, and source code.',
  },
  {
    kind: 'email',
    label: '1jignasu@gmail.com',
    href: 'mailto:1jignasu@gmail.com',
    description: 'Best way to reach me directly.',
  },
  {
    kind: 'phone',
    label: '(540) 824-8721',
    href: 'tel:+15408248721',
    description: 'Available for calls or texts.',
  },
];
