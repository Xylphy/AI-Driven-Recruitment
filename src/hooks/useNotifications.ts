"use client";
import { useEffect, useState } from "react";
import { PAGE_SIZE } from "@/lib/constants";
import { supabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

export default function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<
    Database["public"]["Tables"]["notifications"]["Row"][]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    async function load() {
      const { data } = await supabaseClient
        .from("notifications")
        .select("*")
        // biome-ignore lint/style/noNonNullAssertion: userId is guaranteed to be defined if this function is called, as we return early if it's not
        .eq("staff_id", userId!)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      setNotifications(data || []);
    }

    load();

    const channel = supabaseClient
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `staff_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new as Database["public"]["Tables"]["notifications"]["Row"],
            ...prev,
          ]);
        },
      )
      .subscribe();

    return () => {
      void supabaseClient.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;
    const { error } = await supabaseClient
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("staff_id", userId);
    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    const { error } = await supabaseClient
      .from("notifications")
      .update({ read: true })
      .eq("staff_id", userId)
      .eq("read", false);
    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!userId) return;
    const { error } = await supabaseClient
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("staff_id", userId);
    if (!error)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
