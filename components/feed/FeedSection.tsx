"use client";
import { useState } from "react";
import { format } from "date-fns";
import { DayPicker } from "../DatePicker";
import FeedList from "./feedList";
import FeedTopStats from "./feedTopStats";
import { trpc } from "@/trpc/client";
import { getDeviceTimeZone } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Feed = {
  id: number;
  feedTime: string;
  amount: number;
  type: string;
  foodId: number;
  food: {
    name: string;
    emoji: string;
    unit: {
      name: string;
      emoji: string;
    };
  };
  timeSinceLastFeed: string;
  createdAt: string;
  updatedAt: string;
  babyId: number;
};

type StatsType = {
  timeSinceLastFeed: string;
  totalMilk: number;
  feedCount: number;
  feeds: Feed[];
};

export function FeedSection({
  babyId,
  type = "info",
}: {
  babyId: number;
  type?: "info" | "list" | "full";
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: stats } = trpc.feed.getStats.useQuery({
    babyId,
    date: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss"),
    timezone: getDeviceTimeZone(),
  });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const currentStats = stats as unknown as StatsType;

  // Calculate median time difference
  const medianTimeDifference =
    currentStats?.feeds && currentStats.feeds.length > 1
      ? currentStats.feeds.reduce((total: number, feed: Feed, index: number) => {
          if (index === 0) return 0;
          const timeDiff =
            new Date(feed.feedTime).getTime() -
            new Date(currentStats.feeds[index - 1].feedTime).getTime();
          return total + timeDiff;
        }, 0) /
        (currentStats.feeds.length - 1)
      : 0;

  // Sort by feedTime descending
  const sorted_stats = [...(currentStats?.feeds || [])].sort(
    (a, b) => new Date(b.feedTime).getTime() - new Date(a.feedTime).getTime()
  );

  return (
    <div className="space-y-4">
      <DayPicker selectedDate={selectedDate} onChange={handleDateChange} />

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate.toISOString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {(type === "info" || type === "full") && currentStats && (
            <FeedTopStats
              stats={currentStats}
              medianTimeDifference={medianTimeDifference}
            />
          )}

          {(type === "list" || type === "full") && currentStats && (
            <div className="bg-bg-card rounded-2xl p-4 shadow-sm border border-bg-elevated">
              <h3 className="text-lg font-bold mb-4">Historie krmení</h3>
              {sorted_stats.length === 0 ? (
                <p className="text-text-muted text-center py-4">V tento den není záznam</p>
              ) : (
                <FeedList feeds={sorted_stats} />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
