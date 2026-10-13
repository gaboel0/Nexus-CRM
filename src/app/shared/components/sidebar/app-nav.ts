import { SidebarItem } from './sidebar';

/**
 * Itens da sidebar das telas logadas. Visão geral e Projetos (`/projetos`, `/projetos/:id`) existem;
 * as outras seções são futuras e, até existirem, caem no redirecionamento padrão (voltam para a home).
 */
export const APP_NAV_ITEMS: readonly SidebarItem[] = [
  { label: 'Visão geral', icon: 'dashboard', route: '/home' },
  { label: 'Projetos', icon: 'folder', route: '/projetos' },
  { label: 'Tarefas', icon: 'checklist', route: '/tarefas' },
  { label: 'Calendário', icon: 'calendar_month', route: '/calendario' },
  { label: 'Equipe', icon: 'group', route: '/equipe' },
  { label: 'Relatórios', icon: 'bar_chart', route: '/relatorios' },
  { label: 'Configurações', icon: 'settings', route: '/configuracoes' },
];
