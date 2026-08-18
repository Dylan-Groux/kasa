import styles from './HowItWorks.module.css';

const STEPS = [
  {
    title: 'Recherchez',
    description: 'Entrez votre destination, vos dates et laissez Kasa faire le reste',
  },
  {
    title: 'Réservez',
    description: "Profitez d'une plateforme sécurisée et de profils d'hôtes vérifiés.",
  },
  {
    title: "Vivez l'expérience",
    description: 'Installez-vous, profitez de votre séjour, et sentez-vous chez vous, partout.',
  },
];

export function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.intro}>
        <h2 className={styles.title}>Comment ça marche ?</h2>
        <p className={styles.subtitle}>
          Que vous partiez pour un week-end improvisé, des vacances en famille ou un voyage
          professionnel, Kasa vous aide à trouver un lieu qui vous ressemble.
        </p>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((step) => (
          <li key={step.title} className={styles.step}>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
