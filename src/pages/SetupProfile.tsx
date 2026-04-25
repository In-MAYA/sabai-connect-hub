import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";

export default function SetupProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="ตั้งค่าโปรไฟล์" back />
      <div className="px-6 pt-6 flex flex-col items-center">
        <button className="relative h-28 w-28 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow group">
          <span className="font-display text-3xl font-bold text-primary-foreground">
            {name.trim() ? name.trim()[0].toUpperCase() : "?"}
          </span>
          <div className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-card border-2 border-background flex items-center justify-center shadow-soft">
            <Camera className="h-4 w-4 text-primary" />
          </div>
        </button>
        <p className="mt-3 text-sm text-muted-foreground">แตะเพื่อเลือกรูปโปรไฟล์</p>
      </div>

      <div className="px-6 mt-8 space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">ชื่อที่แสดง</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น สบาย ใจดี"
            className="mt-1.5 h-14 rounded-2xl bg-muted/60 border-input text-base font-medium"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Bio (ไม่บังคับ)</label>
          <Input
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="แนะนำตัวสั้นๆ ✨"
            className="mt-1.5 h-14 rounded-2xl bg-muted/60 border-input text-base font-medium"
          />
        </div>

        <Button
          onClick={() => navigate("/chats")}
          disabled={!name.trim()}
          className="w-full h-14 rounded-2xl bg-gradient-primary text-base font-semibold shadow-glow mt-4"
        >
          เริ่มใช้งาน SABAI-CHAT
        </Button>
      </div>
    </div>
  );
}
