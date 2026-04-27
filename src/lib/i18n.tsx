import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Lang = "lo" | "th" | "en" | "zh";

export type Country = {
  code: string; // ISO
  dial: string; // +xxx
  flag: string; // emoji
  nameKey: keyof typeof countryNames["en"];
  example: string;
  maxLen: number;
};

const countryNames = {
  lo: {
    LA: "ລາວ", TH: "ໄທ", CN: "ຈີນ", VN: "ຫວຽດນາມ", KH: "ກຳປູເຈຍ", MM: "ມຽນມາ",
    MY: "ມາເລເຊຍ", SG: "ສິງກະໂປ", ID: "ອິນໂດເນເຊຍ", PH: "ຟິລິບປິນ", JP: "ຍີ່ປຸ່ນ", KR: "ເກົາຫລີ",
    US: "ສະຫະລັດ", GB: "ສະຫະລາຊະອານາຈັກ", FR: "ຝະລັ່ງ", DE: "ເຢຍລະມັນ", AU: "ອອສເຕຣເລຍ", IN: "ອິນເດຍ",
  },
  th: {
    LA: "ลาว", TH: "ไทย", CN: "จีน", VN: "เวียดนาม", KH: "กัมพูชา", MM: "เมียนมา",
    MY: "มาเลเซีย", SG: "สิงคโปร์", ID: "อินโดนีเซีย", PH: "ฟิลิปปินส์", JP: "ญี่ปุ่น", KR: "เกาหลีใต้",
    US: "สหรัฐอเมริกา", GB: "สหราชอาณาจักร", FR: "ฝรั่งเศส", DE: "เยอรมนี", AU: "ออสเตรเลีย", IN: "อินเดีย",
  },
  en: {
    LA: "Laos", TH: "Thailand", CN: "China", VN: "Vietnam", KH: "Cambodia", MM: "Myanmar",
    MY: "Malaysia", SG: "Singapore", ID: "Indonesia", PH: "Philippines", JP: "Japan", KR: "South Korea",
    US: "United States", GB: "United Kingdom", FR: "France", DE: "Germany", AU: "Australia", IN: "India",
  },
  zh: {
    LA: "老挝", TH: "泰国", CN: "中国", VN: "越南", KH: "柬埔寨", MM: "缅甸",
    MY: "马来西亚", SG: "新加坡", ID: "印度尼西亚", PH: "菲律宾", JP: "日本", KR: "韩国",
    US: "美国", GB: "英国", FR: "法国", DE: "德国", AU: "澳大利亚", IN: "印度",
  },
} as const;

export const countries: Country[] = [
  { code: "LA", dial: "+856", flag: "🇱🇦", nameKey: "LA", example: "20 12 345 678", maxLen: 10 },
  { code: "TH", dial: "+66",  flag: "🇹🇭", nameKey: "TH", example: "81 234 5678",   maxLen: 10 },
  { code: "CN", dial: "+86",  flag: "🇨🇳", nameKey: "CN", example: "131 1234 5678", maxLen: 11 },
  { code: "VN", dial: "+84",  flag: "🇻🇳", nameKey: "VN", example: "912 345 678",   maxLen: 10 },
  { code: "KH", dial: "+855", flag: "🇰🇭", nameKey: "KH", example: "12 345 678",    maxLen: 9  },
  { code: "MM", dial: "+95",  flag: "🇲🇲", nameKey: "MM", example: "9 1234 5678",   maxLen: 10 },
  { code: "MY", dial: "+60",  flag: "🇲🇾", nameKey: "MY", example: "12 345 6789",   maxLen: 10 },
  { code: "SG", dial: "+65",  flag: "🇸🇬", nameKey: "SG", example: "8123 4567",     maxLen: 8  },
  { code: "ID", dial: "+62",  flag: "🇮🇩", nameKey: "ID", example: "812 3456 789",  maxLen: 11 },
  { code: "PH", dial: "+63",  flag: "🇵🇭", nameKey: "PH", example: "917 123 4567",  maxLen: 10 },
  { code: "JP", dial: "+81",  flag: "🇯🇵", nameKey: "JP", example: "90 1234 5678",  maxLen: 10 },
  { code: "KR", dial: "+82",  flag: "🇰🇷", nameKey: "KR", example: "10 1234 5678",  maxLen: 10 },
  { code: "US", dial: "+1",   flag: "🇺🇸", nameKey: "US", example: "201 555 0123",  maxLen: 10 },
  { code: "GB", dial: "+44",  flag: "🇬🇧", nameKey: "GB", example: "7400 123456",   maxLen: 10 },
  { code: "FR", dial: "+33",  flag: "🇫🇷", nameKey: "FR", example: "6 12 34 56 78", maxLen: 9  },
  { code: "DE", dial: "+49",  flag: "🇩🇪", nameKey: "DE", example: "151 23456789",  maxLen: 11 },
  { code: "AU", dial: "+61",  flag: "🇦🇺", nameKey: "AU", example: "412 345 678",   maxLen: 9  },
  { code: "IN", dial: "+91",  flag: "🇮🇳", nameKey: "IN", example: "98765 43210",   maxLen: 10 },
];

