import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/presentation/contexts/AuthContext';
import { ThemeProvider } from '@/presentation/contexts/ThemeContext';
import { ToastProvider } from '@/presentation/contexts/ToastContext';
import { AuthGuard } from '@/presentation/guards/AuthGuard';
import { RoleGuard } from '@/presentation/guards/RoleGuard';
import AuthLayout from '@/presentation/layouts/AuthLayout';
import MainLayout from '@/presentation/layouts/MainLayout';
import LoginPage from '@/presentation/pages/auth/LoginPage';
import ForgotPasswordPage from '@/presentation/pages/auth/ForgotPasswordPage';
import DashboardPage from '@/presentation/pages/dashboard/DashboardPage';
import CashFlowPlanPage from '@/presentation/pages/cashflow/CashFlowPlanPage';
import SaisieEncaissementPage from '@/presentation/pages/cashflow/SaisieEncaissementPage';
import SaisieDecaissementPage from '@/presentation/pages/cashflow/SaisieDecaissementPage';
import ImportCenterPage from '@/presentation/pages/import/ImportCenterPage';
import UserManagementPage from '@/presentation/pages/users/UserManagementPage';
import ProfileManagementPage from '@/presentation/pages/users/ProfileManagementPage';
import SettingsPage from '@/presentation/pages/settings/SettingsPage';
import ForecastSimulationPage from '@/presentation/pages/forecast/ForecastSimulationPage';
import ReportingPage from '@/presentation/pages/reporting/ReportingPage';
import ValidationPage from '@/presentation/pages/validation/ValidationPage';
import PositionTresoreriePage from '@/presentation/pages/tresorerie/PositionTresoreriePage';
import RapprochementBancairePage from '@/presentation/pages/rapprochement/RapprochementBancairePage';
import NotificationsPage from '@/presentation/pages/notifications/NotificationsPage';
import EcheancierPage from '@/presentation/pages/echeancier/EcheancierPage';
import BudgetRealisePage from '@/presentation/pages/budget/BudgetRealisePage';
import HistoriqueEcrituresPage from '@/presentation/pages/historique/HistoriqueEcrituresPage';
import AccessDeniedPage from '@/presentation/pages/errors/AccessDeniedPage';
import MyProfilePage from '@/presentation/pages/profile/MyProfilePage';
import UserSettingsPage from '@/presentation/pages/profile/UserSettingsPage';
import EnergiePage from '@/presentation/pages/visualization/EnergiePage';
import RemCiePage from '@/presentation/pages/visualization/RemCiePage';
import FonctionnementPage from '@/presentation/pages/visualization/FonctionnementPage';
import ServiceBancairePage from '@/presentation/pages/visualization/ServiceBancairePage';
import ImpotPage from '@/presentation/pages/visualization/ImpotPage';
import AnnexePage from '@/presentation/pages/visualization/AnnexePage';
import GazPage from '@/presentation/pages/visualization/GazPage';
import { PATH } from '@/shared/constants/routes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path={PATH.LOGIN} element={<LoginPage />} />
                <Route path={PATH.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
              </Route>

              {/* Protected routes */}
              <Route
                element={
                  <AuthGuard>
                    <MainLayout />
                  </AuthGuard>
                }
              >
                {/* Dashboard - accessible to all authenticated users */}
                <Route path={PATH.DASHBOARD} element={<DashboardPage />} />

                {/* Treasury Operations */}
                <Route path={PATH.PLAN} element={
                  <RoleGuard resource="plan" fallback={<AccessDeniedPage />}>
                    <CashFlowPlanPage />
                  </RoleGuard>
                } />
                <Route path={PATH.SAISIE_ENCAISSEMENT} element={
                  <RoleGuard resource="saisie" action="create" fallback={<AccessDeniedPage />}>
                    <SaisieEncaissementPage />
                  </RoleGuard>
                } />
                <Route path={PATH.SAISIE_DECAISSEMENT} element={
                  <RoleGuard resource="saisie" action="create" fallback={<AccessDeniedPage />}>
                    <SaisieDecaissementPage />
                  </RoleGuard>
                } />
                <Route path={PATH.POSITION} element={
                  <RoleGuard resource="position" fallback={<AccessDeniedPage />}>
                    <PositionTresoreriePage />
                  </RoleGuard>
                } />
                <Route path={PATH.VALIDATION} element={
                  <RoleGuard resource="validation" fallback={<AccessDeniedPage />}>
                    <ValidationPage />
                  </RoleGuard>
                } />
                <Route path={PATH.RAPPROCHEMENT} element={
                  <RoleGuard resource="rapprochement" fallback={<AccessDeniedPage />}>
                    <RapprochementBancairePage />
                  </RoleGuard>
                } />

                {/* New Treasury Pages */}
                <Route path={PATH.ECHEANCIER} element={
                  <RoleGuard resource="echeancier" fallback={<AccessDeniedPage />}>
                    <EcheancierPage />
                  </RoleGuard>
                } />
                <Route path={PATH.BUDGET_REALISE} element={
                  <RoleGuard resource="budget" fallback={<AccessDeniedPage />}>
                    <BudgetRealisePage />
                  </RoleGuard>
                } />
                <Route path={PATH.HISTORIQUE} element={
                  <RoleGuard resource="historique" fallback={<AccessDeniedPage />}>
                    <HistoriqueEcrituresPage />
                  </RoleGuard>
                } />

                {/* Import & Analysis */}
                <Route path={PATH.IMPORTS} element={
                  <RoleGuard resource="imports" fallback={<AccessDeniedPage />}>
                    <ImportCenterPage />
                  </RoleGuard>
                } />
                <Route path={PATH.FORECAST} element={
                  <RoleGuard resource="forecast" fallback={<AccessDeniedPage />}>
                    <ForecastSimulationPage />
                  </RoleGuard>
                } />
                <Route path={PATH.REPORTING} element={
                  <RoleGuard resource="reporting" fallback={<AccessDeniedPage />}>
                    <ReportingPage />
                  </RoleGuard>
                } />

                {/* Notifications - accessible to all */}
                <Route path={PATH.NOTIFICATIONS} element={<NotificationsPage />} />

                {/* User Profile & Settings - accessible to all authenticated users */}
                <Route path="/profile" element={<MyProfilePage />} />
                <Route path="/user-settings" element={<UserSettingsPage />} />

                {/* Administration */}
                <Route path={PATH.USERS} element={
                  <RoleGuard resource="users" fallback={<AccessDeniedPage />}>
                    <UserManagementPage />
                  </RoleGuard>
                } />
                <Route path={PATH.PROFILES} element={
                  <RoleGuard resource="profiles" fallback={<AccessDeniedPage />}>
                    <ProfileManagementPage />
                  </RoleGuard>
                } />
                <Route path={PATH.SETTINGS} element={
                  <RoleGuard resource="settings" fallback={<AccessDeniedPage />}>
                    <SettingsPage />
                  </RoleGuard>
                } />

                {/* Visualization routes */}
                <Route path={PATH.VIS_ENERGIE} element={
                  <RoleGuard resource="visualization" fallback={<AccessDeniedPage />}>
                    <EnergiePage />
                  </RoleGuard>
                } />
                <Route path={PATH.VIS_REM_CIE} element={
                  <RoleGuard resource="visualization" fallback={<AccessDeniedPage />}>
                    <RemCiePage />
                  </RoleGuard>
                } />
                <Route path={PATH.VIS_FONCTIONNEMENT} element={
                  <RoleGuard resource="visualization" fallback={<AccessDeniedPage />}>
                    <FonctionnementPage />
                  </RoleGuard>
                } />
                <Route path={PATH.VIS_SERVICE_BANCAIRE} element={
                  <RoleGuard resource="visualization" fallback={<AccessDeniedPage />}>
                    <ServiceBancairePage />
                  </RoleGuard>
                } />
                <Route path={PATH.VIS_IMPOT} element={
                  <RoleGuard resource="visualization" fallback={<AccessDeniedPage />}>
                    <ImpotPage />
                  </RoleGuard>
                } />
                <Route path={PATH.VIS_ANNEXE} element={
                  <RoleGuard resource="visualization" fallback={<AccessDeniedPage />}>
                    <AnnexePage />
                  </RoleGuard>
                } />
                <Route path={PATH.VIS_GAZ} element={
                  <RoleGuard resource="visualization" fallback={<AccessDeniedPage />}>
                    <GazPage />
                  </RoleGuard>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to={PATH.DASHBOARD} replace />} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
