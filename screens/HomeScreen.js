import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import App from "../components/navBar";

const { width, height } = Dimensions.get("window"); // Get screen dimensions


const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.circle, styles.positionHygiene]}
        onPress={() => navigation.navigate("Hygiene")}
      >
        <View style={styles.profileImg}>
          <Image
            source={require("../assets/hygiene_feminine.jpg")}
            style={styles.image}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.circle, styles.positionEquality]}
        onPress={() => navigation.navigate("SubEquality")}
      >
        <Image
          source={require("../assets/egalite.jpg")}
          style={styles.image}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.circle, styles.positionConfidence]}
        onPress={() => navigation.navigate("MainConfidence")}
      >
        <Image
          source={require("../assets/confiance.jpg")}
          style={styles.image}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.circle, styles.positionSexism]}
        onPress={() => navigation.navigate("Sexism")}
      >
        <Image
          source={require("../assets/sexisme.jpg")}
          style={styles.image}
        />
      </TouchableOpacity>
      <View style={[styles.centeredLogo]}>
        <Image
          source={require("../assets/logo_transparent.png")}
          style={styles.logo}
        />
      </View>

      <App style={styles.navbar} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: width * 0.6, 
    height: width * 0.6,  
  },

    circle: {
    width: width * 0.45,  
    height: width * 0.45,  
    borderRadius: (width * 0.45) / 2, 
    overflow: "hidden",  
  },

  image: {
    width: width * 0.45,  
    height: width * 0.45,  
  },


  navbar: {
    width: "100%",
    zIndex: 1,
  },

  positionHygiene: {
    top: height * 0.1, 
    left: width * 0.52, 
    zIndex: 2,

  },
  positionEquality: {
    top: height * 0.4, 
    right: width * -0.04, 
    zIndex: 2,

  },
  positionConfidence: {
    top: height * 0.24, 
    left: width * 0.52,  
    zIndex: 2,
  },
  positionSexism: {
    top: height * -0.5,  
    right: width * -0.04, 
    zIndex: 2,

  },

  centeredLogo: {
    position: "absolute",
    top: height * 0.35,
    left: width * 0.2, 
  },

});

export default HomeScreen;
