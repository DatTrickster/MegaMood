import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import Markdown, { type RenderRules } from 'react-native-markdown-display';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import type { ChatMessage } from '../models/ChatMessage';
import type { User } from '../models/User';
import { loadGaiaChat, saveGaiaChat } from '../services/gaiaChatService';
import { loadAIBuddySettings } from '../services/aiBuddySettingsService';

const MEDICAL_DISCLAIMER =
  "I'm not a medical advisor. Any advice I give is for general wellness only—please recheck and validate anything important. " +
  'If you\'re experiencing any health or mental health issues, please seek professional medical assistance.';

function buildGaiaSystemPrompt(user: User | null): string {
  const lines: string[] = [
    'You are Gaia, the MegaMood in-app wellness assistant. Be supportive, warm, and concise.',
    '',
    '## Persona (use this to tailor your replies)',
  ];
  if (user) {
    lines.push(`- The user prefers to be called: ${user.preferredUsername || user.name || 'the user'}.`);
    if (user.lifestyleGoals?.length) {
      lines.push(`- Their lifestyle goals: ${user.lifestyleGoals.join(', ')}.`);
    }
    if (user.gender) lines.push(`- Gender: ${user.gender}.`);
    if (user.race) lines.push(`- Race/ethnicity: ${user.race}.`);
    if (user.country) lines.push(`- Country/region: ${user.country}.`);
    if (user.diet) lines.push(`- Diet: ${user.diet}.`);
    lines.push('- Offer advice and suggestions that are relevant to their goals and context.');
  } else {
    lines.push('- No persona details are available; keep replies general and friendly.');
  }
  lines.push(
    '',
    '## Important rules',
    '- You are NOT a medical professional. Do not give medical diagnoses, prescribe, or replace doctors.',
    '- If the user mentions health problems, mental health struggles, or symptoms, encourage them to see a doctor or qualified professional.',
    '- Frame any wellness or lifestyle advice as general support only; remind them to validate important decisions with qualified professionals when needed.',
    '- At the start of a new conversation you may briefly remind them you are not a medical advisor and that they should seek professional care if they have health concerns.',
    '',
    '## Formatting rules',
    '- Do NOT use tables. Use bullet points or numbered lists instead.',
    '- Do NOT use emojis.',
    '- Use bullet points (- or *) to organize information clearly.',
    '- Keep responses concise and easy to read on mobile.'
  );
  return lines.join('\n');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Fallback when AI Buddy is off or API fails
function getGaiaPlaceholder(_userMessage: string): string {
  return (
    "I'm **Gaia**, your in-app assistant. To get real AI replies, go to **Settings → AI Buddy** and add your Ollama API key (get one at ollama.com/settings/keys).\n\n" +
    "Your messages are always saved for context."
  );
}

async function fetchOllamaReply(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  const base = baseUrl.replace(/\/$/, '');
  const url = base.endsWith('/api') ? `${base}/chat` : `${base}/api/chat`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: model || 'gpt-oss:120b',
        messages,
        stream: false,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('Ollama API error', res.status, err);
      return null;
    }
    const data = (await res.json()) as { message?: { content?: string } };
    return data.message?.content ?? null;
  } catch (e) {
    console.warn('Ollama fetch error', e);
    return null;
  }
}

type Props = {
  visible: boolean;
  onClose: () => void;
  /** User persona for tailoring Gaia's replies; optional if not on dashboard */
  user?: User | null;
};

