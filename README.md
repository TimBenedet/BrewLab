
# BrewLab - Beer Recipe Manager & Viewer

BrewLab is a web application designed for homebrewers and beer enthusiasts to manage, view, and create beer recipes. It parses BeerXML files, displays them in a user-friendly interface, and allows for detailed viewing of recipe specifics, including ingredients, stats, and brewing procedures. The application is built to be a static site, making it easy to host on platforms like GitHub Pages or Vercel.

## Features

*   **Recipe Listing**: Displays a list of all available beer recipes.
*   **Dynamic Filtering**: Filter recipes by style on the main "My Recipes" page.
*   **Detailed Recipe View**:
    *   Comprehensive display of recipe metadata (name, style, author, batch size, boil time, efficiency).
    *   Target statistics (OG, FG, ABV, IBU, Color/SRM) with visual progress gauges.
    *   SRM-based beer color visualization next to the recipe title using a dynamically colored `GlassWater` icon.
    *   Clear tables for Fermentables, Hops, Yeast, and Miscellaneous Ingredients.
    *   Two-tab layout for "Recipe Details" and "Recipe Steps".
*   **Recipe Steps from Markdown**:
    *   The "Recipe Steps" tab displays detailed brewing procedures parsed from a corresponding `.md` file for each recipe.
    *   Supports structured Markdown with sections for Brewer's Notes, Mashing, Boil, Whirlpool, Cooling, Fermentation, and Bottling/Kegging.
*   **Recipe Creation Form**:
    *   An intuitive form to create new beer recipes, including key indicators, general information, and dynamic lists for grains, hops, other ingredients, and yeast.
    *   Includes a fermentation schedule date picker and a section for additional notes.
    *   *(Note: Currently, saving a new recipe from the UI simulates the action by logging data to the console. To persist a new recipe, its XML and MD files need to be manually added to the `public/recipes` directory and the site rebuilt.)*
*   **Responsive Design**: Adapts to various screen sizes, from mobile devices to desktops, ensuring a good user experience across platforms.
*   **Static Site Generation**: Optimized for static export, making it fast and easy to deploy on services like GitHub Pages or Vercel.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **UI Library**: [React](https://reactjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **XML Parsing**: `fast-xml-parser`
*   **Markdown Rendering**: `react-markdown` with `remark-gfm`

## File Structure for Recipes

To add a new recipe or manage existing ones, follow this structure within the `public/recipes/` directory:

Each recipe must reside in its own subdirectory. The name of the subdirectory acts as the recipe's unique slug.

```
public/
└── recipes/
    ├── my-awesome-ipa/
    │   ├── my-awesome-ipa.xml  // BeerXML file for the recipe
    │   └── my-awesome-ipa.md   // Markdown file for brewing steps
    ├── another-great-stout/
    │   ├── another-great-stout.xml
    │   └── another-great-stout.md
    └── ... more recipes
```

*   **`[recipe-slug].xml`**: This is the BeerXML file containing the core recipe data (ingredients, quantities, stats, etc.).
*   **`[recipe-slug].md`**: This optional Markdown file contains the detailed brewing procedures. It should be structured with H2 headings for different phases (e.g., `## Brewer's Notes`, `## Mashing`, `## Boil`, `## Fermentation`, etc.) to be correctly parsed and displayed in the "Recipe Steps" tab.

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn or pnpm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
    cd YOUR_REPOSITORY_NAME
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

### Running in Development Mode

To start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) (or the port indicated in your terminal) in your browser to see the application.

### Adding New Recipes

1.  Create a new directory under `public/recipes/` named after your recipe's slug (e.g., `public/recipes/my-new-ale/`).
2.  Inside this new directory, add your `my-new-ale.xml` (BeerXML) file.
3.  (Optional) Add a `my-new-ale.md` file with detailed brewing steps, formatted with H2 headings for each section.
4.  If the development server is running, it should automatically pick up the new recipe. Otherwise, restart the server.

### Building for Production (Static Export)

To build the application for static deployment:

```bash
npm run build
```

This command will generate a static version of your site in the `out/` directory.

## Deployment

### Vercel (Recommended for Next.js)

1.  Push your code to a GitHub repository.
2.  Sign up or log in to [Vercel](https://vercel.com/).
3.  Import your GitHub repository into Vercel.
4.  Vercel will automatically detect it's a Next.js project and configure the build settings. Your `output: 'export'` configuration will be respected.
5.  Deploy! Vercel will handle CI/CD for subsequent pushes.

### GitHub Pages

1.  Ensure your `next.config.ts` has `output: 'export'`.
2.  Build your project: `npm run build`. This creates an `out` folder.
3.  Deploy the contents of the `out` folder to your `gh-pages` branch or configure GitHub Pages to serve from your main branch's `/docs` folder (if you move the `out` content there).
    *   You might need to configure `basePath` and `assetPrefix` in `next.config.ts` if your GitHub Pages site is served from a subdirectory (e.g., `https://username.github.io/repository-name/`).
    *   Add an empty `.nojekyll` file to your `public/` directory (it will be copied to `out/`) to prevent GitHub Pages from processing the site with Jekyll.

## Future Enhancements (Ideas)

*   Client-side brewing calculators (IBU, ABV, carbonation).
*   Brew day timer.
*   User-specific equipment profiles (using `localStorage`).
*   Personal notes on recipes (using `localStorage`).
*   Recipe comparison tool.
*   Advanced searching and sorting of recipes.

---

Happy Brewing! 🍻
