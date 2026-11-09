import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {WorkVisual} from './WorkVisual';

const ENGINEER = require('../assets/professionals/engineer-job-detail-v1.jpg');
const PLUMBING = require('../assets/professionals/plumbing-job-detail-v1.jpg');
const PAINTING = require('../assets/professionals/painting-job-detail-v1.jpg');

/** Bundled, role-aware visuals. Unknown service categories use their own service icon. */
export function JobContextVisual({kind, title, size = 52}: {kind: 'engineering' | 'service'; title: string; size?: number}) {
  const label = title.toLowerCase();
  const source = kind === 'engineering' ? ENGINEER : label.includes('plumb') ? PLUMBING : label.includes('paint') ? PAINTING : null;
  if (!source) {return <WorkVisual kind="service" service={title} size={size} />;}
  return <View style={[styles.frame, {width: size, height: size}]}><Image source={source} style={styles.image} resizeMode="cover" accessibilityLabel={kind === 'engineering' ? 'Engineer reviewing site plans' : label.includes('plumb') ? 'Professional plumbing work' : 'Professional painting work'} /></View>;
}

const styles = StyleSheet.create({frame: {borderRadius: 12, overflow: 'hidden'}, image: {width: '100%', height: '100%'}});
