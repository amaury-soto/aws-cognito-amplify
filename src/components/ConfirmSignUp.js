import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {Auth} from 'aws-amplify';
import {validateEmail, validatePassword} from '../validation';
import { FormStyles, styles } from '../styles/FormStyles';

const windowWidth = Dimensions.get('window').width;

export default function ConfirmSignUp(props) {
  const [state, setState] = useState({
    email: '',
    confirmationCode: '',
  });
  const [error, setError] = useState({
    email: ''
  });

  async function onSubmit() {
    const {email: username, confirmationCode : code} = state
    const emailError = validateEmail(state.email);
    if (emailError ) {
      setError({email: emailError});
    } else {
      try {
        const user = await Auth.confirmSignUp(username, code);
        setState({confirmationCode:''})
        props.onStateChange('signIn')
      } catch (err) {
        Alert.alert(err.message);
      }
    }
  }

  if (props.authState === 'confirmSignUp')
    return (
      <View style={FormStyles.container}>
        <Text style={FormStyles.title}>Confirm Sign Up</Text>
        <Text style={FormStyles.label}>Email</Text>
        <TextInput
          style={FormStyles.input}
          onChangeText={text => setState({...state, email: text.toLowerCase()})}
          value={state.email}
          placeholder={'Email'}
        />
        <Text style={FormStyles.errors}>{error.email}</Text>
        <Text style={FormStyles.label}>Confirmation code</Text>
        <TextInput
          style={FormStyles.input}
          onChangeText={text => setState({...state, confirmationCode: text})}
          placeholder={'Enter confirmation code'}
          value={state.confirmationCode}
        />
       

        <TouchableOpacity onPress={() => onSubmit()} style={FormStyles.button}>
          <Text style={FormStyles.buttonText}>Confirm signup</Text>
        </TouchableOpacity>
        <View style={FormStyles.links}>
          <Button
            onPress={() => props.onStateChange('signIn', {})}
            title="Back to Sign In"
            color="black"
          />
          <Button
            onPress={() => props.onStateChange('signUp', {})}
            title="Back to Sign Up"
            color="black"
          />
        </View>
      </View>
    );
  else return <></>;
}

