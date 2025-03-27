import { View, Text, Switch, StyleSheet } from 'react-native';

interface ToggleSwitchProps {
    isToggled: boolean;
    toggleItem: () => void;
    toggleLabel: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isToggled, toggleItem, toggleLabel }) => (
    <View style={styles.toggleContainer}>
        <Switch
            trackColor={{ false: "#767577", true: "#33418b" }}
            thumbColor={isToggled ? "#ffffff" : "#f4f3f4"}
            onValueChange={toggleItem}
            value={isToggled}
        />
        <Text>{toggleLabel}</Text>
    </View>
);

const styles = StyleSheet.create({
    toggleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 20,
    },
})

export default ToggleSwitch;