export type Question = { question: string; answer: string }
export type Lesson = {
  id: string
  title: string
  eyebrow: string
  summary: string
  image: string
  questions: Question[]
}
export type Topic = {
  id: string
  title: string
  shortTitle: string
  description: string
  image: string
  color: string
  softColor: string
  lessons: Lesson[]
}

const hygieneQuestions: Question[] = [
  {
    question: "Qu’est-ce que l’hygiène féminine ?",
    answer:
      "L’hygiène féminine regroupe les gestes simples qui permettent de prendre soin de son corps et de son intimité. La zone intime possède un équilibre fragile : une toilette douce, externe et sans excès suffit généralement.",
  },
  {
    question: "Comment maintenir une bonne hygiène intime ?",
    answer:
      "Privilégiez des sous-vêtements propres et respirants, lavez uniquement la partie externe avec de l’eau ou un produit très doux, puis séchez délicatement. Évitez les douches vaginales et les produits parfumés qui peuvent perturber la flore.",
  },
  {
    question: "Est-ce différent lorsque l’on a ses règles ?",
    answer:
      "La routine quotidienne reste la même. Il faut surtout utiliser une protection adaptée à son flux, la changer régulièrement et se laver les mains avant et après chaque changement.",
  },
]

const productQuestions: Question[] = [
  {
    question: "Quels produits utiliser pour l’hygiène intime ?",
    answer:
      "Aucun produit n’est obligatoirement nécessaire. De l’eau peut suffire. Si vous utilisez un gel intime, choisissez-le doux, sans parfum, et appliquez-le uniquement sur la partie externe. Le vagin est autonettoyant.",
  },
  {
    question: "Quelles protections utiliser pendant les règles ?",
    answer:
      "Serviettes, tampons, coupes ou culottes menstruelles sont possibles. Le meilleur choix est celui qui correspond à votre confort, votre activité et votre flux. Respectez toujours la durée d’utilisation indiquée par le fabricant.",
  },
  {
    question: "À quelle fréquence changer sa protection ?",
    answer:
      "La fréquence dépend du produit et du flux. Une serviette ou un tampon se change généralement toutes les 4 à 6 heures, et plus souvent si nécessaire. Ne gardez jamais un tampon plus de 8 heures.",
  },
]

const equalityQuestions: Question[] = [
  {
    question: "Qu’est-ce que l’égalité ?",
    answer:
      "L’égalité désigne l’absence de discrimination entre les personnes dans leurs droits, leurs possibilités et leur dignité. Elle peut être politique, civile, sociale ou économique.",
  },
  {
    question: "Qu’est-ce que l’égalité entre les femmes et les hommes ?",
    answer:
      "Elle existe lorsque les femmes et les hommes ont les mêmes droits, les mêmes responsabilités et les mêmes possibilités de participer à la vie sociale, politique, économique et culturelle.",
  },
  {
    question: "Vivons-nous déjà dans un monde égalitaire ?",
    answer:
      "Des avancées importantes ont eu lieu, mais des différences de traitement persistent : accès à l’éducation, représentation, revenus, charge domestique ou sécurité. L’égalité juridique ne garantit pas toujours une égalité vécue.",
  },
]

const limitsQuestions: Question[] = [
  {
    question: "La parité a-t-elle toujours existé ?",
    answer:
      "Non. De nombreux droits ont été obtenus récemment grâce à des générations de militantes et de citoyens. L’accès au vote, à l’éducation, au travail ou à l’autonomie juridique a progressé à des rythmes différents selon les pays.",
  },
  {
    question: "Aujourd’hui, cette égalité est-elle totale ?",
    answer:
      "Elle ne l’est encore dans aucun pays. Les écarts concernent notamment l’emploi, les revenus, l’accès aux responsabilités, les violences et le temps consacré aux tâches domestiques.",
  },
]

const actionQuestions: Question[] = [
  {
    question: "Comment contribuer à plus d’égalité ?",
    answer:
      "Questionnez les stéréotypes, partagez équitablement les responsabilités, écoutez la parole des personnes concernées, signalez les discriminations et soutenez les initiatives qui favorisent l’accès de toutes et tous aux mêmes possibilités.",
  },
  {
    question: "Pourquoi ce combat reste-t-il actuel ?",
    answer:
      "Parce que les droits acquis peuvent rester fragiles et que les inégalités changent de forme. L’éducation, la solidarité et des politiques adaptées permettent de transformer durablement les pratiques.",
  },
]

const esteemQuestions: Question[] = [
  {
    question: "Comment construire son estime de soi ?",
    answer:
      "L’estime de soi se construit progressivement. Reconnaissez vos qualités, célébrez vos progrès, pratiquez des activités qui vous font du bien et entourez-vous de personnes respectueuses. Parlez-vous comme vous parleriez à une amie.",
  },
  {
    question: "Comment faire face aux critiques ?",
    answer:
      "Distinguez un conseil respectueux d’une remarque destinée à blesser. Vous avez le droit de poser une limite, de prendre de la distance et de demander de l’aide. Une critique ne définit ni votre valeur ni vos capacités.",
  },
  {
    question: "Mes proches ont-ils un rôle à jouer ?",
    answer:
      "Un entourage bienveillant peut aider, mais votre valeur ne dépend pas de son approbation. Cherchez des relations qui vous élèvent, respectent vos limites et vous permettent d’être vous-même.",
  },
]

