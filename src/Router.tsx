import { LayoutNewDashboard } from '@/components/LayoutNewDashbord/LayoutNewDashboard'
import { kebabCase } from 'lodash-es'
import { createBrowserRouter, Link, Navigate, RouteObject, useLocation, useMatch } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundry.tsx'
import { LayoutBase } from './components/LayoutBase.tsx'
import { LayoutDashboard } from './components/LayoutDashboard.tsx'

const transformed = (r: { lazy: () => never; label: string; handle: any }): RouteObject => {
  return {
    ...r,
    path: kebabCase(r.label),
    handle: r?.handle ?? { crumb: () => r.label },
  }
}

// prettier-ignore
export const PageScope1Routes: RouteObject[] = [
  { label: 'Stationary Combustion', lazy: async () => await import('@/pages/Emission/Scope1/stationary-combustion/MainPage.tsx'), },
  { label: 'Mobile Combustion', lazy: async () => await import('@/pages/Emission/Scope1/mobile-combustion/MainPage.tsx'), },
  { label: 'Processes Emission', lazy: async () => await import('@/pages/Emission/Scope1/processes-emission/MainPage.tsx') },
  { label: 'Fugitive Emission', lazy: async () => await import('@/pages/Emission/Scope1/fugitive-emission/FugitiveEmissionPage.tsx'), },
].filter(Boolean).map(transformed)

// prettier-ignore
export const PageScope3DownstreamRoutes: RouteObject[] = [
  { label: 'Downstream transportation & distribution', lazy: async () => await import( '@/pages/Emission/Scope3/upstream/upstream-transportation-and-distribution/MainPage.tsx' ),  },
  // { label: 'Processing of sold products',lazy: async () => await import('@/pages/Emission/Scope3/downstream/processing-of-sold-products/ProcessingOfSoldProductsPage.tsx'), },
  // { label: 'Use of sold products', lazy: async () => await import('@/pages/Emission/Scope3/downstream/use-of-sold-products/UseOfSoldProductsPage.tsx'), },
  // { label: 'End-of-life treatment of sold products', lazy: async () => await import( '@/pages/Emission/Scope3/downstream/end-of-life-treatment-of-sold-products/EndOfLifeTreatmentOfSoldProductsPage' ), },
  // { label: 'Downstream leased assets', lazy: async () => await import('@/pages/Emission/Scope3/downstream/downstream-leased-assets/DownstreamLeasedAssetsPage.tsx'), },
  // { label: 'Franchises', lazy: async () => await import('@/pages/Emission/Scope3/downstream/franchises/FranchisesPage.tsx'), },
  // { label: 'Investments', lazy: async () => await import('@/pages/Emission/Scope3/downstream/investments/InvestmentsPage.tsx'), },
].map(transformed)

// prettier-ignore
export const PageScope3UpstreamRoutes: RouteObject[] = [
  { label: 'Business travel', lazy: async () => await import('@/pages/Emission/Scope3/upstream/business-travel/MainPage.tsx'), },
  { label: 'Employee commuting', lazy: async () => await import('@/pages/Emission/Scope3/upstream/employee-commuting/MainPage.tsx'), },
  // { label: 'Purchased goods & services', lazy: async () => await import('@/pages/Emission/Scope3/upstream/purchased-goods-and-services/PurchasedGoodsAndServicesPage.tsx'), },
  // { label: 'Capital goods', lazy: async () => await import('@/pages/Emission/Scope3/upstream/capital-goods/CapitalGoodsPage.tsx'), },
  // { label: 'Fuel- and energy-related', lazy: async () => await import('@/pages/Emission/Scope3/upstream/fuel-and-energy-related/FuelAndEnergyRelatedPage.tsx'), },
  { label: 'Upstream transportation & distribution', lazy: async () => await import( '@/pages/Emission/Scope3/upstream/upstream-transportation-and-distribution/MainPage.tsx' ), },
  { label: 'Waste generated', lazy: async () => await import('@/pages/Emission/Scope3/upstream/waste-generated/MainPage.tsx'), },
  // { label: 'Upstream leased assets', lazy: async () => await import('@/pages/Emission/Scope3/upstream/upstream-leased-assets/UpstreamLeasedAssetsPage.tsx'), },
].map(transformed)

