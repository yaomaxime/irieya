import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { topics } from "./frontend/src/content";
import { buildApiUrl } from "./config";

const COLORS = {
  ink: "#25332f",
  muted: "#6e7973",
  canvas: "#f6f7f2",
  paper: "#ffffff",
  line: "#e4e9e2",
  green: "#276b57",
  greenDark: "#174b3c",
  greenSoft: "#e7f2ec",
  coral: "#de816d",
  gold: "#e5b64f",
  lavender: "#8276ba",
  rose: "#c96e83",
};

const EMPTY_PROFILE = {
  name: "",
  firstName: "",
  age: "",
  email: "",
  pseudo: "",
  gender: "",
};

const TOPIC_IMAGES = {
  hygiene: require("./assets/hygiene_feminine.jpg"),
  egalite: require("./assets/egalite.jpg"),
  confiance: require("./assets/confiance.jpg"),
  sexisme: require("./assets/sexisme.jpg"),
};

const LESSON_IMAGES = {
  "bonne-hygiene": require("./assets/hygiene.jpg"),
  produits: require("./assets/produit_hygiene.jpg"),
  genre: require("./assets/egalite_genre.jpg"),
  limites: require("./assets/limites.jpg"),
  combat: require("./assets/combat_actu.jpg"),
  estime: require("./assets/estime_de_soi.jpg"),
  opinion: require("./assets/opinion_des_autres.jpg"),
  quotidien: require("./assets/sexisme.jpg"),
};

async function apiRequest(path, { token, method = "GET", body } = {}) {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Le serveur est momentanément indisponible.",
    );
  }
  return data;
}

