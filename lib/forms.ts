export const latinDigits = (value: string) => value.replace(/[۰-۹]/g, n => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(n))).replace(/[٠-٩]/g, n => String('٠١٢٣٤٥٦٧٨٩'.indexOf(n)));
export const digits = (value: string) => latinDigits(value).replace(/\D/g, '');
export const money = (value: number) => value.toLocaleString('fa-IR');
export const passwordRules = (value: string, repeat: string) => [value.length >= 8, /[0-9۰-۹]/.test(value), /[a-zA-Z\u0600-\u06ff]/.test(value), value.length > 0 && value === repeat];
export const DEMO_OTP = '123456';
export const persianDigits = (value: string) => latinDigits(value).replace(/[0-9]/g, n => '۰۱۲۳۴۵۶۷۸۹'[Number(n)]);
