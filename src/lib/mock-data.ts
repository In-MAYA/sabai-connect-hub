// Mock data สำหรับ SABAI-CHAT V1

export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string; // gradient class
  verified?: boolean;
  online?: boolean;
};

export type Chat = {
  id: string;
  user: User;
  lastMessage: string;
  time: string;
  unread: number;
  isGroup?: boolean;
  members?: number;
  pinned?: boolean;
};

export type Attachment =
  | { kind: "image"; url: string; name?: string; size?: number }
  | { kind: "video"; url: string; poster?: string; name?: string; size?: number; duration?: string }
  | { kind: "file"; url?: string; name: string; size?: number; mime?: string };

export type Message = {
  id: string;
  senderId: string;
  text?: string;
  image?: string;
  voice?: { duration: string };
  attachment?: Attachment;
  uploadProgress?: number; // 0-100, undefined = done
  time: string;
  status?: "sent" | "delivered" | "read";
};

export type Post = {
  id: string;
  user: User;
  video: string; // image used as poster for mock
  caption: string;
  music: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  shop: string;
  shopAvatar: string;
  rating: number;
  sold: number;
  liked?: boolean;
  category: string;
};

export type Notification = {
  id: string;
  type: "like" | "comment" | "follow" | "order" | "message";
  user: User;
  text: string;
  time: string;
  read?: boolean;
};

const gradients = [
  "from-sky-400 to-cyan-500",
  "from-blue-400 to-indigo-500",
  "from-cyan-400 to-teal-500",
  "from-sky-500 to-blue-600",
  "from-indigo-400 to-sky-500",
  "from-teal-400 to-sky-500",
  "from-blue-500 to-cyan-400",
  "from-sky-300 to-blue-500",
];

export const currentUser: User = {
  id: "me",
  name: "คุณ สบาย",
  username: "@sabai_you",
  avatar: "from-sky-500 to-cyan-400",
  verified: true,
};

export const users: User[] = [
  { id: "u1", name: "พิมพ์ชนก", username: "@pim_ch", avatar: gradients[0], online: true, verified: true },
  { id: "u2", name: "ธนกร วงศ์ใหญ่", username: "@thana_k", avatar: gradients[1], online: true },
  { id: "u3", name: "Mei Lin", username: "@meilin", avatar: gradients[2], verified: true },
  { id: "u4", name: "อาทิตย์ ส.", username: "@artit", avatar: gradients[3], online: true },
  { id: "u5", name: "Sora Cafe", username: "@soracafe", avatar: gradients[4], verified: true },
  { id: "u6", name: "นัทธมน", username: "@nutta", avatar: gradients[5] },
  { id: "u7", name: "Kevin Tan", username: "@kevintan", avatar: gradients[6], online: true },
  { id: "u8", name: "ใบเตย", username: "@baitoey", avatar: gradients[7] },
];

export const chats: Chat[] = [
  { id: "c1", user: users[0], lastMessage: "เดี๋ยวเจอกันที่คาเฟ่นะ ☕", time: "12:42", unread: 2, pinned: true },
  { id: "c2", user: { ...users[1], name: "ทีมงาน SABAI 🚀" }, lastMessage: "ธนกร: ส่งไฟล์ดีไซน์ให้แล้ว", time: "12:30", unread: 5, isGroup: true, members: 8 },
  { id: "c3", user: users[2], lastMessage: "📷 รูปภาพ", time: "11:58", unread: 0 },
  { id: "c4", user: users[3], lastMessage: "ขอบคุณมากนะครับ 🙏", time: "10:12", unread: 0 },
  { id: "c5", user: users[4], lastMessage: "🎵 Voice message · 0:24", time: "เมื่อวาน", unread: 1 },
  { id: "c6", user: users[5], lastMessage: "พรุ่งนี้ว่างไหม?", time: "เมื่อวาน", unread: 0 },
  { id: "c7", user: users[6], lastMessage: "Got it! Talk soon.", time: "จันทร์", unread: 0 },
  { id: "c8", user: users[7], lastMessage: "💙💙💙", time: "อาทิตย์", unread: 0 },
];

export const messages: Record<string, Message[]> = {
  c1: [
    { id: "m1", senderId: "u1", text: "ไง! เป็นยังไงบ้างวันนี้ 😊", time: "12:30" },
    { id: "m2", senderId: "me", text: "สบายดีมากเลย ทำงานเสร็จพอดี", time: "12:31", status: "read" },
    { id: "m3", senderId: "u1", text: "เย้! ไปกินกาแฟกันไหม?", time: "12:32" },
    { id: "m4", senderId: "me", text: "เอาสิ ร้านไหนดี?", time: "12:33", status: "read" },
    { id: "m5", senderId: "u1", text: "Sora Cafe ใกล้ๆ ออฟฟิศ บรรยากาศดีมากกก", time: "12:35" },
    { id: "m6", senderId: "u1", voice: { duration: "0:18" }, time: "12:36" },
    { id: "m7", senderId: "me", text: "โอเคเลย! เจอกัน 13:30 นะ", time: "12:40", status: "read" },
    { id: "m8", senderId: "u1", text: "เดี๋ยวเจอกันที่คาเฟ่นะ ☕", time: "12:42" },
  ],
};

