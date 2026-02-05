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

export interface ScenarioEntity {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  parameters: ScenarioParameters[];
  isBaseline: boolean;
  createdAt: string;
  updatedAt: string;
}