export default function GaiaChatModal({ visible, onClose, user }: Props) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (visible) {
      loadGaiaChat().then((loaded) => {
        setMessages(loaded);
        setInitialLoad(false);
      });
    }
  }, [visible]);

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    await saveGaiaChat(next);
    setLoading(true);
    scrollToEnd();

    let gaiaContent: string;
    const settings = await loadAIBuddySettings();
    if (settings.enabled && settings.apiKey.trim()) {
      const systemPrompt = buildGaiaSystemPrompt(user ?? null);
      const ollamaMessages = [
        { role: 'system', content: systemPrompt },
        ...next.map((m) => ({ role: m.role, content: m.content })),
      ];
      const reply = await fetchOllamaReply(
        settings.baseUrl,
        settings.apiKey,
        settings.model,
        ollamaMessages
      );
      gaiaContent = reply?.trim() || getGaiaPlaceholder(text);
    } else {
      gaiaContent = getGaiaPlaceholder(text);
    }

    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: gaiaContent,
      createdAt: new Date().toISOString(),
    };
    const updated = [...next, assistantMsg];
    setMessages(updated);
    await saveGaiaChat(updated);
    setLoading(false);
    scrollToEnd();
  };

  const tableBorderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
  const tableHeaderBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const codeBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  const markdownStyles = {
    body: {
      color: isDark ? colors.onSurfaceDark : colors.onSurface,
      fontSize: 15,
      lineHeight: 22,
    },
    paragraph: {
      marginTop: spacing.xs,
      marginBottom: spacing.sm,
    },
    strong: { fontWeight: '600' as const },
    em: { fontStyle: 'italic' as const },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline' as const,
    },
    blockquote: {
      marginVertical: spacing.sm,
      paddingLeft: spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      opacity: 0.95,
    },
    code_inline: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 13,
      backgroundColor: codeBg,
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderRadius: 4,
    },
    code_block: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 12,
      backgroundColor: codeBg,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginVertical: spacing.sm,
    },
    fence: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 12,
      backgroundColor: codeBg,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      marginVertical: spacing.sm,
    },
    heading1: { 
      fontSize: 20, 
      fontWeight: '700' as const, 
      marginTop: spacing.sm, 
      marginBottom: spacing.xs,
      color: isDark ? colors.onSurfaceDark : colors.onSurface,
    },
    heading2: { 
      fontSize: 18, 
      fontWeight: '700' as const, 
      marginTop: spacing.sm, 
      marginBottom: spacing.xs,
      color: isDark ? colors.onSurfaceDark : colors.onSurface,
    },
    heading3: { 
      fontSize: 16, 
      fontWeight: '600' as const, 
      marginTop: spacing.sm, 
      marginBottom: spacing.xs,
      color: isDark ? colors.onSurfaceDark : colors.onSurface,
    },
    bullet_list: {
      marginVertical: spacing.xs,
    },
    ordered_list: {
      marginVertical: spacing.xs,
    },
    list_item: { 
      marginBottom: spacing.xs,
    },
    hr: { backgroundColor: tableBorderColor, height: 1, marginVertical: spacing.sm },
    // Tables: compact and scoped so they don’t take over the chat
    table: {
      borderWidth: 1,
      borderColor: tableBorderColor,
      borderRadius: borderRadius.sm,
      marginVertical: spacing.sm,
      overflow: 'hidden' as const,
      alignSelf: 'flex-start' as const,
      maxWidth: 320,
    },
    thead: {
      backgroundColor: tableHeaderBg,
    },
    tbody: {},
    th: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderRightWidth: 1,
      borderColor: tableBorderColor,
      fontSize: 13,
      fontWeight: '600' as const,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: tableBorderColor,
    },
    td: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRightWidth: 1,
      borderColor: tableBorderColor,
      fontSize: 13,
    },
  };

  const markdownRules: RenderRules = {
    table: (node, children, parent, styles) => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={mdStyles.tableScrollContent}
        style={mdStyles.tableScroll}
        key={node.key}
      >
        <View style={[styles.table, { maxWidth: undefined }]}>{children}</View>
      </ScrollView>
    ),
    fence: (node, children, parent, styles) => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={mdStyles.codeScroll}
        key={node.key}
      >
        <Text style={styles.fence}>{node.content}</Text>
      </ScrollView>
    ),
    code_block: (node, children, parent, styles) => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        style={mdStyles.codeScroll}
        key={node.key}
      >
        <Text style={styles.code_block}>{node.content}</Text>
      </ScrollView>
    ),
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.bubbleWrap,
          isUser ? styles.bubbleWrapUser : styles.bubbleWrapAssistant,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, isDark && styles.bubbleUserDark]
              : [styles.bubbleAssistant, isDark && styles.bubbleAssistantDark],
          ]}
        >
          {isUser ? (
            <Text style={[styles.bubbleText, isDark && styles.bubbleTextDark]}>
              {item.content}
            </Text>
          ) : (
            <Markdown style={markdownStyles} rules={markdownRules}>
              {item.content}
            </Markdown>
          )}
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, isDark && styles.containerDark]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, isDark && styles.headerDark, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Gaia</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, isDark && styles.closeTextDark]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>

        {initialLoad ? (
          <View style={styles.loadWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.flatList}
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.listContentEmpty,
            ]}
            onContentSizeChange={scrollToEnd}
            onLayout={scrollToEnd}
            showsVerticalScrollIndicator={true}
            removeClippedSubviews={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
                  Hi! I'm Gaia, your wellness assistant.
                </Text>
                <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                  Ask me for help with planning, habits, or general advice. I'll tailor replies to you and remember our chat.
                </Text>
                <View style={[styles.disclaimerBox, isDark && styles.disclaimerBoxDark]}>
                  <Text style={[styles.disclaimerTitle, isDark && styles.disclaimerTitleDark]}>
                    Important
                  </Text>
                  <Text style={[styles.disclaimerText, isDark && styles.disclaimerTextDark]}>
                    {MEDICAL_DISCLAIMER}
                  </Text>
                </View>
              </View>
            }
          />
        )}

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
              Gaia is typing…
            </Text>
          </View>
        )}

        <View style={[styles.inputRow, isDark && styles.inputRowDark, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <TextInput
            style={[
              styles.input,
              isDark && styles.inputDark,
            ]}
            value={input}
            onChangeText={setInput}
            placeholder="Message Gaia…"
            placeholderTextColor={isDark ? '#888' : '#999'}
            multiline
            maxLength={2000}
            editable={!loading}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const mdStyles = StyleSheet.create({
  tableScroll: {
    maxWidth: '100%',
    marginVertical: -spacing.sm,
  },
  tableScrollContent: {
    flexGrow: 1,
    paddingVertical: spacing.sm,
  },
  codeScroll: {
    maxWidth: '100%',
    marginVertical: spacing.sm,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  headerDark: {
    borderBottomColor: colors.outlineDark,
  },
  title: {
    ...typography.titleLarge,
    color: colors.primary,
  },
  titleDark: {
    color: colors.primaryLight,
  },
  closeBtn: {
    padding: spacing.sm,
  },
  closeText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  closeTextDark: {
    color: colors.primaryLight,
  },
  loadWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyWrap: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.titleMedium,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyTitleDark: {
    color: colors.primaryLight,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyTextDark: {
    color: colors.onSurfaceDark,
  },
  disclaimerBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: 'rgba(232, 93, 0, 0.06)',
    alignSelf: 'stretch',
  },
  disclaimerBoxDark: {
    borderColor: colors.outlineDark,
    backgroundColor: 'rgba(255, 140, 66, 0.08)',
  },
  disclaimerTitle: {
    ...typography.labelLarge,
    color: colors.onSurface,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  disclaimerTitleDark: {
    color: colors.onSurfaceDark,
  },
  disclaimerText: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    opacity: 0.9,
    fontSize: 13,
  },
  disclaimerTextDark: {
    color: colors.onSurfaceDark,
  },
  bubbleWrap: {
    marginBottom: spacing.md,
  },
  bubbleWrapUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapAssistant: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '88%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
  },
  bubbleUserDark: {
    backgroundColor: colors.primaryDark,
  },
  bubbleAssistant: {
    backgroundColor: '#F0F0F0',
  },
  bubbleAssistantDark: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bubbleText: {
    ...typography.bodyLarge,
    color: colors.onPrimary,
  },
  bubbleTextDark: {
    color: colors.onPrimary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    opacity: 0.7,
  },
  loadingTextDark: {
    color: colors.onSurfaceDark,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  inputRowDark: {
    borderTopColor: colors.outlineDark,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyLarge,
    color: colors.onSurface,
  },
  inputDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: colors.onSurfaceDark,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
