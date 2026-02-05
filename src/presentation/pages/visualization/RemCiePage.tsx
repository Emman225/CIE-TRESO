import React from 'react';
import VisualizationTemplate from '@/presentation/pages/visualization/VisualizationTemplate';

const RemCiePage: React.FC = () => (
  <VisualizationTemplate
    domain="REM_CIE"
    title="Remuneration CIE"
    description="Flux lies a la remuneration de la concession CIE"
    icon="account_balance_wallet"
    accentColor="#137fec"
  />
);

export default RemCiePage;
