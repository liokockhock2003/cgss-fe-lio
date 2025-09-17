import { Priority, PriorityValue } from '@/store/authUser.context.ts';
import { Antenna, Binoculars, Building, Component, LayoutGrid, LayoutList, type LucideIcon, Rainbow, Weight } from 'lucide-react';

export type Group = {
  groupLabel: string
  accessLevel?: PriorityValue
  menus: {
    href: string
    label: string
    icon: LucideIcon
    accessLevel?: PriorityValue
    submenus: {
      href: string
      label: string
      accessLevel?: PriorityValue
      // submenus?: Group['menus'][number]['submenus'][number][]
    }[]
  }[]
}

export const routerMenuItems = ({ globalFilterParams }: { globalFilterParams: string }): Group[] => {
  return [
    {
      groupLabel: '',
      menus: [
        {
          href: `/emission/dashboard${globalFilterParams}`,
          label: 'Dashboard',
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: '',
      menus: [
        {
          href: '',
          label: 'Emission',
          icon: Rainbow,
          submenus: [
            { label: 'Summary', href: `/emission/summary${globalFilterParams}` },
            { label: 'Scope 1', href: `/emission/scope1${globalFilterParams}` },
            { label: 'Scope 2', href: `/emission/scope2${globalFilterParams}` },
            { label: 'Scope 3 / Upstream', href: `/emission/scope3/upstream${globalFilterParams}` },
            { label: 'Scope 3 / Downstream', href: `/emission/scope3/downstream${globalFilterParams}` },
          ],
        },
      ],
    },
    {
      groupLabel: '',
      menus: [
        {
          href: `/emission/production${globalFilterParams}`,
          label: 'Production',
          icon: Weight,
          submenus: [],
        },
      ],
    },

    {
      groupLabel: 'Settings',
      menus: [
        {
          href: '',
          label: 'Company Registry',
          icon: LayoutList,
          submenus: [
            {
              label: 'Mobile Vehicle',
              href: '/emission/settings/company-registry/mobile-vehicle',
            },
            {
              label: 'Employee',
              href: '/emission/settings/company-registry/employee',
            },
          ],
        },
        {
          label: 'Manage Group By',
          href: '/emission/settings/manage-group-by',
          icon: Component,
          accessLevel: Priority.adminCompany,
          submenus: [],
        },
        {
          label: 'Configuration',
          href: '/emission/settings/configuration',
          icon: Binoculars,
          accessLevel: Priority.adminCompany,
          submenus: [],
        },
        // {
        //   label: 'Account',
        //   href: '/emission/settings/account',
        //   icon: Users,
        //   submenus: [],
        // },
      ],
    },

    {
      groupLabel: 'Internal',
      menus: [
        {
          href: '/emission/settings/company-info',
          label: 'Company Info',
          icon: Building,
          submenus: [],
          accessLevel: Priority.root,
        },
        {
          label: 'Emission Factor',
          href: '/emission/settings/emission-factor',
          icon: Antenna,
          accessLevel: Priority.adminSystem,
          submenus: [],
        },
        {
          href: '',
          label: 'Access Management',
          accessLevel: Priority.adminSystem,
          icon: Rainbow,
          submenus: [
            { label: 'Permissions', href: `/emission/permissions`, accessLevel: Priority.adminSystem, },
            { label: 'User & GroupBy', href: '/emission/user-groupby-map', accessLevel: Priority.adminSystem, },
            { label: 'User & Roles', href: '/emission/user-access-group-map', accessLevel: Priority.adminSystem, },
            { label: 'Role & Permissions', href: '/emission/role-permission-map', accessLevel: Priority.adminSystem, },
          ],
        },
      ],
    },
  ]
}
