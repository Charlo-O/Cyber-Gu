export interface Trait {
  id: string;
  label: string;
  active: boolean;
}

export interface RitualStep {
  id: number;
  title: string;
  desc: string;
}

export interface CurseLog {
  id: string;
  type: 'Curse' | 'Blessing' | 'Deflect';
  name: string;
  date: string;
  hash: string;
}

export type RootStackParamList = {
  Contract: undefined;
  Altar: undefined;
  Ritual: undefined;
  Effigy: undefined;
  RitualDemote: undefined;
  RitualServer: undefined;
  RitualLove: undefined;
  Karma: undefined;
  Grimoire: undefined;
};
