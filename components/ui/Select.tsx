/**
 * Select Component
 * Composant de sélection custom qui fonctionne bien sur iOS et Android
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Spacing, Layout, ComponentHeight } from '@/constants/Spacing';
import { TextStyles } from '@/constants/Typography';

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    value: string;
    options: SelectOption[];
    onValueChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

export function Select({
    label,
    value,
    options,
    onValueChange,
    placeholder = 'Sélectionner...',
    error,
    disabled = false,
}: SelectProps) {
    const colors = useThemeColors();
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);
    const displayText = selectedOption?.label || placeholder;

    const handleSelect = (optionValue: string) => {
        onValueChange(optionValue);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {label && (
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            )}

            <TouchableOpacity
                style={[
                    styles.selectButton,
                    {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: error ? colors.error : colors.border,
                    },
                    disabled && { opacity: 0.5 },
                ]}
                onPress={() => !disabled && setModalVisible(true)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.selectText,
                        { color: selectedOption ? colors.text : colors.textTertiary },
                    ]}
                >
                    {displayText}
                </Text>
                <Text style={[styles.arrow, { color: colors.textSecondary }]}>▼</Text>
            </TouchableOpacity>

            {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setModalVisible(false)}
                >
                    <View
                        style={[styles.modalContent, { backgroundColor: colors.card }]}
                        onStartShouldSetResponder={() => true}
                    >
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[TextStyles.h4, { color: colors.text }]}>
                                {label || 'Sélectionner'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={[TextStyles.h4, { color: colors.primary }]}>
                                    Fermer
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.optionsList}>
                            {options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.option,
                                            { borderBottomColor: colors.border },
                                            isSelected && {
                                                backgroundColor: colors.primaryLight + '20',
                                            },
                                        ]}
                                        onPress={() => handleSelect(option.value)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                {
                                                    color: isSelected ? colors.primary : colors.text,
                                                    fontWeight: isSelected ? '600' : '400',
                                                },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                        {isSelected && (
                                            <Text style={{ color: colors.primary, fontSize: 18 }}>
                                                ✓
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        ...TextStyles.label,
        marginBottom: Spacing.xs,
    },
    selectButton: {
        height: ComponentHeight.input,
        borderWidth: 1,
        borderRadius: Layout.borderRadius.md,
        paddingHorizontal: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectText: {
        ...TextStyles.body,
        flex: 1,
    },
    arrow: {
        fontSize: 12,
        marginLeft: Spacing.sm,
    },
    errorText: {
        ...TextStyles.caption,
        marginTop: Spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: Layout.borderRadius.xl,
        borderTopRightRadius: Layout.borderRadius.xl,
        maxHeight: '70%',
        ...Layout.shadow.large,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
    },
    optionsList: {
        maxHeight: 400,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
    },
    optionText: {
        ...TextStyles.body,
    },
});
