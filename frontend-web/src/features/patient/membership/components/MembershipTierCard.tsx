import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Check, Sparkles } from "lucide-react";

export interface MembershipCardTier {
  id?: string;
  name: string;
  description?: string;
  benefits: string[];
}

interface Props {
  tier: MembershipCardTier;
  isCurrent?: boolean;
  onUpgrade?: () => void;
}

export default function MembershipTierCard({ tier, isCurrent }: Props) {
  return (
    <Card className={`rounded-2xl border-border transition-all ${isCurrent ? "ring-2 ring-brand-gold shadow-md" : ""}`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-brand-charcoal">{tier.name}</h3>
            {tier.description && <p className="text-xs text-muted-foreground">{tier.description}</p>}
          </div>
          {isCurrent && (
            <Badge className="bg-brand-gold text-white text-[10px]">
              <Sparkles className="w-3 h-3 mr-1" /> Level Anda
            </Badge>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t text-xs">
          {tier.benefits?.map((benefit: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-brand-warm-gray">
              <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
