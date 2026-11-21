//canusenoti -> load noti module -> init noti -> setup -> req permissions

import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

type NotificationModule = typeof import("expo-notifications");

// expo go - your code is running on expo go -
// android - Expo go

// expo go + android - block noti
// dev build + android - allow noti

function canUseNotifications(): boolean {
  return !(isRunningInExpoGo() && Platform.OS === "android");
}

async function loadNotfications(): Promise<NotificationModule | null> {
  if (!canUseNotifications()) {
    return null;
  }

  try {
    return await import("expo-notifications");
  } catch {
    return null;
  }
}

export async function initNotifications(): Promise<void> {
  const Notifications = await loadNotfications();

  if (!Notifications) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  await setupNotificationChannel();
}

export async function setupNotificationChannel(): Promise<void> {
  const Notifications = await loadNotfications();

  if (!Notifications) {
    return;
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("meal-actions", {
        name: "Meal Actions",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#f93716",
      });
    }
  } catch {}
}

export async function requestNotificationsPermissions(): Promise<boolean> {
  const Notifications = await loadNotfications();
  if (!Notifications) {
    return false;
  }

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();

    return status === "granted";
  } catch {
    return false;
  }
}

async function showLocalNotification(
  title: string,
  body: string,
): Promise<void> {
  const Notifications = await loadNotfications();
  if (!Notifications) {
    return;
  }

  const granted = await requestNotificationsPermissions();

  if (!granted) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        ...(Platform.OS === "android" ? { channelId: "meal-actions" } : {}),
      },
      trigger: null,
    });
  } catch {}
}

export async function showMealSavedNotification(
  mealName: string,
): Promise<void> {
  await showLocalNotification(
    "Meal Saved",
    `${mealName} was added to your saved meals.`,
  );
}

export async function showMealDeleteNotification(
  mealName: string,
): Promise<void> {
  await showLocalNotification(
    "Meal Removed",
    `${mealName} was removed from your saved meals.`,
  );
}
