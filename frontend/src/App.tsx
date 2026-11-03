import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleUserRound,
  Eye,
  EyeOff,
  Home,
  Leaf,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { api, type Profile } from "./api"
import { topics, type Lesson, type Topic } from "./content"

type Page =
  | { type: "home" }
  | { type: "explore" }
  | { type: "profile" }
  | { type: "topic"; topicId: string }
  | { type: "lesson"; topicId: string; lessonId: string }

const emptyProfile: Profile = {
  name: "",
  firstName: "",
  age: "",
  email: "",
  pseudo: "",
  gender: "",
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Irieya">
      <img
        src="/irieya/irieya.png"
        alt=""
        className={compact ? "brand-logo compact" : "brand-logo"}
      />
      <div>
        <strong>Irieya</strong>
        {!compact && <span>Grandir, comprendre, s’affirmer</span>}
      </div>
    </div>
  )
}

function AuthScreen({
  onAuthenticated,
  onGuest,
}: {
  onAuthenticated: (token: string) => void
  onGuest: () => void
}) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ ...emptyProfile, password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const response =
        mode === "login"
          ? await api.login(form.email.trim(), form.password)
          : await api.signup({
              name: form.name.trim(),
              firstName: form.firstName.trim(),
              age: form.age,
              email: form.email.trim(),
              pseudo: form.pseudo.trim(),
              gender: form.gender,
              password: form.password,
            })
      if (response.status !== "success" || !response.token) {
        throw new Error(response.message || "Impossible de poursuivre.")
      }
      onAuthenticated(response.token)
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Une erreur est survenue.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-art" aria-label="Bienvenue sur Irieya">
        <div className="art-glow" />
        <div className="auth-art-copy">
          <div className="art-badge">
            <Sparkles size={16} /> Un espace rien qu’à toi
          </div>
          <h1>Des réponses claires pour avancer avec confiance.</h1>
          <p>
            Explore, apprends et prends soin de toi dans un espace bienveillant,
            confidentiel et sans jugement.
          </p>
        </div>
        <div className="art-orbit" aria-hidden="true">
          <img src="/irieya/logo_transparent.png" alt="" />
          <span className="orbit-dot dot-one" />
          <span className="orbit-dot dot-two" />
          <span className="orbit-dot dot-three" />
        </div>
        <div className="art-trust">
          <ShieldCheck size={18} />
          <span>
            <strong>Ton espace est privé</strong>
            Tes informations restent confidentielles.
          </span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <Brand />
          <div className="auth-heading">
            <p className="eyebrow">
              {mode === "login" ? "Heureuse de te revoir" : "Bienvenue"}
            </p>
            <h2>{mode === "login" ? "Connecte-toi" : "Crée ton espace"}</h2>
            <p>
              {mode === "login"
                ? "Retrouve tes contenus et poursuis ton parcours."
                : "Quelques informations suffisent pour commencer."}
            </p>
          </div>

          <form onSubmit={submit} className="auth-form">
            {mode === "signup" && (
              <>
                <div className="form-row">
                  <label>
                    Prénom
                    <input
                      value={form.firstName}
                      onChange={(event) =>
                        update("firstName", event.target.value)
                      }
                      placeholder="Awa"
                      autoComplete="given-name"
                    />
                  </label>
                  <label>
                    Nom
                    <input
                      value={form.name}
                      onChange={(event) => update("name", event.target.value)}
                      placeholder="Koné"
                      autoComplete="family-name"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Pseudo <span>(requis)</span>
                    <input
                      required
                      value={form.pseudo}
                      onChange={(event) => update("pseudo", event.target.value)}
                      placeholder="awa_k"
                      autoComplete="username"
                    />
                  </label>
                  <label>
                    Âge
                    <input
                      value={form.age}
                      onChange={(event) => update("age", event.target.value)}
                      placeholder="18"
                      inputMode="numeric"
                    />
                  </label>
                </div>
              </>
            )}
            <label>
              Adresse e-mail
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                placeholder="toi@exemple.com"
                autoComplete="email"
              />
            </label>
            <label>
              Mot de passe
              <div className="password-field">
                <input
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  placeholder="6 caractères minimum"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <button className="primary-button" disabled={loading}>
              {loading
                ? "Un instant…"
                : mode === "login"
                  ? "Se connecter"
                  : "Créer mon compte"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <button className="guest-button" onClick={onGuest}>
            Découvrir l’application sans compte
          </button>
          <p className="auth-switch">
            {mode === "login"
              ? "Pas encore de compte ?"
              : "Tu as déjà un compte ?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login")
                setError("")
              }}
            >
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

