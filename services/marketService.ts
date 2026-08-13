
export interface MarketPrice {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export const fetchCryptoPrices = async (ids: string[]): Promise<MarketPrice[]> => {
  try {
    const response = await fetch(`/api/market/prices?ids=${ids.join(',')}`);
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.map((coin: any) => ({
      id: coin.id,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
    }));
  } catch (error) {
    console.error('Core market feed error:', error);
    return [];
  }
};
