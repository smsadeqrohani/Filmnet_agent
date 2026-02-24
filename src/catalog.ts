/**
 * لیست ثابت اشتراک و بلیت سینما — فقط همین فایل را ویرایش کن.
 * id برای اشتراک = subscriptionPlanId، برای بلیت = ticketId (UUID).
 */

export interface CatalogItem {
  id: string;
  title: string;
}

/** پلن‌های اشتراک (subscriptionPlanId از سیستم اسکرت‌نت) */
export const subscriptionPlans: CatalogItem[] = [
  { id: '6e391fe2-2034-4844-9643-a677df226b3e', title: 'اشتراک ۱ ماهه' },
  { id: '3e9f3f32-5f7a-4220-95d9-bd5406eaf9ca', title: 'اشتراک ۳ ماهه' },
  { id: '27535ab0-db4f-4337-b999-13081b23c00c', title: 'اشتراک ۶ ماهه' },
];

/** بلیت‌های سینما آنلاین (ticketId از سیستم اسکرت‌نت) */
export const cinemaTickets: CatalogItem[] = [
  { id: '0fd9900f-85a0-4b29-a462-557fde56bfb7', title: 'پیشمرگ' },
  { id: '74b12153-aac7-4633-abbc-f3d32bb57735', title: 'لاله کبود' },
  { id: 'e9fb1f47-a91a-4a28-85c1-2f1a1ee3778c', title: 'تابستانی که برف آمد' },
  { id: '545a9e75-6a7e-43bb-a359-810e2cbf07a6', title: 'سینما شهر قصه' },
  { id: '26bc0fbf-f61b-4fc2-85a0-2169aa4a82ea', title: 'کج پیله' },
  { id: 'd00cced5-dc9e-467d-b708-307c82f1742a', title: 'زیبا صدایم کن' },
  { id: '646eb89d-6c44-449e-8587-be8dd2a12cd4', title: 'صددام' }

];

export function getSubscriptionPlans(): CatalogItem[] {
  return subscriptionPlans;
}

export function getCinemaTickets(): CatalogItem[] {
  return cinemaTickets;
}

export function getSubscriptionPlanById(planId: string): CatalogItem | undefined {
  return subscriptionPlans.find((p) => p.id === planId);
}

export function getCinemaTicketById(ticketId: string): CatalogItem | undefined {
  return cinemaTickets.find((t) => t.id === ticketId);
}
