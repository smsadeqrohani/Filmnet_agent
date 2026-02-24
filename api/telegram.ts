/**
 * Vercel serverless webhook: شماره موبایل (هدف) → انتخاب نوع → اشتراک/بلیت.
 * لاگین اسکرت‌نت با یوزر/پس ادمین از env؛ ربطی به شماره‌ای که کاربر می‌فرستد ندارد.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { normalizeIranianMobile } from '../src/phone.js';
import { getCinemaTicketById } from '../src/catalog.js';
import { getAdminToken, assignSubscription, giveUserTicket } from '../src/scratnet.js';
import { sendMessage, answerCallbackQuery } from '../src/telegram.js';
import {
  typeSelectionKeyboard,
  subscriptionPlansKeyboard,
  cinemaItemsKeyboard,
} from '../src/keyboards.js';

// --- Telegram types ---
interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string };
  from?: { id: number };
  text?: string;
}

interface CallbackQuery {
  id: string;
  from: { id: number };
  message?: { message_id: number; chat: { id: number } };
  data?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: CallbackQuery;
}

// --- Messages (Persian) ---
const MSG_WELCOME =
  'سلام. شماره موبایلی که می‌خواهید اشتراک یا بلیت به آن داده شود را وارد کنید (مثال: ۰۹۱۲۱۲۳۴۵۶۷).';
const MSG_INVALID_MOBILE =
  'شماره موبایل معتبر نیست. لطفاً یک شماره موبایل ایرانی وارد کنید.';
const MSG_ADMIN_LOGIN_FAIL = 'خطا در ورود به سیستم. لطفاً بعداً تلاش کنید.';
const MSG_CHOOSE_TYPE = 'چه نوع فعال‌سازی می‌خواهید؟';
const MSG_USE_BUTTONS = 'لطفاً از دکمه‌های زیر استفاده کنید.';
const MSG_CANCELLED = 'عملیات لغو شد. برای شروع مجدد /start را بزنید.';
const MSG_SUCCESS = 'فعال‌سازی با موفقیت انجام شد.';
const MSG_FAILURE = 'فعال‌سازی انجام نشد. لطفاً بعداً تلاش کنید.';
const MSG_ERROR = 'خطایی رخ داد. لطفاً دوباره /start را بزنید.';

function getChatId(update: TelegramUpdate): number | null {
  if (update.message?.chat?.id) return update.message.chat.id;
  if (update.callback_query?.message?.chat?.id) return update.callback_query.message.chat.id;
  return null;
}

function verifyWebhookSecret(req: VercelRequest): boolean {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) return true;
  const header = req.headers['x-telegram-bot-api-secret-token'];
  return typeof header === 'string' && header === secret;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!verifyWebhookSecret(req)) {
    console.warn('[webhook] Invalid or missing secret token');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  let body: TelegramUpdate;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const chatId = getChatId(body);
  if (chatId == null) {
    return res.status(200).json({ ok: true });
  }

  try {
    if (body.callback_query) {
      await handleCallbackQuery(chatId, body.callback_query);
    } else if (body.message?.text) {
      await handleMessage(chatId, body.message);
    }
  } catch (e) {
    console.error('[webhook] handler error', e);
    try {
      await sendMessage(chatId, MSG_ERROR);
    } catch (_) {}
  }

  return res.status(200).json({ ok: true });
}

async function handleMessage(chatId: number, message: TelegramMessage): Promise<void> {
  const text = (message.text ?? '').trim();

  if (text === '/start') {
    await sendMessage(chatId, MSG_WELCOME);
    return;
  }

  if (text === '/cancel') {
    await sendMessage(chatId, MSG_CANCELLED);
    return;
  }

  const normalized = normalizeIranianMobile(text);
  if (!normalized) {
    await sendMessage(chatId, MSG_INVALID_MOBILE);
    return;
  }
  await sendMessage(chatId, MSG_CHOOSE_TYPE, {
    replyMarkup: typeSelectionKeyboard(normalized),
  });
}

async function handleCallbackQuery(chatId: number, query: CallbackQuery): Promise<void> {
  const data = query.data ?? '';
  await answerCallbackQuery(query.id);

  if (data === 'cancel_all') {
    await sendMessage(chatId, MSG_CANCELLED);
    return;
  }

  if (data.startsWith('back_type_')) {
    const msisdn_989 = data.slice('back_type_'.length);
    await sendMessage(chatId, MSG_CHOOSE_TYPE, {
      replyMarkup: typeSelectionKeyboard(msisdn_989),
    });
    return;
  }

  if (data.startsWith('type_sub_')) {
    const msisdn_989 = data.slice('type_sub_'.length);
    await sendMessage(chatId, 'اشتراک مورد نظر را انتخاب کنید:', {
      replyMarkup: subscriptionPlansKeyboard(msisdn_989),
    });
    return;
  }

  if (data.startsWith('type_cinema_')) {
    const msisdn_989 = data.slice('type_cinema_'.length);
    await sendMessage(chatId, 'بلیت سینما آنلاین مورد نظر را انتخاب کنید:', {
      replyMarkup: cinemaItemsKeyboard(msisdn_989),
    });
    return;
  }

  if (data.startsWith('item_sub_')) {
    const parts = data.split('_');
    if (parts.length < 4) {
      await sendMessage(chatId, MSG_ERROR);
      return;
    }
    const planId = parts.slice(2, -1).join('_');
    const msisdn_989 = parts[parts.length - 1];
    const token = await getAdminToken();
    if (!token) {
      await sendMessage(chatId, MSG_ADMIN_LOGIN_FAIL);
      return;
    }
    const result = await assignSubscription(token, msisdn_989, planId);
    const replyText = result.success
      ? MSG_SUCCESS
      : (result.message ?? MSG_FAILURE);
    await sendMessage(chatId, replyText);
    await sendMessage(chatId, MSG_WELCOME);
    return;
  }

  if (data.startsWith('item_cinema_')) {
    const parts = data.split('_');
    if (parts.length < 4) {
      await sendMessage(chatId, MSG_ERROR);
      return;
    }
    const ticketId = parts[2];
    const msisdn_989 = parts[3];
    const token = await getAdminToken();
    if (!token) {
      await sendMessage(chatId, MSG_ADMIN_LOGIN_FAIL);
      return;
    }
    const item = getCinemaTicketById(ticketId);
    if (!item) {
      await sendMessage(chatId, MSG_ERROR);
      return;
    }
    const result = await giveUserTicket(token, msisdn_989, ticketId);
    const replyText = result.success
      ? MSG_SUCCESS
      : (result.message ?? MSG_FAILURE);
    await sendMessage(chatId, replyText);
    await sendMessage(chatId, MSG_WELCOME);
    return;
  }

  await sendMessage(chatId, MSG_USE_BUTTONS);
}