function Header({
  onMenu,
  onProfile,
  search,
  setSearch,
}: {
  onMenu: () => void
  onProfile: () => void
  search: string
  setSearch: (value: string) => void
}) {
  return (
    <header className="topbar">
      <button
        className="icon-button mobile-menu"
        onClick={onMenu}
        aria-label="Ouvrir le menu"
      >
        <Menu />
      </button>
      <Brand compact />
      <label className="top-search">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un sujet…"
          aria-label="Rechercher un sujet"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Effacer la recherche"
          >
            <X size={16} />
          </button>
        )}
      </label>
      <button
        className="avatar-button"
        onClick={onProfile}
        aria-label="Ouvrir mon profil"
      >
        <CircleUserRound />
      </button>
    </header>
  )
}

function SideNav({
  open,
  page,
  navigate,
  close,
}: {
  open: boolean
  page: Page
  navigate: (page: Page) => void
  close: () => void
}) {
  const go = (next: Page) => {
    navigate(next)
    close()
  }
  return (
    <>
      {open && (
        <button
          className="nav-scrim"
          onClick={close}
          aria-label="Fermer le menu"
        />
      )}
      <aside className={`side-nav ${open ? "open" : ""}`}>
        <div className="side-brand">
          <Brand compact />
          <button
            className="icon-button side-close"
            onClick={close}
            aria-label="Fermer"
          >
            <X />
          </button>
        </div>
        <nav aria-label="Navigation principale">
          <button
            className={page.type === "home" ? "active" : ""}
            onClick={() => go({ type: "home" })}
          >
            <Home /> Accueil
          </button>
          <button
            className={
              ["explore", "topic", "lesson"].includes(page.type) ? "active" : ""
            }
            onClick={() => go({ type: "explore" })}
          >
            <BookOpen /> Explorer
          </button>
          <button
            className={page.type === "profile" ? "active" : ""}
            onClick={() => go({ type: "profile" })}
          >
            <Settings /> Mon espace
          </button>
        </nav>
        <div className="side-note">
          <div className="note-icon">
            <Leaf size={18} />
          </div>
          <strong>À ton rythme</strong>
          <p>
            Tu peux revenir sur chaque sujet autant de fois que tu le souhaites.
          </p>
        </div>
      </aside>
    </>
  )
}

function BottomNav({
  page,
  navigate,
}: {
  page: Page
  navigate: (page: Page) => void
}) {
  return (
    <nav className="bottom-nav" aria-label="Navigation mobile">
      <button
        className={page.type === "home" ? "active" : ""}
        onClick={() => navigate({ type: "home" })}
      >
        <Home />
        <span>Accueil</span>
      </button>
      <button
        className={
          ["explore", "topic", "lesson"].includes(page.type) ? "active" : ""
        }
        onClick={() => navigate({ type: "explore" })}
      >
        <BookOpen />
        <span>Explorer</span>
      </button>
      <button
        className={page.type === "profile" ? "active" : ""}
        onClick={() => navigate({ type: "profile" })}
      >
        <CircleUserRound />
        <span>Mon espace</span>
      </button>
    </nav>
  )
}

