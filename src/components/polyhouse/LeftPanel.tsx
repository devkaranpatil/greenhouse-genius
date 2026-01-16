import { useState } from 'react';
import { Settings2, Ruler, Building2, Wind, MapPin, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PolyhouseConfig, 
  POLYHOUSE_TYPES, 
  ROOF_TYPES, 
  STRUCTURE_MATERIALS, 
  COVER_MATERIALS,
  INDIAN_STATES 
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

  return (
    <div className="h-full flex flex-col panel-left">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Configuration</h2>
            <p className="text-xs text-muted-foreground">Define polyhouse parameters</p>
          </div>
        </div>
      </div>

      {/* Area Display */}
      <div className="mx-4 mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Area</span>
          <span className="text-lg font-semibold text-primary">{area.toFixed(0)} m²</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 px-4 custom-scrollbar">
        <Accordion type="multiple" defaultValue={['dimensions', 'type', 'ventilation', 'location']} className="py-4">
          
          {/* Dimensions Section */}
          <AccordionItem value="dimensions" className="border-b-0 mb-2">
            <AccordionTrigger className="py-3 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:no-underline">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Dimensions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3 pb-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <Label>Length (m)</Label>
                  <Input
                    type="number"
                    value={config.length}
                    onChange={(e) => updateNumber('length', e.target.value)}
                    min={5}
                    max={200}
                  />
                </div>
                <div className="input-group">
                  <Label>Width (m)</Label>
                  <Input
                    type="number"
                    value={config.width}
                    onChange={(e) => updateNumber('width', e.target.value)}
                    min={5}
                    max={100}
                  />
                </div>
                <div className="input-group">
                  <Label>Eave Height (m)</Label>
                  <Input
                    type="number"
                    value={config.eaveHeight}
                    onChange={(e) => updateNumber('eaveHeight', e.target.value)}
                    min={2}
                    max={8}
                    step={0.5}
                  />
                </div>
                <div className="input-group">
                  <Label>Ridge Height (m)</Label>
                  <Input
                    type="number"
                    value={config.ridgeHeight}
                    onChange={(e) => updateNumber('ridgeHeight', e.target.value)}
                    min={3}
                    max={12}
                    step={0.5}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Type & Structure Section */}
          <AccordionItem value="type" className="border-b-0 mb-2">
            <AccordionTrigger className="py-3 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:no-underline">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Type & Structure</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3 pb-1">
              <div className="space-y-3">
                <div className="input-group">
                  <Label>Polyhouse Type</Label>
                  <Select 
                    value={config.polyhouseType} 
                    onValueChange={(v) => updateConfig('polyhouseType', v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POLYHOUSE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="input-group">
                  <Label>Roof Type</Label>
                  <Select 
                    value={config.roofType} 
                    onValueChange={(v) => updateConfig('roofType', v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOF_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="input-group">
                  <Label>Structure Material</Label>
                  <Select 
                    value={config.structureMaterial} 
                    onValueChange={(v) => updateConfig('structureMaterial', v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STRUCTURE_MATERIALS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="input-group">
                  <Label>Cover Material</Label>
                  <Select 
                    value={config.coverMaterial} 
                    onValueChange={(v) => updateConfig('coverMaterial', v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COVER_MATERIALS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ventilation Section */}
          <AccordionItem value="ventilation" className="border-b-0 mb-2">
            <AccordionTrigger className="py-3 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:no-underline">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Ventilation & Climate</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3 pb-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">Side Ventilation</Label>
                  <Switch 
                    checked={config.sideVentilation}
                    onCheckedChange={(v) => updateConfig('sideVentilation', v)}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">Top Ventilation</Label>
                  <Switch 
                    checked={config.topVentilation}
                    onCheckedChange={(v) => updateConfig('topVentilation', v)}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">Insect Netting</Label>
                  <Switch 
                    checked={config.insectNet}
                    onCheckedChange={(v) => updateConfig('insectNet', v)}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">Fogging System</Label>
                  <Switch 
                    checked={config.foggers}
                    onCheckedChange={(v) => updateConfig('foggers', v)}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-sm cursor-pointer">Exhaust Fans</Label>
                  <Switch 
                    checked={config.fans}
                    onCheckedChange={(v) => updateConfig('fans', v)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Location Section */}
          <AccordionItem value="location" className="border-b-0 mb-2">
            <AccordionTrigger className="py-3 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:no-underline">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Location</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-3 pb-1">
              <div className="space-y-3">
                <div className="input-group">
                  <Label>State</Label>
                  <Select 
                    value={config.state} 
                    onValueChange={(v) => updateConfig('state', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="input-group">
                  <Label>District</Label>
                  <Input
                    type="text"
                    value={config.district}
                    onChange={(e) => updateConfig('district', e.target.value)}
                    placeholder="Enter district name"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </ScrollArea>
    </div>
  );
}
