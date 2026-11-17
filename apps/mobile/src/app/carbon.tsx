import {
  CarbonChartCard,
  CarbonHighlightCard,
  CarbonTodayCard,
  useCarbonStore,
  useCarbonSummary,
} from "@/features/carbon";
import { useEnergySummary } from "@/features/energy";
import { useUserSettings } from "@/features/settings";
import { LoadingState, Screen, ScreenHeader } from "@/shared/components";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";

export default function CarbonDetailScreen() {
  const { isReady } = useRequireAuth();
  const carbon = useCarbonSummary();
  const energy = useEnergySummary();
  const settings = useUserSettings();
  const setPeriod = useCarbonStore((state) => state.setPeriod);

  if (!isReady) {
    return (
      <Screen>
        <LoadingState label="Loading emissions…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Carbon detail" subtitle="Estimated emissions from electricity use" />
      <CarbonTodayCard
        todayKg={carbon.todayKg}
        weekKg={carbon.weekKg}
        savedPercent={carbon.savedPercent}
      />
      <CarbonChartCard series={carbon.series} period={carbon.period} onPeriodChange={setPeriod} />
      <CarbonHighlightCard
        monthKg={carbon.monthKg}
        monthKwh={energy.monthKwh}
        emissionFactorKgPerKwh={settings.emissionFactorKgPerKwh}
      />
    </Screen>
  );
}
