import React, { useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity,
} from "react-native";
import Dropdown from "../components/dropDown";
import { buildApiUrl } from "../config";

const SignUpPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !pseudo.trim()) {
      Alert.alert("Erreur", "Email, mot de passe et pseudo sont requis.");
      return;
    }

    const data = {
      email: email.trim(),
      password,
      pseudo: pseudo.trim(),
      name: name.trim(),
      firstName: firstName.trim(),
      age: age.trim(),
      gender,
    };

    try {
      const response = await fetch(buildApiUrl("/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (responseData.status === "success") {
        if (responseData.token) {
          await SecureStore.setItemAsync("userToken", responseData.token);
          navigation.navigate("HomePage");
        } else {
          Alert.alert("Erreur", "Inscription réussie, mais aucun token reçu.");
        }
      } else if (responseData.message) {
        Alert.alert("Erreur", responseData.message);
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
      Alert.alert("Erreur", "Une erreur inattendue s'est produite.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="nom"
        style={styles.textInput}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="prénom"
        style={styles.textInput}
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        placeholder="âge"
        style={styles.textInput}
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="exemple@gmail.com"
        style={styles.textInput}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="mot de passe"
        style={styles.textInput}
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="pseudo"
        style={styles.textInput}
        value={pseudo}
        onChangeText={setPseudo}
      />

      <Dropdown value={gender} onValueChange={setGender} />

      <TouchableOpacity style={styles.button1} onPress={handleSignUp}>
        <Text style={styles.buttonText}>créer le compte</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button2}
        onPress={() => navigation.navigate("Connect")}
      >
        <Text style={styles.buttonText}>retour</Text>
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

  errorText: {
    marginTop: 20,
    color: "red",
  },
  successText: {
    marginTop: 20,
    color: "green",
  },

  button1: {
    backgroundColor: "#B57BF9", // Blue color for the button
    padding: 10,
    marginVertical: 10,
    borderRadius: 20,
    width: "30%",
    alignItems: "center",
    left: -90,
    top: -10,
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default SignUpPage;
