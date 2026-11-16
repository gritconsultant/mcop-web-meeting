export type AgendaNode = {
  id: string;
  label: string;
  code?: string;
  children?: AgendaNode[];
  meta?: string;
  defaultOpen?: boolean;
};
