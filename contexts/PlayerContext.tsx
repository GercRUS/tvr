import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

interface PlayerContextValue {
  channels: Channel[];
  currentChannel: Channel | null;
  setCurrentChannel: (ch: Channel) => void;
  loadM3U: (content: string) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const STORAGE_KEY = "iptv_channels";
const CURRENT_KEY = "iptv_current";

function parseM3U(content: string): Channel[] {
  const lines = content.split("\n").map((l) => l.trim());
  const channels: Channel[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("#EXTINF")) {
      const nameMatcher = /,(.+)$/.exec(line);
      const name = nameMatcher ? nameMatcher[1].trim() : "Unknown";
      const logoMatcher = /tvg-logo="([^"]*)"/.exec(line);
      const logo = logoMatcher ? logoMatcher[1] : undefined;
      const groupMatcher = /group-title="([^"]*)"/.exec(line);
      const group = groupMatcher ? groupMatcher[1] : undefined;
      i++;
      while (i < lines.length && (lines[i] === "" || lines[i].startsWith("#"))) {
        i++;
      }
      if (i < lines.length && lines[i] && !lines[i].startsWith("#")) {
        const url = lines[i];
        channels.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name,
          url,
          logo,
          group,
        });
      }
    }
    i++;
  }
  return channels;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannelState] = useState<Channel | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: Channel[] = JSON.parse(saved);
          setChannels(parsed);
          const cur = await AsyncStorage.getItem(CURRENT_KEY);
          if (cur) {
            const ch: Channel = JSON.parse(cur);
            const found = parsed.find((c) => c.id === ch.id);
            if (found) setCurrentChannelState(found);
            else if (parsed.length > 0) setCurrentChannelState(parsed[0]);
          } else if (parsed.length > 0) {
            setCurrentChannelState(parsed[0]);
          }
        }
      } catch {}
    })();
  }, []);

  const setCurrentChannel = useCallback((ch: Channel) => {
    setCurrentChannelState(ch);
    AsyncStorage.setItem(CURRENT_KEY, JSON.stringify(ch)).catch(() => {});
  }, []);

  const loadM3U = useCallback((content: string) => {
    const parsed = parseM3U(content);
    if (parsed.length === 0) return;
    setChannels(parsed);
    setCurrentChannelState(parsed[0]);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)).catch(() => {});
    AsyncStorage.setItem(CURRENT_KEY, JSON.stringify(parsed[0])).catch(() => {});
  }, []);

  return (
    <PlayerContext.Provider
      value={{ channels, currentChannel, setCurrentChannel, loadM3U }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
