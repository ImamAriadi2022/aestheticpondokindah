import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import type { BranchWithSlug } from "../services/branchesService";

interface BranchCardProps {
  branch: BranchWithSlug;
}

export function BranchCard({ branch }: BranchCardProps) {
  return (
    <Card className="rounded-2xl border-border shadow-lg shadow-black/5 hover:shadow-xl transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-brand-charcoal">{branch.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 text-sm text-brand-warm-gray font-body">
          <MapPin className="w-4 h-4 text-brand-gold mt-0.5" />
          <div className="line-clamp-3">{branch.address}</div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link to={`/branches/${encodeURIComponent(branch.slug)}`}>
            <Button variant="outline" className="rounded-xl font-body">
              Lihat Detail <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link to={`/booking/new?branch=${encodeURIComponent(branch.id)}`}>
            <Button className="rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
              Booking Cabang Ini
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
