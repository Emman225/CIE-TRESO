import React from 'react';
import VisualizationTemplate from '@/presentation/pages/visualization/VisualizationTemplate';

const ImpotPage: React.FC = () => (
  <VisualizationTemplate
    domain="Impot"
    title="Impots & Taxes"
    description="Obligations fiscales et parafiscales"
    icon="receipt_long"
    accentColor="#f59e0b"
  />
);

export default ImpotPage;
