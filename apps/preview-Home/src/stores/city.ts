import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {stateForCity} from '../services/geography';

interface CityState {
  city: string;
  state: string;
  setCity: (city: string, state?: string) => void;
}

export const useCity = create<CityState>()(
  persist(
    set => ({
      city: '',
      state: '',
      setCity: (city, state) => set({city, state: state ?? stateForCity(city) ?? ''}),
    }),
    {
      name: 'nahtreek-city',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const saved = persisted as Partial<CityState> | undefined;
        const city = saved?.city ?? current.city;
        return {
          ...current,
          ...saved,
          city,
          state: saved?.state || stateForCity(city) || '',
        };
      },
    },
  ),
);
