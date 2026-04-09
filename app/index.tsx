import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

import ChannelPanel from "@/components/ChannelPanel";
import VideoPlayer from "@/components/VideoPlayer";
import { usePlayer } from "@/contexts/PlayerContext";

const PANEL_AUTO_HIDE_MS = 5000;

export default function PlayerScreen() {
  const { currentChannel, loadM3U } = usePlayer();
  const [panelVisible, setPanelVisible] = useState(false);
  const [loadingM3U, setLoadingM3U] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const showPanel = useCallback(() => {
    setPanelVisible(true);
    clearHideTimer();
    hideTimer.current = setTimeout(() => {
      setPanelVisible(false);
    }, PANEL_AUTO_HIDE_MS);
  }, [clearHideTimer]);

  const hidePanel = useCallback(() => {
    clearHideTimer();
    setPanelVisible(false);
  }, [clearHideTimer]);

  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  const handleVideoTap = useCallback(() => {
    if (panelVisible) {
      hidePanel();
    } else {
      showPanel();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [panelVisible, showPanel, hidePanel]);

  const handlePickM3U = useCallback(async () => {
    try {
      setLoadingM3U(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) {
        return;
      }
      const asset = result.assets[0];
      const uri = asset.uri;

      // fetch() handles both file:// (native) and blob: (web) URIs
      const response = await fetch(uri);
      const content = await response.text();

      if (!content || content.trim().length === 0) {
        console.warn("M3U file is empty");
        return;
      }

      loadM3U(content);
    } catch (e) {
      console.warn("M3U load error:", e);
    } finally {
      setLoadingM3U(false);
    }
  }, [loadM3U]);

  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <VideoPlayer channel={currentChannel} onTap={handleVideoTap} />
      <ChannelPanel
        visible={panelVisible}
        onPickM3U={handlePickM3U}
        loading={loadingM3U}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
