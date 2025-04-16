import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Utensils, Leaf, Milk } from "lucide-react";

export type FoodFilter = "halal" | "vegetarian" | "dairy" | null;

interface FilterPanelProps {
  activeFilters: FoodFilter[];
  onFilterChange: (filter: FoodFilter) => void;
}

export const FilterPanel = ({
  activeFilters,
  onFilterChange,
}: FilterPanelProps) => {
  const filters = [
    { id: "halal" as FoodFilter, icon: Utensils, label: "Halal" },
    { id: "vegetarian" as FoodFilter, icon: Leaf, label: "Vegetarian" },
    { id: "dairy" as FoodFilter, icon: Milk, label: "Dairy" },
  ];

  return (
    <Card className="fixed right-4 top-24 z-[1000] p-3 w-52 shadow-lg bg-background/95 backdrop-blur-sm">
      <h3 className="font-medium px-2">Food Type Filters</h3>
      <div className="flex flex-col gap-1.5">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={activeFilters.includes(filter.id) ? "default" : "ghost"}
            className="w-full justify-between text-sm"
            onClick={() => onFilterChange(filter.id)}
          >
            <span className="flex items-center gap-2">
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </span>
            {activeFilters.includes(filter.id) && <Check className="h-4 w-4" />}
          </Button>
        ))}
      </div>
    </Card>
  );
};
