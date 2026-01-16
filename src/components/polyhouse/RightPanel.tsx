import { useState } from 'react';
import { 
  Sparkles, 
  CloudSun, 
  IndianRupee, 
  FileText, 
  Leaf, 
  AlertTriangle,
  Download,
  Loader2,
  TrendingUp,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PolyhouseConfig, CalculationResult } from '@/types/polyhouse';
import { useCropSuggestions } from '@/hooks/usePolyhouseCalculations';
import jsPDF from 'jspdf';

interface RightPanelProps {
  config: PolyhouseConfig;
  result: CalculationResult | null;
  isLoading: boolean;
  onCalculate: () => void;
}

export function RightPanel({ config, result, isLoading, onCalculate }: RightPanelProps) {
  const { getSuggestions, isLoading: aiLoading, suggestions } = useCropSuggestions();
  const [activeTab, setActiveTab] = useState('climate');

  const handleAISuggestions = async () => {
    if (result?.climate) {
      await getSuggestions(config, result.climate);
    }
  };

  const generatePDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(45, 106, 79);
    doc.text('Polyhouse Design Report', margin, y);
    y += 15;

    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, y);
    y += 20;

    // Configuration Section
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Configuration', margin, y);
    y += 10;

    doc.setFontSize(10);
    const configLines = [
      `Dimensions: ${config.length}m × ${config.width}m × ${config.ridgeHeight}m`,
      `Total Area: ${result.area.toFixed(0)} m²`,
      `Volume: ${result.volume.toFixed(0)} m³`,
      `Type: ${config.polyhouseType.replace(/-/g, ' ')}`,
      `Roof: ${config.roofType.replace(/-/g, ' ')}`,
      `Structure: ${config.structureMaterial.replace(/-/g, ' ')}`,
      `Cover: ${config.coverMaterial.replace(/-/g, ' ')}`,
      `Location: ${config.district}, ${config.state}`,
    ];
    configLines.forEach(line => {
      doc.text(line, margin, y);
      y += 6;
    });
    y += 10;

    // Climate Section
    doc.setFontSize(14);
    doc.text('Climate Intelligence', margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Climate Zone: ${result.climate.climateZone}`, margin, y);
    y += 6;
    doc.text(`Avg Temperature: ${result.climate.avgTemperature}°C`, margin, y);
    y += 6;
    doc.text(`Humidity: ${result.climate.humidity}%`, margin, y);
    y += 6;
    doc.text(`Annual Rainfall: ${result.climate.rainfall}mm`, margin, y);
    y += 15;

    // Cost Section
    doc.setFontSize(14);
    doc.text('Cost Analysis', margin, y);
    y += 10;
    doc.setFontSize(10);
    const costLines = [
      `Structure Cost: ₹${result.cost.structureCost.toLocaleString()}`,
      `Cover Cost: ₹${result.cost.coverCost.toLocaleString()}`,
      `Ventilation Cost: ₹${result.cost.ventilationCost.toLocaleString()}`,
      `Foundation Cost: ₹${result.cost.foundationCost.toLocaleString()}`,
      `Irrigation Cost: ₹${result.cost.irrigationCost.toLocaleString()}`,
      `Electrical Cost: ₹${result.cost.electricalCost.toLocaleString()}`,
      `Labor Cost: ₹${result.cost.laborCost.toLocaleString()}`,
      `Miscellaneous: ₹${result.cost.miscCost.toLocaleString()}`,
      `Climate Adjustment: ${result.cost.climateAdjustment > 0 ? '+' : ''}${(result.cost.climateAdjustment * 100).toFixed(1)}%`,
    ];
    costLines.forEach(line => {
      doc.text(line, margin, y);
      y += 6;
    });
    y += 5;
    doc.setFontSize(12);
    doc.setTextColor(45, 106, 79);
    doc.text(`Total Cost: ₹${result.cost.totalCost.toLocaleString()}`, margin, y);
    y += 6;
    doc.text(`Cost per m²: ₹${result.cost.costPerSqm.toLocaleString()}`, margin, y);

    doc.save(`polyhouse-report-${Date.now()}.pdf`);
  };

  return (
    <div className="h-full flex flex-col panel-right">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-success" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Insights & Export</h2>
              <p className="text-xs text-muted-foreground">Analysis & recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onCalculate} 
          disabled={isLoading}
          className="w-full btn-primary-gradient"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4 mr-2" />
              Calculate Cost & Climate
            </>
          )}
        </Button>
      </div>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid grid-cols-3">
          <TabsTrigger value="climate" className="text-xs">
            <CloudSun className="w-3.5 h-3.5 mr-1" />
            Climate
          </TabsTrigger>
          <TabsTrigger value="cost" className="text-xs">
            <IndianRupee className="w-3.5 h-3.5 mr-1" />
            Cost
          </TabsTrigger>
          <TabsTrigger value="crops" className="text-xs">
            <Leaf className="w-3.5 h-3.5 mr-1" />
            Crops
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 custom-scrollbar">
          {/* Climate Tab */}
          <TabsContent value="climate" className="p-4 m-0">
            {result?.climate ? (
              <div className="space-y-4 animate-fade-in">
                <div className="metric-card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Climate Zone</span>
                    <span className="badge-info">{result.climate.climateZone}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Thermometer className="w-4 h-4 mx-auto mb-1 text-destructive" />
                      <div className="text-lg font-semibold">{result.climate.avgTemperature}°C</div>
                      <div className="text-xs text-muted-foreground">Avg Temp</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Droplets className="w-4 h-4 mx-auto mb-1 text-accent" />
                      <div className="text-lg font-semibold">{result.climate.humidity}%</div>
                      <div className="text-xs text-muted-foreground">Humidity</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Wind className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-semibold">{result.climate.rainfall}</div>
                      <div className="text-xs text-muted-foreground">Rainfall (mm)</div>
                    </div>
                  </div>
                </div>

                {result.climate.advisories.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      Climate Advisories
                    </h4>
                    {result.climate.advisories.map((advisory, i) => (
                      <div key={i} className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
                        {advisory}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CloudSun className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click "Calculate" to analyze climate data</p>
              </div>
            )}
          </TabsContent>

          {/* Cost Tab */}
          <TabsContent value="cost" className="p-4 m-0">
            {result?.cost ? (
              <div className="space-y-4 animate-fade-in">
                {/* Total Cost Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-1">Total Estimated Cost</div>
                  <div className="text-3xl font-bold text-primary">
                    ₹{result.cost.totalCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ₹{result.cost.costPerSqm.toLocaleString()} per m²
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cost Breakdown</h4>
                  {[
                    { label: 'Structure', value: result.cost.structureCost },
                    { label: 'Cover Material', value: result.cost.coverCost },
                    { label: 'Ventilation', value: result.cost.ventilationCost },
                    { label: 'Foundation', value: result.cost.foundationCost },
                    { label: 'Irrigation', value: result.cost.irrigationCost },
                    { label: 'Electrical', value: result.cost.electricalCost },
                    { label: 'Labor', value: result.cost.laborCost },
                    { label: 'Miscellaneous', value: result.cost.miscCost },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-medium">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                  
                  {result.cost.climateAdjustment !== 0 && (
                    <div className="flex justify-between items-center py-2 text-warning">
                      <span className="text-sm">Climate Adjustment</span>
                      <span className="text-sm font-medium">
                        {result.cost.climateAdjustment > 0 ? '+' : ''}
                        {(result.cost.climateAdjustment * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Click "Calculate" to get cost estimation</p>
              </div>
            )}
          </TabsContent>

          {/* Crops Tab */}
          <TabsContent value="crops" className="p-4 m-0">
            <div className="space-y-4">
              <Button 
                onClick={handleAISuggestions}
                disabled={!result?.climate || aiLoading}
                variant="outline"
                className="w-full"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting AI suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Crop Suggestions
                  </>
                )}
              </Button>

              {suggestions ? (
                <div className="prose prose-sm max-w-none animate-fade-in">
                  <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
                    {suggestions}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Leaf className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Calculate climate data first, then get AI-powered crop recommendations</p>
                </div>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Export Section */}
      <div className="p-4 border-t border-border">
        <Button 
          onClick={generatePDF}
          disabled={!result}
          variant="outline"
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF Report
        </Button>
      </div>
    </div>
  );
}
