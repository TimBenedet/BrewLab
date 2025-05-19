
# BrewCrafter - Beer Recipe Manager & Viewer

BrewCrafter is a web application designed for homebrewers and beer enthusiasts to visualize and manage their beer recipes. Its primary function is to parse and display recipes formatted in **BeerXML**, presenting them in a user-friendly and detailed interface. It also includes a **BrewCrafter Label** tool to design simple beer labels. The application is built as a static site, making it easy to host on platforms like Vercel or GitHub Pages.

This project was developed with the assistance of AI tools, including **Gemini**, and built using **Firebase Studio**. It's optimized for easy deployment on **Vercel**.

## Core Features

*   **BeerXML Recipe Viewer**: Reads and parses BeerXML files to display comprehensive recipe details.
*   **Recipe Listing & Filtering**: Displays all available recipes from your collection with client-side filtering by style.
*   **Detailed Recipe View**:
    *   Comprehensive display of recipe metadata (name, style, author, batch size, boil time, efficiency).
    *   Target statistics (OG, FG, ABV, IBU, Color/SRM) with visual progress gauges.
    *   SRM-based beer color visualization next to the recipe title.
    *   Clear tables for Fermentables, Hops, Yeast, and Miscellaneous Ingredients.
    *   Two-tab layout for "Recipe Details" and "Recipe Steps".
*   **Recipe Steps from Markdown**: For each recipe, an optional corresponding `.md` file can provide detailed brewing procedures, which are parsed and displayed in organized sections (Mashing, Boil, Fermentation, etc.).
*   **BrewCrafter XML**: An intuitive form to build new beer recipes from scratch and download them as BeerXML files.
*   **BrewCrafter Label**: A tool to design simple front and back labels for your craft beer. Features include:
    *   Input fields for beer name, IBU, alcohol, volume, description, ingredients, brewing date, and location.
    *   Customization of background color, text color, and an optional background image.
    *   Live preview of both front and back labels.
    *   Ability to download the generated labels as PNG images.
*   **Responsive Design**: Adapts to various screen sizes for a good user experience on desktops, tablets, and mobile devices.
*   **Static Site Generation**: Optimized for static export (`output: 'export'` in Next.js config), making it fast and easy to deploy.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **UI Library**: [React](https://reactjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **XML Parsing**: `fast-xml-parser`
*   **Markdown Rendering**: `react-markdown` with `remark-gfm`
*   **Label Image Generation**: `html2canvas`

## Getting Started: Using This Project

You can easily use and customize this project for your own beer recipes. Here's how:

### 1. Prerequisites

*   Node.js (v18 or later recommended)
*   A GitHub account

### 2. Fork the Repository

*   Go to the GitHub repository page for this project: `[Link to your GitHub Repo - e.g., https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME]`
*   Click the "Fork" button in the top-right corner. This will create a copy of the repository under your own GitHub account.

### 3. Clone Your Forked Repository

*   On your GitHub account, navigate to the forked repository.
*   Click the "Code" button and copy the HTTPS or SSH clone URL.
*   Open your terminal or command prompt and run:
    ```bash
    git clone [URL you copied]
    cd [repository-name] # e.g., cd BrewCrafter
    ```

### 4. Install Dependencies

*   Once inside the project directory, install the necessary dependencies:
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

### 5. Add Your BeerXML Recipes

*   The application reads recipes from the `public/recipes/` directory.
*   For each recipe, create a new subdirectory named after your recipe's slug (e.g., `my-awesome-ipa`).
*   Inside this new subdirectory:
    *   Place your BeerXML file, naming it `[recipe-slug].xml` (e.g., `my-awesome-ipa.xml`).
    *   (Optional) Create a Markdown file named `[recipe-slug].md` (e.g., `my-awesome-ipa.md`) for detailed brewing steps. Structure this file with H2 headings for different phases (e.g., `## Mashing`, `## Boil`).

    Example structure:
    ```
    public/
    └── recipes/
        ├── my-awesome-ipa/
        │   ├── my-awesome-ipa.xml
        │   └── my-awesome-ipa.md
        ├── another-great-stout/
        │   ├── another-great-stout.xml
        │   └── another-great-stout.md
        └── ... more recipes
    ```

### 6. Run in Development Mode

*   To start the development server and see your recipes:
    ```bash
    npm run dev
    ```
*   Open [http://localhost:9002](http://localhost:9002) (or the port indicated in your terminal) in your browser.

### 7. Build for Production (Static Export)

*   When you're ready to deploy, build the static version of your site:
    ```bash
    npm run build
    ```
*   This command generates a static version of your site in the `out/` directory.

### 8. Deploy Your Site

**Vercel (Recommended for Next.js):**

1.  Push your forked and modified code (including your recipes in `public/recipes/`) to your GitHub repository.
2.  Sign up or log in to [Vercel](https://vercel.com/) (you can connect with your GitHub account).
3.  Import your forked GitHub repository into Vercel.
4.  Vercel will automatically detect it's a Next.js project. The `output: 'export'` configuration will be respected. Default settings are usually fine.
5.  Deploy! Vercel will handle CI/CD, automatically rebuilding and deploying your site whenever you push changes to your repository.

**GitHub Pages:**

1.  Ensure your `next.config.ts` has `output: 'export'`.
2.  Build your project: `npm run build`.
3.  Deploy the contents of the `out/` directory to your `gh-pages` branch or configure GitHub Pages in your repository settings to serve from your main branch's `/docs` folder (if you move the `out` content there).
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
