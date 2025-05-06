/*  Owner */

export type VenueOwner = {
  name: string;
  email: string;
  bio?: string;
  avatar?: { url: string; alt?: string };
  banner?: { url: string; alt?: string };
};

/*  Helpers reused by several  */

export type VenueMeta = {
  wifi?: boolean;
  parking?: boolean;
  breakfast?: boolean;
  pets?: boolean;
};

export type VenueLocation = {
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  continent?: string;
  lat?: number;
  lng?: number;
};

/*  Core */

export type Venue = {
  id: string;
  name: string;
  description?: string;
  media?: { url: string; alt?: string }[];
  price: number;
  maxGuests: number;
  rating?: number;
  meta?: VenueMeta;
  location?: VenueLocation;
  created?: string;
  updated?: string;
  owner?: VenueOwner;
  bookings?: unknown[];
};

export type NewVenue = {
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  media: { url: string; alt?: string }[];
  meta: VenueMeta;
  location?: VenueLocation;
};

export type NewUser = {
  name: string;
  email: string;
  password: string;
  venueManager?: boolean;
};
