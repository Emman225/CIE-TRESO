import React from 'react';
import VisualizationTemplate from '@/presentation/pages/visualization/VisualizationTemplate';

const FonctionnementPage: React.FC = () => (
  <VisualizationTemplate
    domain="Fonctionnement"
    title="Fonctionnement"
    description="Charges de fonctionnement et exploitation courante"
    icon="engineering"
    accentColor="#8b5cf6"
  />
);

export default FonctionnementPage;
