import type {
  IForecastRepository,
  CreateScenarioRequest,
  AdjustForecastRequest,
} from '@/domain/repositories/IForecastRepository';
import type { ScenarioEntity, ScenarioParameters } from '@/domain/entities/Scenario';
import type {
  ForecastEntity,
  ForecastSnapshot,
  ForecastSnapshotEntry,
  BalanceEvolutionPoint,
} from '@/domain/entities/Forecast';
import type { AlertEntity } from '@/domain/entities/Alert';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MONTHS_FR = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];

const DEFAULT_PARAMETERS: ScenarioParameters[] = [
  { key: 'growth', label: 'Facteur de Croissance', value: 1, min: 0.5, max: 2, step: 0.05, unit: 'x' },
  { key: 'volatility', label: 'Volatilite', value: 5, min: 0, max: 15, step: 0.5, unit: '%' },
  { key: 'inflation', label: 'Taux Inflation', value: 3.5, min: 0, max: 10, step: 0.1, unit: '%' },
  { key: 'collection_rate', label: 'Taux Recouvrement', value: 92, min: 70, max: 100, step: 1, unit: '%' },
];

const RUBRIQUE_IDS = [
  'rub-vente-energie',
  'rub-fact-residentielle',
  'rub-fact-industrielle',
  'rub-exploit-gaz',
  'rub-fiscalite',
  'rub-salaires',
  'rub-frais-bancaires',
  'rub-remuneration-cie',
  'rub-investissements',
];

const RUBRIQUE_LABELS: Record<string, string> = {
  'rub-vente-energie': "Vente d'Energie",
  'rub-fact-residentielle': 'Facturation Residentielle',
  'rub-fact-industrielle': 'Facturation Industrielle',
  'rub-exploit-gaz': 'Exploitation Gaziere',
  'rub-fiscalite': 'Fiscalite & Taxes',
  'rub-salaires': 'Salaires et Charges',
  'rub-frais-bancaires': 'Frais Bancaires',
  'rub-remuneration-cie': 'Remuneration CIE',
  'rub-investissements': 'Investissements Reseau',
};

function generateForecasts(
  scenarioId: string,
  periodeId: string,
  parameters: ScenarioParameters[]
): ForecastEntity[] {
  const growthFactor = parameters.find((p) => p.key === 'growth')?.value ?? 1;
  const forecasts: ForecastEntity[] = [];

  RUBRIQUE_IDS.forEach((rubriqueId, idx) => {
    const baseAmount = (200_000_000 + idx * 50_000_000) * growthFactor;
    const variance = (Math.random() - 0.5) * 20_000_000;
    const originalAmount = Math.round(baseAmount + variance);
    const adjustedAmount = originalAmount;

    forecasts.push({
      id: `fcst-${scenarioId}-${rubriqueId}`,
      scenarioId,
      periodeId,
      rubriqueId,
      originalAmount,
      adjustedAmount,
      version: 1,
      createdAt: '2024-01-15T08:00:00.000Z',
      updatedAt: '2024-01-15T08:00:00.000Z',
    });
  });

  return forecasts;
}

