export const POINT_PACKS: Record<string, { points: number; bonus: number; price: number; label: string; popular?: boolean }> = {
  p500:   { points: 500,   bonus: 0,    price: 550,   label: "500pt" },
  p1000:  { points: 1000,  bonus: 50,   price: 1100,  label: "1,050pt" },
  p3000:  { points: 3000,  bonus: 300,  price: 3300,  label: "3,300pt", popular: true },
  p5000:  { points: 5000,  bonus: 750,  price: 5500,  label: "5,750pt" },
  p10000: { points: 10000, bonus: 2000, price: 11000, label: "12,000pt" },
};
