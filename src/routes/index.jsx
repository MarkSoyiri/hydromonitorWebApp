import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/common';
import { ProtectedRoute, PublicRoute, TenantRoute, AdminRoute, SuperAdminRoute } from '@/guards';
import { TenantLayout } from '@/layouts/TenantLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { SuperAdminLayout } from '@/layouts/SuperAdminLayout';

const Lazy = (Component) => (props) => (
  <Suspense fallback={<LoadingScreen />}>
    <Component {...props} />
  </Suspense>
);

const LoginPage = Lazy(lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))));
const ForgotPasswordPage = Lazy(lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))));

const TenantDashboardPage = Lazy(lazy(() => import('@/pages/tenant/TenantDashboardPage').then((m) => ({ default: m.TenantDashboardPage }))));
const TenantUsagePage = Lazy(lazy(() => import('@/pages/tenant/UsagePage').then((m) => ({ default: m.UsagePage }))));
const TenantBillsPage = Lazy(lazy(() => import('@/pages/tenant/BillsPage').then((m) => ({ default: m.BillsPage }))));
const TenantPaymentsPage = Lazy(lazy(() => import('@/pages/tenant/PaymentsPage').then((m) => ({ default: m.PaymentsPage }))));
const TenantInvoicesPage = Lazy(lazy(() => import('@/pages/tenant/InvoicesPage').then((m) => ({ default: m.InvoicesPage }))));
const TenantAlertsPage = Lazy(lazy(() => import('@/pages/tenant/TenantAlertsPage').then((m) => ({ default: m.TenantAlertsPage }))));
const ContactSupportPage = Lazy(lazy(() => import('@/pages/tenant/ContactSupportPage').then((m) => ({ default: m.ContactSupportPage }))));

const AdminDashboardPage = Lazy(lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))));
const RoomsPage = Lazy(lazy(() => import('@/pages/rooms/RoomsPage').then((m) => ({ default: m.RoomsPage }))));
const RoomDetailPage = Lazy(lazy(() => import('@/pages/rooms/RoomDetailPage').then((m) => ({ default: m.RoomDetailPage }))));
const DevicesPage = Lazy(lazy(() => import('@/pages/devices/DevicesPage').then((m) => ({ default: m.DevicesPage }))));
const DeviceDetailPage = Lazy(lazy(() => import('@/pages/devices/DeviceDetailPage').then((m) => ({ default: m.DeviceDetailPage }))));
const TenantsPage = Lazy(lazy(() => import('@/pages/tenants/TenantsPage').then((m) => ({ default: m.TenantsPage }))));
const TenantDetailPage = Lazy(lazy(() => import('@/pages/tenants/TenantDetailPage').then((m) => ({ default: m.TenantDetailPage }))));
const AlertsPage = Lazy(lazy(() => import('@/pages/alerts/AlertsPage').then((m) => ({ default: m.AlertsPage }))));
const BillingPage = Lazy(lazy(() => import('@/pages/billing/BillingPage').then((m) => ({ default: m.BillingPage }))));
const ReportsPage = Lazy(lazy(() => import('@/pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage }))));
const ProfilePage = Lazy(lazy(() => import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))));

const SuperAdminDashboardPage = Lazy(lazy(() => import('@/pages/superadmin/SuperAdminDashboardPage').then((m) => ({ default: m.SuperAdminDashboardPage }))));
const BuildingsPage = Lazy(lazy(() => import('@/pages/buildings/BuildingsPage').then((m) => ({ default: m.BuildingsPage }))));
const BuildingDetailPage = Lazy(lazy(() => import('@/pages/buildings/BuildingDetailPage').then((m) => ({ default: m.BuildingDetailPage }))));
const AnalyticsPage = Lazy(lazy(() => import('@/pages/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))));
const SettingsPage = Lazy(lazy(() => import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))));
const AdminManagementPage = Lazy(lazy(() => import('@/pages/admin/AdminManagementPage').then((m) => ({ default: m.AdminManagementPage }))));
const LogsPage = Lazy(lazy(() => import('@/pages/superadmin/LogsPage').then((m) => ({ default: m.LogsPage }))));
const NotFoundPage = Lazy(lazy(() => import('@/pages/errors/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicRoute><LoginPage /></PublicRoute>,
  },
  {
    path: '/forgot-password',
    element: <PublicRoute><ForgotPasswordPage /></PublicRoute>,
  },
  {
    path: '/',
    element: <ProtectedRoute><TenantLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'app/dashboard', element: <TenantDashboardPage /> },
      { path: 'app/usage', element: <TenantRoute><TenantUsagePage /></TenantRoute> },
      { path: 'app/bills', element: <TenantRoute><TenantBillsPage /></TenantRoute> },
      { path: 'app/payments', element: <TenantRoute><TenantPaymentsPage /></TenantRoute> },
      { path: 'app/invoices', element: <TenantRoute><TenantInvoicesPage /></TenantRoute> },
      { path: 'app/alerts', element: <TenantRoute><TenantAlertsPage /></TenantRoute> },
      { path: 'app/support', element: <TenantRoute><ContactSupportPage /></TenantRoute> },
      { path: 'app/profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'rooms', element: <RoomsPage /> },
      { path: 'rooms/:roomId', element: <RoomDetailPage /> },
      { path: 'devices', element: <DevicesPage /> },
      { path: 'devices/:deviceId', element: <DeviceDetailPage /> },
      { path: 'tenants', element: <TenantsPage /> },
      { path: 'tenants/:tenantId', element: <TenantDetailPage /> },
      { path: 'billing', element: <BillingPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/super-admin',
    element: <SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>,
    children: [
      { index: true, element: <Navigate to="/super-admin/dashboard" replace /> },
      { path: 'dashboard', element: <SuperAdminDashboardPage /> },
      { path: 'buildings', element: <BuildingsPage /> },
      { path: 'buildings/:buildingId', element: <BuildingDetailPage /> },
      { path: 'rooms', element: <RoomsPage /> },
      { path: 'rooms/:roomId', element: <RoomDetailPage /> },
      { path: 'devices', element: <DevicesPage /> },
      { path: 'devices/:deviceId', element: <DeviceDetailPage /> },
      { path: 'tenants', element: <TenantsPage /> },
      { path: 'tenants/:tenantId', element: <TenantDetailPage /> },
      { path: 'admins', element: <AdminManagementPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'logs', element: <LogsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
