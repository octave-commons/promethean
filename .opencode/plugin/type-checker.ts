// import type { Plugin } from '@opencode-ai/plugin';

// export const TypeCheckerPlugin: Plugin = async ({ $ }) => {
//   // Helper function to determine if a file should be type checked
//   function shouldTypeCheckFile(filePath: string): boolean {
//     const typeCheckableExtensions = [
//       '.ts',
//       '.tsx',
//       '.js',
//       '.jsx', // TypeScript/JavaScript
//       '.clj',
//       '.cljs',
//       '.cljc', // Clojure
//       '.edn',
//       '.bb', // Clojure data/babashka
//     ];

//     // Also check for specific config files
//     const specialFiles = ['shadow-cljs.edn', 'deps.edn', 'bb.edn'];

//     const fileName = filePath.split('/').pop() || '';

//     return (
//       typeCheckableExtensions.some((ext) => filePath.endsWith(ext)) ||
//       specialFiles.includes(fileName)
//     );
//   }

//   // Helper function to detect project type and choose appropriate type checker
//   function getTypeChecker(filePath: string): string {
//     if (
//       filePath.endsWith('.clj') ||
//       filePath.endsWith('.cljs') ||
//       filePath.endsWith('.cljc') ||
//       filePath.endsWith('.edn') ||
//       filePath.endsWith('shadow-cljs.edn')
//     ) {
//       return 'clj-kondo';
//     }

//     if (filePath.endsWith('.bb')) {
//       return 'babashka';
//     }

//     if (
//       filePath.endsWith('.ts') ||
//       filePath.endsWith('.tsx') ||
//       filePath.endsWith('.js') ||
//       filePath.endsWith('.jsx')
//     ) {
//       return 'typescript';
//     }

//     return 'none';
//   }

//   // Helper function to run type checker based on file type
//   async function runTypeChecker(filePath: string): Promise<{
//     success: boolean;
//     output: string;
//     errors: string[];
//     warnings: string[];
//   }> {
//     const checker = getTypeChecker(filePath);

//     try {
//       let result;

//       switch (checker) {
//         case 'typescript':
//           result = await $`pnpm tsc --noEmit --skipLibCheck ${filePath}`.text();
//           break;

//         case 'clj-kondo':
//           result = await $`clj-kondo --lint ${filePath}`.text();
//           break;

//         case 'babashka':
//           result = await $`bb --check ${filePath}`.text();
//           break;

//         case 'shadow-cljs':
//           result = await $`npx shadow-cljs compile app`.text();
//           break;

//         default:
//           return {
//             success: true,
//             output: `No type checker available for ${filePath}`,
//             errors: [],
//             warnings: [],
//           };
//       }

//       // Parse results to extract errors and warnings
//       const lines = result.split('\n');
//       const errors: string[] = [];
//       const warnings: string[] = [];

//       lines.forEach((line: string) => {
//         if (line.toLowerCase().includes('error') || line.includes('✗')) {
//           errors.push(line);
//         } else if (line.toLowerCase().includes('warning') || line.includes('⚠')) {
//           warnings.push(line);
//         }
//       });

//       return {
//         success: errors.length === 0,
//         output: result,
//         errors,
//         warnings,
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         output: error.stderr || error.stdout || error.message || 'Unknown error',
//         errors: [error.message || 'Type checker failed'],
//         warnings: [],
//       };
//     }
//   }

//   return {
//     'tool.execute.after': async (input, output) => {
//       // Only run type checking after write operations
//       if (input.tool === 'write') {
//         const filePath = (output as any).args?.filePath;

//         if (!filePath) {
//           console.log('No file path found in write operation');
//           return;
//         }

//         // Check if file should be type checked
//         if (!shouldTypeCheckFile(filePath)) {
//           return;
//         }

//         console.log(`Running type checking for ${filePath}...`);

//         try {
//           const result = await runTypeChecker(filePath);
//           if (!result.success) {
//             console.error(`Type errors found in ${filePath}:`);
//             console.error(result.output);

//             // Add type check results to metadata
//             (output as any).metadata = {
//               ...(output as any).metadata,
//               typeCheckErrors: result.errors,
//               typeCheckWarnings: result.warnings,
//               typeCheckOutput: result.output,
//               typeCheckSuccess: result.success,
//             };
//           } else {
//             console.log(`✅ No type errors in ${filePath}`);
//             (output as any).metadata = {
//               ...(output as any).metadata,
//               typeCheckSuccess: true,
//               typeCheckWarnings: result.warnings,
//             };
//           }
//         } catch (error) {
//           console.error(`Failed to run type checker on ${filePath}:`, error);
//           (output as any).metadata = {
//             ...(output as any).metadata,
//             typeCheckError: error instanceof Error ? error.message : 'Unknown error',
//             typeCheckSuccess: false,
//           };
//         }
//       }
//     },
//   };
// };
