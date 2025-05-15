
// 'use server';

// import fs from 'fs/promises';
// import path from 'path';
// import { revalidatePath } from 'next/cache';

// const recipesDirectory = path.join(process.cwd(), 'public/recipes');

// export async function deleteRecipeAction(slug: string): Promise<{ success: boolean; message?: string }> {
//   if (!slug || typeof slug !== 'string') {
//     return { success: false, message: 'Invalid recipe identifier provided.' };
//   }

//   const fullPath = path.join(recipesDirectory, `${slug}.xml`);

//   try {
//     // Check if file exists before attempting to delete
//     await fs.access(fullPath);
//   } catch (error) {
//     console.warn(`Attempted to delete non-existent file: ${fullPath}`);
//     // Still proceed as if successful from UI perspective if file is already gone
//     // or treat as an error if strict file existence is required.
//     // For this case, let's consider it "successfully deleted" if it's not there.
//     revalidatePath('/');
//     return { success: true, message: 'Recipe file not found, considered deleted.' };
//   }

//   try {
//     await fs.unlink(fullPath);
//     revalidatePath('/'); // Revalidate the homepage to refresh the recipe list
//     return { success: true };
//   } catch (error) {
//     console.error(`Error deleting file ${fullPath}:`, error);
//     // Check if the error is because the file doesn't exist (ENOENT)
//     if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
//         revalidatePath('/');
//         return { success: true, message: 'Recipe file was already deleted.' };
//     }
//     return { success: false, message: `Failed to delete recipe: ${slug}.xml. Check server logs.` };
//   }
// }
