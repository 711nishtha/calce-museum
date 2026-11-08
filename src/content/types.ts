/**
 * Typed content model shared by the website, the 3D museum and the graphic identity.
 * Every artist, artwork and exhibition is original and fictional.
 */

export type Medium = "sculpture" | "painting" | "photography" | "installation";

export type RoomId =
  | "forecourt"
  | "reception"
  | "shop"
  | "cafe"
  | "garden"
  | "atrium"
  | "passage-south"
  | "passage-north"
  | "passage-east"
  | "passage-west"
  | "passage-far-north"
  | "gallery-sculpture"
  | "gallery-painting"
  | "gallery-photography"
  | "gallery-installation"
  | "passage-royal"
  | "gallery-royal";

/** Direction an artwork's face points towards (its surface normal), in plan. */
export type Facing = "north" | "south" | "east" | "west";

export type Placement =
  | { type: "wall"; room: RoomId; x: number; z: number; y?: number; facing: Facing }
  | { type: "floor"; room: RoomId; x: number; z: number; rotation?: number }
  | { type: "storage" };

export type PaintingStyle = "bands" | "arches" | "horizon" | "plaster" | "window" | "shadow";
export type PhotoProcess = "cyanotype" | "photogram" | "lumen" | "salt";
export type PhotoMotif = "leaves" | "glass" | "wave" | "grass" | "shell" | "net";
export type SculptureForm = "stack" | "vessel" | "arch" | "ring" | "column" | "relief" | "seat";
export type SculptureMaterial = "limestone" | "travertine" | "bronze" | "terracotta" | "oak" | "marble";
export type InstallationForm = "threads" | "mirror-pool" | "light-slot" | "breathing-wall";

export type ArtworkVisual =
  | { kind: "painting"; style: PaintingStyle; palette: string[]; seed: number }
  | { kind: "photo"; process: PhotoProcess; motif: PhotoMotif; seed: number }
  | { kind: "sculpture"; form: SculptureForm; material: SculptureMaterial; seed: number }
  | { kind: "installation"; form: InstallationForm; seed: number }
  /** A photographic reproduction of a public-domain work, stored in /public/paintings. */
  | { kind: "image"; file: string; holder: string; source: string };

export interface Dimensions {
  /** centimetres */
  w: number;
  h: number;
  d?: number;
}

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  /** null for permanent-collection works shown outside a temporary exhibition */
  exhibitionId: string | null;
  year: number;
  /** shown instead of the year when a date is approximate or a range, e.g. "c. 1503–19" */
  dateLabel?: string;
  medium: Medium;
  materials: string;
  dimensions: Dimensions;
  accession: string;
  description: string;
  /** A short prompt for slow looking, shown in the 3D information panel and on artwork pages. */
  lookCloser: string;
  visual: ArtworkVisual;
  placement: Placement;
}

export interface Artist {
  id: string;
  name: string;
  born: number;
  birthplace: string;
  basedIn: string;
  practice: string;
  bio: string[];
  /** fictional contemporary artists only; historical masters are not given invented quotes */
  quote?: string;
  /** set for historical artists */
  died?: number;
}

export interface Exhibition {
  id: string;
  title: string;
  subtitle: string;
  medium: Medium;
  room: RoomId;
  opens: string; // ISO date
  closes: string; // ISO date
  curator: string;
  /** Exhibition accent, drawn from the identity palette */
  accent: string;
  statement: string[];
  layout: string;
  number: string; // "01", "02" … used in signage and posters
  /** shows reproductions of public-domain works rather than original fictional works */
  reproductions?: boolean;
}

export interface UpcomingExhibition {
  id: string;
  title: string;
  subtitle: string;
  opens: string;
  closes: string;
  teaser: string;
}

export interface JournalArticle {
  slug: string;
  title: string;
  dek: string;
  author: string;
  date: string;
  category: "Architecture" | "Studio visit" | "Essay" | "Materials" | "Opinion" | "Families";
  body: string[];
}

export interface ShopProduct {
  id: string;
  name: string;
  category: "Print" | "Book" | "Object" | "Textile";
  price: number;
  description: string;
  details: string;
  mockup: "tote" | "poster" | "catalogue" | "cup" | "scarf" | "notebook" | "postcards" | "candle";
  /** optional link to an exhibition whose graphics appear on the product */
  exhibitionId?: string;
}

export interface TourStop {
  id: string;
  title: string;
  room: RoomId;
  /** camera position in metres; y is eye height */
  position: [number, number, number];
  /** point the camera looks at */
  target: [number, number, number];
  narration: string;
  artworkId?: string;
}
