/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Layout } from './components/Layout';
import { CrisisProvider, useCrisis } from './context/CrisisContext';
import { ClassificationPage } from './pages/ClassificationPage';
import { DashboardPage } from './pages/DashboardPage';
import { DistributionPage } from './pages/DistributionPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { HistoryPage } from './pages/HistoryPage';
import { LoginPage } from './pages/LoginPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { ReportsPage } from './pages/ReportsPage';
import { ResponseCenterPage } from './pages/ResponseCenterPage';
import { SentimentPage } from './pages/SentimentPage';
import { SettingsPage } from './pages/SettingsPage';
import { ValidationPage } from './pages/ValidationPage';

const AppRouter: React.FC = () => {
  const { currentUser, activePage } = useCrisis();

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'monitoring':
        return <MonitoringPage />;
      case 'sentiment':
        return <SentimentPage />;
      case 'validation':
        return <ValidationPage />;
      case 'classification':
        return <ClassificationPage />;
      case 'response':
        return <ResponseCenterPage />;
      case 'distribution':
        return <DistributionPage />;
      case 'evaluation':
        return <EvaluationPage />;
      case 'history':
        return <HistoryPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
};

export default function App() {
  return (
    <CrisisProvider>
      <AppRouter />
    </CrisisProvider>
  );
}
