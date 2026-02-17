import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n-context";

const TrustSection = () => {
  const { t } = useLanguage();
  return (
    <div className="mx-auto rounded-lg p-6 shadow-sm border">
      <h2 className="font-semibold mb-4">{t("home.trustSection.title")}</h2>

      <hr className="my-4" />

      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Lock className="h-6 w-6 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-normal">{t("home.trustSection.privacyTitle")}</h4>
            <span className="space-y-4 text-sm text-muted-foreground">
              {t("home.trustSection.privacyDescription")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSection;
