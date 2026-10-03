import { loadContent, validateContent } from './content.mjs';
validateContent(await loadContent());
console.log('Content valid: eight slots, preserved mission mappings, 40 missions and publication/evidence gates.');
