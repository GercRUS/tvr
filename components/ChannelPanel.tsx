import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import React, { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { Channel, usePlayer } from "@/contexts/PlayerContext";

interface Props {
  visible: boolean;
  onPickM3U: () => void;
  loading: boolean;
}

export default function ChannelPanel({ visible, onPickM3U, loading }: Props) {
  const { channels, currentChannel, setCurrentChannel } = usePlayer();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-320)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const native = Platform.OS !== "web";
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: native,
          damping: 18,
          stiffness: 160,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: native,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -320,
          duration: 250,
          useNativeDriver: native,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: native,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelect = useCallback(
    (ch: Channel) => {
      Haptics.selectionAsync();
      setCurrentChannel(ch);
    },
    [setCurrentChannel]
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderItem = ({ item }: { item: Channel }) => {
    const isActive = currentChannel?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.channelItem, isActive && styles.channelItemActive]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.channelIcon}>
          <Feather
            name="tv"
            size={16}
            color={isActive ? colors.light.primary : colors.light.mutedForeground}
          />
        </View>
        <Text
          style={[
            styles.channelName,
            isActive && styles.channelNameActive,
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {isActive && (
          <Feather name="check" size={14} color={colors.light.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          paddingTop: topPad + 16,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
          pointerEvents: visible ? "auto" : "none",
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Каналы</Text>
        <TouchableOpacity
          style={styles.pickBtn}
          onPress={onPickM3U}
          disabled={loading}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.light.primary} />
          ) : (
            <>
              <Feather name="folder" size={15} color={colors.light.primary} />
              <Text style={styles.pickBtnText}>M3U</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {channels.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="list" size={40} color={colors.light.mutedForeground} />
          <Text style={styles.emptyText}>Загрузите M3U плейлист</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={onPickM3U}
            activeOpacity={0.7}
          >
            <Feather name="folder-plus" size={16} color={colors.light.primaryForeground} />
            <Text style={styles.emptyBtnText}>Выбрать файл</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={channels}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 290,
    backgroundColor: colors.light.panelBg,
    borderRightWidth: 1,
    borderRightColor: colors.light.border,
    zIndex: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    marginBottom: 4,
  },
  headerTitle: {
    color: colors.light.foreground,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  pickBtnText: {
    color: colors.light.primary,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  list: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  channelItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 8,
    marginVertical: 2,
    gap: 10,
  },
  channelItemActive: {
    backgroundColor: colors.light.channelHover,
  },
  channelIcon: {
    width: 28,
    alignItems: "center",
  },
  channelName: {
    flex: 1,
    color: colors.light.secondaryForeground,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  channelNameActive: {
    color: colors.light.primary,
    fontFamily: "Inter_500Medium",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  emptyText: {
    color: colors.light.mutedForeground,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: colors.light.primaryForeground,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
