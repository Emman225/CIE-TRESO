import type { ScenarioEntity, ScenarioParameters } from '@/domain/entities/Scenario';
import type { ForecastEntity, ForecastSnapshot, BalanceEvolutionPoint } from '@/domain/entities/Forecast';
import type { AlertEntity } from '@/domain/entities/Alert';

export interface CreateScenarioRequest {
  name: string;
  description: string;
  type: 'realistic' | 'optimistic' | 'pessimistic';
  parameters: ScenarioParameters[];
  isBaseline: boolean;
}

export interface AdjustForecastRequest {
  forecastId: string;
  adjustedAmount: number;
  adjustmentReason: string;
}

export interface IForecastRepository {
  // Scenarios
  getScenarios(): Promise<ScenarioEntity[]>;
  getScenarioById(id: string): Promise<ScenarioEntity | null>;
  createScenario(scenario: CreateScenarioRequest): Promise<ScenarioEntity>;
  updateScenario(id: string, data: Partial<ScenarioEntity>): Promise<ScenarioEntity>;
  deleteScenario(id: string): Promise<void>;
  simulateScenario(scenarioId: string, parameters: ScenarioParameters[]): Promise<ScenarioEntity>;

  // Forecasts
  getForecasts(scenarioId: string, periodeId?: string): Promise<ForecastEntity[]>;
  getForecastById(id: string): Promise<ForecastEntity | null>;
  adjustForecast(request: AdjustForecastRequest): Promise<ForecastEntity>;

  // Snapshots
  saveSnapshot(snapshot: Omit<ForecastSnapshot, 'id' | 'createdAt'>): Promise<ForecastSnapshot>;
  getSnapshots(scenarioId: string): Promise<ForecastSnapshot[]>;
  getSnapshotById(id: string): Promise<ForecastSnapshot | null>;

  // Alerts
  getAlerts(scenarioId?: string): Promise<AlertEntity[]>;

  // Balance evolution
  getBalanceEvolution(scenarioId: string, year: number): Promise<BalanceEvolutionPoint[]>;
}
