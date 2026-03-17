// Store floor plan zone definitions for SVG heatmap rendering
// Each zone has position (x, y), dimensions (width, height), and a type.

export const storeZones = [
  { id: 'entrance', name: 'Entrance', x: 150, y: 380, width: 100, height: 60, type: 'entrance' },
  { id: 'smartphones', name: 'Smartphones', x: 50, y: 50, width: 150, height: 120, type: 'product' },
  { id: 'accessories', name: 'Accessories', x: 220, y: 50, width: 120, height: 100, type: 'product' },
  { id: 'laptops', name: 'Laptops', x: 50, y: 190, width: 150, height: 100, type: 'product' },
  { id: 'tvs', name: 'TVs & Audio', x: 220, y: 170, width: 120, height: 100, type: 'product' },
  { id: 'gaming', name: 'Gaming', x: 360, y: 50, width: 100, height: 120, type: 'product' },
  { id: 'checkout', name: 'Checkout', x: 360, y: 190, width: 100, height: 80, type: 'service' },
  { id: 'service', name: 'Service Desk', x: 280, y: 300, width: 120, height: 60, type: 'service' },
  { id: 'demo', name: 'Demo Area', x: 50, y: 310, width: 130, height: 70, type: 'experience' },
];

export const storeWidth = 500;
export const storeHeight = 450;


