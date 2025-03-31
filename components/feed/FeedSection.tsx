// app/components/FeedSection/FeedSection.tsx
"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "../DatePicker";
import { Baby, Feed } from "@/lib/types";
import FeedList from "./feedList";
import FeedTopStats from "./feedTopStats";

type FeedStats = {
  feeds: Feed[];
  totalMilk: number;
  feedCount: number;
  targetMilk: number;
  remainingMilk: number;
  remainingFeeds: number;
  averageAmount: number;
  recommendedNextAmount: number;
  timeSinceLastFeed: string | null;
  lastFeedTime: string | null;
};

export function FeedSection({
  initialStats,
  baby,
  type = "info",
}: {
  initialStats: FeedStats;
  baby: Baby;
  type?: "info" | "list" | "full";
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [stats, setStats] = useState<FeedStats>({
    ...initialStats,
    feeds: initialStats.feeds || [],
  });

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    try {
      const response = await fetch(
        `/api/feeds?babyId=${baby.id}&date=${format(date, "yyyy-MM-dd")}`
      );
      const result = await response.json();
      if (result.success) {
        setStats({ ...result.data, feeds: result.data.feeds || [] });
      } else {
        console.error("Failed to fetch feeds:", result);
      }
    } catch (error) {
      console.error("Failed to fetch feeds:", error);
    }
  };

  // Update the feed stats when initial stats change
  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  // Calculate median time difference between feeds return in hours and minutes as
  const medianTimeDifference =
    stats.feeds && stats.feeds.length > 1
      ? stats.feeds.reduce((total, feed, index) => {
          if (index === 0) return 0;
          const timeDiff =
            new Date(feed.feedTime).getTime() -
            new Date(stats.feeds[index - 1].feedTime).getTime();
          return total + timeDiff;
        }, 0) /
        (stats.feeds.length - 1)
      : 0;

  // Stats sort by created_at by desc
  const sorted_stats = [...stats.feeds].sort(
    (a, b) => new Date(b.feedTime).getTime() - new Date(a.feedTime).getTime()
  );

  return (
    <div className="rounded-2xl">
      {(type === "info" || type === "full") && (
        <>
          <h2 className="text-lg font-semibold text-baby-accent mb-2">
            Historie krmení
          </h2>
          <DayPicker selectedDate={selectedDate} onChange={handleDateChange} />
          <FeedTopStats
            stats={{
              ...stats,
              timeSinceLastFeed: stats.timeSinceLastFeed || "",
            }}
            medianTimeDifference={medianTimeDifference}
          />
        </>
      )}

      {(type === "list" || type === "full") && (
        <>
          {type !== "full" && (
            <h2 className="text-lg font-semibold text-baby-accent mb-2">
              Historie krmení
            </h2>
          )}
          <DayPicker selectedDate={selectedDate} onChange={handleDateChange} />
          <FeedList
            feeds={sorted_stats.map((feed) => ({
              ...feed,
              foodId: feed.foodId || 0,
            }))}
          />
        </>
      )}
    </div>
  );
}