const opinionQuestions: Question[] = [
  {
    question: "Comment moins se soucier de l’opinion des autres ?",
    answer:
      "Revenez à vos valeurs : est-ce que cette opinion est utile, respectueuse et formulée par quelqu’un qui vous connaît ? Concentrez-vous sur ce que vous pouvez contrôler et accordez moins de place aux jugements qui ne vous font pas grandir.",
  },
  {
    question: "Comment reconnaître une intention bienveillante ?",
    answer:
      "Une remarque bienveillante respecte votre dignité, tient compte du contexte et cherche à vous aider. Une attaque humilie, compare ou insiste malgré votre inconfort. Votre ressenti et vos limites comptent.",
  },
]

const sexismQuestions: Question[] = [
  {
    question: "À quoi ressemble le sexisme au quotidien ?",
    answer:
      "Il peut prendre la forme de blagues, d’attentes différentes selon le genre, d’interruptions répétées, de remarques sur le corps, de discriminations ou de violences. Même les gestes qui semblent anodins renforcent parfois des stéréotypes.",
  },
  {
    question: "Que sont les violences basées sur le genre ?",
    answer:
      "Ce sont des violences commises envers une personne en raison de son genre : harcèlement, violences domestiques, agressions, mariages forcés ou mutilations. Elles nécessitent écoute, protection, soins et justice. En Côte d’Ivoire, Akwaba Mousso peut être contactée au +225 07 69 84 84 84.",
  },
  {
    question: "Comment réagir face à une situation sexiste ?",
    answer:
      "Si vous êtes en sécurité, nommez le comportement, soutenez la personne visée et cherchez un adulte ou un service de confiance. La responsabilité appartient toujours à l’auteur du comportement, jamais à la victime.",
  },
]

export const topics: Topic[] = [
  {
    id: "hygiene",
    title: "L’hygiène féminine",
    shortTitle: "Hygiène",
    description:
      "Comprendre son corps, adopter des gestes doux et choisir les protections qui vous conviennent.",
    image: "/irieya/hygiene_feminine.jpg",
    color: "#d77b95",
    softColor: "#fae8ee",
    lessons: [
      {
        id: "bonne-hygiene",
        title: "Prendre soin de soi",
        eyebrow: "Les essentiels",
        summary:
          "Les bons gestes pour une routine simple, saine et respectueuse du corps.",
        image: "/irieya/hygiene.jpg",
        questions: hygieneQuestions,
      },
      {
        id: "produits",
        title: "Choisir ses produits",
        eyebrow: "Guide pratique",
        summary:
          "Produits intimes et protections menstruelles : faire un choix éclairé.",
        image: "/irieya/produit_hygiene.jpg",
        questions: productQuestions,
      },
    ],
  },
  {
    id: "egalite",
    title: "L’égalité",
    shortTitle: "Égalité",
    description:
      "Découvrir ce que signifie l’égalité et mieux comprendre les progrès qu’il reste à accomplir.",
    image: "/irieya/egalite.jpg",
    color: "#e2a938",
    softColor: "#fff2cf",
    lessons: [
      {
        id: "genre",
        title: "L’égalité de genre",
        eyebrow: "Comprendre",
        summary:
          "Les droits, les chances et la place de chacune et chacun dans la société.",
        image: "/irieya/egalite_genre.jpg",
        questions: equalityQuestions,
      },
      {
        id: "limites",
        title: "Les limites de l’égalité",
        eyebrow: "Prendre du recul",
        summary:
          "Identifier les écarts entre les droits reconnus et les réalités vécues.",
        image: "/irieya/limites.jpg",
        questions: limitsQuestions,
      },
      {
        id: "combat",
        title: "Un combat actuel",
        eyebrow: "Passer à l’action",
        summary:
          "Des gestes concrets pour faire progresser l’égalité autour de soi.",
        image: "/irieya/combat_actu.jpg",
        questions: actionQuestions,
      },
    ],
  },
  {
    id: "confiance",
    title: "La confiance en soi",
    shortTitle: "Confiance",
    description:
      "Apprendre à reconnaître sa valeur, poser ses limites et s’affranchir du regard des autres.",
    image: "/irieya/confiance.jpg",
    color: "#7479d9",
    softColor: "#e9e9fb",
    lessons: [
      {
        id: "estime",
        title: "L’estime de soi",
        eyebrow: "Se construire",
        summary:
          "Créer une relation plus douce avec soi-même, un pas après l’autre.",
        image: "/irieya/estime_de_soi.jpg",
        questions: esteemQuestions,
      },
      {
        id: "opinion",
        title: "L’opinion des autres",
        eyebrow: "Poser ses limites",
        summary:
          "Faire la différence entre un conseil utile et un jugement qui blesse.",
        image: "/irieya/opinion_des_autres.jpg",
        questions: opinionQuestions,
      },
    ],
  },
  {
    id: "sexisme",
    title: "Comprendre le sexisme",
    shortTitle: "Sexisme",
    description:
      "Repérer les stéréotypes, comprendre leurs effets et savoir comment agir en toute sécurité.",
    image: "/irieya/sexisme.jpg",
    color: "#ad76cf",
    softColor: "#f3e8fa",
    lessons: [
      {
        id: "quotidien",
        title: "Le sexisme au quotidien",
        eyebrow: "Reconnaître et agir",
        summary:
          "Des clés pour identifier les situations sexistes et ne pas rester seule.",
        image: "/irieya/sexisme.jpg",
        questions: sexismQuestions,
      },
    ],
  },
]
