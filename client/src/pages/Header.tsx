import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, MoveRight, X, Languages } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "en");

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "en" ? "es" : "en";
    i18n.changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
  };

  const navigationItems = [
    {
      title: t("nav.home"),
      href: "/",
      description: "",
    },
    {
      title: t("nav.product"),
      description: t("nav.productDescription"),
      items: [
        {
          title: t("nav.product_items.map"),
          href: "/map",
        },
        {
          title: t("nav.product_items.liveHelp"),
          href: "/live-map",
        },
        {
          title: t("nav.product_items.volunteer"),
          href: "/volunteer",
        },
        {
          title: t("nav.product_items.donate"),
          href: "/donate",
        },
      ],
    },
  ];

  const [isOpen, setOpen] = useState(false);
  return (
    <header className="w-full z-50 fixed top-0 left-0 bg-background shadow-sm">
      <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
        <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
          <NavigationMenu className="flex justify-start items-start">
            <NavigationMenuList className="flex justify-start gap-4 flex-row">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.href ? (
                    <>
                      <NavigationMenuLink asChild>
                        <Link to={item.href}>
                          <Button variant="ghost">{item.title}</Button>
                        </Link>
                      </NavigationMenuLink>
                    </>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="font-medium text-sm">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="!w-[450px] p-4">
                        <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                          <div className="flex flex-col h-full justify-between">
                            <div className="flex flex-col">
                              <p className="text-base">{item.title}</p>
                              <p className="text-muted-foreground text-sm">
                                {item.description}
                              </p>
                            </div>
                            <Button size="sm" className="mt-10">
                              {t("buttons.callNow")}
                            </Button>
                          </div>
                          <div className="flex flex-col text-sm h-full justify-end">
                            {item.items?.map((subItem) => (
                              <NavigationMenuLink
                                asChild
                                key={subItem.title}
                                className="flex flex-row justify-between items-center hover:bg-muted py-2 px-4 rounded"
                              >
                                <Link to={subItem.href}>
                                  <span>{subItem.title}</span>
                                  <MoveRight className="w-4 h-4 text-muted-foreground" />
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex lg:justify-center"></div>
        <div className="flex md:justify-end w-full gap-4 justify-start">
          <Button
            size="lg"
            onClick={toggleLanguage}
            className="flex items-center gap-2"
          >
            <Languages className="w-6 h-6" />
            <span className="text-xs font-medium">
              {currentLanguage.toUpperCase()}
            </span>
          </Button>
          <div className="border-r hidden md:inline"></div>
          <Button variant="outline" className="mr-2">
            <Link to="/contact">{t("buttons.contact")}</Link>
          </Button>
        </div>
        <div className="flex w-12 shrink lg:hidden items-end justify-end">
          <Button variant="ghost" onClick={() => setOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          {isOpen && (
            <div className="absolute top-20 border-t flex flex-col w-full right-0 bg-background shadow-lg py-4 container gap-8">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  <div className="flex flex-col gap-2">
                    {item.href ? (
                      <Link
                        to={item.href}
                        className="flex justify-between items-center"
                      >
                        <span className="text-lg">{item.title}</span>
                        <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground" />
                      </Link>
                    ) : (
                      <p className="text-lg">{item.title}</p>
                    )}
                    {item.items &&
                      item.items.map((subItem) => (
                        <Link
                          key={subItem.title}
                          to={subItem.href}
                          className="flex justify-between items-center"
                        >
                          <span className="text-muted-foreground">
                            {subItem.title}
                          </span>
                          <MoveRight className="w-4 h-4 stroke-1" />
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
