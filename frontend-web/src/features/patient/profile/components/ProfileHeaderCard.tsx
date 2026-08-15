import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { User, Sparkles } from "lucide-react";
import { type UserProfileData } from "../services/userProfileApi";

interface Props {
  profile: UserProfileData | null;
}

export default function ProfileHeaderCard({ profile }: Props) {
  if (!profile) return null;

  return (
    <Card className="rounded-2xl border-border bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/20 shadow-xs">
      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-2xl border border-brand-gold/20 shadow-xs">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-8 h-8" />
          )}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-brand-charcoal">{profile.name}</h2>
            {profile.membership?.tier && (
              <Badge className="bg-brand-gold text-white text-xs">
                <Sparkles className="w-3 h-3 mr-1" /> {profile.membership.tier} Member
              </Badge>
            )}
          </div>
          <p className="text-xs text-brand-warm-gray">{profile.email || profile.whatsapp || profile.phone}</p>
        </div>
      </CardContent>
    </Card>
  );
}
