"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, CreditCard, Users } from "lucide-react";
import { Overview } from "./overview";
import { RecentBookings } from "./recent-bookings";
import { DashboardTitle } from "@/components/dashboard-title";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/lib/i18n-context";
import { useGetPanelSummaryQuery } from "@/redux/slices/panel/panel-slice";

function getStatusLabelKey(status: string): string {
  if (status === "in-process") return "dashboard.status_inProcess";
  if (status === "completed") return "dashboard.status_completed";
  if (status === "pending") return "dashboard.status_pending";
  if (status === "cancelled") return "dashboard.status_cancelled";
  return "dashboard.status_pending";
}

export function DashboardContent() {
  const { user } = useUser();
  const userId = user?.id;
  const { t } = useLanguage();
  const { data, isLoading, error } = useGetPanelSummaryQuery(userId ?? "", {
    skip: !userId,
  });

  const getStatusLabel = (status: string) => {
    const key = getStatusLabelKey(status);
    const label = t(key);
    return label === key ? status : label;
  };

  if (!userId) {
    return (
      <div className="flex flex-col gap-8 px-3 md:px-0">
        <DashboardTitle
          heading={t("dashboard.title")}
          description={t("dashboard.description")}
        />
        <p className="text-muted-foreground">{t("dashboard.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8 px-3 md:px-0">
        <DashboardTitle
          heading={t("dashboard.title")}
          description={t("dashboard.description")}
        />
        <p className="text-destructive">{t("dashboard.error")}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex flex-col gap-8 px-3 md:px-0">
        <DashboardTitle
          heading={t("dashboard.title")}
          description={t("dashboard.description")}
        />
        <p className="text-muted-foreground">{t("dashboard.loading")}</p>
      </div>
    );
  }

  const { activeReservations, totalRevenue, frequentTravelers, reservationActivity, upcomingReservations } = data;

  const activeChangeText =
    activeReservations.changeFromLastMonth === 0
      ? t("dashboard.noChangeSinceLastMonth")
      : activeReservations.changeFromLastMonth > 0
        ? `+${activeReservations.changeFromLastMonth} ${t("dashboard.sinceLastMonth")}`
        : `${activeReservations.changeFromLastMonth} ${t("dashboard.sinceLastMonth")}`;

  const revenueChangeText =
    totalRevenue.percentChangeFromLastYear === 0
      ? t("dashboard.noChangeSinceLastYear")
      : `${totalRevenue.percentChangeFromLastYear > 0 ? "+" : ""}${totalRevenue.percentChangeFromLastYear}% ${t("dashboard.sinceLastYear")}`;

  return (
    <div className="flex flex-col gap-8 px-3 md:px-0">
      <DashboardTitle
        heading={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.activeReservations")}
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReservations.total}</div>
            <p className="text-xs text-muted-foreground">{activeChangeText}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalRevenue")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.total}</div>
            <p className="text-xs text-muted-foreground">{revenueChangeText}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.frequentTravelers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{frequentTravelers.count}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.frequentTravelersSub")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("dashboard.reservationActivity")}</CardTitle>
            <CardDescription>
              {t("dashboard.reservationActivityDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={reservationActivity} />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>{t("dashboard.upcomingReservations")}</CardTitle>
            <CardDescription>
              {upcomingReservations.total === 1
                ? t("dashboard.youHaveOneReservation")
                : t("dashboard.youHaveManyReservations").replace(
                    "{{count}}",
                    String(upcomingReservations.total)
                  )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentBookings
              data={upcomingReservations}
              viewAllLabel={t("dashboard.viewAllReservations")}
              getStatusLabel={getStatusLabel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
