import { Map, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export const Landing = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full pt-20">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Badge variant="outline">{t("badge")}</Badge>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              {t("description")}
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button
              size="lg"
              className="gap-4 px-6 py-4 font-semibold"
              variant="outline"
            >
              {t("buttons.call")} <PhoneCall className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4 px-6 py-4 font-semibold">
              {t("buttons.viewMap")} <Map className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
