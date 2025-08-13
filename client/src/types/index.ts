export interface Product {
  id: string;
  name: string;
  collection: string;
  design: string;
  format: string;
  areaPerPiece: number;
  piecesPerPackage: number;
  areaPerPackage: number;
  price: number;
  isPremium: boolean;
  image: string;
  category: 'concrete' | 'fabric' | 'matte' | 'marble' | 'accessories' | 'profile' | 'glue';
  surface: string;
  color: string;
  barcode?: string;
  packageBarcode?: string;
}

export interface Accessory {
  id: string;
  name: string;
  type: string;
  price: number;
  unit: string;
  description: string;
  image: string;
  specifications?: string;
  colors?: string[];
}

export interface CalculationResult {
  areaWithWaste: number;
  panelsNeeded: number;
  packagesNeeded: number;
  totalArea: number;
  adhesiveTubes: number;
}

export type Collection = 'all' | 'concrete' | 'fabric' | 'matte' | 'marble' | 'favorites';
