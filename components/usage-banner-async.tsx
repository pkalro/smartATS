import { getUsage } from "@/lib/usage";
import { UsageBanner } from "./usage-banner";

export async function UsageBannerAsync({ userId }: { userId: string }) {
  const usage = await getUsage(userId);
  return <UsageBanner usage={usage} />;
}
