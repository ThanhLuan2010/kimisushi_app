import { Redirect } from 'expo-router';

/**
 * Entry point: redirect directly to the main app tabs.
 * In a production app, this would check auth state and redirect accordingly.
 */
export default function Index() {
  // For demo purposes, go straight to dashboard (skip login)
  return <Redirect href="/(tabs)/dashboard" />;
}
