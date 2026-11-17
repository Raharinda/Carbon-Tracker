import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Button, Card, ErrorBanner, Input, Screen, Text } from "@/shared/components";
import { LeafIcon } from "@/shared/components/icons";
import { useAuth } from "@/shared/lib/auth";
import { colors } from "@/shared/theme";

export default function LoginScreen() {
  const { status, signIn, signInDemo, isDemoMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status]);

  const submit = async () => {
    if (email.trim().length === 0 || password.length === 0) {
      setError("Enter your email and password.");
      return;
    }
    setError(null);
    setIsBusy(true);
    try {
      await signIn(email, password);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in failed. Check your connection.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Screen contentClassName="flex-grow justify-center gap-6">
      <View className="items-center gap-3">
        <View className="h-14 w-14 items-center justify-center rounded-xl bg-accent">
          <LeafIcon size={30} color={colors.white} />
        </View>
        <Text variant="heading">Carbon Tracker</Text>
        <Text variant="body" tone="muted" className="text-center">
          Monitor your energy use, control the relay, and track your carbon footprint.
        </Text>
      </View>

      <Card className="gap-4">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
        {error ? <ErrorBanner message={error} /> : null}
        <Button label="Sign in" onPress={submit} loading={isBusy} />
      </Card>

      {isDemoMode ? (
        <View className="gap-2">
          <Button label="Explore with demo data" variant="secondary" onPress={signInDemo} />
          <Text variant="caption" className="text-center">
            Demo mode uses simulated readings and does not call Firebase.
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}
