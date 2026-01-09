"use client";
import {
	collection,
	deleteDoc,
	doc,
	limit,
	onSnapshot,
	orderBy,
	query,
	updateDoc,
	writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import type { Notification } from "@/types/types";

export default function useNotifications(
	limitCount: number = 20,
	userId?: string,
) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId) {
			setNotifications([]);
			setUnreadCount(0);
			setLoading(false);
			return;
		}

		const notificationsRef = collection(db, "users", userId, "notifications");

		// Real-time listener
		const unsubscribe = onSnapshot(
			query(notificationsRef, orderBy("createdAt", "desc"), limit(limitCount)),
			(snapshot) => {
				const notifications: Notification[] = [];
				let unread = 0;
				snapshot.docs.forEach((doc) => {
					const data = doc.data();
					notifications.push({ id: doc.id, ...data } as Notification);
					if (!data.isRead) unread++;
				});
				setNotifications(notifications);
				setUnreadCount(unread);
				setLoading(false);
			},
			(error) => {
				console.error("Notification listener error:", error);
				setLoading(false);
			},
		);

		return () => unsubscribe();
	}, [userId, limitCount]);

	const markAsRead = async (notificationId: string) => {
		if (!userId) return;
		await updateDoc(doc(db, "users", userId, "notifications", notificationId), {
			isRead: true,
		});
	};

	const markAllAsRead = async () => {
		if (!userId) return;
		const batch = writeBatch(db);
		notifications
			.filter((n) => !n.isRead)
			.forEach((n) => {
				batch.update(doc(db, "users", userId, "notifications", n.id), {
					isRead: true,
				});
			});
		await batch.commit();
	};

	const deleteNotification = async (notificationId: string) => {
		if (!userId) return;
		await deleteDoc(doc(db, "users", userId, "notifications", notificationId));
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