function TopicCard({
  topic,
  onClick,
  compact = false,
}: {
  topic: Topic
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      className={`topic-card ${compact ? "compact-card" : ""}`}
      style={
        {
          "--topic": topic.color,
          "--topic-soft": topic.softColor,
        } as React.CSSProperties
      }
      onClick={onClick}
    >
      <div className="topic-image-wrap">
        <img src={topic.image} alt="" />
        <span>
          {topic.lessons.length} chapitre{topic.lessons.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="topic-copy">
        <p>{topic.shortTitle}</p>
        <h3>{topic.title}</h3>
        {!compact && <span>{topic.description}</span>}
        <div className="card-action">
          Découvrir <ArrowRight size={17} />
        </div>
      </div>
    </button>
  )
}

function HomePage({
  profile,
  navigate,
  visited,
}: {
  profile: Profile
  navigate: (page: Page) => void
  visited: string[]
}) {
  const name = profile.firstName || profile.pseudo
  return (
    <div className="page home-page">
      <section className="welcome">
        <div>
          <p className="eyebrow">Bonjour{name ? ` ${name}` : ""}</p>
          <h1>Qu’aimerais-tu découvrir aujourd’hui ?</h1>
          <p>
            Des contenus simples et bienveillants pour mieux te connaître et
            prendre confiance en toi.
          </p>
        </div>
        <img src="/irieya/logo_transparent.png" alt="" />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Les essentiels</p>
            <h2>Explore à ton rythme</h2>
          </div>
          <button
            className="text-button"
            onClick={() => navigate({ type: "explore" })}
          >
            Tout voir <ArrowRight size={17} />
          </button>
        </div>
        <div className="topic-grid">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={() => navigate({ type: "topic", topicId: topic.id })}
            />
          ))}
        </div>
      </section>

      <section className="daily-card">
        <div className="daily-icon">
          <Sparkles />
        </div>
        <div>
          <p className="eyebrow">Ta pensée du jour</p>
          <blockquote>
            « Tu n’as pas besoin d’être parfaite pour être fière de toi. »
          </blockquote>
          <span>Chaque petit pas compte.</span>
        </div>
        <div className="progress-pill">
          <strong>{visited.length}</strong>
          chapitre{visited.length !== 1 ? "s" : ""} exploré
          {visited.length !== 1 ? "s" : ""}
        </div>
      </section>
    </div>
  )
}

function ExplorePage({
  navigate,
  search,
  setSearch,
}: {
  navigate: (page: Page) => void
  search: string
  setSearch: (value: string) => void
}) {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return topics
    return topics.filter((topic) =>
      `${topic.title} ${topic.description} ${topic.lessons.map((lesson) => lesson.title).join(" ")}`
        .toLowerCase()
        .includes(query),
    )
  }, [search])

  return (
    <div className="page">
      <div className="page-title">
        <p className="eyebrow">Bibliothèque</p>
        <h1>Tout explorer</h1>
        <p>Choisis un sujet et avance dans les chapitres à ton rythme.</p>
      </div>
      <label className="mobile-search">
        <Search />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un sujet…"
          aria-label="Rechercher un sujet"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Effacer la recherche"
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </label>
      {filtered.length ? (
        <div className="explore-grid">
          {filtered.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              onClick={() => navigate({ type: "topic", topicId: topic.id })}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search />
          <h2>Aucun sujet trouvé</h2>
          <p>Essaie un mot comme « confiance », « règles » ou « égalité ».</p>
        </div>
      )}
    </div>
  )
}

