import "./Intro.css";

const CHAPTERS = [
  {
    eyebrow: "I · O ano",
    title: "O ano respira",
    orbs: 1,
    text: [
      "Antes dos relógios, o tempo já tinha um ritmo. A Terra não conta os dias: respira-os.",
      "Na noite mais longa do inverno, quando a luz começa a regressar, o ano inspira. Os dias alargam-se, a seiva sobe, e tudo o que vive se abre e cresce até ao pleno do verão.",
      "Aí, no topo, há um instante suspenso. Depois o ano expira: a luz recolhe, os frutos caem, a vida regressa à raiz. Na noite mais longa, outra pausa. E tudo recomeça.",
    ],
  },
  {
    eyebrow: "II · O mês",
    title: "Quarenta dias, o mesmo sopro",
    orbs: 9,
    text: [
      "Dentro dessa grande respiração vivem nove mais pequenas. Cada mês da Terra dura cerca de quarenta dias e repete o gesto do ano: metade a inspirar, metade a expirar.",
      "Entre um movimento e o outro fica sempre um pequeno silêncio, umas horas em que nada cresce nem recolhe. O que sobra da conta do Sol não se esconde: torna-se pausa.",
    ],
  },
];

export default function About() {
  return (
    <section className="view-page about" aria-labelledby="about-title">
      <div className="page-heading">
        <span className="eyebrow">Sobre</span>
        <h1 id="about-title">Um calendário que respira</h1>
      </div>
      {CHAPTERS.map((chapter) => (
        <article key={chapter.title} className="about__chapter">
          <div className="intro__breath" aria-hidden="true">
            {Array.from({ length: chapter.orbs }, (_, i) => (
              <i key={i} style={{ animationDelay: `${i * -0.9}s` }} />
            ))}
          </div>
          <span className="eyebrow">{chapter.eyebrow}</span>
          <h2>{chapter.title}</h2>
          {chapter.text.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </article>
      ))}
    </section>
  );
}
