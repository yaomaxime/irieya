import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { buildApiUrl } from "../config";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        fetch(buildApiUrl("/verify-token"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success") {
              navigation.navigate("HomePage");
            } else {
              navigation.navigate("Connect");
            }
          })
          .catch(() => navigation.navigate("Connect"));
      } else {
        navigation.navigate("Connect");
      }
    };

    checkToken();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Loading...</Text>
    </View>
  );
};

export default SplashScreen;
