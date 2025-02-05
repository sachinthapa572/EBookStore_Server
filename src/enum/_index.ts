import { ROLES } from "./role.enum";

export { ROLES };

//* The const object approach is more lightweight and preferred in modern TypeScript
//* Enums create additional reverse mappings which aren't always needed
//* Both provide type safety, but const objects with as const are more explicit about their immutability
//* Choose const objects when you don't need reverse mapping and want smaller compiled code
