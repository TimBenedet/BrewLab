
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Filter, Info } from "lucide-react";

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

  // Mocked recipes data for demonstration. Replace with actual data fetching.
  const recipes: any[] = []; // Simule une liste vide de recettes pour l'instant

  return (
    <div className="space-y-6">
      {/* Top Actions Bar */}
      <div className="flex justify-end items-center space-x-3 pt-2">
        <Select>
          <SelectTrigger className="group w-auto md:w-[200px] text-sm shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary-foreground" />
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

      {/* Main Content Area */}
      {recipes.length === 0 ? (
        <Card className="w-full shadow-sm border-border">
          <CardContent className="py-16 md:py-24 flex flex-col items-center justify-center text-center space-y-4">
            {/* Vous pouvez ajouter une icône ici si vous le souhaitez, par exemple : */}
            {/* <Info size={48} className="text-muted-foreground mb-4" /> */}
            <h2 className="text-xl md:text-2xl font-medium text-foreground">
              Aucune recette enregistrée.
            </h2>
            <p className="text-muted-foreground max-w-xs text-sm md:text-base">
              Commencez par créer votre première recette ou importez-en !
            </p>
            {/* Le bouton "Créer une recette" central a été enlevé comme demandé */}
          </CardContent>
        </Card>
      ) : (
        // Ici, vous mapperez sur vos recettes pour les afficher, par exemple avec RecipeCard
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)} */}
        </div>
      )}
    </div>
  );
}
