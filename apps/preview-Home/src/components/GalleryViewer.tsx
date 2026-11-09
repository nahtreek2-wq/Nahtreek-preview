import React from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Spacing, Typography} from '@nahtreek/design-system';
import {Icon, ICONS} from './ui/Icon';

export type GalleryImage = {key: string; source: ImageSourcePropType};

export function GalleryViewer({
  visible,
  images,
  index,
  onClose,
  onIndexChange,
}: {
  visible: boolean;
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={[styles.top, {paddingTop: insets.top + Spacing.sm}]}>
          <Text style={styles.count}>
            {index + 1} / {images.length}
          </Text>
          <TouchableOpacity
            style={styles.close}
            accessibilityRole="button"
            accessibilityLabel="Close gallery"
            onPress={onClose}>
            <Icon name={ICONS.close} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={images}
          keyExtractor={item => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={index}
          getItemLayout={(_, itemIndex) => ({
            length: width,
            offset: width * itemIndex,
            index: itemIndex,
          })}
          onMomentumScrollEnd={event =>
            onIndexChange(
              Math.round(event.nativeEvent.contentOffset.x / width),
            )
          }
          renderItem={({item}) => (
            <Image
              source={item.source}
              style={[styles.image, {width}]}
              resizeMode="contain"
            />
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  count: {
    ...Typography.body,
    color: Colors.white,
  },
  close: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
  },
});