function generateAlerts(
  scenarioId: string,
  parameters: ScenarioParameters[]
): AlertEntity[] {
  const alerts: AlertEntity[] = [];
  const volatility = parameters.find((p) => p.key === 'volatility')?.value ?? 5;
  const growth = parameters.find((p) => p.key === 'growth')?.value ?? 1;

  if (volatility > 8) {
    alerts.push({
      id: `alert-${scenarioId}-vol`,
      type: 'FORECAST_DEVIATION',
      severity: 'warning',
      title: 'Volatilite elevee',
      message: 'Volatilite elevee detectee dans les previsions du scenario.',
      resourceType: 'scenario',
      resourceId: scenarioId,
      threshold: 8,
      currentValue: volatility,
      isRead: false,
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (growth < 0.9) {
    alerts.push({
      id: `alert-${scenarioId}-growth`,
      type: 'NEGATIVE_BALANCE',
      severity: 'critical',
      title: 'Baisse de tresorerie',
      message: 'Prevision de baisse significative de tresorerie pour ce scenario.',
      resourceType: 'scenario',
      resourceId: scenarioId,
      threshold: 0.9,
      currentValue: growth,
      isRead: false,
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  if (growth >= 1.2) {
    alerts.push({
      id: `alert-${scenarioId}-optim`,
      type: 'THRESHOLD_EXCEEDED',
      severity: 'info',
      title: 'Hypothese optimiste',
      message: 'Le facteur de croissance depasse 1.2 - verifier la coherence des hypotheses.',
      resourceType: 'scenario',
      resourceId: scenarioId,
      threshold: 1.2,
      currentValue: growth,
      isRead: true,
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  return alerts;
}

function generateBalanceEvolution(
  parameters: ScenarioParameters[],
  year: number
): BalanceEvolutionPoint[] {
  const growthFactor = parameters.find((p) => p.key === 'growth')?.value ?? 1;
  const volatility = parameters.find((p) => p.key === 'volatility')?.value ?? 5;
  const points: BalanceEvolutionPoint[] = [];
  let cumulativeBalance = 500_000_000;

  for (let month = 0; month < 12; month++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const baseReceipts = (350_000_000 + month * 10_000_000) * growthFactor;
    const basePayments = 280_000_000 + month * 8_000_000;
    const variance = (Math.random() - 0.5) * 2 * volatility * 1_000_000;

    const receipts = Math.round(baseReceipts + variance);
    const payments = Math.round(basePayments - variance * 0.5);
    cumulativeBalance += receipts - payments;

    points.push({
      date,
      balance: cumulativeBalance,
      receipts,
      payments,
    });
  }

  return points;
}

const MOCK_SCENARIOS: ScenarioEntity[] = [
  {
    id: 'scn-001',
    name: 'Scenario de Base',
    description: 'Previsions basees sur les tendances actuelles',
    type: 'realistic',
    parameters: DEFAULT_PARAMETERS.map((p) => ({ ...p })),
    isBaseline: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'scn-002',
    name: 'Scenario Optimiste',
    description: 'Hypothese de croissance soutenue et bon recouvrement',
    type: 'optimistic',
    parameters: DEFAULT_PARAMETERS.map((p) =>
      p.key === 'growth' ? { ...p, value: 1.3 } : p.key === 'collection_rate' ? { ...p, value: 96 } : { ...p }
    ),
    isBaseline: false,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'scn-003',
    name: 'Scenario Pessimiste',
    description: 'Hypothese de contraction economique et volatilite accrue',
    type: 'pessimistic',
    parameters: DEFAULT_PARAMETERS.map((p) =>
      p.key === 'growth'
        ? { ...p, value: 0.8 }
        : p.key === 'volatility'
          ? { ...p, value: 10 }
          : { ...p }
    ),
    isBaseline: false,
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
];

export class MockForecastRepository implements IForecastRepository {
  private scenarios: ScenarioEntity[] = MOCK_SCENARIOS.map((s) => ({
    ...s,
    parameters: s.parameters.map((p) => ({ ...p })),
  }));

  private forecasts: ForecastEntity[] = [
    ...generateForecasts('scn-001', 'per-2024', MOCK_SCENARIOS[0].parameters),
    ...generateForecasts('scn-002', 'per-2024', MOCK_SCENARIOS[1].parameters),
    ...generateForecasts('scn-003', 'per-2024', MOCK_SCENARIOS[2].parameters),
  ];

  private snapshots: ForecastSnapshot[] = [
    {
      id: 'snap-001',
      scenarioId: 'scn-001',
      name: 'Snapshot Initial Q1',
      description: 'Capture initiale du scenario de base pour le premier trimestre',
      totalReceipts: 2_400_000_000,
      totalPayments: 1_800_000_000,
      netBalance: 600_000_000,
      data: RUBRIQUE_IDS.slice(0, 5).map((rubriqueId) => ({
        rubriqueId,
        label: RUBRIQUE_LABELS[rubriqueId],
        originalAmount: 200_000_000 + Math.round(Math.random() * 100_000_000),
        adjustedAmount: 200_000_000 + Math.round(Math.random() * 100_000_000),
        ecart: Math.round((Math.random() - 0.5) * 20_000_000),
      })),
      createdAt: '2024-01-20T10:00:00.000Z',
    },
  ];

  // --- Scenarios ---

  async getScenarios(): Promise<ScenarioEntity[]> {
    await delay(400);
    return this.scenarios.map((s) => ({
      ...s,
      parameters: s.parameters.map((p) => ({ ...p })),
    }));
  }

  async getScenarioById(id: string): Promise<ScenarioEntity | null> {
    await delay(200);
    const scenario = this.scenarios.find((s) => s.id === id);
    if (!scenario) return null;
    return {
      ...scenario,
      parameters: scenario.parameters.map((p) => ({ ...p })),
    };
  }

  async createScenario(request: CreateScenarioRequest): Promise<ScenarioEntity> {
    await delay(500);

    const scenario: ScenarioEntity = {
      id: 'scn-' + Date.now().toString(36),
      name: request.name,
      description: request.description,
      type: request.type,
      parameters: request.parameters.map((p) => ({ ...p })),
      isBaseline: request.isBaseline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.scenarios.push(scenario);

    // Generate associated forecasts for default periode
    const newForecasts = generateForecasts(scenario.id, 'per-2024', scenario.parameters);
    this.forecasts.push(...newForecasts);

    return { ...scenario, parameters: scenario.parameters.map((p) => ({ ...p })) };
  }

  async updateScenario(id: string, data: Partial<ScenarioEntity>): Promise<ScenarioEntity> {
    await delay(400);

    const index = this.scenarios.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Scenario non trouve.');

    this.scenarios[index] = {
      ...this.scenarios[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    return {
      ...this.scenarios[index],
      parameters: this.scenarios[index].parameters.map((p) => ({ ...p })),
    };
  }

  async deleteScenario(id: string): Promise<void> {
    await delay(300);

    const index = this.scenarios.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Scenario non trouve.');

    if (this.scenarios[index].isBaseline) {
      throw new Error('Impossible de supprimer le scenario de base.');
    }

    this.scenarios.splice(index, 1);

    // Remove associated forecasts and snapshots
    this.forecasts = this.forecasts.filter((f) => f.scenarioId !== id);
    this.snapshots = this.snapshots.filter((s) => s.scenarioId !== id);
  }

  async simulateScenario(
    scenarioId: string,
    parameters: ScenarioParameters[]
  ): Promise<ScenarioEntity> {
    await delay(800);

    const index = this.scenarios.findIndex((s) => s.id === scenarioId);
    if (index === -1) throw new Error('Scenario non trouve.');

    // Update scenario parameters
    this.scenarios[index] = {
      ...this.scenarios[index],
      parameters: parameters.map((p) => ({ ...p })),
      updatedAt: new Date().toISOString(),
    };

    // Regenerate associated forecasts
    this.forecasts = this.forecasts.filter((f) => f.scenarioId !== scenarioId);
    const newForecasts = generateForecasts(scenarioId, 'per-2024', parameters);
    this.forecasts.push(...newForecasts);

    return {
      ...this.scenarios[index],
      parameters: this.scenarios[index].parameters.map((p) => ({ ...p })),
    };
  }

  // --- Forecasts ---

  async getForecasts(scenarioId: string, periodeId?: string): Promise<ForecastEntity[]> {
    await delay(400);

    let filtered = this.forecasts.filter((f) => f.scenarioId === scenarioId);
    if (periodeId) {
      filtered = filtered.filter((f) => f.periodeId === periodeId);
    }

    return filtered.map((f) => ({ ...f }));
  }

  async getForecastById(id: string): Promise<ForecastEntity | null> {
    await delay(200);
    const forecast = this.forecasts.find((f) => f.id === id);
    return forecast ? { ...forecast } : null;
  }

  async adjustForecast(request: AdjustForecastRequest): Promise<ForecastEntity> {
    await delay(500);

    const index = this.forecasts.findIndex((f) => f.id === request.forecastId);
    if (index === -1) throw new Error('Prevision non trouvee.');

    this.forecasts[index] = {
      ...this.forecasts[index],
      adjustedAmount: request.adjustedAmount,
      adjustmentReason: request.adjustmentReason,
      version: this.forecasts[index].version + 1,
      updatedAt: new Date().toISOString(),
    };

    return { ...this.forecasts[index] };
  }

  // --- Snapshots ---

  async saveSnapshot(
    data: Omit<ForecastSnapshot, 'id' | 'createdAt'>
  ): Promise<ForecastSnapshot> {
    await delay(400);

    const snapshot: ForecastSnapshot = {
      ...data,
      data: data.data.map((d) => ({ ...d })),
      id: 'snap-' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };

    this.snapshots.push(snapshot);
    return { ...snapshot, data: snapshot.data.map((d) => ({ ...d })) };
  }

  async getSnapshots(scenarioId: string): Promise<ForecastSnapshot[]> {
    await delay(300);
    return this.snapshots
      .filter((s) => s.scenarioId === scenarioId)
      .map((s) => ({
        ...s,
        data: s.data.map((d) => ({ ...d })),
      }));
  }

  async getSnapshotById(id: string): Promise<ForecastSnapshot | null> {
    await delay(200);
    const snapshot = this.snapshots.find((s) => s.id === id);
    if (!snapshot) return null;
    return { ...snapshot, data: snapshot.data.map((d) => ({ ...d })) };
  }

  // --- Alerts ---

  async getAlerts(scenarioId?: string): Promise<AlertEntity[]> {
    await delay(300);

    if (scenarioId) {
      const scenario = this.scenarios.find((s) => s.id === scenarioId);
      if (!scenario) return [];
      return generateAlerts(scenarioId, scenario.parameters);
    }

    // Return alerts for all scenarios
    const allAlerts: AlertEntity[] = [];
    for (const scenario of this.scenarios) {
      allAlerts.push(...generateAlerts(scenario.id, scenario.parameters));
    }
    return allAlerts;
  }

  // --- Balance Evolution ---

  async getBalanceEvolution(
    scenarioId: string,
    year: number
  ): Promise<BalanceEvolutionPoint[]> {
    await delay(500);

    const scenario = this.scenarios.find((s) => s.id === scenarioId);
    if (!scenario) throw new Error('Scenario non trouve.');

    return generateBalanceEvolution(scenario.parameters, year);
  }
}
