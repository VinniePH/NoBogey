import type { ImageSourcePropType } from "react-native";
import type { Caddie, GolfCourse } from "@nobogey/contracts";

import junMercado from "../../assets/images/caddies/jun-mercado.png";
import paoloReyes from "../../assets/images/caddies/paolo-reyes.png";
import courseSouthwoods from "../../assets/images/courses/course-southwoods.jpg";
import courseValley from "../../assets/images/courses/course-valley.jpg";
import courseWackWack from "../../assets/images/courses/course-wackwack.jpg";
import golfLifestyle from "../../assets/images/courses/golf-lifestyle.jpg";

const caddiePlaceholders = [junMercado, paoloReyes] as const;
const coursePlaceholders = [courseSouthwoods, courseValley, courseWackWack, golfLifestyle] as const;

/**
 * Bundled presentation-only images. They intentionally do not alter remote
 * course or caddie records and can later be replaced with stored image URLs.
 */
export function localCoursePlaceholder(course: Pick<GolfCourse, "id" | "name">): ImageSourcePropType {
  const name = `${course.id} ${course.name}`.toLowerCase();
  if (name.includes("southwoods")) return courseSouthwoods;
  if (name.includes("wack")) return courseWackWack;
  if (name.includes("valley")) return courseValley;
  return coursePlaceholders[stableIndex(course.id || course.name, coursePlaceholders.length)]!;
}

export function localCaddiePlaceholder(caddie: Pick<Caddie, "id" | "displayName">): ImageSourcePropType {
  const name = `${caddie.id} ${caddie.displayName}`.toLowerCase();
  if (name.includes("jun")) return junMercado;
  if (name.includes("paolo")) return paoloReyes;
  return caddiePlaceholders[stableIndex(caddie.id || caddie.displayName, caddiePlaceholders.length)]!;
}

function stableIndex(value: string, length: number) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 0) % length;
}
