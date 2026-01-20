export interface PolyhouseConfig {
  // Base Dimensions
  length: number;
  width: number;
  
  // Height Configuration
  gutterHeight: number;
  ridgeHeight: number;
  
  // Polyhouse Type
  polyhouseType: 'naturally-ventilated' | 'climate-controlled' | 'shade-net';
  
  // Roof Geometry
  roofType: 'flat' | 'gable' | 'gothic';
  
  // Materials
  structureMaterial: 'gi-steel' | 'aluminium' | 'bamboo';
  coverMaterial: 'uv-polyfilm' | 'shade-net' | 'insect-net';
  
  // Ventilation & Access
  sideVentilation: 'none' | 'manual-rollup' | 'motorized-rollup' | 'louver';
  doorEntry: 'single-sliding' | 'double-sliding' | 'roll-up' | 'curtain';
  
  // Location & Climate
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
  { value: 'naturally-ventilated', label: 'Naturally Ventilated', description: 'Uses natural wind for cooling' },
  { value: 'climate-controlled', label: 'Climate Controlled', description: 'Fans and pads for precision' },
  { value: 'shade-net', label: 'Shade Net', description: 'Basic protection from sunlight' },
] as const;

export const ROOF_TYPES = [
  { value: 'flat', label: 'Flat', description: 'Simple & low-cost' },
  { value: 'gable', label: 'Gable', description: 'Traditional A-shape' },
  { value: 'gothic', label: 'Gothic', description: 'Best for snow/rain' },
] as const;

export const STRUCTURE_MATERIALS = [
  { value: 'gi-steel', label: 'GI Steel' },
  { value: 'aluminium', label: 'Aluminium' },
  { value: 'bamboo', label: 'Bamboo' },
] as const;

export const COVER_MATERIALS = [
  { value: 'uv-polyfilm', label: 'UV Polyfilm' },
  { value: 'shade-net', label: 'Shade Net' },
  { value: 'insect-net', label: 'Insect Net' },
] as const;

export const SIDE_VENTILATION_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'manual-rollup', label: 'Manual Roll-up' },
  { value: 'motorized-rollup', label: 'Motorized Roll-up' },
  { value: 'louver', label: 'Louver Vents' },
] as const;

export const DOOR_ENTRY_OPTIONS = [
  { value: 'single-sliding', label: 'Single Sliding Door' },
  { value: 'double-sliding', label: 'Double Sliding Door' },
  { value: 'roll-up', label: 'Roll-up Door' },
  { value: 'curtain', label: 'Curtain Entry' },
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
] as const;

export const INDIAN_DISTRICTS: Record<string, string[]> = {
  'Karnataka': ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Mangaluru', 'Hubli-Dharwad', 'Belgaum', 'Gulbarga', 'Shimoga'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Thane'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli', 'Erode', 'Vellore'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur', 'Kollam', 'Palakkad', 'Alappuzha'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Alwar', 'Bharatpur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj', 'Meerut', 'Ghaziabad', 'Noida'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Rewa', 'Satna'],
  'West Bengal': ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Asansol', 'Durgapur', 'Kharagpur', 'Murshidabad'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat'],
};

export const DEFAULT_CONFIG: PolyhouseConfig = {
  length: 30,
  width: 10,
  gutterHeight: 4,
  ridgeHeight: 6,
  polyhouseType: 'naturally-ventilated',
  roofType: 'gable',
  structureMaterial: 'gi-steel',
  coverMaterial: 'uv-polyfilm',
  sideVentilation: 'manual-rollup',
  doorEntry: 'single-sliding',
  state: '',
  district: '',
};
