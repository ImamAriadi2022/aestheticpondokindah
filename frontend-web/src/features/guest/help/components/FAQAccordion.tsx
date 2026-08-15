import { Card, CardContent } from "@/shared/ui/card";
import { HelpCircle } from "lucide-react";
import type { FAQItem } from "../services/helpService";

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <div className="space-y-3">
      {items.map((faq, index) => (
        <Card key={index} className="rounded-xl border-gray-100 shadow-sm bg-white overflow-hidden hover:border-[#c9a24a]/30 transition-all">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a] shrink-0 mt-0.5">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{faq.q}</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{faq.a}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
