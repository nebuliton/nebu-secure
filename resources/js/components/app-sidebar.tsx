import { Link, usePage } from '@inertiajs/react';
import {
    FolderLock,
    LayoutGrid,
    Settings,
    Shield,
    Users,
    UsersRound,
    Vault,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

type UserRole = {
    role?: 'admin' | 'user';
};

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: UserRole | null } }>().props;
    const isAdmin = auth.user?.role === 'admin';

    const mainNavItems: NavItem[] = isAdmin
        ? [
              { title: 'Übersicht', href: '/admin', icon: LayoutGrid },
              { title: 'Benutzer', href: '/admin/users', icon: Users },
              { title: 'Gruppen', href: '/admin/groups', icon: UsersRound },
              {
                  title: 'Tresor-Einträge',
                  href: '/admin/vault-items',
                  icon: FolderLock,
              },
              {
                  title: 'Einstellungen',
                  href: '/admin/settings',
                  icon: Settings,
              },
              { title: 'Mein Tresor', href: '/vault', icon: Vault },
          ]
        : [
              { title: 'Übersicht', href: '/dashboard', icon: LayoutGrid },
              { title: 'Mein Tresor', href: '/vault', icon: Shield },
          ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href={isAdmin ? '/admin' : '/dashboard'}
                                prefetch
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
