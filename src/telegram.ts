/**
 * Telegram Bot API helpers: sendMessage, answerCallbackQuery, editMessageReplyMarkup/editMessageText.
 * Uses raw fetch to keep dependencies minimal and work reliably on Vercel serverless.
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  return token;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

async function telegramRequest<T>(
  method: string,
  body: Record<string, unknown>
): Promise<T> {
  const token = getBotToken();
  const url = `${TELEGRAM_API_BASE}${token}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[telegram] ${method} failed`, res.status, text);
    throw new Error(`Telegram API error: ${res.status}`);
  }
  const data = (await res.json()) as { ok: boolean; result?: T };
  if (!data.ok) {
    console.error('[telegram] ok=false', data);
    throw new Error('Telegram API returned ok: false');
  }
  return data.result as T;
}

/**
 * Send a text message to a chat. Optionally attach an inline keyboard.
 */
export async function sendMessage(
  chatId: number,
  text: string,
  options?: { replyMarkup?: InlineKeyboardMarkup; parseMode?: 'HTML' | 'Markdown' }
): Promise<void> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
  };
  if (options?.replyMarkup) body.reply_markup = options.replyMarkup;
  if (options?.parseMode) body.parse_mode = options.parseMode;
  await telegramRequest('sendMessage', body);
}

/**
 * Answer a callback_query to remove the loading state on the client.
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  options?: { text?: string; showAlert?: boolean }
): Promise<void> {
  await telegramRequest('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(options?.text && { text: options.text }),
    ...(options?.showAlert && { show_alert: options.showAlert }),
  });
}

/**
 * Edit only the reply markup of a message (e.g. to update inline buttons).
 */
export async function editMessageReplyMarkup(
  chatId: number,
  messageId: number,
  replyMarkup: InlineKeyboardMarkup
): Promise<void> {
  await telegramRequest('editMessageReplyMarkup', {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup,
  });
}

/**
 * Edit message text and optionally reply markup.
 */
export async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  options?: { replyMarkup?: InlineKeyboardMarkup }
): Promise<void> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
  };
  if (options?.replyMarkup) body.reply_markup = options.replyMarkup;
  await telegramRequest('editMessageText', body);
}
