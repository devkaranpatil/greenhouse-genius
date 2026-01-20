import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  PolyhouseConfig, 
  POLYHOUSE_TYPES, 
  ROOF_TYPES, 
  STRUCTURE_MATERIALS, 
  COVER_MATERIALS,
  SIDE_VENTILATION_OPTIONS,
  DOOR_ENTRY_OPTIONS,
  INDIAN_STATES,
  INDIAN_DISTRICTS 
} from '@/types/polyhouse';

interface LeftPanelProps {
  config: PolyhouseConfig;
  onConfigChange: (config: PolyhouseConfig) => void;
  area: number;
}

export function LeftPanel({ config, onConfigChange, area }: LeftPanelProps) {
  const updateConfig = <K extends keyof PolyhouseConfig>(key: K, value: PolyhouseConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  const updateNumber = (key: keyof PolyhouseConfig, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      updateConfig(key, num as any);
    }
  };

  const districts = config.state ? INDIAN_DISTRICTS[config.state] || [] : [];

  return (
    <div className="h-full flex flex-col bg-background">
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-6 space-y-8">
          
          {/* 1. BASE DIMENSIONS */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              1. BASE DIMENSIONS
            </h3>
            <p className="text-sm text-foreground mb-4">
              Define the footprint of your polyhouse
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Length (m)</Label>
                <Input
                  type="number"
                  value={config.length}
                  onChange={(e) => updateNumber('length', e.target.value)}
                  min={5}
                  max={200}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Width (m)</Label>
                <Input
                  type="number"
                  value={config.width}
                  onChange={(e) => updateNumber('width', e.target.value)}
                  min={5}
                  max={100}
                  className="bg-background"
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="text-sm text-primary font-medium">
                Total Area: {area.toFixed(0)} m²
              </span>
            </div>
          </section>

          {/* 2. HEIGHT CONFIGURATION */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              2. HEIGHT CONFIGURATION
            </h3>
            <p className="text-sm text-foreground mb-4">
              Set structural heights for proper airflow
            </p>
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Gutter (m)</Label>
                <Input
                  type="number"
                  value={config.gutterHeight}
                  onChange={(e) => updateNumber('gutterHeight', e.target.value)}
                  min={2}
                  max={8}
                  step={0.5}
                  placeholder="e.g. 4.0"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Ridge (m)</Label>
                <Input
                  type="number"
                  value={config.ridgeHeight}
                  onChange={(e) => updateNumber('ridgeHeight', e.target.value)}
                  min={3}
                  max={12}
                  step={0.5}
                  className="bg-background"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Ridge must be higher than gutter for slope.
            </p>
          </section>

          {/* 3. POLYHOUSE TYPE */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              3. POLYHOUSE TYPE
            </h3>
            <RadioGroup
              value={config.polyhouseType}
              onValueChange={(v) => updateConfig('polyhouseType', v as any)}
              className="space-y-3"
            >
              {POLYHOUSE_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    config.polyhouseType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={type.value} className="mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </section>

          {/* 4. ROOF GEOMETRY */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              4. ROOF GEOMETRY
            </h3>
            <RadioGroup
              value={config.roofType}
              onValueChange={(v) => updateConfig('roofType', v as any)}
              className="space-y-3"
            >
              {ROOF_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    config.roofType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={type.value} className="mt-0.5" />
                  <div>
                    <div className="font-medium text-foreground">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </section>

          {/* 5. MATERIALS */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              5. MATERIALS
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Structure</Label>
                <div className="flex flex-wrap gap-2">
                  {STRUCTURE_MATERIALS.map((material) => (
                    <Button
                      key={material.value}
                      type="button"
                      variant={config.structureMaterial === material.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateConfig('structureMaterial', material.value as any)}
                      className="px-4"
                    >
                      {material.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Covering</Label>
                <div className="flex flex-wrap gap-2">
                  {COVER_MATERIALS.map((material) => (
                    <Button
                      key={material.value}
                      type="button"
                      variant={config.coverMaterial === material.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateConfig('coverMaterial', material.value as any)}
                      className="px-4"
                    >
                      {material.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 6. VENTILATION & ACCESS */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              6. VENTILATION & ACCESS
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Side Ventilation</Label>
                <Select 
                  value={config.sideVentilation} 
                  onValueChange={(v) => updateConfig('sideVentilation', v as any)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Option" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIDE_VENTILATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Door Entry</Label>
                <Select 
                  value={config.doorEntry} 
                  onValueChange={(v) => updateConfig('doorEntry', v as any)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Option" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOOR_ENTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* LOCATION & CLIMATE */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              LOCATION & CLIMATE
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">State</Label>
                <Select 
                  value={config.state} 
                  onValueChange={(v) => {
                    updateConfig('state', v);
                    updateConfig('district', '');
                  }}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">District</Label>
                <Select 
                  value={config.district} 
                  onValueChange={(v) => updateConfig('district', v)}
                  disabled={!config.state}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Validate Button */}
          <Button className="w-full" size="lg">
            Validate & Continue
          </Button>

        </div>
      </ScrollArea>
    </div>
  );
}
