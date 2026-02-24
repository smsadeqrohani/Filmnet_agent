/**
 * Inline keyboard builders. لیست اشتراک و بلیت از catalog.ts می‌آید.
 */

import type { InlineKeyboardMarkup, InlineKeyboardButton } from './telegram.js';
import { getSubscriptionPlans, getCinemaTickets } from './catalog.js';

export function typeSelectionKeyboard(msisdn_989: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: 'اشتراک', callback_data: `type_sub_${msisdn_989}` }],
      [{ text: 'بلیت سینما آنلاین', callback_data: `type_cinema_${msisdn_989}` }],
    ],
  };
}

function packSubItem(planId: string, msisdn_989: string): string {
  const prefix = 'item_sub_';
  const suffix = `_${msisdn_989}`;
  if (prefix.length + planId.length + suffix.length <= 64) {
    return `${prefix}${planId}${suffix}`;
  }
  return `${prefix}${planId.slice(0, 64 - prefix.length - suffix.length)}${suffix}`;
}

export function subscriptionPlansKeyboard(msisdn_989: string): InlineKeyboardMarkup {
  const plans = getSubscriptionPlans();
  const buttons: InlineKeyboardButton[][] = plans.map((p) => [
    { text: p.title, callback_data: packSubItem(p.id, msisdn_989) },
  ]);
  buttons.push(
    [{ text: '⬅️ برگشت', callback_data: `back_type_${msisdn_989}` }],
    [{ text: 'لغو', callback_data: 'cancel_all' }]
  );
  return { inline_keyboard: buttons };
}

export function cinemaItemsKeyboard(msisdn_989: string): InlineKeyboardMarkup {
  const items = getCinemaTickets();
  const buttons: InlineKeyboardButton[][] = items.map((item) => [
    { text: item.title, callback_data: `item_cinema_${item.id}_${msisdn_989}` },
  ]);
  buttons.push(
    [{ text: '⬅️ برگشت', callback_data: `back_type_${msisdn_989}` }],
    [{ text: 'لغو', callback_data: 'cancel_all' }]
  );
  return { inline_keyboard: buttons };
}
