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

// Base costs per sqm in INR
const STRUCTURE_COSTS = { 'gi-pipe': 350, 'ms-pipe': 280, 'aluminum': 550 };
const COVER_COSTS = { 'polyethylene': 80, 'polycarbonate': 350, 'shade-net': 45, 'glass': 800 };
const TYPE_MULTIPLIERS = { 'naturally-ventilated': 1.0, 'fan-and-pad': 1.35, 'climate-controlled': 1.8 };

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const config = await req.json();
    const { length, width, eaveHeight, ridgeHeight, polyhouseType, roofType, structureMaterial, coverMaterial, sideVentilation, topVentilation, insectNet, foggers, fans, state } = config;

    const area = length * width;
    const avgHeight = (eaveHeight + ridgeHeight) / 2;
    const volume = area * avgHeight;
    const perimeter = 2 * (length + width);

    // Climate calculation
    const climateInfo = CLIMATE_DATA[state] || CLIMATE_DATA['Karnataka'];
    const advisories: string[] = [];
    
    if (climateInfo.temp > 30) advisories.push('High temperature zone - consider enhanced cooling systems');
    if (climateInfo.humidity > 75) advisories.push('High humidity - ensure adequate ventilation to prevent fungal diseases');
    if (climateInfo.rainfall > 2000) advisories.push('Heavy rainfall region - reinforce roof structure and drainage');
    if (climateInfo.zone.includes('Arid')) advisories.push('Arid climate - fogging systems highly recommended');

    const climate = {
      climateZone: climateInfo.zone,
      avgTemperature: climateInfo.temp,
      humidity: climateInfo.humidity,
      rainfall: climateInfo.rainfall,
      climateFactor: climateInfo.factor,
      advisories,
    };

    // Cost calculation
    const structureBase = STRUCTURE_COSTS[structureMaterial as keyof typeof STRUCTURE_COSTS] || 350;
    const coverBase = COVER_COSTS[coverMaterial as keyof typeof COVER_COSTS] || 80;
    const typeMultiplier = TYPE_MULTIPLIERS[polyhouseType as keyof typeof TYPE_MULTIPLIERS] || 1.0;

    const structureCost = Math.round(area * structureBase * typeMultiplier);
    const wallArea = perimeter * avgHeight;
    const roofArea = area * (roofType === 'gothic' || roofType === 'quonset' ? 1.2 : 1.1);
    const coverCost = Math.round((wallArea + roofArea) * coverBase);
    
    let ventilationCost = 0;
    if (sideVentilation) ventilationCost += perimeter * 800;
    if (topVentilation) ventilationCost += length * 1200;
    if (insectNet) ventilationCost += (wallArea + roofArea) * 35;
    if (foggers) ventilationCost += area * 150;
    if (fans) ventilationCost += Math.ceil(area / 50) * 8000;
    ventilationCost = Math.round(ventilationCost);

    const foundationCost = Math.round(perimeter * 1500);
    const irrigationCost = Math.round(area * 120);
    const electricalCost = Math.round(area * 80 + (fans ? 15000 : 0));
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

    return new Response(JSON.stringify({ area, volume, climate, cost, crops: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return new Response(JSON.stringify({ error: 'Calculation failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