function TopicPage({
  topic,
  navigate,
}: {
  topic: Topic
  navigate: (page: Page) => void
}) {
  return (
    <div
      className="page"
      style={
        {
          "--topic": topic.color,
          "--topic-soft": topic.softColor,
        } as React.CSSProperties
      }
    >
      <button
        className="back-button"
        onClick={() => navigate({ type: "explore" })}
      >
        <ArrowLeft /> Tous les sujets
      </button>
      <section className="topic-hero">
        <div className="topic-hero-copy">
          <p className="eyebrow">
            {topic.lessons.length} chapitres pour comprendre
          </p>
          <h1>{topic.title}</h1>
          <p>{topic.description}</p>
        </div>
        <div className="topic-hero-image">
          <img src={topic.image} alt="" />
        </div>
      </section>
      <section className="lesson-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ton parcours</p>
            <h2>Choisis un chapitre</h2>
          </div>
        </div>
        <div className="lesson-list">
          {topic.lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              className="lesson-card"
              onClick={() =>
                navigate({
                  type: "lesson",
                  topicId: topic.id,
                  lessonId: lesson.id,
                })
              }
            >
              <img src={lesson.image} alt="" />
              <span className="lesson-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p>{lesson.eyebrow}</p>
                <h3>{lesson.title}</h3>
                <span>{lesson.summary}</span>
              </div>
              <span className="lesson-arrow">
                <ArrowRight />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function LessonPage({
  topic,
  lesson,
  navigate,
  markVisited,
}: {
  topic: Topic
  lesson: Lesson
  navigate: (page: Page) => void
  markVisited: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<number | null>(0)
  useEffect(
    () => markVisited(`${topic.id}/${lesson.id}`),
    [topic.id, lesson.id, markVisited],
  )

  return (
    <div
      className="page lesson-page"
      style={
        {
          "--topic": topic.color,
          "--topic-soft": topic.softColor,
        } as React.CSSProperties
      }
    >
      <button
        className="back-button"
        onClick={() => navigate({ type: "topic", topicId: topic.id })}
      >
        <ArrowLeft /> {topic.shortTitle}
      </button>
      <section className="article-head">
        <div>
          <p className="eyebrow">{lesson.eyebrow}</p>
          <h1>{lesson.title}</h1>
          <p>{lesson.summary}</p>
          <span className="read-time">
            <BookOpen size={16} /> Lecture : 4 min
          </span>
        </div>
        <img src={lesson.image} alt="" />
      </section>

      <section className="article-layout">
        <div className="article-intro">
          <p className="eyebrow">Questions & réponses</p>
          <h2>L’essentiel, simplement</h2>
          <p>
            Appuie sur une question pour afficher sa réponse. Tu peux prendre
            ton temps et revenir plus tard.
          </p>
        </div>
        <div className="accordion">
          {lesson.questions.map((item, index) => {
            const isOpen = expanded === index
            return (
              <article
                className={`accordion-item ${isOpen ? "open" : ""}`}
                key={item.question}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`answer-${index}`}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.question}</strong>
                  <ChevronDown />
                </button>
                <div
                  id={`answer-${index}`}
                  className="accordion-answer"
                  hidden={!isOpen}
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="lesson-complete">
        <div className="complete-icon">
          <Check />
        </div>
        <div>
          <p className="eyebrow">Bravo</p>
          <h2>Tu viens de faire un pas pour toi.</h2>
          <p>Continue quand tu te sens prête. Il n’y a aucune course.</p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigate({ type: "topic", topicId: topic.id })}
        >
          Voir les chapitres <ArrowRight />
        </button>
      </section>
    </div>
  )
}

function ProfilePage({
  profile,
  setProfile,
  token,
  isGuest,
  logout,
}: {
  profile: Profile
  setProfile: (profile: Profile) => void
  token: string | null
  isGuest: boolean
  logout: () => void
}) {
  const [draft, setDraft] = useState(profile)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => setDraft(profile), [profile])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      if (token) await api.updateProfile(token, draft)
      setProfile(draft)
      localStorage.setItem("irieya-profile", JSON.stringify(draft))
      setMessage(
        isGuest
          ? "Tes préférences sont enregistrées sur cet appareil."
          : "Ton profil est à jour.",
      )
    } catch (reason) {
      setMessage(
        reason instanceof Error ? reason.message : "Impossible d’enregistrer.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page profile-page">
      <div className="page-title">
        <p className="eyebrow">Mon espace</p>
        <h1>Ton profil</h1>
        <p>
          Personnalise l’application avec les informations que tu souhaites
          partager.
        </p>
      </div>
      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="profile-avatar">
            <CircleUserRound />
          </div>
          <h2>{profile.pseudo || profile.firstName || "Exploratrice"}</h2>
          <p>{isGuest ? "Mode découverte" : profile.email}</p>
          <span>
            <ShieldCheck size={16} /> Espace confidentiel
          </span>
        </aside>
        <form className="profile-form" onSubmit={submit}>
          <div className="form-section-title">
            <h2>Informations personnelles</h2>
            <p>
              Tu peux laisser vides les champs que tu ne veux pas renseigner.
            </p>
          </div>
          <div className="form-row">
            <label>
              Prénom
              <input
                value={draft.firstName}
                onChange={(event) =>
                  setDraft({ ...draft, firstName: event.target.value })
                }
              />
            </label>
            <label>
              Nom
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Pseudo
              <input
                value={draft.pseudo}
                onChange={(event) =>
                  setDraft({ ...draft, pseudo: event.target.value })
                }
              />
            </label>
            <label>
              Âge
              <input
                inputMode="numeric"
                value={draft.age}
                onChange={(event) =>
                  setDraft({ ...draft, age: event.target.value })
                }
              />
            </label>
          </div>
          <label>
            Adresse e-mail
            <input
              type="email"
              disabled={isGuest}
              value={draft.email}
              onChange={(event) =>
                setDraft({ ...draft, email: event.target.value })
              }
              placeholder={isGuest ? "Connecte-toi pour ajouter un e-mail" : ""}
            />
          </label>
          {message && <div className="save-message">{message}</div>}
          <div className="profile-actions">
            <button className="primary-button" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
              {!saving && <Check size={18} />}
            </button>
            <button type="button" className="logout-button" onClick={logout}>
              <LogOut size={18} />{" "}
              {isGuest ? "Quitter le mode découverte" : "Se déconnecter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("irieya-token"),
  )
  const [isGuest, setIsGuest] = useState(
    () => sessionStorage.getItem("irieya-guest") === "true",
  )
  const [checking, setChecking] = useState(Boolean(token))
  const [page, setPage] = useState<Page>({ type: "home" })
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      return JSON.parse(localStorage.getItem("irieya-profile") || "") as Profile
    } catch {
      return emptyProfile
    }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [visited, setVisited] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("irieya-visited") || "[]",
      ) as string[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (!token) return
    Promise.all([api.verifyToken(token), api.getProfile(token)])
      .then(([verification, loadedProfile]) => {
        if (verification.status !== "success")
          throw new Error("Session expirée")
        setProfile({ ...emptyProfile, ...loadedProfile })
      })
      .catch(() => {
        localStorage.removeItem("irieya-token")
        setToken(null)
      })
      .finally(() => setChecking(false))
  }, [token])

  const navigate = (next: Page) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const markVisited = useCallback((id: string) => {
    setVisited((current) => {
      if (current.includes(id)) return current
      const next = [...current, id]
      localStorage.setItem("irieya-visited", JSON.stringify(next))
      return next
    })
  }, [])

  const authenticate = (newToken: string) => {
    localStorage.setItem("irieya-token", newToken)
    sessionStorage.removeItem("irieya-guest")
    setIsGuest(false)
    setToken(newToken)
    setChecking(true)
  }

  const enterAsGuest = () => {
    sessionStorage.setItem("irieya-guest", "true")
    setIsGuest(true)
    setPage({ type: "home" })
  }

  const logout = () => {
    localStorage.removeItem("irieya-token")
    sessionStorage.removeItem("irieya-guest")
    setToken(null)
    setIsGuest(false)
    setPage({ type: "home" })
  }

  if (checking) {
    return (
      <main className="loading-screen">
        <img src="/irieya/logo_transparent.png" alt="Irieya" />
        <div className="loader" />
        <p>Préparation de ton espace…</p>
      </main>
    )
  }

  if (!token && !isGuest) {
    return <AuthScreen onAuthenticated={authenticate} onGuest={enterAsGuest} />
  }

  const currentTopic =
    page.type === "topic" || page.type === "lesson"
      ? topics.find((topic) => topic.id === page.topicId)
      : undefined
  const currentLesson =
    page.type === "lesson"
      ? currentTopic?.lessons.find((lesson) => lesson.id === page.lessonId)
      : undefined

  return (
    <div className="app-shell">
      <Header
        onMenu={() => setMenuOpen(true)}
        onProfile={() => navigate({ type: "profile" })}
        search={search}
        setSearch={(value) => {
          setSearch(value)
          if (value) navigate({ type: "explore" })
        }}
      />
      <SideNav
        open={menuOpen}
        page={page}
        navigate={navigate}
        close={() => setMenuOpen(false)}
      />
      <main className="main-content">
        {page.type === "home" && (
          <HomePage profile={profile} navigate={navigate} visited={visited} />
        )}
        {page.type === "explore" && (
          <ExplorePage
            navigate={navigate}
            search={search}
            setSearch={setSearch}
          />
        )}
        {page.type === "topic" && currentTopic && (
          <TopicPage topic={currentTopic} navigate={navigate} />
        )}
        {page.type === "lesson" && currentTopic && currentLesson && (
          <LessonPage
            topic={currentTopic}
            lesson={currentLesson}
            navigate={navigate}
            markVisited={markVisited}
          />
        )}
        {page.type === "profile" && (
          <ProfilePage
            profile={profile}
            setProfile={setProfile}
            token={token}
            isGuest={isGuest}
            logout={logout}
          />
        )}
      </main>
      <BottomNav page={page} navigate={navigate} />
    </div>
  )
}
