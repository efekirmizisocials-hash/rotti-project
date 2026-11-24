import { Tag, TagType } from "../types";

export function parseTagFromString(tagString: string): Tag {
  const cleanLabel = tagString.substring(1).replace(/-+/g, " ");
  switch (tagString.charAt(0)) {
    case "@":
      return { label: cleanLabel, type: TagType.PERSON };
    case "!":
      return { label: cleanLabel, type: TagType.CONTEXT };
    case "?":
      return { label: cleanLabel, type: TagType.ENERGY };
    default:
      return { label: tagString.replace(/-+/g, " "), type: TagType.STANDARD };
  }
}
