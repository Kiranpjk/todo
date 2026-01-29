import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';

const Input = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  iconName,
  error,
  keyboardType,
  multiline,
  numberOfLines,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, error && styles.errorBorder]}>
        {iconName && <MaterialIcons name={iconName} size={24} color={colors.textSecondary} style={styles.icon} />}
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50, // Changed from fixed height
    paddingVertical: 5,
  },
  multilineInput: {
    minHeight: 100,
    height: 'auto',
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  errorBorder: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
