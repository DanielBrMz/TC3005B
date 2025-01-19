export interface ShippingRate {
  carrier: string;
  service: string;
  amount: number;
  estimatedDeliveryDate: string;
}

export interface ShippingRequest {
  postalCode: string;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
}

export const calculateShipping = async ({
  postalCode,
  weight,
  length = 10,
  width = 10,
  height = 10,
}: ShippingRequest): Promise<ShippingRate[]> => {
  const basePrice = weight * 0.5; // $0.50 per pound

  console.log(
    `Calculating shipping for ${postalCode} with weight ${weight} lbs and dimensions ${length}x${width}x${height}`
  );
  return [
    {
      carrier: "FedEx",
      service: "Standard",
      amount: basePrice + 5.99,
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days
    },
    {
      carrier: "UPS",
      service: "Express",
      amount: basePrice + 8.99,
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days
    },
  ];
};