function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  style,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[styles.buttonText, secondary && styles.buttonSecondaryText]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function Field({ label, value, onChangeText, placeholder, ...props }) {
  const { rightIcon, onRightIconPress, ...inputProps } = props;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={rightIcon ? styles.inputRow : undefined}>
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ba49e"
          style={[styles.input, rightIcon && styles.inputWithAction]}
          value={value}
          {...inputProps}
        />
        {rightIcon ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRightIconPress}
            style={styles.inputAction}
          >
            <Text style={styles.inputActionText}>{rightIcon}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Brand({ compact = false }) {
  return (
    <View style={styles.brand}>
      <Image
        source={require("./assets/irieya.png")}
        style={styles.brandImage}
      />
      <View>
        <Text style={styles.brandName}>Iriéya</Text>
        {!compact && (
          <Text style={styles.brandTagline}>
            Grandir, comprendre, s’affirmer
          </Text>
        )}
      </View>
    </View>
  );
}

function AuthScreen({ onAuthenticated, onGuest }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ ...EMPTY_PROFILE, password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Saisis ton adresse e-mail et ton mot de passe.");
      return;
    }
    setLoading(true);
    try {
      const data =
        mode === "login"
          ? await apiRequest("/login", {
              method: "POST",
              body: { email: form.email.trim(), password: form.password },
            })
          : await apiRequest("/signup", {
              method: "POST",
              body: {
                ...EMPTY_PROFILE,
                name: form.name.trim(),
                firstName: form.firstName.trim(),
                age: form.age,
                email: form.email.trim(),
                pseudo: form.pseudo.trim(),
                gender: form.gender,
                password: form.password,
              },
            });
      if (data.status !== "success" || !data.token) {
        throw new Error(data.message || "Impossible de poursuivre.");
      }
      await onAuthenticated(data.token);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.canvas} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.authScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authHero}>
            <View style={styles.authHeroTop}>
              <Brand />
              <View style={styles.heroMark}>
                <Image
                  source={require("./assets/logo_transparent.png")}
                  style={styles.heroLogo}
                />
              </View>
            </View>
            <Text style={styles.heroEyebrow}>UN ESPACE RIEN QU’À TOI</Text>
            <Text style={styles.authHeroTitle}>Avance avec confiance.</Text>
            <Text style={styles.authHeroCopy}>
              Des réponses claires pour mieux te connaître, dans un espace
              bienveillant et sans jugement.
            </Text>
            <Text style={styles.privacyLine}>
              ◈ Tes informations restent confidentielles
            </Text>
          </View>

          <View style={styles.authForm}>
            <Text style={styles.eyebrow}>
              {mode === "login" ? "HEUREUSE DE TE REVOIR" : "BIENVENUE"}
            </Text>
            <Text style={styles.authTitle}>
              {mode === "login" ? "Connecte-toi" : "Crée ton espace"}
            </Text>
            <Text style={styles.bodyCopy}>
              {mode === "login"
                ? "Retrouve tes contenus et poursuis ton parcours."
                : "Quelques informations suffisent pour commencer."}
            </Text>

            {mode === "signup" && (
              <>
                <Field
                  label="Prénom"
                  value={form.firstName}
                  onChangeText={(value) => setField("firstName", value)}
                  placeholder="Awa"
                />
                <Field
                  label="Nom"
                  value={form.name}
                  onChangeText={(value) => setField("name", value)}
                  placeholder="Koné"
                />
                <Field
                  label="Pseudo"
                  value={form.pseudo}
                  onChangeText={(value) => setField("pseudo", value)}
                  placeholder="awa_k"
                />
                <Field
                  label="Âge"
                  value={form.age}
                  onChangeText={(value) => setField("age", value)}
                  placeholder="18"
                  keyboardType="number-pad"
                />
              </>
            )}
            <Field
              label="Adresse e-mail"
              value={form.email}
              onChangeText={(value) => setField("email", value)}
              placeholder="toi@exemple.com"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <Field
              label="Mot de passe"
              value={form.password}
              onChangeText={(value) => setField("password", value)}
              placeholder="6 caractères minimum"
              secureTextEntry={!showPassword}
              textContentType={mode === "login" ? "password" : "newPassword"}
              rightIcon={showPassword ? "Masquer" : "Afficher"}
              onRightIconPress={() => setShowPassword((value) => !value)}
            />
            {error ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
            ) : null}
            <Button
              title={
                loading
                  ? "Un instant…"
                  : mode === "login"
                    ? "Se connecter  →"
                    : "Créer mon compte  →"
              }
              onPress={submit}
              disabled={loading}
            />
            <Button title="Découvrir sans compte" secondary onPress={onGuest} />
            <Pressable
              onPress={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              style={styles.authSwitch}
            >
              <Text style={styles.bodyCopy}>
                {mode === "login"
                  ? "Pas encore de compte ? "
                  : "Tu as déjà un compte ? "}
              </Text>
              <Text style={styles.linkText}>
                {mode === "login" ? "Créer un compte" : "Se connecter"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TopicCard({ topic, onPress, compact = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.topicCard,
        compact && styles.topicCardCompact,
        pressed && styles.pressed,
      ]}
    >
      <Image source={TOPIC_IMAGES[topic.id]} style={styles.topicImage} />
      <View style={styles.topicCardBody}>
        <View style={[styles.topicTag, { backgroundColor: topic.softColor }]}>
          <Text style={[styles.topicTagText, { color: topic.color }]}>
            {topic.shortTitle.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        {!compact && (
          <Text style={styles.topicDescription} numberOfLines={3}>
            {topic.description}
          </Text>
        )}
        <Text style={[styles.cardLink, { color: topic.color }]}>
          Découvrir →
        </Text>
      </View>
    </Pressable>
  );
}

function App() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);
  const [guest, setGuest] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [page, setPage] = useState({ type: "home" });
  const [search, setSearch] = useState("");
  const [visited, setVisited] = useState([]);
  const [openQuestion, setOpenQuestion] = useState(0);
  const [profileMessage, setProfileMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [savedToken, savedGuest, savedProfile, savedVisited] =
          await Promise.all([
            SecureStore.getItemAsync("irieya-token"),
            AsyncStorage.getItem("irieya-guest"),
            AsyncStorage.getItem("irieya-profile"),
            AsyncStorage.getItem("irieya-visited"),
          ]);
        if (!active) return;
        if (savedProfile)
          setProfile({ ...EMPTY_PROFILE, ...JSON.parse(savedProfile) });
        if (savedVisited) setVisited(JSON.parse(savedVisited));
        if (savedGuest === "true") setGuest(true);
        if (savedToken) {
          try {
            const [verification, loadedProfile] = await Promise.all([
              apiRequest("/verify-token", {
                method: "POST",
                body: { token: savedToken },
              }),
              apiRequest("/profile", { token: savedToken }),
            ]);
            if (verification.status !== "success")
              throw new Error("Session expirée");
            if (active) {
              setToken(savedToken);
              setProfile({ ...EMPTY_PROFILE, ...loadedProfile });
            }
          } catch {
            await SecureStore.deleteItemAsync("irieya-token");
          }
        }
      } catch {
        if (active) setProfile(EMPTY_PROFILE);
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return topics;
    return topics.filter((topic) =>
      `${topic.title} ${topic.description} ${topic.lessons.map((lesson) => lesson.title).join(" ")}`
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  const go = (next) => {
    setPage(next);
    setOpenQuestion(0);
  };

  const authenticate = async (newToken) => {
    await SecureStore.setItemAsync("irieya-token", newToken);
    await AsyncStorage.removeItem("irieya-guest");
    setToken(newToken);
    setGuest(false);
    try {
      const loaded = await apiRequest("/profile", { token: newToken });
      setProfile({ ...EMPTY_PROFILE, ...loaded });
      await AsyncStorage.setItem(
        "irieya-profile",
        JSON.stringify({ ...EMPTY_PROFILE, ...loaded }),
      );
    } catch {
      // The token is valid even if the optional profile fetch is temporarily unavailable.
    }
  };

  const enterGuest = async () => {
    await AsyncStorage.setItem("irieya-guest", "true");
    setGuest(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("irieya-token");
    await AsyncStorage.removeItem("irieya-guest");
    setToken(null);
    setGuest(false);
    setPage({ type: "home" });
  };

  const markVisited = async (id) => {
    if (visited.includes(id)) return;
    const next = [...visited, id];
    setVisited(next);
    await AsyncStorage.setItem("irieya-visited", JSON.stringify(next));
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage("");
    try {
      if (token)
        await apiRequest("/profile", { method: "PUT", token, body: profile });
      await AsyncStorage.setItem("irieya-profile", JSON.stringify(profile));
      setProfileMessage(
        guest
          ? "Préférences enregistrées sur cet appareil."
          : "Ton profil est à jour.",
      );
    } catch (reason) {
      setProfileMessage(
        reason instanceof Error ? reason.message : "Impossible d’enregistrer.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  if (!ready) {
    return (
      <SafeAreaView style={[styles.safe, styles.loadingScreen]}>
        <Image
          source={require("./assets/logo_transparent.png")}
          style={styles.loadingLogo}
        />
        <ActivityIndicator color={COLORS.green} size="large" />
        <Text style={styles.bodyCopy}>Préparation de ton espace…</Text>
      </SafeAreaView>
    );
  }
  if (!token && !guest)
    return <AuthScreen onAuthenticated={authenticate} onGuest={enterGuest} />;

  const topic = ["topic", "lesson"].includes(page.type)
    ? topics.find((item) => item.id === page.topicId)
    : null;
  const lesson =
    page.type === "lesson"
      ? topic?.lessons.find((item) => item.id === page.lessonId)
      : null;

  const renderHome = () => (
    <ScrollView contentContainerStyle={styles.pageContent}>
      <View style={styles.homeHero}>
        <Text style={styles.eyebrow}>
          BONJOUR
          {profile.firstName ? ` ${profile.firstName.toUpperCase()}` : ""}
        </Text>
        <Text style={styles.homeTitle}>
          Qu’aimerais-tu découvrir aujourd’hui ?
        </Text>
        <Text style={styles.bodyCopy}>
          Des contenus simples et bienveillants pour mieux te connaître et
          prendre confiance en toi.
        </Text>
        <View style={styles.heroImageWrap}>
          <Image
            source={require("./assets/logo_transparent.png")}
            style={styles.homeLogo}
          />
        </View>
      </View>
      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.eyebrow}>LES ESSENTIELS</Text>
          <Text style={styles.sectionTitle}>Explore à ton rythme</Text>
        </View>
        <Pressable onPress={() => go({ type: "explore" })}>
          <Text style={styles.linkText}>Tout voir →</Text>
        </Pressable>
      </View>
      {topics.map((item) => (
        <TopicCard
          key={item.id}
          topic={item}
          onPress={() => go({ type: "topic", topicId: item.id })}
        />
      ))}
      <View style={styles.dailyCard}>
        <Text style={styles.eyebrow}>TA PENSÉE DU JOUR</Text>
        <Text style={styles.dailyQuote}>
          « Tu n’as pas besoin d’être parfaite pour être fière de toi. »
        </Text>
        <Text style={styles.bodyCopy}>
          Chaque petit pas compte. · {visited.length} chapitre
          {visited.length === 1 ? "" : "s"} exploré
          {visited.length === 1 ? "" : "s"}
        </Text>
      </View>
    </ScrollView>
  );

  const renderExplore = () => (
    <ScrollView
      contentContainerStyle={styles.pageContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>BIBLIOTHÈQUE</Text>
      <Text style={styles.pageTitle}>Tout explorer</Text>
      <Text style={styles.bodyCopy}>
        Choisis un sujet et avance dans les chapitres à ton rythme.
      </Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="⌕  Rechercher un sujet…"
        placeholderTextColor="#8b9690"
        style={styles.searchInput}
      />
      {filteredTopics.length ? (
        filteredTopics.map((item) => (
          <TopicCard
            key={item.id}
            topic={item}
            onPress={() => go({ type: "topic", topicId: item.id })}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.sectionTitle}>Aucun sujet trouvé</Text>
          <Text style={styles.bodyCopy}>
            Essaie « confiance », « règles » ou « égalité ».
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderTopic = () =>
    topic && (
      <ScrollView contentContainerStyle={styles.pageContent}>
        <Pressable
          onPress={() => go({ type: "explore" })}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Tous les sujets</Text>
        </Pressable>
        <Image source={TOPIC_IMAGES[topic.id]} style={styles.detailHeroImage} />
        <Text style={[styles.eyebrow, { color: topic.color }]}>
          {topic.lessons.length} CHAPITRE{topic.lessons.length > 1 ? "S" : ""}{" "}
          POUR COMPRENDRE
        </Text>
        <Text style={styles.pageTitle}>{topic.title}</Text>
        <Text style={styles.bodyCopy}>{topic.description}</Text>
        <Text style={[styles.eyebrow, styles.spacedEyebrow]}>TON PARCOURS</Text>
        <Text style={styles.sectionTitle}>Choisis un chapitre</Text>
        {topic.lessons.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => {
              go({ type: "lesson", topicId: topic.id, lessonId: item.id });
              markVisited(`${topic.id}/${item.id}`);
            }}
            style={styles.lessonCard}
          >
            <Image source={LESSON_IMAGES[item.id]} style={styles.lessonImage} />
            <View style={styles.lessonCopy}>
              <Text style={[styles.eyebrow, { color: topic.color }]}>
                {String(index + 1).padStart(2, "0")} ·{" "}
                {item.eyebrow.toUpperCase()}
              </Text>
              <Text style={styles.lessonTitle}>{item.title}</Text>
              <Text style={styles.topicDescription} numberOfLines={3}>
                {item.summary}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    );

  const renderLesson = () =>
    lesson &&
    topic && (
      <ScrollView contentContainerStyle={styles.pageContent}>
        <Pressable
          onPress={() => go({ type: "topic", topicId: topic.id })}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ {topic.shortTitle}</Text>
        </Pressable>
        <Image
          source={LESSON_IMAGES[lesson.id]}
          style={styles.detailHeroImage}
        />
        <Text style={[styles.eyebrow, { color: topic.color }]}>
          {lesson.eyebrow.toUpperCase()} · LECTURE : 4 MIN
        </Text>
        <Text style={styles.pageTitle}>{lesson.title}</Text>
        <Text style={styles.bodyCopy}>{lesson.summary}</Text>
        <View style={styles.articleIntro}>
          <Text style={styles.eyebrow}>QUESTIONS & RÉPONSES</Text>
          <Text style={styles.sectionTitle}>L’essentiel, simplement</Text>
          <Text style={styles.bodyCopy}>
            Appuie sur une question pour afficher sa réponse. Tu peux prendre
            ton temps et revenir plus tard.
          </Text>
        </View>
        {lesson.questions.map((item, index) => {
          const expanded = openQuestion === index;
          return (
            <View key={item.question} style={styles.questionCard}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={() => setOpenQuestion(expanded ? null : index)}
                style={styles.questionButton}
              >
                <Text style={[styles.questionNumber, { color: topic.color }]}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <Text style={styles.questionText}>{item.question}</Text>
                <Text style={styles.chevron}>{expanded ? "−" : "+"}</Text>
              </Pressable>
              {expanded && <Text style={styles.answerText}>{item.answer}</Text>}
            </View>
          );
        })}
        <View style={styles.completeCard}>
          <Text style={styles.eyebrow}>BRAVO</Text>
          <Text style={styles.sectionTitle}>
            Tu viens de faire un pas pour toi.
          </Text>
          <Text style={styles.bodyCopy}>
            Continue quand tu te sens prête. Il n’y a aucune course.
          </Text>
          <Button
            title="Voir les chapitres  →"
            secondary
            onPress={() => go({ type: "topic", topicId: topic.id })}
            style={styles.completeButton}
          />
        </View>
      </ScrollView>
    );

  const renderProfile = () => (
    <ScrollView
      contentContainerStyle={styles.pageContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>MON ESPACE</Text>
      <Text style={styles.pageTitle}>Ton profil</Text>
      <Text style={styles.bodyCopy}>
        Personnalise l’application avec les informations que tu souhaites
        partager.
      </Text>
      <View style={styles.profileSummary}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile.pseudo || profile.firstName || "I")
              .slice(0, 1)
              .toUpperCase()}
          </Text>
        </View>
        <Text style={styles.sectionTitle}>
          {profile.pseudo || profile.firstName || "Exploratrice"}
        </Text>
        <Text style={styles.bodyCopy}>
          {guest ? "Mode découverte" : profile.email}
        </Text>
        <Text style={styles.privacyBadge}>◈ Espace confidentiel</Text>
      </View>
      <Text style={[styles.eyebrow, styles.spacedEyebrow]}>
        INFORMATIONS PERSONNELLES
      </Text>
      <Text style={styles.bodyCopy}>
        Tu peux laisser vides les champs que tu ne veux pas renseigner.
      </Text>
      {[
        ["Prénom", "firstName"],
        ["Nom", "name"],
        ["Pseudo", "pseudo"],
        ["Âge", "age"],
        ["Adresse e-mail", "email"],
      ].map(([label, key]) => (
        <Field
          key={key}
          label={label}
          value={profile[key] || ""}
          editable={key !== "email" || !guest}
          keyboardType={
            key === "age"
              ? "number-pad"
              : key === "email"
                ? "email-address"
                : "default"
          }
          onChangeText={(value) =>
            setProfile((current) => ({ ...current, [key]: value }))
          }
          placeholder={
            key === "email" && guest
              ? "Connecte-toi pour ajouter un e-mail"
              : ""
          }
        />
      ))}
      {profileMessage ? (
        <Text style={styles.saveMessage}>{profileMessage}</Text>
      ) : null}
      <Button
        title={savingProfile ? "Enregistrement…" : "Enregistrer  ✓"}
        onPress={saveProfile}
        disabled={savingProfile}
      />
      <Button
        title={guest ? "Quitter le mode découverte" : "Se déconnecter"}
        secondary
        onPress={logout}
      />
    </ScrollView>
  );

  const activeTab = ["topic", "lesson"].includes(page.type)
    ? "explore"
    : page.type;
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.canvas} />
      <View style={styles.appHeader}>
        <Brand compact />
        <Pressable
          accessibilityLabel="Ouvrir mon profil"
          onPress={() => go({ type: "profile" })}
          style={styles.headerAvatar}
        >
          <Text style={styles.headerAvatarText}>
            {(profile.firstName || profile.pseudo || "I")
              .slice(0, 1)
              .toUpperCase()}
          </Text>
        </Pressable>
      </View>
      <View style={styles.flex}>
        {page.type === "home" && renderHome()}
        {page.type === "explore" && renderExplore()}
        {page.type === "topic" && renderTopic()}
        {page.type === "lesson" && renderLesson()}
        {page.type === "profile" && renderProfile()}
      </View>
      <View style={styles.bottomNav}>
        {[
          ["home", "⌂", "Accueil"],
          ["explore", "▤", "Explorer"],
          ["profile", "◉", "Mon espace"],
        ].map(([key, icon, label]) => (
          <Pressable
            key={key}
            onPress={() => go({ type: key })}
            style={styles.navItem}
          >
            <Text
              style={[styles.navIcon, activeTab === key && styles.navActive]}
            >
              {icon}
            </Text>
            <Text
              style={[styles.navLabel, activeTab === key && styles.navActive]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.canvas },
  flex: { flex: 1 },
  loadingScreen: { alignItems: "center", justifyContent: "center", gap: 20 },
  loadingLogo: { width: 140, height: 110, resizeMode: "contain" },
  authScroll: { flexGrow: 1, paddingBottom: 28 },
  authHero: {
    backgroundColor: COLORS.greenDark,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 26,
    overflow: "hidden",
  },
  authHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 25,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandImage: { width: 42, height: 42, resizeMode: "contain" },
  brandName: { color: COLORS.greenDark, fontSize: 21, fontWeight: "800" },
  brandTagline: { color: COLORS.muted, fontSize: 10, marginTop: 2 },
  heroMark: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLogo: { width: 66, height: 66, resizeMode: "contain" },
  heroEyebrow: {
    color: "#d8e9dc",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  authHeroTitle: {
    color: "#fff",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    marginTop: 10,
    maxWidth: 310,
  },
  authHeroCopy: {
    color: "#dbe6df",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
    maxWidth: 380,
  },
  privacyLine: { color: "#d3e2d9", fontSize: 12, marginTop: 22 },
  authForm: { paddingHorizontal: 24, paddingTop: 30, gap: 14 },
  eyebrow: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.25,
  },
  authTitle: {
    color: COLORS.ink,
    fontSize: 29,
    fontWeight: "800",
    marginTop: -7,
  },
  bodyCopy: { color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  fieldWrap: { gap: 7 },
  fieldLabel: { color: COLORS.ink, fontSize: 13, fontWeight: "700" },
  input: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 10,
    backgroundColor: COLORS.paper,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: COLORS.ink,
    fontSize: 15,
  },
  inputRow: { position: "relative", justifyContent: "center" },
  inputWithAction: { paddingRight: 82 },
  inputAction: {
    position: "absolute",
    right: 12,
    paddingVertical: 10,
    paddingHorizontal: 3,
  },
  inputActionText: { color: COLORS.green, fontSize: 12, fontWeight: "800" },
  button: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginTop: 2,
  },
  buttonSecondary: {
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: "#d1e5d9",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  buttonSecondaryText: { color: COLORS.greenDark },
  pressed: { opacity: 0.78 },
  errorText: { color: "#a43d45", fontSize: 13, lineHeight: 18 },
  authSwitch: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingVertical: 4,
  },
  linkText: { color: COLORS.green, fontSize: 13, fontWeight: "800" },
  appHeader: {
    height: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: COLORS.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.canvas,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    color: COLORS.greenDark,
    fontWeight: "800",
    fontSize: 15,
  },
  pageContent: { padding: 20, paddingBottom: 32, gap: 14 },
  homeHero: {
    minHeight: 240,
    backgroundColor: "#e8f0e8",
    borderRadius: 18,
    padding: 22,
    overflow: "hidden",
    justifyContent: "center",
  },
  homeTitle: {
    color: COLORS.ink,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    maxWidth: "80%",
    marginTop: 10,
  },
  heroImageWrap: {
    position: "absolute",
    right: -24,
    bottom: -27,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#d8e7d8",
    alignItems: "center",
    justifyContent: "center",
  },
  homeLogo: { width: 135, height: 135, resizeMode: "contain" },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 2,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    marginTop: 5,
  },
  topicCard: {
    backgroundColor: COLORS.paper,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.line,
    marginBottom: 2,
  },
  topicCardCompact: { flexDirection: "row", alignItems: "center" },
  topicImage: { width: "100%", height: 148, backgroundColor: "#e7ece7" },
  topicCardCompact: { flexDirection: "row" },
  topicCardBody: { padding: 16, gap: 8 },
  topicTag: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  topicTagText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  topicTitle: {
    color: COLORS.ink,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
  },
  topicDescription: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  cardLink: { fontSize: 13, fontWeight: "800", marginTop: 2 },
  dailyCard: {
    backgroundColor: COLORS.greenDark,
    borderRadius: 14,
    padding: 20,
    marginTop: 5,
    gap: 10,
  },
  dailyQuote: {
    color: "#fff",
    fontSize: 19,
    lineHeight: 27,
    fontWeight: "700",
  },
  pageTitle: {
    color: COLORS.ink,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "800",
    marginTop: -6,
  },
  searchInput: {
    height: 48,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: COLORS.paper,
    paddingHorizontal: 14,
    color: COLORS.ink,
    fontSize: 14,
    marginVertical: 6,
  },
  emptyState: { alignItems: "center", padding: 28, gap: 8 },
  backButton: { alignSelf: "flex-start", paddingVertical: 3, marginBottom: 2 },
  backText: { color: COLORS.green, fontSize: 14, fontWeight: "800" },
  detailHeroImage: {
    width: "100%",
    height: 190,
    borderRadius: 15,
    backgroundColor: "#e5e9e3",
    marginBottom: 6,
  },
  spacedEyebrow: { marginTop: 18 },
  lessonCard: {
    flexDirection: "row",
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 13,
    overflow: "hidden",
    marginTop: 5,
  },
  lessonImage: { width: 96, minHeight: 132, backgroundColor: "#e6ebe6" },
  lessonCopy: { flex: 1, padding: 13, justifyContent: "center", gap: 6 },
  lessonTitle: {
    color: COLORS.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  articleIntro: {
    backgroundColor: COLORS.greenSoft,
    padding: 17,
    borderRadius: 12,
    marginTop: 18,
    gap: 7,
  },
  questionCard: {
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 11,
    overflow: "hidden",
  },
  questionButton: {
    minHeight: 62,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  questionNumber: { fontSize: 12, fontWeight: "900" },
  questionText: {
    flex: 1,
    color: COLORS.ink,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  chevron: { color: COLORS.green, fontSize: 22, fontWeight: "500" },
  answerText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  completeCard: {
    backgroundColor: "#f0eee7",
    borderRadius: 14,
    padding: 19,
    marginTop: 14,
    gap: 8,
  },
  completeButton: { marginTop: 6 },
  profileSummary: {
    alignItems: "center",
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    padding: 22,
    gap: 6,
    marginTop: 8,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  avatarText: { color: COLORS.greenDark, fontSize: 27, fontWeight: "800" },
  privacyBadge: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  saveMessage: { color: COLORS.green, fontSize: 13, lineHeight: 19 },
  bottomNav: {
    minHeight: 62,
    paddingBottom: Platform.OS === "ios" ? 2 : 5,
    borderTopColor: COLORS.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.paper,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 5,
  },
  navIcon: { color: COLORS.muted, fontSize: 20, lineHeight: 23 },
  navLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "700" },
  navActive: { color: COLORS.green, fontWeight: "900" },
});

export default App;