export const countryName = (lang: Lang, code: string): string =>
  (countryNames[lang] as Record<string, string>)[code] ?? code;

export const languages: { code: Lang; label: string; native: string; flag: string }[] = [
  { code: "lo", label: "Lao",     native: "ລາວ",  flag: "🇱🇦" },
  { code: "th", label: "Thai",    native: "ไทย",  flag: "🇹🇭" },
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "zh", label: "Chinese", native: "中文",  flag: "🇨🇳" },
];

type Dict = Record<string, string>;

const dict: Record<Lang, Dict> = {
  lo: {
    "auth.tagline": "ສົນທະນາ · ໂທ · ໂຊຊຽວ · ຊື້ສິນຄ້າ — ຄົບວົງຈອນ 💙",
    "auth.title": "ເຂົ້າສູ່ລະບົບ",
    "auth.subtitle": "ພວກເຮົາຈະສົ່ງລະຫັດ OTP ໄປຫາເບີຂອງເຈົ້າ",
    "auth.phone": "ເບີໂທລະສັບ",
    "auth.country": "ປະເທດ",
    "auth.send": "ສົ່ງລະຫັດ OTP",
    "auth.or": "ຫຼື",
    "auth.privacy": "ພວກເຮົາເຂົ້າລະຫັດຂໍ້ຄວາມຂອງເຈົ້າແບບ end-to-end ເພື່ອຄວາມເປັນສ່ວນຕົວ",
    "auth.language": "ພາສາ",
    "country.search": "ຄົ້ນຫາປະເທດ...",
    "country.select": "ເລືອກປະເທດ",
    "lang.select": "ເລືອກພາສາ",
    "common.cancel": "ຍົກເລີກ",
    "otp.title": "ຢືນຢັນຕົວຕົນ",
    "otp.sentTo": "ສົ່ງລະຫັດ 6 ຫລັກໄປທີ່",
    "otp.resendIn": "ຂໍລະຫັດໃໝ່ໃນອີກ",
    "otp.resend": "ສົ່ງລະຫັດອີກຄັ້ງ",
    "otp.sending": "ກຳລັງສົ່ງ...",
    "otp.locked": "ຂໍລະຫັດເກີນກຳນົດ ກະລຸນາລໍຖ້າ",
    "otp.attempts": "ສົ່ງແລ້ວ {n}/{m} ຄັ້ງ",
    "otp.verify": "ຢືນຢັນ",
  },
  th: {
    "auth.tagline": "แชท · โทร · โซเชียล · ช็อปปิ้ง — ครบจบในแอปเดียว 💙",
    "auth.title": "เข้าสู่ระบบ",
    "auth.subtitle": "เราจะส่งรหัส OTP ไปยังเบอร์ของคุณ",
    "auth.phone": "เบอร์โทรศัพท์",
    "auth.country": "ประเทศ",
    "auth.send": "ส่งรหัส OTP",
    "auth.or": "หรือ",
    "auth.privacy": "เราเข้ารหัสข้อความของคุณแบบ end-to-end เพื่อความเป็นส่วนตัว",
    "auth.language": "ภาษา",
    "country.search": "ค้นหาประเทศ...",
    "country.select": "เลือกประเทศ",
    "lang.select": "เลือกภาษา",
    "common.cancel": "ยกเลิก",
    "otp.title": "ยืนยันตัวตน",
    "otp.sentTo": "ส่งรหัส 6 หลักไปที่",
    "otp.resendIn": "ขอรหัสใหม่ในอีก",
    "otp.resend": "ส่งรหัสอีกครั้ง",
    "otp.sending": "กำลังส่ง...",
    "otp.locked": "ขอรหัสเกินกำหนด กรุณารอสักครู่",
    "otp.attempts": "ส่งแล้ว {n}/{m} ครั้ง",
    "otp.verify": "ยืนยัน",
  },
  en: {
    "auth.tagline": "Chat · Call · Social · Shop — all in one app 💙",
    "auth.title": "Sign in",
    "auth.subtitle": "We'll send an OTP code to your number",
    "auth.phone": "Phone number",
    "auth.country": "Country",
    "auth.send": "Send OTP code",
    "auth.or": "or",
    "auth.privacy": "Your messages are end-to-end encrypted for privacy",
    "auth.language": "Language",
    "country.search": "Search country...",
    "country.select": "Select country",
    "lang.select": "Select language",
    "common.cancel": "Cancel",
    "otp.title": "Verify identity",
    "otp.sentTo": "A 6-digit code was sent to",
    "otp.resendIn": "Resend code in",
    "otp.resend": "Resend code",
    "otp.sending": "Sending...",
    "otp.locked": "Too many requests — please wait",
    "otp.attempts": "Sent {n}/{m} times",
    "otp.verify": "Verify",
  },
  zh: {
    "auth.tagline": "聊天 · 通话 · 社交 · 购物 — 一应俱全 💙",
    "auth.title": "登录",
    "auth.subtitle": "我们将向您的号码发送验证码",
    "auth.phone": "手机号码",
    "auth.country": "国家",
    "auth.send": "发送验证码",
    "auth.or": "或",
    "auth.privacy": "您的消息端到端加密,保护您的隐私",
    "auth.language": "语言",
    "country.search": "搜索国家...",
    "country.select": "选择国家",
    "lang.select": "选择语言",
    "common.cancel": "取消",
    "otp.title": "验证身份",
    "otp.sentTo": "6 位验证码已发送至",
    "otp.resendIn": "重新发送倒计时",
    "otp.resend": "重新发送",
    "otp.sending": "发送中...",
    "otp.locked": "请求次数过多,请稍候",
    "otp.attempts": "已发送 {n}/{m} 次",
    "otp.verify": "确认",
  },
};

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  country: Country;
  setCountry: (c: Country) => void;
};

const Ctx = createContext<I18nCtx | null>(null);

const STORAGE_LANG = "sabai_lang";
const STORAGE_COUNTRY = "sabai_country";

const detectLang = (): Lang => {
  if (typeof window === "undefined") return "lo";
  const saved = localStorage.getItem(STORAGE_LANG) as Lang | null;
  if (saved && dict[saved]) return saved;
  return "lo"; // default Lao
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const [country, setCountryState] = useState<Country>(() => {
    if (typeof window === "undefined") return countries[0];
    const saved = localStorage.getItem(STORAGE_COUNTRY);
    return countries.find((c) => c.code === saved) ?? countries[0];
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_LANG, lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem(STORAGE_COUNTRY, country.code);
  }, [country]);

  const value = useMemo<I18nCtx>(
    () => ({
      lang,
      setLang: setLangState,
      t: (k: string, vars?: Record<string, string | number>) => {
        let s = dict[lang][k] ?? dict.en[k] ?? k;
        if (vars) for (const [key, val] of Object.entries(vars)) s = s.split(`{${key}}`).join(String(val));
        return s;
      },
      country,
      setCountry: setCountryState,
    }),
    [lang, country],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