export const posts: Post[] = [
  {
    id: "p1",
    user: users[0],
    video: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80",
    caption: "วันสบายๆ ที่ทะเล 🌊✨ ใครอยากไปบ้าง?",
    music: "♪ Summer Vibes — Lofi",
    likes: 12400,
    comments: 234,
    shares: 89,
  },
  {
    id: "p2",
    user: users[4],
    video: "https://images.unsplash.com/photo-1442975631115-c4f7b05b8a2c?w=800&q=80",
    caption: "เมนูใหม่! Sky Latte 💙 หวานละมุน",
    music: "♪ Sora Cafe — Original",
    likes: 8900,
    comments: 567,
    shares: 145,
    liked: true,
  },
  {
    id: "p3",
    user: users[2],
    video: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&q=80",
    caption: "POV: คุณตื่นมาเจอวิวแบบนี้ ☁️",
    music: "♪ Cloud Nine — Indie Pop",
    likes: 23100,
    comments: 891,
    shares: 412,
  },
];

export const products: Product[] = [
  {
    id: "pr1",
    title: "หูฟัง Bluetooth รุ่น Sky Pro มาใหม่!",
    price: 1290,
    originalPrice: 1990,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    shop: "Sora Tech",
    shopAvatar: "from-sky-500 to-cyan-400",
    rating: 4.8,
    sold: 1240,
    category: "Electronics",
  },
  {
    id: "pr2",
    title: "เสื้อยืดผ้า Cotton Premium สีฟ้าพาสเทล",
    price: 390,
    originalPrice: 590,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    shop: "Blue Closet",
    shopAvatar: "from-blue-400 to-indigo-500",
    rating: 4.9,
    sold: 3210,
    liked: true,
    category: "Fashion",
  },
  {
    id: "pr3",
    title: "Sky Latte Original (เซตคู่)",
    price: 220,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80",
    shop: "Sora Cafe",
    shopAvatar: "from-cyan-400 to-teal-500",
    rating: 5.0,
    sold: 567,
    category: "Food",
  },
  {
    id: "pr4",
    title: "นาฬิกาข้อมือ Minimal Blue Edition",
    price: 2490,
    originalPrice: 3290,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    shop: "Time Co.",
    shopAvatar: "from-sky-500 to-blue-600",
    rating: 4.7,
    sold: 890,
    category: "Accessories",
  },
  {
    id: "pr5",
    title: "หมอนรองคอเดินทาง นุ่มสบาย",
    price: 159,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    shop: "Travel+",
    shopAvatar: "from-indigo-400 to-sky-500",
    rating: 4.6,
    sold: 2100,
    category: "Travel",
  },
  {
    id: "pr6",
    title: "Sticker Pack — SABAI Bear น่ารักสุด",
    price: 39,
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80",
    shop: "SABAI Store",
    shopAvatar: "from-sky-400 to-cyan-500",
    rating: 5.0,
    sold: 8421,
    category: "Stickers",
  },
];

export const notifications: Notification[] = [
  { id: "n1", type: "like", user: users[0], text: "ถูกใจโพสต์ของคุณ", time: "2 นาทีที่แล้ว" },
  { id: "n2", type: "comment", user: users[2], text: 'แสดงความเห็น: "สวยมากเลย!"', time: "15 นาทีที่แล้ว" },
  { id: "n3", type: "follow", user: users[4], text: "เริ่มติดตามคุณ", time: "1 ชั่วโมงที่แล้ว" },
  { id: "n4", type: "order", user: users[3], text: "สั่งซื้อสินค้าจากร้านของคุณ ฿1,290", time: "3 ชั่วโมงที่แล้ว" },
  { id: "n5", type: "message", user: users[1], text: "ส่งข้อความหาคุณ", time: "เมื่อวาน", read: true },
  { id: "n6", type: "like", user: users[6], text: "และอีก 24 คน ถูกใจโพสต์", time: "เมื่อวาน", read: true },
];

export const stories = [
  { id: "s0", user: currentUser, isYou: true },
  ...users.slice(0, 6).map((u) => ({ id: `s_${u.id}`, user: u, isYou: false })),
];
