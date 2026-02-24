# Filmnet Telegram Bot

ربات تلگرام برای دادن اشتراک و بلیت سینما آنلاین (API اسکرت‌نت). کاربر فقط **شماره موبایل هدف** را می‌فرستد؛ لاگین به اسکرت‌نت با **یک یوزر/پس ادمین ثابت** از env انجام می‌شود (ربطی به آن شماره ندارد).

**هم روی Vercel هم لوکال** با همان کد کار می‌کند.

## جریان کار

1. کاربر شماره موبایلی که می‌خواهد به آن اشتراک/بلیت داده شود را می‌فرستد → اعتبارسنجی
2. انتخاب نوع: **اشتراک** یا **بلیت سینما آنلاین**
3. انتخاب از لیست ثابت (catalog.ts) → صدا زدن API با توکن ادمین و همان msisdn

## ساختار پروژه

```
├── api/
│   └── telegram.ts      # وب‌هوک تلگرام
├── src/
│   ├── phone.ts         # نرمال و اعتبار موبایل ایران
│   ├── catalog.ts       # لیست ثابت اشتراک و بلیت (همینجا عوض کن)
│   ├── scratnet.ts      # لاگین ادمین از env + assign subscription / user-ticket
│   ├── telegram.ts      # ارسال پیام و دکمه‌های اینلاین
│   └── keyboards.ts     # ساخت کیبوردها
├── package.json
├── tsconfig.json
├── vercel.json
└── .env.example
```

## متغیرهای محیط

| متغیر | الزامی | توضیح |
|--------|--------|--------|
| `TELEGRAM_BOT_TOKEN` | بله | توکن ربات از @BotFather |
| `TELEGRAM_WEBHOOK_SECRET` | خیر | در صورت تنظیم، هدر `X-Telegram-Bot-Api-Secret-Token` چک می‌شود |
| `SCRATNET_ADMIN_MSISDN` | بله | شماره موبایل ادمین اسکرت‌نت (مثلاً 09381234567) |
| `SCRATNET_ADMIN_PASSWORD` | بله | رمز عبور همان ادمین — ربطی به شماره‌ای که کاربر می‌فرستد نداره |

## اجرای محلی

همان کد بدون تغییر روی لوکال هم اجرا می‌شود:

```bash
npm install
cp .env.example .env
# همه متغیرها را در .env پر کن: TELEGRAM_BOT_TOKEN، SCRATNET_ADMIN_MSISDN، SCRATNET_ADMIN_PASSWORD
npm run dev
```

سرور روی `http://localhost:3000` بالا می‌آید و اندپوینت وب‌هوک: `http://localhost:3000/api/telegram`.

**برای اینکه تلگرام به لوکال درخواست بفرستد** باید آدرس عمومی داشته باشی (مثلاً با [ngrok](https://ngrok.com)):

```bash
ngrok http 3000
```

آدرس HTTPS که ngrok می‌دهد (مثلاً `https://abc123.ngrok.io`) را در setWebhook بگذار؛ بعد از تست می‌توانی دوباره webhook را به آدرس Vercel برگردانی.

## تنظیم وب‌هوک

- **روی Vercel:** آدرس پروژه‌ات مثلاً `https://your-project.vercel.app`
- **روی لوکال (با ngrok):** آدرس ngrok مثلاً `https://abc123.ngrok.io`

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<آدرس>/api/telegram&secret_token=<SECRET>"
```
(اگر `TELEGRAM_WEBHOOK_SECRET` نگذاشتی، `&secret_token=...` را حذف کن.)

## دپلوی روی Vercel

1. ریپو را به Vercel متصل کنید.
2. متغیرهای محیط را تنظیم کنید: `TELEGRAM_BOT_TOKEN`، `SCRATNET_ADMIN_MSISDN`، `SCRATNET_ADMIN_PASSWORD` و در صورت نیاز `TELEGRAM_WEBHOOK_SECRET`.
3. دپلوی کنید و همان آدرس را در setWebhook قرار دهید.

## لاگین اسکرت‌نت

- یک **توکن ادمین** با `SCRATNET_ADMIN_MSISDN` و `SCRATNET_ADMIN_PASSWORD` از env گرفته می‌شود و در حافظه کش می‌شود (حدود ۵۰ دقیقه).
- برای هر درخواست اشتراک/بلیت از همین توکن استفاده می‌شود؛ شماره‌ای که کاربر در ربات وارد می‌کند فقط همان msisdn هدف است که به آن اشتراک/بلیت داده می‌شود.

## APIهای اسکرت‌نت استفاده‌شده

- **ورود ادمین**: `POST /login/LoginByPassword` با `{ msisdn, password }` از env → توکن
- **تخصیص اشتراک**: `POST /subscription-service/subscriptions/{msisdn}/subscription-plans` با `{ subscriptionPlanId }`
- **صدور بلیت سینما**: `POST /subscription-service/cinema-online/{msisdn}/user-ticket` با `{ msisdn, ticketId, price: 0, ... }`

## License

MIT
