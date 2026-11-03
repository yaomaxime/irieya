import React, { useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { buildApiUrl } from "../config";

const ConnectPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Email et mot de passe requis.");
      return;
    }

    const data = {
      email: email.trim(),
      password,
    };

    try {
      const response = await fetch(buildApiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let responseData;
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const textData = await response.text();
        console.error("Unexpected response format:", textData);
        Alert.alert("Erreur", "Réponse inattendue du serveur.");
        return;
      }

      if (!response.ok) {
        Alert.alert("Erreur", responseData.message || "Connexion impossible.");
        return;
      }

      if (responseData.status === "success") {
        if (responseData.token) {
          await SecureStore.setItemAsync("userToken", responseData.token);
          navigation.navigate("HomePage");
        } else {
          Alert.alert("Erreur", "Aucun token reçu après connexion.");
        }
      } else if (responseData.message) {
        Alert.alert("Erreur", responseData.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
      Alert.alert("Erreur", "Une erreur inattendue s'est produite.");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/irieya.png")} style={styles.logo} />
      <TextInput
        placeholder="email"
        style={styles.textInput}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="mot de passe"
        style={styles.textInput}
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button1} onPress={handleLogin}>
        <Text style={styles.buttonText}>se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button2}
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.buttonText}>créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  textInput: {
    textAlign: "center",
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: "60%",
  },
  logo: {
    height: 200,
    width: 200,
    borderRadius: 100,
  },
  button1: {
    backgroundColor: "#B57BF9", // Blue color for the button
    padding: 10,
    marginVertical: 10,
    borderRadius: 20,
    width: "30%",
    alignItems: "center",
    left: -90,
    top: -10, // Adjust the position of the button
    zIndex: 2,
  },
  button2: {
    backgroundColor: "#B57BF9",
    padding: 10,
    marginVertical: 10,
    borderRadius: 20,
    width: "32%",
    alignItems: "center",
    left: 90,
    top: -60,
    zIndex: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default ConnectPage;
