import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { auth } from '../services/firebase';
import { colors } from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   try {
  //     // Configure Google Sign-In with your Web Client ID
  //     // (Yes, for Firebase credential exchange, you always use the Web Client ID,
  //     // the native Android client automatically validates via the google-services.json)
  //     GoogleSignin.configure({
  //       webClientId: '1003844937796-t5k4439elbfatvagaojl0a3t953o3pac.apps.googleusercontent.com', 
  //     });
  //   } catch (error) {
  //     console.error('Google Sign-In configuration failed (possibly running in Expo Go?):', error);
  //     // Don't alert here to avoid spamming the user on launch, just log it.
  //   }
  // }, []);

  /*
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      
      // Get the ID token (try both structure formats just in case)
      let idToken = signInResult.data?.idToken || signInResult.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await signInWithCredential(auth, googleCredential);
      
      // No need to navigate manually, the auth listener in MainNavigator will handle it
    } catch (error) {
      console.error(error);
      if (error.code === 'SIGN_IN_CANCELLED') {
        // user cancelled the login flow
        Alert.alert('Sign In', 'Sign in process was cancelled');
      } else if (error.code === 'IN_PROGRESS') {
        // operation (e.g. sign in) is in progress already
        Alert.alert('Sign In', 'Sign in is already in progress');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        // play services not available or outdated
        Alert.alert('Error', 'Google Play Services are not available');
      } else {
        // some other error happened
        Alert.alert('Google Sign-In Error', error.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };
  */

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let errorMessage = 'Something went wrong';
      if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address';
      if (error.code === 'auth/user-not-found') errorMessage = 'User not found';
      if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password';
      if (error.code === 'auth/invalid-credential') errorMessage = 'Invalid credentials';
      Alert.alert('Login Failed', errorMessage);
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      Alert.alert('Guest Login Failed', error.message + '\n\nCheck if "Anonymous" is enabled in Firebase Console.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue your productivity journey.</Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            iconName="email"
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            iconName="lock"
          />
          
          <Button title="Sign In" onPress={handleLogin} loading={loading} style={styles.button} />
{/* 
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <Button 
            title="Sign in with Google" 
            onPress={handleGoogleLogin} 
            enabled={!loading}
            variant="outline"
            style={styles.googleButton}
          />
*/ }
          
          <Button 
            title="Continue as Guest" 
            onPress={handleGuestLogin} 
            enabled={!loading}
            variant="text"
            style={styles.guestButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    marginHorizontal: 10,
    color: colors.textSecondary,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  guestButton: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
