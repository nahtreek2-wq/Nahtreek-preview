import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from '@nahtreek/design-system';
import {ClientColors} from '../design-system/tokens';
import {AppHeader, Card, Icon, ICONS, SectionHeader} from '../components/ui';

const FAQS = [
  {
    q: 'How do I book a service?',
    a: 'Choose a professional, describe your requirement and location, review the details, then send your request. Follow updates in Requests.',
  },
  {
    q: 'Can I cancel a booking or request?',
    a: 'You can cancel a pending or accepted request when the Cancel action is available. Other arrangements should be discussed with the professional.',
  },
  {
    q: 'How do I receive progress updates?',
    a: 'Open Request details to see status updates. Messages become available after the request is accepted.',
  },
  {
    q: 'What happens without internet?',
    a: 'You need an internet connection to send requests, messages and account changes. A failed action has not been confirmed; retry when connected.',
  },
];

export function HelpScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Help and support"
        subtitle="Guidance for your requests and account"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={[
          styles.body,
          {paddingBottom: insets.bottom + Spacing.xl},
        ]}
        showsVerticalScrollIndicator={false}>
        <SectionHeader title="Frequently asked questions" />
        {FAQS.map((f, i) => (
          <Card key={f.q} style={styles.faq}>
            <TouchableOpacity
              style={styles.faqHead}
              onPress={() => setOpen(open === i ? null : i)}>
              <Text style={styles.faqQ}>{f.q}</Text>
              <Icon
                name={ICONS.chevronDown}
                size={16}
                color={Colors.slate500}
                style={open === i ? styles.faqOpen : undefined}
              />
            </TouchableOpacity>
            {open === i && <Text style={styles.faqA}>{f.a}</Text>}
          </Card>
        ))}

        <View style={styles.note}>
          <Icon name={ICONS.support} size={14} color={Colors.slate500} />
          <Text style={styles.noteLabel}>
            For an accepted request, contact your professional through Messages.
            Additional support contact details will appear when available.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  body: {
    padding: Spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  contactCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.slate100,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  contactIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    ...Typography.subtitle,
    fontWeight: '700',
    color: Colors.slate900,
  },
  contactSub: {
    ...Typography.caption,
    color: Colors.slate500,
  },
  faq: {
    marginBottom: Spacing.sm,
  },
  faqHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  faqQ: {
    ...Typography.subtitle,
    fontWeight: '600',
    color: Colors.slate800,
    flex: 1,
  },
  faqOpen: {
    transform: [{rotate: '180deg'}],
  },
  faqA: {
    ...Typography.body,
    color: Colors.slate600,
    marginTop: Spacing.sm,
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  noteLabel: {
    ...Typography.badge,
    color: Colors.slate500,
    flex: 1,
  },
});
