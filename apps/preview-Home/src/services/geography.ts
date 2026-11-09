import {INDIA_DIRECTORY} from '../../../../packages/mobile-geography/indiaDirectory';

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function stateForCity(city: string): string | undefined {
  const name = normalize(city.split(',')[0] ?? '');
  return INDIA_DIRECTORY.find(state =>
    state.districts.some(district => normalize(district.name) === name),
  )?.name;
}
