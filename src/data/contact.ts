export type ContactKind = 'linkedin' | 'github' | 'email' | 'phone';

export interface ContactItem {
  kind: ContactKind;
  label: string;
  href: string;
}

export const contactItems: ContactItem[] = [
  {
    kind: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jignasu-pathak/',
  },
  {
    kind: 'github',
    label: 'GitHub',
    href: 'https://github.com/Mister-JP',
  },
  {
    kind: 'email',
    label: '1jignasu@gmail.com',
    href: 'mailto:1jignasu@gmail.com',
  },
  {
    kind: 'phone',
    label: '(540) 824-8721',
    href: 'tel:+15408248721',
  },
];
