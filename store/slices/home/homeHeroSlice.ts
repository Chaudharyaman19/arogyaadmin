export interface HomeHero {
  _id?: string;
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  status?: string;
  tagline?: string;
  titlePrimary?: string;
  titleSecondary?: string;
  description?: string;
  date?: string;
  location?: string;
  button1Name?: string;
  button1Link?: string;
  button2Name?: string;
  button2Link?: string;
  img?: string;
  image?: string;
  [key: string]: any;
}

export interface HomeHeroState {
  data: HomeHero[];
  loading: boolean;
  error: string | null;
}

export const fetchHomeHeros = () => async (dispatch: any) => {
  return { payload: [] };
};

export const createHomeHero = (payload: any) => async (dispatch: any) => {
  return { payload };
};

export const updateHomeHero = (payload: any) => async (dispatch: any) => {
  return { payload };
};

export const deleteHomeHero = (id: string) => async (dispatch: any) => {
  return { payload: id };
};

export const setHomeHeros = (payload: HomeHero[]) => ({
  type: "homeHero/setHomeHeros",
  payload,
});
