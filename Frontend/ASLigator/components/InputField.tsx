import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';

interface InputFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  rules?: object;
  testID?: string;
}

const InputField: React.FC<InputFieldProps> = ({ control, name, label, placeholder, secureTextEntry, rules, testID }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <>
          <TextInput
            style={[styles.input, error && styles.errorInput]}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            testID={testID}
          />
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </>
      )}
    />
  </View>
);

const styles = StyleSheet.create({
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
    },
    input: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: "#fff",
      borderRadius: 10,
      borderWidth: 1,
      marginTop: 5,
      marginBottom: 20,
      width: '100%',
      height: 40,
    },
    errorInput: { 
      borderColor: "red" 
    },
    errorText: { 
      color: "red",
      marginTop: -20,
    },
  })

export default InputField;
