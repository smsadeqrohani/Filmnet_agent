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
  { id: 'd00cced5-dc9e-467d-b708-307c82f1742a', title: 'بلیت فیلم A' },
  { id: '00000000-0000-0000-0000-000000000000', title: 'بلیت فیلم B' },
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
