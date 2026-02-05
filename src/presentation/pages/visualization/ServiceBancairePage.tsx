import React from 'react';
import VisualizationTemplate from '@/presentation/pages/visualization/VisualizationTemplate';

const ServiceBancairePage: React.FC = () => (
  <VisualizationTemplate
    domain="ServiceBancaire"
    title="Services Bancaires"
    description="Frais bancaires, commissions et operations financieres"
    icon="account_balance"
    accentColor="#06b6d4"
  />
);

export default ServiceBancairePage;
