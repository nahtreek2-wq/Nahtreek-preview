import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Typography} from '@nahtreek/design-system';
import {ProColors, ProType} from '../theme/professionalTheme';

export type GatedFeature = 'jobs' | 'time' | 'chat';

const COPY: Record<GatedFeature, {title: string; body: string; reviewTitle: string; reviewBody: string}> = {
  jobs: {
    title: 'Jobs unlock after verification',
    body: "You're not a verified professional yet. Finish verification to receive jobs from customers.",
    reviewTitle: 'Verification under review',
    reviewBody: "Your details are being reviewed. Jobs will unlock as soon as you're approved.",
  },
  time: {
    title: 'Time unlocks after verification',
    body: "You're not a verified professional yet. Finish verification to set your availability and receive work.",
    reviewTitle: 'Verification under review',
    reviewBody: "Your details are being reviewed. Your schedule will unlock as soon as you're approved.",
  },
  chat: {
    title: 'Chat unlocks after verification',
    body: "You're not a verified professional yet. Finish verification to chat with customers about their work.",
    reviewTitle: 'Verification under review',
    reviewBody: "Your details are being reviewed. Chat will unlock as soon as you're approved.",
  },
};

// Polite locked state for Jobs / Time / Chat before the professional is
// approved. Rendered only when the profile is loaded and definitively not
// verified — loading and network errors fall through to normal content.
export function VerificationGate({
  feature,
  underReview,
  onVerify,
  bottomPadding = 0,
}: {
  feature: GatedFeature;
  underReview: boolean;
  onVerify: () => void;
  bottomPadding?: number;
}) {
  const copy = COPY[feature];
  return (
    <View style={[styles.wrap, {paddingBottom: bottomPadding}]}>
      <View style={styles.card}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name={underReview ? 'clock-check-outline' : 'lock-outline'}
            size={30}
            color={Colors.navyDeep}
          />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {underReview ? copy.reviewTitle : copy.title}
        </Text>
        <Text style={styles.body}>{underReview ? copy.reviewBody : copy.body}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onVerify}
          style={({pressed}) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>
            {underReview ? 'View my submission' : 'Continue verification'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color={ProColors.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, padding: 20, justifyContent: 'center'},
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: 18,
    padding: 22,
    gap: 10,
    alignItems: 'center',
  },
  icon: {width: 52, height: 52, alignItems: 'center', justifyContent: 'center'},
  title: {...Typography.h2, color: Colors.navyDeep, textAlign: 'center'},
  body: {...ProType.body, color: Colors.slate600, textAlign: 'center'},
  button: {
    minHeight: 52,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: ProColors.accent,
    marginTop: 8,
  },
  pressed: {opacity: 0.85},
  buttonText: {...Typography.button, color: ProColors.onAccent},
});
