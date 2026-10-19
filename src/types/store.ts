export type ProductDepartment = 'solar' | 'muebles' | 'accesorios';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  department?: ProductDepartment;
  category: 'farolas' | 'reflector' | 'solar' | 'muebles' | 'accesorios' | 'decoracion' | 'jardin' | 'pared' | 'potencia';
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  badge?: string;
  inStock: boolean;
  lumens?: string;
  batteryLife?: string;
  waterproof?: string;
  description: string;
  features: string[];
  material?: string;
  dimensions?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ShippingCarrier = 'ferguson' | 'uno_express' | 'servientrega';

export interface OrderFormData {
  fullName: string;
  phone: string;
  idNumber: string;
  province: string;
  cityOrDistrict: string;
  carrier: ShippingCarrier;
  branchOrAddress: string;
  paymentPreference: 'yappy' | 'ach';
  notes?: string;
}
