import { Check, MoveRight, Phone, MessageCircleMore } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full py-20 lg:py-35">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10">
          <div className="flex flex-col gap-6 lg:p-0 p-8">
            <div className="flex flex-col gap-4 ">
              <div>
                <Badge>{t("contact.badge")}</Badge>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl text-left font-regular">
                  {t("contact.title")}
                </h4>
                <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-sm text-left">
                  {t("contact.description")}
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-6 items-start text-left">
              <Phone className="inline w-4 h-4 mt-2 text-primary" />
              <div className="flex flex-col gap-1">
                <p>{t("contact.call.title")}</p>
                <p className="text-muted-foreground text-sm">
                  {t("contact.call.phone")}
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-6 items-start text-left">
              <MessageCircleMore className="inline w-4 h-4 mt-2 text-primary" />
              <div className="flex flex-col gap-1">
                <p>{t("contact.message.title")}</p>
                <p className="text-muted-foreground text-sm">
                  {t("contact.message.phone")}
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-6 items-start text-left">
              <Check className="w-4 h-4 mt-2 text-primary" />
              <div className="flex flex-col gap-1">
                <p>{t("contact.map.title")}</p>
                <Link to="/live-map">
                  <Button className="mt-2 w-max gap-4" variant="outline">
                    {t("contact.map.button")} <MoveRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="justify-center flex items-center">
            <div className="rounded-md max-w-sm flex flex-col border p-8 gap-4">
              <p>{t("contact.form.title")}</p>
              <div className="grid w-full max-w-sm items-center gap-1">
                <Label htmlFor="firstname">{t("contact.form.firstName")}</Label>
                <Input id="firstname" type="text" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1">
                <Label htmlFor="lastname">{t("contact.form.lastName")}</Label>
                <Input id="lastname" type="text" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1">
                <Label htmlFor="email">{t("contact.form.email")}</Label>
                <Input id="email" type="email" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1">
                <Label htmlFor="phone">{t("contact.form.phone")}</Label>
                <Input id="phone" type="tel" />
              </div>
              <Button className="gap-4 w-full">
                {t("contact.form.button")} <MoveRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
