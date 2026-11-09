import {FormScrollView, useFormFieldFocus} from '../../../../packages/mobile-ui/FormScrollView';
import React, {useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {KeyboardAwareView} from '../../../../packages/mobile-ui/KeyboardAwareView';
import {useIsFocused} from '@react-navigation/native';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '@nahtreek/design-system';
import {PrimaryButton} from '../components/PrimaryButton';
import {useProfessionalDraft} from '../stores/professional';
import {api, ApiError} from '../services/apiClient';
import {useSessionStore} from '../stores/session';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StateDistrictPicker} from '../../../../packages/mobile-geography/StateDistrictPicker';

export function IdentitySetupScreen() {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const draft = useProfessionalDraft();
  const [name, setName] = useState(draft.displayName);
  const [city, setCity] = useState(draft.city);
  const [state, setState] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const user = useSessionStore(session => session.user);
  const updateUser = useSessionStore(session => session.updateUser);
  const role = user?.roles.includes('ENGINEER')
    ? 'Civil Engineer'
    : 'Service Professional';
  const continueSetup = async () => {
    if (name.trim().length < 2) {
      return setError('Enter your full name');
    }
    if (city.trim().length < 2) {
      return setError('Enter your city or town');
    }
    if (state.trim().length < 2) {
      return setError('Enter your state');
    }
    setSaving(true);
    setError('');
    try {
      await api.patch('/professionals/me/identity', {
        fullName: name.trim(),
        baseCity: city.trim(),
        baseState: state.trim(),
      });
      draft.saveIdentityDraft({displayName: name.trim(), city: city.trim()});
      updateUser({
        fullName: name.trim(),
        city: city.trim(),
        state: state.trim(),
        needsProfessionalProfile: false,
      });
    } catch (reason) {
      setError(
        reason instanceof ApiError
          ? reason.message
          : 'Could not save your details. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <KeyboardAwareView style={styles.root}>
      {focused ? (
        <StatusBar barStyle="dark-content" backgroundColor={Colors.offWhite} />
      ) : null}
      <FormScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}>
        <Text style={styles.kicker}>PROFILE SETUP · STEP 1</Text>
        <Text style={styles.title}>Start with the basics</Text>
        <Text style={styles.subtitle}>
          You are creating a {role} profile. You can add services,
          qualifications and verification documents in the next steps.
        </Text>
        <View style={styles.form}>
          <Field
            label="Full name"
            value={name}
            onChangeText={value => {
              setName(value);
              setError('');
            }}
            placeholder="Enter your name"
          />
          <StateDistrictPicker
            state={state}
            district={city}
            onStateChange={value => {
              setState(value);
              setError('');
            }}
            onDistrictChange={value => {
              setCity(value);
              setError('');
            }}
          />
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <PrimaryButton
            label={saving ? 'Saving…' : 'Save and continue'}
            disabled={saving}
            onPress={continueSetup}
          />
        </View>
        <Text style={styles.note}>
          Your profile remains private and unverified until every required
          section is completed and submitted for review.
        </Text>
      </FormScrollView>
    </KeyboardAwareView>
  );
}

function Field({
  label,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  onFocus?: React.ComponentProps<typeof TextInput>['onFocus'];
}) {
  const onFocus = useFormFieldFocus();
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        onFocus={props.onFocus ?? onFocus}
        accessibilityLabel={label}
        placeholderTextColor={Colors.slate500}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.offWhite},
  content: {flexGrow: 1, padding: 20},
  kicker: {
    ...Typography.badge,
    lineHeight: 16,
    color: Colors.navyMid,
    letterSpacing: 1,
  },
  title: {...Typography.h1, color: Colors.slate900, marginTop: Spacing.sm},
  subtitle: {...Typography.body, color: Colors.slate600, marginTop: Spacing.sm},
  form: {gap: 20, marginTop: Spacing.lg},
  label: {
    ...Typography.caption,
    color: Colors.slate700,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  input: {
    ...Typography.body,
    minHeight: 50,
    color: Colors.slate900,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.slate200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  error: {...Typography.caption, color: Colors.error},
  note: {
    ...Typography.caption,
    color: Colors.slate500,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
