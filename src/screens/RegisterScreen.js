import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile, signInWithCredential, GoogleAuthProvider, signInAnonymously } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { colors } from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';

// WebBrowser.maybeCompleteAuthSession();

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Hardcoded Redirect URI for Expo Go Proxy
  // This must match EXACTLY what is in the Google Cloud Console "Authorized redirect URIs"
  // const redirectUri = "https://auth.expo.io/@unknownpjk/expotodoapp";

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   clientId: '1003844937796-t5k4439elbfatvagaojl0a3t953o3pac.apps.googleusercontent.com',
  //   redirectUri: redirectUri,
  //   responseType: 'id_token',
  // }, {
  //   useProxy: true
  // });

  // const handleGoogleLogin = () => {
  //   // Pass the redirectUri explicitly here as well to be safe
  //   promptAsync({ 
  //     useProxy: true, 
  //     redirectUri: redirectUri,
  //     extraParams: {
  //       prompt: 'select_account'
  //     }
  //   });
  // };

  // React.useEffect(() => {
  //   if (response?.type === 'success') {
  //     const { id_token, access_token } = response.params;
  //     const { accessToken } = response.authentication || {};
      
  //     const token = id_token || accessToken || access_token;

  //     if (!token) {
  //       Alert.alert("Google Login Error", "No token received from Google.");
  //       return;
  //     }

  //     // If we have an id_token, use it. If only access_token, pass null for id_token.
  //     const credential = id_token 
  //       ? GoogleAuthProvider.credential(id_token)
  //       : GoogleAuthProvider.credential(null, token);

  //     setLoading(true);
  //     signInWithCredential(auth, credential)
  //       .catch((error) => {
  //         console.error("Firebase Auth Error:", error);
  //         Alert.alert("Google Login Error", error.message);
  //       })
  //       .finally(() => setLoading(false));
  //   }
  // }, [response]);

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      Alert.alert('Guest Login Failed', error.message);
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name,
        email: email,
        createdAt: serverTimestamp(),
      });
      
    } catch (error) {
      let errorMessage = 'Something went wrong';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'That email address is already in use!';
      if (error.code === 'auth/invalid-email') errorMessage = 'That email address is invalid!';
      Alert.alert('Registration Failed', errorMessage);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start organizing your life.</Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            iconName="person"
          />
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
          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            iconName="lock"
          />
          
          <Button title="Sign Up" onPress={handleRegister} loading={loading} style={styles.button} />

          {/* <Button title="Sign Up" onPress={handleRegister} loading={loading} style={styles.button} /> */}

{/*
          <View style={styles.divider}>
             <View style={styles.line} />
             <Text style={styles.orText}>OR</Text>
             <View style={styles.line} />
           </View>
 
           <Button 
             title="Sign up with Google" 
             onPress={handleGoogleLogin} 
             enabled={!loading}
             variant="outline"
             style={styles.googleButton}
           />
*/}
           
           <Button 
             title="Continue as Guest" 
             onPress={handleGuestLogin} 
             enabled={!loading}
             variant="text"
             style={styles.guestButton}
           />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Login</Text>
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
  },
  link: {
    color: colors.secondary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
