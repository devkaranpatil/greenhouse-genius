export interface PolyhouseConfig {
  // Dimensions
  length: number;
  width: number;
  eaveHeight: number;
  ridgeHeight: number;
  
  // Type & Structure
  polyhouseType: 'naturally-ventilated' | 'fan-and-pad' | 'climate-controlled';
  roofType: 'gable' | 'gothic' | 'quonset' | 'venlo';
  structureMaterial: 'gi-pipe' | 'ms-pipe' | 'aluminum';
  coverMaterial: 'polyethylene' | 'polycarbonate' | 'shade-net' | 'glass';
  
  // Ventilation
  sideVentilation: boolean;
  topVentilation: boolean;
  insectNet: boolean;
  foggers: boolean;
  fans: boolean;
  
  // Location
  state: string;
  district: string;
}

export interface ClimateData {
  climateZone: string;
  avgTemperature: number;
  humidity: number;
  rainfall: number;
  climateFactor: number;
  advisories: string[];
}

export interface CostBreakdown {
  structureCost: number;
  coverCost: number;
  ventilationCost: number;
  foundationCost: number;
  irrigationCost: number;
  electricalCost: number;
  laborCost: number;
  miscCost: number;
  totalCost: number;
  costPerSqm: number;
  climateAdjustment: number;
}

export interface CropSuggestion {
  name: string;
  suitability: 'excellent' | 'good' | 'moderate';
  expectedYield: string;
  season: string;
  notes: string;
}

export interface CalculationResult {
  area: number;
  volume: number;
  climate: ClimateData;
  cost: CostBreakdown;
  crops: CropSuggestion[];
}

export const POLYHOUSE_TYPES = [
  { value: 'naturally-ventilated', label: 'Naturally Ventilated' },
  { value: 'fan-and-pad', label: 'Fan & Pad Cooled' },
  { value: 'climate-controlled', label: 'Climate Controlled' },
] as const;

export const ROOF_TYPES = [
  { value: 'gable', label: 'Gable (A-Frame)' },
  { value: 'gothic', label: 'Gothic Arch' },
  { value: 'quonset', label: 'Quonset (Round)' },
  { value: 'venlo', label: 'Venlo (Multi-span)' },
] as const;

export const STRUCTURE_MATERIALS = [
  { value: 'gi-pipe', label: 'GI Pipe (Galvanized Iron)' },
  { value: 'ms-pipe', label: 'MS Pipe (Mild Steel)' },
  { value: 'aluminum', label: 'Aluminum' },
] as const;

export const COVER_MATERIALS = [
  { value: 'polyethylene', label: 'UV-Stabilized Polyethylene' },
  { value: 'polycarbonate', label: 'Polycarbonate Sheet' },
  { value: 'shade-net', label: 'Shade Net (50-75%)' },
  { value: 'glass', label: 'Tempered Glass' },
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
] as const;

export const DEFAULT_CONFIG: PolyhouseConfig = {
  length: 30,
  width: 20,
  eaveHeight: 4,
  ridgeHeight: 6,
  polyhouseType: 'naturally-ventilated',
  roofType: 'gable',
  structureMaterial: 'gi-pipe',
  coverMaterial: 'polyethylene',
  sideVentilation: true,
  topVentilation: true,
  insectNet: true,
  foggers: false,
  fans: false,
  state: 'Karnataka',
  district: 'Bengaluru',
};
