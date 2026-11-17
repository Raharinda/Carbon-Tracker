import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentClassName?: string;
}>;

export function Screen({ children, scroll = true, contentClassName }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={`gap-6 px-6 pb-12 pt-4 ${contentClassName ?? ""}`}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 gap-6 px-6 pb-6 pt-4 ${contentClassName ?? ""}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
