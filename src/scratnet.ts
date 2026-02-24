/**
 * Scratnet API (api-v3.scratnet.com). لاگین با یوزر/پس ادمین از env؛ توکن کش می‌شود.
 */

const BASE = 'https://api-v3.scratnet.com';

const DEFAULT_HEADERS = {
  accept: 'application/json, text/plain, */*',
  'content-type': 'application/json',
  'user-agent': 'FilmnetBot/1.0',
};

const ADMIN_TOKEN_TTL_MS = 50 * 60 * 1000; // 50 دقیقه
let adminTokenCache: { token: string; expiresAt: number } | null = null;

async function loginByPassword(
  msisdn: string,
  password: string
): Promise<{ success: true; token: string } | { success: false; message: string }> {
  try {
    const res = await fetch(`${BASE}/login/LoginByPassword`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ msisdn, password }),
    });
    const data = (await res.json()) as {
      token?: string;
      accessToken?: string;
      data?: { token?: string };
      message?: string;
    };
    const token = data.token ?? data.accessToken ?? data.data?.token;
    if (token && typeof token === 'string') {
      return { success: true, token };
    }
    return {
      success: false,
      message: data.message ?? 'ورود ناموفق بود.',
    };
  } catch (e) {
    console.error('[scratnet] login error', e);
    return { success: false, message: 'خطا در ارتباط با سرور.' };
  }
}

/** توکن ادمین از env (SCRATNET_ADMIN_MSISDN + SCRATNET_ADMIN_PASSWORD). کش در حافظه. */
export async function getAdminToken(): Promise<string | null> {
  if (adminTokenCache && Date.now() < adminTokenCache.expiresAt) {
    return adminTokenCache.token;
  }
  const msisdn = process.env.SCRATNET_ADMIN_MSISDN;
  const password = process.env.SCRATNET_ADMIN_PASSWORD;
  if (!msisdn || !password) {
    console.error('[scratnet] SCRATNET_ADMIN_MSISDN or SCRATNET_ADMIN_PASSWORD not set');
    return null;
  }
  const result = await loginByPassword(msisdn.trim(), password);
  if (!result.success) {
    console.error('[scratnet] admin login failed', result.message);
    return null;
  }
  adminTokenCache = {
    token: result.token,
    expiresAt: Date.now() + ADMIN_TOKEN_TTL_MS,
  };
  return result.token;
}

/** Assign subscription to user: POST .../subscriptions/{msisdn}/subscription-plans */
export async function assignSubscription(
  token: string,
  msisdn_989: string,
  planId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(
      `${BASE}/subscription-service/subscriptions/${msisdn_989}/subscription-plans`,
      {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionPlanId: planId }),
      }
    );
    if (res.ok) return { success: true };
    const text = await res.text();
    let msg = 'فعال‌سازی اشتراک انجام نشد.';
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) msg = j.message;
    } catch (_) {}
    return { success: false, message: msg };
  } catch (e) {
    console.error('[scratnet] assignSubscription error', e);
    return { success: false, message: 'خطا در ارتباط با سرور.' };
  }
}

/** Give cinema online ticket to user. */
export async function giveUserTicket(
  token: string,
  msisdn_989: string,
  ticketId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(
      `${BASE}/subscription-service/cinema-online/${msisdn_989}/user-ticket`,
      {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          msisdn: msisdn_989,
          ticketId,
          price: 0,
          discountCode: '',
          issuerAdmin: '',
          startTime: new Date().toISOString(),
        }),
      }
    );
    if (res.ok) return { success: true };
    const text = await res.text();
    let msg = 'صدور بلیت انجام نشد.';
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) msg = j.message;
    } catch (_) {}
    return { success: false, message: msg };
  } catch (e) {
    console.error('[scratnet] giveUserTicket error', e);
    return { success: false, message: 'خطا در ارتباط با سرور.' };
  }
}
