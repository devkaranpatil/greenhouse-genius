import { useState, useCallback } from 'react';
import { LeftPanel } from '@/components/polyhouse/LeftPanel';
import { MiddlePanel } from '@/components/polyhouse/MiddlePanel';
import { RightPanel } from '@/components/polyhouse/RightPanel';
import { PolyhouseConfig, DEFAULT_CONFIG, CalculationResult } from '@/types/polyhouse';
import { usePolyhouseCalculations } from '@/hooks/usePolyhouseCalculations';
import { Leaf } from 'lucide-react';

const Index = () => {
  const [config, setConfig] = useState<PolyhouseConfig>(DEFAULT_CONFIG);
  const { calculate, isLoading, result } = usePolyhouseCalculations();

  const area = config.length * config.width;

  const handleCalculate = useCallback(() => {
    calculate(config);
  }, [config, calculate]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border px-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">PolyDesign Pro</h1>
            <p className="text-xs text-muted-foreground">Polyhouse Design & Cost Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 rounded bg-muted">v1.0</span>
        </div>
      </header>

      {/* Main Content - Three Panel Layout */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Panel - Configuration */}
        <div className="w-80 flex-shrink-0">
          <LeftPanel config={config} onConfigChange={setConfig} area={area} />
        </div>

        {/* Middle Panel - 3D Visualization */}
        <div className="flex-1 min-w-0">
          <MiddlePanel config={config} />
        </div>

        {/* Right Panel - Insights */}
        <div className="w-80 flex-shrink-0">
          <RightPanel 
            config={config} 
            result={result} 
            isLoading={isLoading}
            onCalculate={handleCalculate}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
