import { atom } from "jotai";
import { atomWithStorage } from 'jotai/utils'

export type UserType = {
  uuid: string;
  user_id: string;
};

export const accessTokenAtom = atom<string | null>(null);
export const userAtom = atom<UserType | null>(null);
export const savedIdAtom = atomWithStorage<string | null>("savedId", null);
