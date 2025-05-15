import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Filter } from "lucide-react";

export default function HomePage() {
  // Mock styles for the filter dropdown. Replace with actual data as needed.
  const styles = [
    { value: "all", label: "Tous les styles" },
    { value: "ipa", label: "IPA" },
    { value: "stout", label: "Stout" },
    { value: "lager", label: "Lager" },
    { value: "pale_ale", label: "Pale Ale" },
    { value: "porter", label: "Porter" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Actions Bar */}
      <div className="flex justify-end items-center space-x-3 pt-2">
        <Select>
          <SelectTrigger className="w-auto md:w-[200px] text-sm">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filtrer par style" />
          </SelectTrigger>
          <SelectContent>
            {styles.map((style) => (
              <SelectItem key={style.value} value={style.value} className="text-sm">
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="text-sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Créer une recette
        </Button>
      </div>

      {/* Main Content Area - Empty State */}
      <Card className="w-full shadow-sm">
        <CardContent className="py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-5">
          <h2 className="text-xl md:text-2xl font-medium text-foreground">
            Aucune recette enregistrée.
          </h2>
          <p className="text-muted-foreground max-w-xs text-sm md:text-base">
            Commencez par créer votre première recette !
          </p>
          <Button size="lg" className="mt-4 text-base">
            <PlusCircle className="mr-2 h-5 w-5" />
            Créer une recette
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
