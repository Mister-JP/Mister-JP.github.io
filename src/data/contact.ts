export type ContactKind = 'linkedin' | 'github' | 'email' | 'phone';

export interface ContactItem {
  kind: ContactKind;
  label: string;
  href: string;
  description: string;
}
