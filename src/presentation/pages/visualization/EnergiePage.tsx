import React from 'react';
import VisualizationTemplate from '@/presentation/pages/visualization/VisualizationTemplate';

const EnergiePage: React.FC = () => (
  <VisualizationTemplate
    domain="Energie"
    title="Energie"
    description="Flux de trésorerie lies a la production et distribution d'energie electrique"
    icon="bolt"
    accentColor="#e65000"
  />
);

export default EnergiePage;
