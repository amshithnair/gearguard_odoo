import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthLayout } from './features/auth/AuthLayout';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { RequireAuth } from './features/auth/RequireAuth';

import { DashboardPage } from './features/dashboard/DashboardPage';
import { KanbanPage } from './features/kanban/KanbanPage';
import { EquipmentPage } from './features/equipment/EquipmentPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { EquipmentFormPage } from './features/equipment/EquipmentFormPage';
import { TelemetrySimulator } from './features/simulation/TelemetrySimulator';
import { ShopFloorMap } from './features/map/ShopFloorMap';
import { MasterListView } from './features/master-data/MasterListView';
import { TeamsPage } from './features/teams/TeamsPage';
import { ReportingPage } from './features/analytics/ReportingPage';

const AlertsPlaceholder = () => <div className="p-8 text-2xl font-bold">Alerts & Notifications</div>;
const SettingsPlaceholder = () => <div className="p-8 text-2xl font-bold">System Settings</div>;

function App() {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="equipment/new" element={<EquipmentFormPage />} />
          <Route path="equipment/:id" element={<EquipmentFormPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="reporting" element={<ReportingPage />} />
          <Route path="alerts" element={<AlertsPlaceholder />} />
          <Route path="settings" element={<SettingsPlaceholder />} />
          <Route path="scomp" element={<div className="p-8 font-mono">SCOMP Terminal Placeholder</div>} />

          {/* Master Data */}
          <Route path="teams" element={<TeamsPage />} />
          <Route path="master/inventory" element={<MasterListView forceType="inventory" />} />
          <Route path="master/work-centers" element={<MasterListView forceType="work-centers" />} />
          <Route path="map" element={<ShopFloorMap />} />

          {/* New Feature: Telemetry Simulation */}
          <Route path="simulation" element={<TelemetrySimulator />} />
        </Route>
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route index element={<Navigate to="login" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