// prettier-ignore
export const PageEmissionFactorRoutes: RouteObject[] = [
  { label: 'Stationary Combustion', lazy: async () => await import('@/pages/Emission/Settings/EmissionFactor/stationary-combustion/Page.tsx'), },
  { label: 'Mobile Combustion', lazy: async () => await import('@/pages/Emission/Settings/EmissionFactor/mobile-combustion/Page.tsx'), },
  { label: 'Scope 2', lazy: async () => await import('@/pages/Emission/Settings/EmissionFactor/scope-2/Page.tsx'), },
  { label: 'GWP', lazy: async () => await import('@/pages/Emission/Settings/EmissionFactor/gwp/Page.tsx'), },
  {
    label: 'Waste Generated',
    handle: { crumb: () => <Link to='/emission/settings/emission-factor/waste-generated'>Waste Generated</Link> },
    children: [
      {
        path: kebabCase('Supplier Specific'),
        handle: { crumb: () => 'Supplier Specific' },
        label: 'Supplier Specific',
        lazy: async () => await import('@/pages/Emission/Settings/EmissionFactor/waste-generated/supplier-specific/Page.tsx'),
      },
      {
        path: kebabCase('Waste Type Specific'),
        handle: { crumb: () => 'Waste Type Specific' },
        label: 'Waste Type Specific',
        lazy: async () => await import('@/pages/Emission/Settings/EmissionFactor/waste-generated/waste-type-specific/Page.tsx'),
      },
      { path: '', element: <Navigate to={kebabCase('Waste Type Specific')} />, },
      { path: '*', element: <Navigate to={kebabCase('Waste Type Specific')} />, },
    ]
  },
].map(transformed)

const RedirectWithQueryParams = ({ to }) => {
  const location = useLocation()
  return <Navigate relative='route' to={to + location.search} />
}

