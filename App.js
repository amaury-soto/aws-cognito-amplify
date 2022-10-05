/**
 * Authentication with Amplify and React Native App
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import {Text, View, StyleSheet, Button, Linking} from 'react-native';
import Amplify, {Auth, Hub} from 'aws-amplify';
import awsconfig from './aws-exports';
import {Authenticator, withOAuth} from 'aws-amplify-react-native';
import SignIn from './src/components/SignIn';
import SignUp from './src/components/SignUp';
import ForgotPassword from './src/components/ForgotPassword';
import ConfirmSignUp from './src/components/ConfirmSignUp';
import ChangePassword from './src/components/ChangePassword';
import InAppBrowser from 'react-native-inappbrowser-reborn';

async function urlOpener(url, redirectUrl) {
  await InAppBrowser.isAvailable();
  const {type, url: newUrl} = await InAppBrowser.openAuth(url, redirectUrl, {
    showTitle: false,
    enableUrlBarHiding: true,
    enableDefaultShare: false,
    ephemeralWebSession: true,
  });
  console.log('type::', type);
  if (type === 'success') {
    Linking.openURL(newUrl);
  }
}

Amplify.configure({
  ...awsconfig,
  oauth: {
    ...awsconfig.oauth,
    urlOpener,
  },
});

function Home(props) {
  return (
    <View>
      <Text>Welcome</Text>
      <Button title="Sign Out" onPress={() => Auth.signOut()} />
    </View>
  );
}

const AuthScreens = props => {
  switch (props.authState) {
    case 'signIn':
      return <SignIn {...props} />;
    case 'signUp':
      return <SignUp {...props} />;
    case 'forgotPassword':
      return <ForgotPassword {...props} />;
    case 'confirmSignUp':
      return <ConfirmSignUp {...props} />;
    case 'changePassword':
      return <ChangePassword {...props} />;
    case 'signedIn':
      return <Home />;
    default:
      return <></>;
  }
};

const App = props => {
  const [user, setUser] = useState({});
  useEffect(() => {
    Hub.listen('auth', ({payload}) => {
      switch (payload.event) {
        case 'signIn':
        case 'cognitoHostedUI':
          try {
            getUser().then(userData => setUser(userData));
          } catch (err) {
            console.log(err);
          }
          break;
        case 'signOut':
          setUser(null);
          break;
        case 'signIn_failure':
        case 'cognitoHostedUI_failure':
          console.log('Sign in failure', data);
          break;
      }
    });
    getUser()
      .then(userData => setUser(userData))
      .catch(err => console.log(err));
  }, []);

  function getUser() {
    return Auth.currentAuthenticatedUser()
      .then(userData => userData)
      .catch(err => console.log(err));
  }

  const {googleSignIn} = props;
  console.log('userMAIN::', user);
  return (
    <View style={styles.container}>
      {user ? (
        <View style={{paddingHorizontal:60}}>
           <Text>{`Hola, ${JSON.stringify(user.attributes, null, 3)}`}</Text>
          <Button title="Sign Out" onPress={() => Auth.signOut()} />
        </View>
      ) : (
        <>
          <Authenticator
            usernameAttributes="email"
            hideDefault={true}
            authState="signUp">
            <AuthScreens />
          </Authenticator>
          <View style={{marginBottom: 200}}>
            <Button title="Login with Google" onPress={googleSignIn}></Button>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default withOAuth(App);
