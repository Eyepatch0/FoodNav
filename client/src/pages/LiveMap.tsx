import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Navigation2,
  UtensilsCrossed,
  Apple,
  MapPin,
  Clock,
  Calendar,
  Phone,
  ExternalLink,
} from "lucide-react";
import { TransportPanel } from "@/components/TransportPanel";
import { FilterPanel, FoodFilter } from "@/components/FilterPanel";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Market, Partner } from "@/types/resources";
import { formatTime } from "@/utils/formatters";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom icons for markets and partners
const createCustomIcon = (type: "market" | "partner") =>
  L.divIcon({
    className: "custom-marker",
    html: `
      <div class="w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white transform transition-transform hover:scale-110 ${
        type === "market"
          ? "bg-gradient-to-br from-green-400 to-green-600"
          : "bg-gradient-to-br from-blue-400 to-blue-600"
      }">
          ${
            type === "market"
              ? `<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path>
                   <line x1="6" y1="17" x2="18" y2="17"></line>
                 </svg>`
              : `<svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M2.75 7.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"></path>
                   <path d="M3 10h18M7 15h.01M11 15h.01M15 15h.01"></path>
                 </svg>`
          }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

const marketIcon = createCustomIcon("market");
const partnerIcon = createCustomIcon("partner");

// DMV boundaries and center
const DMV_BOUNDS: L.LatLngBoundsExpression = [
  [38.6833, -77.6452],
  [39.3642, -76.543],
];
const DMV_BOUNDS_PADDED = L.latLngBounds(DMV_BOUNDS).pad(0.05);
const DC_CENTER: [number, number] = [38.9897, -77.1];

export const LiveMap = () => {
  const [position, setPosition] = useState<[number, number]>(DC_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [activeTransportMode, setActiveTransportMode] = useState("bus");
  const [resources, setResources] = useState<{
    market_hours: Market[];
    partner_hours: Partner[];
  }>({ market_hours: [], partner_hours: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FoodFilter[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/resources");
        if (response.data.status === "success") {
          setResources({
            market_hours: response.data.market_hours || [],
            partner_hours: response.data.partner_hours || [],
          });
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    if (map) {
      setTimeout(() => {
        map.invalidateSize();
        map.setMaxBounds(DMV_BOUNDS_PADDED);
        map.fitBounds(DMV_BOUNDS);
      }, 200);
    }
  }, [map]);

  const handleLocationClick = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (location) => {
        const newPos: [number, number] = [
          location.coords.latitude,
          location.coords.longitude,
        ];

        if (L.latLngBounds(DMV_BOUNDS).contains(newPos)) {
          setPosition(newPos);
          map?.flyTo(newPos, 13, { duration: 2 });
        } else {
          alert("Location is outside the DMV area. Showing DC center.");
          setPosition(DC_CENTER);
          map?.flyTo(DC_CENTER, 10);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
      }
    );
  };

  const parseCoordinates = (coordStr: string) => {
    try {
      const coords = JSON.parse(coordStr);
      return [coords.lat, coords.lng] as [number, number];
    } catch (error) {
      console.error("Error parsing coordinates:", error);
      return DC_CENTER;
    }
  };

  const handleFilterChange = (filter: FoodFilter) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  // Memoize filtered lists
  const filteredMarkets = useMemo(
    () =>
      resources.market_hours.filter((market) => {
        if (activeFilters.length === 0) return true;
        return activeFilters.some((filter) => {
          switch (filter) {
            case "halal":
              return market["Food Format"]?.toLowerCase().includes("halal");
            case "vegetarian":
              return market["Food Format"]
                ?.toLowerCase()
                .includes("vegetarian");
            case "dairy":
              return market["Food Format"]?.toLowerCase().includes("dairy");
            default:
              return false;
          }
        });
      }),
    [activeFilters, resources.market_hours]
  );

  const filteredPartners = useMemo(
    () =>
      resources.partner_hours.filter((partner) => {
        if (activeFilters.length === 0) return true;
        return activeFilters.some((filter) => {
          switch (filter) {
            case "halal":
              return partner["Food Format"]?.toLowerCase().includes("halal");
            case "vegetarian":
              return partner["Food Format"]
                ?.toLowerCase()
                .includes("vegetarian");
            case "dairy":
              return partner["Food Format"]?.toLowerCase().includes("dairy");
            default:
              return false;
          }
        });
      }),
    [activeFilters, resources.partner_hours]
  );

  return (
    <div className="h-screen w-screen">
      <TransportPanel
        onModeChange={setActiveTransportMode}
        activeMode={activeTransportMode}
      />

      <FilterPanel
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      <div className="fixed bottom-4 left-5 z-[1000]">
        <Card className="p-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLocationClick}
            disabled={isLocating}
          >
            <Navigation2
              className={`h-4 w-4 ${isLocating ? "animate-spin" : ""}`}
            />
          </Button>
        </Card>
      </div>

      {/* Map Container */}
      <MapContainer
        center={DC_CENTER}
        zoom={9}
        className="h-full w-full relative z-0"
        zoomControl={false}
        maxBounds={DMV_BOUNDS_PADDED}
        minZoom={9}
        maxZoom={18}
        maxBoundsViscosity={1.0}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredMarkets.map((market) => (
          <Marker
            key={market["Agency ID"]}
            position={parseCoordinates(market.coordinates)}
            icon={marketIcon}
          >
            <Popup className="rounded-xl bg-background text-foreground border shadow-lg">
              <div className="p-4 max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium text-lg text-primary">
                    {market["Agency Name"]}
                  </h3>
                </div>
                <div className="text-sm text-muted-foreground mb-3 flex items-start gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                  <span>{market["Shipping Address"]}</span>
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{market["Day of Week"]}</span>
                  </div>
                  <div className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTime(market["Starting Time"])} -{" "}
                      {formatTime(market["Ending Time"])}
                    </span>
                  </div>
                </div>
                <Button
                  variant="link"
                  className="mt-2 flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                  onClick={() =>
                    (window.location.href = `/market/${market["Agency ID"]}`)
                  }
                >
                  View Details
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {filteredPartners.map((partner) => (
          <Marker
            key={partner["External ID"]}
            position={parseCoordinates(partner.coordinates)}
            icon={partnerIcon}
          >
            <Popup className="rounded-xl bg-background text-foreground border shadow-lg">
              <div className="p-4 max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium text-lg text-primary">
                    {partner.Name}
                  </h3>
                </div>
                <div className="text-sm text-muted-foreground mb-3 flex items-start gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                  <span>{partner["Shipping Address"]}</span>
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{partner["Day of Week"]}</span>
                  </div>
                  <div className="text-sm flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTime(partner["Starting Time"])} -{" "}
                      {formatTime(partner["Ending Time"])}
                    </span>
                  </div>
                </div>
                {partner.Phone && (
                  <a
                    href={`tel:${partner.Phone}`}
                    className="mt-2 flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{partner.Phone}</span>
                  </a>
                )}
                <Button
                  variant="link"
                  className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    (window.location.href = `/partner/${partner["External ID"]}`)
                  }
                >
                  View Details
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {isLoading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
};