export const router = createBrowserRouter(
  [
    {
      path: '',
      element: <LayoutBase />,
      children: [
        {
          path: '/dashboard-iframe',
          lazy: () => import('@/pages/Emission/Dashboard/IframeLayout.tsx'),
        },
        {
          path: '/',
          handle: {
            crumb: () => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const isDashboard = useMatch('/dashboard')
              return isDashboard ? <span>Home</span> : <Link to='/dashboard'>Home</Link>
            },
          },
          element: <LayoutDashboard />,
          children: [
            {
              path: 'dashboard',
              lazy: async () => {
                const { PageDashboard } = await import('./pages/Dashboard/PageDashboard')
                return { Component: PageDashboard }
              },
            },
            {
              path: 'plants',
              handle: { crumb: () => <span>Plants</span> },
              lazy: async () => {
                const { PagePlant } = await import('./pages/Plant/PagePlant')
                return { Component: PagePlant }
              },
            },
            {
              path: 'map',
              handle: { crumb: () => <span>Map</span> },
              lazy: async () => {
                const { PageMap: Component } = await import('./pages/Maps/PageMap')
                return { Component }
              },
            },
            {
              path: 'plant-target',
              handle: { crumb: () => <span>Plant Targets</span> },
              lazy: async () => {
                const { PagePlantTarget: Component } = await import('./pages/PlantTarget/PagePlantTarget')
                return { Component }
              },
            },
            {
              path: 'species/:name',
              handle: { crumb: () => <span>Species</span> },
              lazy: async () => {
                const { PagePlantSpecies: Component } = await import('./pages/PlantSpecies/PagePlantSpecies')
                return { Component }
              },
            },
            {
              path: 'plant-actual/:name',
              handle: {
                crumb: ({ params }) =>
                  params?.id ?
                    <Link className='capitalize' to={`/plant-actual/${params?.name}`}>
                      {params?.name}
                    </Link>
                  : <span>Plant Actuals</span>,
              },
              lazy: async () => {
                const { PagePlantActual: Component } = await import('./pages/PlantActual/PagePlantActual')
                return { Component }
              },
              children: [
                {
                  path: ':id',
                  handle: { crumb: () => <span>Plant Actual Details</span> },
                  lazy: async () => {
                    const { PagePlantActualDetail } = await import(
                      './pages/PlantActual/PlantActualDetail/PagePlantActualDetail'
                    )

                    return { Component: PagePlantActualDetail }
                  },
                  errorElement: <ErrorBoundary />,
                },
              ],
            },
            {
              path: 'growth/:name',
              handle: { crumb: () => <span>Growth</span> },
              lazy: async () => {
                const { PagePlantGrowth } = await import('./pages/PlantGrowth/PagePlantGrowth')
                return { Component: PagePlantGrowth }
              },
            },
            {
              path: 'states',
              handle: { crumb: () => <span>State</span> },
              lazy: async () => {
                const { PageState } = await import('./pages/States/PageState')
                return { Component: PageState }
              },
            },
            {
              path: 'users',
              handle: { crumb: () => <span>User</span> },
              lazy: async () => {
                const { PageUser } = await import('./pages/Users/PageUser')
                return { Component: PageUser }
              },
            },
            {
              path: 'profile',
              handle: { crumb: () => <span>Profile</span> },
              lazy: () => import('./pages/Profile'),
            },
            { path: '', exact: true, element: <Navigate to='/dashboard' /> },
            { path: '*', element: <Navigate to='/dashboard' /> },
          ].map((c) => ({ ...c, errorElement: <ErrorBoundary /> })),
        },
        {
          path: 'emission',
          handle: {
            crumb: () => <Link to='/emission/dashboard'>Emission</Link>,
          },
          element: <LayoutNewDashboard />,
          children: [
            {
              path: 'dashboard',
              handle: { crumb: () => 'Dashboard', enableGlobalFilter: true },
              lazy: async () => import('@/pages/Emission/Dashboard/PageDashboard'),
            },
            {
              path: 'summary',
              handle: {
                crumb: () => <Link to='/emission/summary'>Summary</Link>,
              },
              lazy: async () => import('./pages/Emission/Summary/MainPage.tsx'),
            },
            {
              path: 'scope1',
              handle: {
                crumb: () => <Link to='/emission/scope1'>Scope 1</Link>,
              },
              lazy: async () => import('./pages/Emission/Scope1/PageScope1'),
              children: PageScope1Routes.concat([
                {
                  path: '',
                  element: <RedirectWithQueryParams to={`/emission/scope1/${PageScope1Routes.at(0).path}`} />,
                },
                {
                  path: '*',
                  element: <RedirectWithQueryParams to={`/emission/scope1/${PageScope1Routes.at(0).path}`} />,
                },
              ]),
            },
            {
              path: 'scope2',
              handle: { crumb: () => 'Scope 2', enableGlobalFilter: true },
              lazy: async () => import('@/pages/Emission/Scope2/MainPage.tsx'),
            },
            {
              path: 'scope3',
              handle: {
                crumb: () => <Link to='/emission/scope3'>Scope 3</Link>,
              },
              lazy: async () => import('@/pages/Emission/Scope3/PageScope3.tsx'),
              children: [
                {
                  path: 'upstream',
                  handle: { crumb: () => <Link to='/emission/scope3/upstream'>Upstream</Link> },
                  children: PageScope3UpstreamRoutes.concat([
                    { path: '', element: <RedirectWithQueryParams to={`./${PageScope3UpstreamRoutes.at(0).path}`} /> },
                    { path: '*', element: <RedirectWithQueryParams to={`./${PageScope3UpstreamRoutes.at(0).path}`} /> },
                  ]),
                },
                {
                  path: 'downstream',
                  handle: { crumb: () => <Link to='/emission/scope3/downstream'>Downstream</Link> },
                  children: PageScope3DownstreamRoutes.concat([
                    { path: '', element: <RedirectWithQueryParams to={PageScope3DownstreamRoutes.at(0).path} /> },
                    { path: '*', element: <RedirectWithQueryParams to={PageScope3DownstreamRoutes.at(0).path} /> },
                  ]),
                },
                { path: '', element: <Navigate to='./upstream' /> },
                { path: '*', element: <Navigate to='./upstream' /> },
              ],
            },

            {
              path: 'production',
              handle: { crumb: () => <span>Production</span> },
              lazy: async () => import('@/pages/Emission/Production/MainPage.tsx'),
              children: [
                { path: '', element: <Navigate to='./' /> },
                { path: '*', element: <Navigate to='./' /> },
              ],
            },

            {
              path: 'settings',
              handle: { crumb: () => <Link to='/emission/settings'>Settings</Link> },
              children: [
                {
                  path: 'account',
                  handle: { crumb: () => 'Account' },
                  lazy: async () => import('@/pages/Emission/Settings/Account/AccountPage.tsx'),
                },
                {
                  path: 'company-info',
                  handle: { crumb: () => 'Company Info' },
                  lazy: async () => import('@/pages/Emission/Settings/CompanyInfo/MainPage.tsx'),
                },
                {
                  path: 'manage-group-by',
                  handle: { crumb: () => 'Manage Group By' },
                  lazy: async () => import('@/pages/Emission/Settings/ManageGroupBy/MainPage.tsx'),
                },
                {
                  path: 'company-registry',
                  handle: { crumb: () => <Link to='/emission/settings/company-registry'>Company Registry</Link> },
                  children: [
                    {
                      path: 'mobile-vehicle',
                      handle: { crumb: () => 'Mobile Vehicle' },
                      lazy: async () => import('@/pages/Emission/Settings/Registry/MobileVehicle/MainPage.tsx'),
                    },
                    {
                      path: 'employee',
                      handle: { crumb: () => 'Employee' },
                      lazy: async () => import('@/pages/Emission/Settings/Registry/Employee/MainPage.tsx'),
                    },
                    { path: '', element: <Navigate to='./mobile-vehicle' /> },
                    { path: '*', element: <Navigate to='./mobile-vehicle' /> },
                  ],
                },
                {
                  path: 'emission-factor',
                  handle: {
                    crumb: () => (
                      <Link to='/emission/settings/emission-factor/stationary-combustion'>Emission Factor</Link>
                    ),
                  },
                  lazy: async () => import('@/pages/Emission/Settings/EmissionFactor/EmissionFactorPage'),
                  children: PageEmissionFactorRoutes.concat([
                    { path: '', element: <Navigate to='./stationary-combustion' /> },
                    { path: '*', element: <Navigate to='./stationary-combustion' /> },
                  ]),
                },
                {
                  path: 'configuration',
                  handle: {
                    crumb: () => <Link to='/emission/settings/configutation'>Configuration</Link>,
                  },
                  lazy: async () => import('@/pages/Emission/Settings/Configuration/MainPage.tsx'),
                },
              ],
            },

            {
              path: 'permissions',
              handle: { crumb: () => 'Permissions' },
              lazy: async () => import('@/pages/Access/Permissions/MainPage'),
            },
            {
              path: 'user-groupby-map',
              handle: { crumb: () => 'User & GroupBy' },
              lazy: async () => import('@/pages/Access/UserGroupByMap/MainPage'),
            },
            {
              path: 'user-access-group-map',
              handle: { crumb: () => 'User & Roles' },
              lazy: async () => import('@/pages/Access/UserAccessGroupMap/MainPage'),
            },
            {
              path: 'role-permission-map',
              handle: { crumb: () => 'Role & Permissions' },
              lazy: async () => import('@/pages/Access/UserAccessGroupPermissionMap/MainPage'),
            },
            { path: '', element: <Navigate to='/emission/dashboard' /> },
            { path: '*', element: <Navigate to='/emission/dashboard' /> },
          ],
        },
      ],
    },
    { path: 'login', lazy: () => import('./pages/Login') },
    { path: 'register', lazy: async () => import('./pages/register/register_controller') },
    {
      path: '404',
      lazy: async () => {
        const { Page404: Component } = await import('./pages/Page404')
        return { Component }
      },
    },
    {
      path: '500',
      lazy: async () => {
        const { Page500: Component } = await import('./pages/Page500')
        return { Component }
      },
    },
    { path: '*', element: <Navigate to='/dashboard' /> },
  ]
    .map((r) => ({ ...r, errorComponent: <ErrorBoundary /> }))
    .filter(Boolean) as RouteObject[],
)
