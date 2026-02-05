export type ScenarioType = 'realistic' | 'optimistic' | 'pessimistic';

export interface ScenarioParameters {
  key: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface ForecastDataPoint {
  date: string;
  realise: number;
  prevision: number;
  ecart: number;
}

export interface ImpactMetric {
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface ForecastAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  date: string;
  threshold?: number;
  currentValue?: number;
}

export interface ScenarioEntity {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  parameters: ScenarioParameters[];
  data: ForecastDataPoint[];
  impactMetrics: ImpactMetric[];
  alerts: ForecastAlert[];
  isBaseline: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForecastSnapshot {
  id: string;
  scenarioId: string;
  name: string;
  data: ForecastDataPoint[];
  impactMetrics: ImpactMetric[];
  createdAt: string;
}
