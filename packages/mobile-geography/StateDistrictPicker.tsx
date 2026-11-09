import React, {useState} from 'react';
import {FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '../design-system/src';
import {INDIA_DIRECTORY} from './indiaDirectory';

type Props = {state: string; district: string; onStateChange: (value: string) => void; onDistrictChange: (value: string) => void};
const normalized = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '');
export function StateDistrictPicker({state, district, onStateChange, onDistrictChange}: Props) {
  const insets = useSafeAreaInsets();
  const [choosing, setChoosing] = useState<'state' | 'district' | null>(null);
  const [search, setSearch] = useState('');
  const selected = INDIA_DIRECTORY.find(item => normalized(item.name) === normalized(state));
  const names: string[] = choosing === 'state' ? INDIA_DIRECTORY.map(item => item.name) : selected?.districts.map(item => item.name) ?? [];
  const options = names.filter(name => name.toLowerCase().includes(search.trim().toLowerCase()));
  const open = (kind: 'state' | 'district') => {setSearch(''); setChoosing(kind);};
  return <View style={styles.fields}>
    <Text style={styles.label}>State / Union Territory</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Choose state or union territory" style={styles.field} onPress={() => open('state')}>
      <Text style={[styles.value, !state && styles.placeholder]}>{state || 'Choose your state'}</Text><Text style={styles.arrow}>⌄</Text>
    </Pressable>
    <Text style={styles.label}>District</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Choose district" disabled={!selected} style={[styles.field, !selected && styles.disabled]} onPress={() => open('district')}>
      <Text style={[styles.value, !district && styles.placeholder]}>{district || (selected ? 'Choose your district' : 'Choose a state first')}</Text><Text style={styles.arrow}>⌄</Text>
    </Pressable>
    <Modal visible={choosing !== null} animationType="slide" onRequestClose={() => setChoosing(null)}>
      <KeyboardAvoidingView style={[styles.modal, {paddingTop: insets.top, paddingBottom: insets.bottom}]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.heading}><Text style={styles.title}>{choosing === 'state' ? 'Choose state' : `Districts in ${selected?.name ?? state}`}</Text><Pressable accessibilityRole="button" onPress={() => setChoosing(null)} style={styles.close}><Text style={styles.closeText}>Done</Text></Pressable></View>
        <TextInput accessibilityLabel="Search locations" placeholder={choosing === 'state' ? 'Search states' : 'Search districts'} placeholderTextColor={Colors.slate500} value={search} onChangeText={setSearch} style={styles.search} autoCorrect={false} />
        <FlatList data={options} keyboardShouldPersistTaps="handled" keyExtractor={item => item} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No matching location. Try another spelling.</Text>} renderItem={({item}) => <Pressable accessibilityRole="button" style={styles.option} onPress={() => {
          if (choosing === 'state') {if (item !== state) {onStateChange(item); onDistrictChange('');}} else onDistrictChange(item);
          setChoosing(null);
        }}><Text style={styles.value}>{item}</Text>{item === (choosing === 'state' ? state : district) ? <Text style={styles.check}>✓</Text> : null}</Pressable>} />
      </KeyboardAvoidingView>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  fields: {gap: 8}, label: {fontSize: 15, fontWeight: '600', color: Colors.slate700},
  field: {minHeight: 52, padding: 14, borderWidth: 1, borderColor: Colors.slate200, borderRadius: 12, backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  value: {flex: 1, fontSize: 16, color: Colors.slate900}, placeholder: {color: Colors.slate500}, arrow: {fontSize: 22, color: Colors.navyDeep}, disabled: {opacity: 0.55},
  modal: {flex: 1, backgroundColor: Colors.offWhite}, heading: {padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12}, title: {flex: 1, fontSize: 22, fontWeight: '700', color: Colors.navyDeep},
  close: {minHeight: 44, justifyContent: 'center', paddingHorizontal: 12}, closeText: {color: Colors.navyDeep, fontSize: 16, fontWeight: '700'},
  search: {marginHorizontal: 20, marginBottom: 12, padding: 14, fontSize: 16, color: Colors.slate900, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.slate200, borderRadius: 12},
  list: {paddingHorizontal: 20, paddingBottom: 24}, option: {minHeight: 52, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.slate200, flexDirection: 'row', alignItems: 'center'}, check: {color: Colors.success, fontSize: 20}, empty: {padding: 20, color: Colors.slate500},
});
