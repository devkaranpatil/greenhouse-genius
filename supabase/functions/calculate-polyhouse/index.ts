import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Climate data by Indian state
const CLIMATE_DATA: Record<string, { zone: string; temp: number; humidity: number; rainfall: number; factor: number }> = {
  'Karnataka': { zone: 'Tropical Wet-Dry', temp: 27, humidity: 65, rainfall: 1200, factor: 1.0 },
  'Maharashtra': { zone: 'Tropical Wet-Dry', temp: 28, humidity: 60, rainfall: 1100, factor: 1.05 },
  'Tamil Nadu': { zone: 'Tropical', temp: 30, humidity: 70, rainfall: 950, factor: 1.1 },
  'Kerala': { zone: 'Tropical Wet', temp: 28, humidity: 80, rainfall: 3000, factor: 1.15 },
  'Gujarat': { zone: 'Semi-Arid', temp: 29, humidity: 55, rainfall: 600, factor: 1.1 },
  'Rajasthan': { zone: 'Arid', temp: 32, humidity: 40, rainfall: 400, factor: 1.2 },
  'Punjab': { zone: 'Semi-Arid', temp: 25, humidity: 55, rainfall: 650, factor: 1.0 },
  'Haryana': { zone: 'Semi-Arid', temp: 26, humidity: 50, rainfall: 550, factor: 1.05 },
  'Uttar Pradesh': { zone: 'Subtropical', temp: 26, humidity: 60, rainfall: 1000, factor: 1.0 },
  'Madhya Pradesh': { zone: 'Subtropical', temp: 27, humidity: 55, rainfall: 1100, factor: 1.0 },
  'West Bengal': { zone: 'Tropical Wet', temp: 27, humidity: 75, rainfall: 1800, factor: 1.1 },
  'Andhra Pradesh': { zone: 'Tropical', temp: 29, humidity: 65, rainfall: 900, factor: 1.05 },
  'Telangana': { zone: 'Tropical', temp: 28, humidity: 60, rainfall: 950, factor: 1.05 },
  'Bihar': { zone: 'Subtropical', temp: 26, humidity: 70, rainfall: 1200, factor: 1.0 },
  'Odisha': { zone: 'Tropical Wet-Dry', temp: 28, humidity: 75, rainfall: 1500, factor: 1.1 },
  'Jharkhand': { zone: 'Subtropical', temp: 26, humidity: 65, rainfall: 1300, factor: 1.0 },
  'Chhattisgarh': { zone: 'Tropical', temp: 27, humidity: 65, rainfall: 1400, factor: 1.0 },
  'Assam': { zone: 'Humid Subtropical', temp: 25, humidity: 80, rainfall: 2500, factor: 1.15 },
  'Himachal Pradesh': { zone: 'Subtropical Highland', temp: 18, humidity: 60, rainfall: 1500, factor: 1.25 },
  'Uttarakhand': { zone: 'Subtropical Highland', temp: 20, humidity: 65, rainfall: 1600, factor: 1.2 },
};

// Base costs per sqm in INR - updated to match new material options
const STRUCTURE_COSTS: Record<string, number> = { 
  'gi-steel': 350, 
  'aluminium': 550,
  'bamboo': 180 
};

const COVER_COSTS: Record<string, number> = { 
  'uv-polyfilm': 80, 
  'shade-net': 45, 
  'insect-net': 55 
};

const TYPE_MULTIPLIERS: Record<string, number> = { 
  'naturally-ventilated': 1.0, 
  'climate-controlled': 1.8, 
  'shade-net': 0.7 
};

const VENTILATION_COSTS: Record<string, number> = {
  'none': 0,
  'manual-rollup': 800,
  'motorized-rollup': 2500,
  'louver': 1800
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const config = await req.json();
    console.log('Received config:', JSON.stringify(config));
    
    const { 
      length, 
      width, 
      gutterHeight, 
      ridgeHeight, 
      polyhouseType, 
      roofType, 
      structureMaterial, 
      coverMaterial, 
      sideVentilation, 
      doorEntry,
      state 
    } = config;

    // Calculate basic dimensions
    const area = length * width;
    const avgHeight = (gutterHeight + ridgeHeight) / 2;
    const volume = area * avgHeight;
    const perimeter = 2 * (length + width);

    // Climate calculation
    const climateInfo = CLIMATE_DATA[state] || CLIMATE_DATA['Karnataka'];
    const advisories: string[] = [];
    
    if (climateInfo.temp > 30) advisories.push('High temperature zone - consider enhanced cooling systems');
    if (climateInfo.humidity > 75) advisories.push('High humidity - ensure adequate ventilation to prevent fungal diseases');
    if (climateInfo.rainfall > 2000) advisories.push('Heavy rainfall region - reinforce roof structure and drainage');
    if (climateInfo.zone.includes('Arid')) advisories.push('Arid climate - fogging systems highly recommended');
    if (polyhouseType === 'shade-net') advisories.push('Shade net houses provide basic protection - ideal for nurseries and hardier crops');

    const climate = {
      climateZone: climateInfo.zone,
      avgTemperature: climateInfo.temp,
      humidity: climateInfo.humidity,
      rainfall: climateInfo.rainfall,
      climateFactor: climateInfo.factor,
      advisories,
    };

    // Cost calculation with proper fallbacks
    const structureBase = STRUCTURE_COSTS[structureMaterial] || 350;
    const coverBase = COVER_COSTS[coverMaterial] || 80;
    const typeMultiplier = TYPE_MULTIPLIERS[polyhouseType] || 1.0;

    console.log('Cost bases:', { structureBase, coverBase, typeMultiplier });

    const structureCost = Math.round(area * structureBase * typeMultiplier);
    
    // Wall and roof area calculations
    const wallArea = perimeter * avgHeight;
    const roofMultiplier = roofType === 'gothic' ? 1.25 : roofType === 'gable' ? 1.15 : 1.05;
    const roofArea = area * roofMultiplier;
    const coverCost = Math.round((wallArea + roofArea) * coverBase);
    
    // Ventilation cost
    const ventilationBase = VENTILATION_COSTS[sideVentilation] || 0;
    let ventilationCost = Math.round(perimeter * ventilationBase);
    
    // Add door cost
    const doorCosts: Record<string, number> = {
      'single-sliding': 8000,
      'double-sliding': 15000,
      'roll-up': 12000,
      'curtain': 5000
    };
    ventilationCost += doorCosts[doorEntry] || 8000;

    // Other costs
    const foundationCost = Math.round(perimeter * 1500);
    const irrigationCost = Math.round(area * 120);
    const electricalCost = Math.round(area * 80 + (polyhouseType === 'climate-controlled' ? 25000 : 0));
    const laborCost = Math.round(area * 200);
    
    const subtotal = structureCost + coverCost + ventilationCost + foundationCost + irrigationCost + electricalCost + laborCost;
    const miscCost = Math.round(subtotal * 0.05);
    
    const climateAdjustment = climateInfo.factor - 1;
    const totalCost = Math.round((subtotal + miscCost) * climateInfo.factor);

    const cost = {
      structureCost,
      coverCost,
      ventilationCost,
      foundationCost,
      irrigationCost,
      electricalCost,
      laborCost,
      miscCost,
      totalCost,
      costPerSqm: Math.round(totalCost / area),
      climateAdjustment,
    };

    console.log('Calculated cost:', JSON.stringify(cost));

    return new Response(JSON.stringify({ area, volume, climate, cost, crops: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return new Response(JSON.stringify({ error: 'Calculation failed', details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
