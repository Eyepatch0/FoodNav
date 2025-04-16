import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bus, Car, Train, Footprints } from "lucide-react";

interface TransportPanelProps {
  onModeChange: (mode: string) => void;
  activeMode: string;
}

export const TransportPanel = ({
  onModeChange,
  activeMode,
}: TransportPanelProps) => {
  const transportModes = [
    { id: "bus", icon: Bus, label: "Bus" },
    { id: "metro", icon: Train, label: "Metro" },
    { id: "car", icon: Car, label: "Drive" },
    { id: "walking", icon: Footprints, label: "Walk" },
  ];

  return (
    <Card className="fixed left-4 top-24 z-[1000] p-3 w-52 shadow-lg bg-background/95 backdrop-blur-sm">
      <h3 className="font-medium px-2">Transport Options</h3>
      <div className="flex flex-col gap-1.5">
        {transportModes.map((mode) => (
          <Button
            key={mode.id}
            variant={activeMode === mode.id ? "default" : "ghost"}
            className="w-full justify-start gap-2 text-sm"
            onClick={() => onModeChange(mode.id)}
          >
            <mode.icon className="h-4 w-4" />
            {mode.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};
