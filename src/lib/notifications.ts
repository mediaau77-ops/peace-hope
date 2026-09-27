/**
 * Centralized Notification Engine
 * Peace & Hope SDA Platform
 */

import { getSupabaseClient, SUPABASE_TABLES } from './supabase';

export type NotificationType =
  | 'message'
  | 'mention'
  | 'incoming_call'
  | 'meeting_invite'
  | 'meeting_starting'
  | 'church_announcement'
  | 'prayer_request'
  | 'event_reminder'
  | 'sermon_published'
  | 'devotional_published';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link_url?: string;
  metadata?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export class NotificationService {
  /**
   * Request browser Web Push notification permissions
   */
  static async requestPushPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Show local system toast / Web Notification
   */
  static showLocalNotification(title: string, options?: NotificationOptions) {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } catch (err) {
        console.debug('Failed to show system notification:', err);
      }
    }
  }

  /**
   * Send notification to a recipient in Supabase
   */
  static async sendNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    linkUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('notifications').insert([
        {
          user_id: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          link_url: data.linkUrl || '',
          metadata: data.metadata || {},
          read: false,
          created_at: new Date().toISOString(),
        },
      ]);
      return !error;
    } catch (err) {
      console.debug('Error dispatching notification:', err);
      return false;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      return !error;
    } catch (err) {
      return false;
    }
  }

  /**
   * Mark all notifications read for user
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);
      return !error;
    } catch (err) {
      return false;
    }
  }
}
