import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput} from 'react-native';
import {Colors} from '@nahtreek/design-system';
import {INDIA_DIRECTORY} from '../../../../packages/mobile-geography/indiaDirectory';
import {BottomSheet} from './ui';

type DirectoryState = {readonly name: string; readonly districts: readonly {readonly name: string; readonly code: string}[]};
const DIRECTORY = INDIA_DIRECTORY as readonly DirectoryState[];

type Props = {
  visible: boolean;
  state: string;
  district: string;
  onClose: () => void;
  onSelect: (state: string, district: string) => void;
};

export function DistrictLocationPicker({visible, state, district, onClose, onSelect}: Props) {
  const [step, setStep] = useState<'state' | 'district'>('state');
  const [query, setQuery] = useState('');
  const [chosenState, setChosenState] = useState(state);
  const activeState = DIRECTORY.find(item => item.name === chosenState);
  const options = useMemo(() => {
    const names: string[] = step === 'state' ? DIRECTORY.map(item => item.name) : activeState?.districts.map(item => item.name) ?? [];
    const normalized = query.trim().toLocaleLowerCase();
    return names.filter(name => name.toLocaleLowerCase().includes(normalized));
  }, [activeState, query, step]);

  useEffect(() => {
    if (visible) {
      setChosenState(state);
      setStep('state');
      setQuery('');
    }
  }, [state, visible]);

  const close = () => {
    setStep('state');
    setQuery('');
    onClose();
  };

  return <BottomSheet
    visible={visible}
    title={step === 'state' ? 'Choose your state' : `Choose a district`}
    subtitle={step === 'state' ? 'Districts are loaded from the shared India directory.' : `Showing districts in ${activeState?.name ?? state}`}
    onClose={close}>
    {step === 'district' ? <Pressable accessibilityRole="button" onPress={() => {setStep('state'); setQuery('');}} style={styles.back}><Text style={styles.backText}>‹  Change state</Text></Pressable> : null}
    <TextInput
      accessibilityLabel={step === 'state' ? 'Search states' : 'Search districts'}
      value={query}
      onChangeText={setQuery}
      placeholder={step === 'state' ? 'Search states and UTs' : 'Search districts'}
      placeholderTextColor={Colors.slate500}
      style={styles.search}
      autoCorrect={false}
      autoCapitalize="words"
    />
    {options.length ? options.map(item => {
        const selected = step === 'state' ? item === state : chosenState === state && item === district;
        return <Pressable
          key={`${step}-${item}`}
          accessibilityRole="button"
          accessibilityState={{selected}}
          onPress={() => {
            if (step === 'state') {
              setChosenState(item);
              setStep('district');
              setQuery('');
            } else {
              onSelect(chosenState, item);
              close();
            }
          }}
          style={styles.option}>
          <Text style={styles.optionText}>{item}</Text>
          {selected ? <Text style={styles.check}>✓</Text> : null}
        </Pressable>;
      }) : <Text style={styles.empty}>No matching location found.</Text>}
  </BottomSheet>;
}

const styles = StyleSheet.create({
  back: {paddingVertical: 8},
  backText: {fontSize: 15, fontWeight: '600', color: Colors.navyDeep},
  search: {minHeight: 50, marginVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate200, backgroundColor: Colors.white, color: Colors.slate900, fontSize: 16},
  option: {minHeight: 52, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.slate200, flexDirection: 'row', alignItems: 'center'},
  optionText: {flex: 1, fontSize: 16, color: Colors.slate900},
  check: {fontSize: 19, color: Colors.navyDeep, fontWeight: '700'},
  empty: {paddingVertical: 20, color: Colors.slate500},
});
