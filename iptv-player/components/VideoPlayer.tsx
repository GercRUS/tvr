import { Feather } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import colors from "@/constants/colors";
import { Channel } from "@/contexts/PlayerContext";

interface Props {
  channel: Channel | null;
  onTap: () => void;
}

export default function VideoPlayer({ channel, onTap }: Props) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(channel?.url ?? null, (p) => {
    p.loop = true;
    if (channel?.url) {
      p.play();
    }
  });

  useEffect(() => {
    setError(false);
    setLoading(!!channel);
    if (!channel) return;

    const sub = player.addListener("statusChange", (e) => {
      if (e.status === "readyToPlay") {
        setLoading(false);
        player.play();
      } else if (e.status === "error") {
        setLoading(false);
        setError(true);
      }
    });
    return () => sub.remove();
  }, [channel?.url]);

  const handleTap = useCallback(() => {
    onTap();
    setShowOverlay(true);
    const native = Platform.OS !== "web";
    Animated.sequence([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: native,
      }),
      Animated.delay(300),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: native,
      }),
    ]).start(() => setShowOverlay(false));
  }, [onTap, overlayOpacity]);

  return (
    <Pressable onPress={handleTap} style={styles.container}>
      <View style={styles.container}>
        {channel ? (
          <VideoView
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />
        ) : (
          <View style={styles.noContent}>
            <Feather name="tv" size={64} color={colors.light.mutedForeground} />
            <Text style={styles.noContentText}>Загрузите M3U плейлист</Text>
            <Text style={styles.noContentSub}>
              Нажмите на экран, чтобы открыть список каналов
            </Text>
          </View>
        )}

        {loading && channel && (
          <View style={styles.overlay}>
            <Feather name="loader" size={36} color={colors.light.primary} />
            <Text style={styles.loadingText}>Загрузка...</Text>
          </View>
        )}

        {error && (
          <View style={styles.overlay}>
            <Feather name="alert-circle" size={48} color={colors.light.destructive} />
            <Text style={styles.errorText}>Ошибка воспроизведения</Text>
            <Text style={styles.errorUrl} numberOfLines={2}>
              {channel?.url}
            </Text>
          </View>
        )}

        {channel && (
          <View style={styles.channelTag}>
            <Feather name="tv" size={12} color={colors.light.primary} />
            <Text style={styles.channelName} numberOfLines={1}>
              {channel.name}
            </Text>
          </View>
        )}

        {showOverlay && (
          <Animated.View
            style={[styles.tapOverlay, { opacity: overlayOpacity, pointerEvents: "none" }]}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  video: {
    flex: 1,
    backgroundColor: "#000000",
  },
  noContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  noContentText: {
    color: colors.light.mutedForeground,
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  noContentSub: {
    color: colors.light.mutedForeground,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    opacity: 0.6,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: colors.light.foreground,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    color: colors.light.destructive,
    fontSize: 18,
    fontFamily: "Inter_500Medium",
  },
  errorUrl: {
    color: colors.light.mutedForeground,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  channelTag: {
    position: "absolute",
    bottom: 20,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  channelName: {
    color: colors.light.foreground,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    maxWidth: 200,
  },
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(79, 158, 248, 0.08)",
  },
});
