import React from 'react';
import VisualizationTemplate from '@/presentation/pages/visualization/VisualizationTemplate';

const GazPage: React.FC = () => (
  <VisualizationTemplate
    domain="Gaz"
    title="Gaz"
    description="Approvisionnement et distribution de gaz"
    icon="local_fire_department"
    accentColor="#ef4444"
  />
);

export default GazPage;
