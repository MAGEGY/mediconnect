import React, { useState } from "react";
import { View, TextInput, Pressable, Modal, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Card } from "./Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TextInputModalProps {
  visible: boolean;
  title: string;
  message: string;
  placeholder?: string;
  minLength?: number;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export function TextInputModal({
  visible,
  title,
  message,
  placeholder = "",
  minLength = 0,
  onSubmit,
  onCancel,
}: TextInputModalProps) {
  const { theme } = useTheme();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (minLength > 0 && text.trim().length < minLength) {
      setError(`Please provide at least ${minLength} characters`);
      return;
    }
    onSubmit(text.trim());
    setText("");
    setError("");
  };

  const handleCancel = () => {
    setText("");
    setError("");
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Card style={styles.modal}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                borderColor: error ? theme.error : theme.border,
                color: theme.text,
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.textSecondary}
            value={text}
            onChangeText={(value) => {
              setText(value);
              setError("");
            }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />

          {error ? (
            <ThemedText style={[styles.errorText, { color: theme.error }]}>
              {error}
            </ThemedText>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={handleCancel}
              style={[styles.button, { backgroundColor: theme.border }]}
            >
              <ThemedText style={styles.buttonText}>Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={[styles.button, { backgroundColor: theme.primary }]}
            >
              <ThemedText style={styles.buttonTextPrimary}>Submit</ThemedText>
            </Pressable>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modal: {
    width: "100%",
    maxWidth: 500,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonTextPrimary: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
