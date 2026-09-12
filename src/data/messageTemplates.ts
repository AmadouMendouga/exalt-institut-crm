import { MessageTemplate, RelanceType } from '../types';

// Choisit une formulation au hasard parmi les variantes d'un modèle, pour
// éviter d'envoyer systématiquement le texte identique à chaque relance.
export function pickVariant(variants: string[]): string {
  return variants[Math.floor(Math.random() * variants.length)] ?? '';
}

export const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [
  // 1. Post-Service Follow-up
  {
    id: 'tpl-ps-wa',
    relanceType: 'post_service',
    title: {
      fr: 'Suivi Qualité & Satisfaction WhatsApp',
      en: 'Post-Service Satisfaction WhatsApp'
    },
    category: {
      fr: 'Suivi Post-Prestation',
      en: 'Post-Service Follow-up'
    },
    channel: 'WhatsApp',
    content: {
      fr: [
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. Votre soin *[Prestation]* a été réalisé récemment dans notre institut, et nous espérons qu'il vous a pleinement satisfait(e).\n\nSi ce n'est pas le cas, n'hésitez pas à nous le faire savoir, votre confort est notre priorité.\n\nVotre avis nous ferait très plaisir :\nhttps://exalt-beauty.up.railway.app/avis\n\nAu plaisir de vous revoir bientôt,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nToute l'équipe espère que vous allez bien depuis votre passage pour *[Prestation]*. Nous avons pris beaucoup de plaisir à nous occuper de vous.\n\nSi quelque chose ne vous a pas pleinement convenu, dites-le-nous simplement, nous serons ravis d'y remédier.\n\nVotre retour compte beaucoup pour nous :\nhttps://exalt-beauty.up.railway.app/avis\n\nBelle journée à vous,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nMerci encore pour votre confiance lors de votre récent soin *[Prestation]*. Nous espérons que le résultat vous a plu autant qu'à nous de vous accueillir.\n\nN'hésitez surtout pas à nous partager votre ressenti :\nhttps://exalt-beauty.up.railway.app/avis\n\nAu plaisir de prendre soin de vous à nouveau,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous pensions à vous et espérons que vous allez bien depuis votre soin *[Prestation]*. Votre satisfaction compte énormément pour nous.\n\nSi quelque chose vous a manqué, faites-le-nous savoir sans hésiter, sinon un petit mot nous ferait chaud au cœur :\nhttps://exalt-beauty.up.railway.app/avis\n\nÀ très bientôt,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nQuelques jours après votre *[Prestation]*, nous espérons que tout vous convient parfaitement. Votre bien-être reste notre plus grande priorité.\n\nUn avis de votre part nous aiderait énormément à continuer de bien faire :\nhttps://exalt-beauty.up.railway.app/avis\n\nAvec toute notre gratitude,\n_L'équipe Exalt_ ✨`
      ],
      en: [
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. Your *[Prestation]* was completed recently at our institute, and we truly hope you are fully satisfied with it.\n\nIf that isn't the case, please let us know, your comfort is our priority.\n\nWe would love to hear your thoughts:\nhttps://exalt-beauty.up.railway.app/avis\n\nLooking forward to seeing you again soon,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nThe whole team hopes you've been doing well since your *[Prestation]*. We truly enjoyed taking care of you.\n\nIf anything didn't fully meet your expectations, just tell us, we'd be glad to make it right.\n\nYour feedback means a lot to us:\nhttps://exalt-beauty.up.railway.app/avis\n\nHave a wonderful day,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nThank you again for trusting us with your recent *[Prestation]*. We hope the result pleased you as much as we enjoyed having you.\n\nFeel free to share your thoughts:\nhttps://exalt-beauty.up.railway.app/avis\n\nLooking forward to taking care of you again,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe were thinking of you and hope you've been well since your *[Prestation]*. Your satisfaction truly matters to us.\n\nIf something was missing, please tell us, otherwise a quick note from you would mean the world:\nhttps://exalt-beauty.up.railway.app/avis\n\nSee you again soon,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nA few days after your *[Prestation]*, we hope everything still suits you perfectly. Your wellbeing remains our greatest priority.\n\nA quick review from you would help us keep improving:\nhttps://exalt-beauty.up.railway.app/avis\n\nWith our sincere gratitude,\n_The Exalt Team_ ✨`
      ]
    },
    ctaText: {
      fr: 'Donner mon avis',
      en: 'Leave Feedback'
    }
  },
  {
    id: 'tpl-ps-sms',
    relanceType: 'post_service',
    title: {
      fr: 'Suivi Qualité SMS Rapide',
      en: 'Post-Service Quick SMS'
    },
    category: {
      fr: 'Suivi Post-Prestation',
      en: 'Post-Service Follow-up'
    },
    channel: 'SMS',
    content: {
      fr: [
        `Bonjour 👋 [Nom], nous espérons que vous allez bien depuis votre [Prestation] chez Exalt Institut. Votre avis nous ferait plaisir : https://exalt-beauty.up.railway.app/avis`,
        `Bonjour 👋 [Nom], nous espérons que votre [Prestation] chez Exalt Institut vous a pleinement satisfait(e). Partagez votre avis : https://exalt-beauty.up.railway.app/avis`,
        `Exalt Institut : merci pour votre visite, [Nom]. Votre retour sur votre [Prestation] nous intéresse : https://exalt-beauty.up.railway.app/avis`,
        `Bonjour 👋 [Nom], toute l'équipe espère que vous allez bien après votre [Prestation]. Un petit avis nous ferait très plaisir : https://exalt-beauty.up.railway.app/avis`,
        `Exalt Institut : [Nom], nous pensions à vous après votre [Prestation]. Dites-nous comment vous allez : https://exalt-beauty.up.railway.app/avis`
      ],
      en: [
        `Hello 👋 [Nom], we hope you've been well since your [Prestation] at Exalt Institute. Your feedback would mean a lot: https://exalt-beauty.up.railway.app/avis`,
        `Hello 👋 [Nom], we hope your [Prestation] at Exalt Institute fully met your expectations. Share your review: https://exalt-beauty.up.railway.app/avis`,
        `Exalt Institute: thank you for your visit, [Nom]. We would value your feedback on your [Prestation]: https://exalt-beauty.up.railway.app/avis`,
        `Hello 👋 [Nom], the whole team hopes you've been well since your [Prestation]. A quick review would mean a lot: https://exalt-beauty.up.railway.app/avis`,
        `Exalt Institute: [Nom], we were thinking of you after your [Prestation]. Let us know how you're doing: https://exalt-beauty.up.railway.app/avis`
      ]
    },
    ctaText: {
      fr: 'Réserver',
      en: 'Book Now'
    }
  },
  {
    id: 'tpl-ps-email',
    relanceType: 'post_service',
    title: {
      fr: 'Enquête de Satisfaction Email',
      en: 'Post-Service Satisfaction Email'
    },
    category: {
      fr: 'Suivi Post-Prestation',
      en: 'Post-Service Follow-up'
    },
    channel: 'Email',
    subject: {
      fr: 'Votre passage chez Exalt Institut - Votre avis compte pour nous',
      en: 'Your visit at Exalt Institute - We value your feedback'
    },
    content: {
      fr: [
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez bien. Nous vous remercions pour votre confiance lors de votre récent passage pour : [Prestation] le [Date].\n\nAfin de maintenir l'excellence de nos soins, nous serions ravis de recueillir votre retour d'expérience. Si quelque chose ne vous a pas pleinement satisfait, n'hésitez pas à nous en parler.\n\nVous pouvez nous laisser votre avis via : https://exalt-beauty.up.railway.app/avis\n\nPour prolonger les bienfaits de votre soin, nous vous recommandons également : [Nouvelle Prestation].\n\nBien cordialement,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez bien depuis votre récente prestation ([Prestation] du [Date]).\n\nVotre expérience compte énormément pour nous : n'hésitez pas à nous faire part de votre avis, qu'il soit positif ou qu'il y ait matière à progresser, via https://exalt-beauty.up.railway.app/avis\n\nNotre équipe reste également disponible pour vous conseiller sur votre prochain soin : [Nouvelle Prestation].\n\nCordialement,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nMerci de votre visite chez Exalt Institut pour [Prestation] le [Date]. Nous espérons sincèrement que vous êtes reparti(e) satisfait(e).\n\nSi ce n'est pas totalement le cas, nous serions ravis d'y remédier. Partagez votre avis via https://exalt-beauty.up.railway.app/avis\n\nN'hésitez pas également à découvrir notre soin complémentaire : [Nouvelle Prestation].\n\nBien à vous,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nToute l'équipe espère que vous allez bien depuis votre [Prestation] du [Date]. Nous avons pris grand soin de vous et espérons que cela se ressent.\n\nVotre avis nous aiderait beaucoup à continuer de progresser : https://exalt-beauty.up.railway.app/avis\n\nNous vous suggérons également : [Nouvelle Prestation], pour prolonger les bienfaits obtenus.\n\nAvec toute notre gratitude,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nQuelques jours après votre [Prestation] du [Date], nous espérons que tout vous convient parfaitement.\n\nSi une question ou une remarque vous vient à l'esprit, nous sommes à votre écoute. Un avis de votre part nous ferait également très plaisir : https://exalt-beauty.up.railway.app/avis\n\nPour continuer sur cette lancée, nous vous recommandons : [Nouvelle Prestation].\n\nBien cordialement,\nL'équipe Exalt ✨`
      ],
      en: [
        `Dear [Nom],\n\nWe hope you are doing well. Thank you for choosing Exalt Institute for your recent treatment: [Prestation] on [Date].\n\nTo maintain the highest quality standards, we would love to hear your feedback. If anything did not fully meet your expectations, please let us know.\n\nYou may leave your review here: https://exalt-beauty.up.railway.app/avis\n\nTo extend the benefits of your treatment, our team also recommends: [Nouvelle Prestation].\n\nWarm regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nWe hope you've been doing well since your recent treatment ([Prestation] on [Date]).\n\nYour experience matters greatly to us: please feel free to share your feedback, whether positive or something we could improve, at https://exalt-beauty.up.railway.app/avis\n\nOur team also remains available to advise you on your next treatment: [Nouvelle Prestation].\n\nKind regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nThank you for your visit to Exalt Institute for [Prestation] on [Date]. We sincerely hope you left fully satisfied.\n\nIf that wasn't entirely the case, we'd be glad to make it right. Share your review at https://exalt-beauty.up.railway.app/avis\n\nFeel free to also explore our complementary treatment: [Nouvelle Prestation].\n\nBest regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nThe whole team hopes you've been well since your [Prestation] on [Date]. We took great care of you and hope it shows.\n\nYour feedback would help us keep improving: https://exalt-beauty.up.railway.app/avis\n\nWe also suggest: [Nouvelle Prestation], to extend the benefits you've gained.\n\nWith our sincere gratitude,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nA few days after your [Prestation] on [Date], we hope everything still suits you perfectly.\n\nIf any question or comment comes to mind, we are here to listen. A review from you would also mean a lot: https://exalt-beauty.up.railway.app/avis\n\nTo keep up the momentum, we recommend: [Nouvelle Prestation].\n\nKind regards,\nThe Exalt Team ✨`
      ]
    },
    ctaText: {
      fr: 'Évaluer ma prestation',
      en: 'Review My Service'
    }
  },

  // 2. Upsell / Suggéré
  {
    id: 'tpl-up-wa',
    relanceType: 'upsell',
    title: {
      fr: 'Recommandation Experte WhatsApp',
      en: 'Recommended Upsell WhatsApp'
    },
    category: {
      fr: 'Vente Incitative (Upsell)',
      en: 'Upsell & Cross-sell'
    },
    channel: 'WhatsApp',
    content: {
      fr: [
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. Suite à votre soin *[Prestation]*, nos expert(e)s pensent que *[Nouvelle Prestation]* pourrait vous plaire tout particulièrement.\n\nEn réservant cette semaine, profitez de 10% de remise.\nRéservez votre créneau : https://exalt-beauty.up.railway.app/rdv\n\nCordialement,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nEn pensant à vous et à votre *[Prestation]*, notre équipe a une recommandation à vous faire : *[Nouvelle Prestation]*, pour prolonger les bienfaits obtenus.\n\n10% de remise pour toute réservation cette semaine : https://exalt-beauty.up.railway.app/rdv\n\nAu plaisir de vous accueillir,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. Nos spécialistes ont identifié un soin qui complèterait idéalement votre *[Prestation]* : *[Nouvelle Prestation]*.\n\nRéservez cette semaine et bénéficiez de 10% de remise : https://exalt-beauty.up.railway.app/rdv\n\nBien à vous,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nToute l'équipe espère que vous allez bien. Nous avons pensé à vous en découvrant *[Nouvelle Prestation]*, un excellent complément à votre *[Prestation]*.\n\nProfitez de 10% de remise en réservant cette semaine : https://exalt-beauty.up.railway.app/rdv\n\nÀ très bientôt,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez merveilleusement bien. Pour prolonger les résultats de votre *[Prestation]*, nous vous suggérons volontiers *[Nouvelle Prestation]*.\n\nUne remise de 10% vous attend si vous réservez cette semaine : https://exalt-beauty.up.railway.app/rdv\n\nAvec plaisir,\n_L'équipe Exalt_ ✨`
      ],
      en: [
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. Following your *[Prestation]*, our specialists believe *[Nouvelle Prestation]* could be perfect for you.\n\nBook this week and enjoy a 10% discount.\nReserve your slot: https://exalt-beauty.up.railway.app/rdv\n\nBest regards,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nThinking of you and your *[Prestation]*, our team has a recommendation: *[Nouvelle Prestation]*, to extend the benefits you've gained.\n\n10% off any booking made this week: https://exalt-beauty.up.railway.app/rdv\n\nLooking forward to welcoming you,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. Our specialists identified a treatment that would ideally complement your *[Prestation]*: *[Nouvelle Prestation]*.\n\nBook this week to receive a 10% discount: https://exalt-beauty.up.railway.app/rdv\n\nKind regards,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nThe whole team hopes you are doing well. We thought of you when we came across *[Nouvelle Prestation]*, a wonderful complement to your *[Prestation]*.\n\nEnjoy 10% off by booking this week: https://exalt-beauty.up.railway.app/rdv\n\nSee you soon,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing wonderfully well. To extend the results of your *[Prestation]*, we'd be glad to suggest *[Nouvelle Prestation]*.\n\nA 10% discount awaits if you book this week: https://exalt-beauty.up.railway.app/rdv\n\nWith pleasure,\n_The Exalt Team_ ✨`
      ]
    },
    ctaText: {
      fr: 'Profiter de l\'offre',
      en: 'Claim Offer'
    }
  },
  {
    id: 'tpl-up-sms',
    relanceType: 'upsell',
    title: {
      fr: 'Upsell Recommandé SMS',
      en: 'Suggested Upsell SMS'
    },
    category: {
      fr: 'Vente Incitative (Upsell)',
      en: 'Upsell & Cross-sell'
    },
    channel: 'SMS',
    content: {
      fr: [
        `Bonjour 👋 [Nom], suite à votre [Prestation], profitez d'une offre privilège sur notre soin "[Nouvelle Prestation]". Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institut : [Nom], notre équipe vous recommande "[Nouvelle Prestation]" pour compléter votre [Prestation]. Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Bonjour 👋 [Nom], une remise vous attend sur "[Nouvelle Prestation]" suite à votre récente [Prestation]. Réservez ici : https://exalt-beauty.up.railway.app/rdv`,
        `Bonjour 👋 [Nom], nous avons pensé à vous : "[Nouvelle Prestation]" complèterait bien votre [Prestation]. Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institut : [Nom], envie de prolonger les bienfaits de votre [Prestation] ? Découvrez "[Nouvelle Prestation]" : https://exalt-beauty.up.railway.app/rdv`
      ],
      en: [
        `Hello 👋 [Nom], following your [Prestation], enjoy a special offer on our "[Nouvelle Prestation]" treatment. Book now: https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institute: [Nom], our team recommends "[Nouvelle Prestation]" to complement your [Prestation]. Book here: https://exalt-beauty.up.railway.app/rdv`,
        `Hello 👋 [Nom], a discount awaits you on "[Nouvelle Prestation]" following your recent [Prestation]. Book now: https://exalt-beauty.up.railway.app/rdv`,
        `Hello 👋 [Nom], we thought of you: "[Nouvelle Prestation]" would pair nicely with your [Prestation]. Book: https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institute: [Nom], want to extend the benefits of your [Prestation]? Discover "[Nouvelle Prestation]": https://exalt-beauty.up.railway.app/rdv`
      ]
    },
    ctaText: {
      fr: 'Découvrir l\'offre',
      en: 'View Offer'
    }
  },
  {
    id: 'tpl-up-email',
    relanceType: 'upsell',
    title: {
      fr: 'Conseil Personnalisé & Upsell Email',
      en: 'Custom Care & Upsell Email'
    },
    category: {
      fr: 'Vente Incitative (Upsell)',
      en: 'Upsell & Cross-sell'
    },
    channel: 'Email',
    subject: {
      fr: 'Recommandation personnalisée pour votre routine beauté',
      en: 'Personalized recommendation for your beauty routine'
    },
    content: {
      fr: [
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez bien. Suite à votre dernier soin ([Prestation]), notre équipe a identifié une opportunité d'enrichir votre routine beauté.\n\nNous vous conseillons le soin suivant : [Nouvelle Prestation].\n\nBénéficiez d'une réduction exclusive de 10% sur ce soin lors de votre prise de rendez-vous en ligne.\n\nÀ très bientôt dans notre institut,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez bien depuis votre [Prestation]. Afin de prolonger les résultats obtenus, nous vous recommandons volontiers : [Nouvelle Prestation].\n\nUne remise de 10% est offerte pour toute réservation effectuée en ligne.\n\nNotre équipe reste à votre disposition pour toute question,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nNotre équipe a pensé à vous : suite à votre [Prestation], le soin [Nouvelle Prestation] pourrait idéalement compléter votre routine.\n\nProfitez de 10% de réduction en réservant dès maintenant.\n\nCordialement,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez merveilleusement bien. Nous avons une recommandation personnalisée pour vous suite à votre [Prestation] : [Nouvelle Prestation].\n\nRéservez en ligne cette semaine pour bénéficier de 10% de réduction.\n\nBien à vous,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nEnvie de prolonger les bienfaits de votre [Prestation] ? Nous vous suggérons : [Nouvelle Prestation], particulièrement adapté à votre routine.\n\n10% de réduction vous attendent pour toute réservation en ligne.\n\nAvec plaisir,\nL'équipe Exalt ✨`
      ],
      en: [
        `Dear [Nom],\n\nWe hope you are doing well. Following your last visit ([Prestation]), our team has identified an opportunity to enhance your beauty routine.\n\nWe recommend: [Nouvelle Prestation].\n\nReceive an exclusive 10% discount when scheduling this treatment online.\n\nBest regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nWe hope you've been well since your [Prestation]. To extend the results you've gained, we would be glad to recommend: [Nouvelle Prestation].\n\nA 10% discount is available for any booking made online.\n\nOur team remains available for any questions,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nWe thought of you: following your [Prestation], the treatment [Nouvelle Prestation] could ideally complement your routine.\n\nEnjoy a 10% discount by booking now.\n\nKind regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nWe hope you are doing wonderfully well. We have a personalized recommendation for you following your [Prestation]: [Nouvelle Prestation].\n\nBook online this week to enjoy a 10% discount.\n\nBest regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nLooking to extend the benefits of your [Prestation]? We suggest: [Nouvelle Prestation], especially well suited to your routine.\n\nA 10% discount awaits any online booking.\n\nWith pleasure,\nThe Exalt Team ✨`
      ]
    },
    ctaText: {
      fr: 'Prendre Rendez-vous',
      en: 'Schedule Appointment'
    }
  },

  // 3. Discount & Promotions
  {
    id: 'tpl-disc-wa',
    relanceType: 'discount',
    title: {
      fr: 'Code Promo Exclusif WhatsApp',
      en: 'Exclusive Promo Code WhatsApp'
    },
    category: {
      fr: 'Offres & Remises',
      en: 'Offers & Discounts'
    },
    channel: 'WhatsApp',
    content: {
      fr: [
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. En tant que cliente privilégiée, bénéficiez d'une remise immédiate de 15% (jusqu'à 50 000 FCFA) avec le code *PROMO15* 🎁 sur votre prochain *[Nouvelle Prestation]* chez Exalt Institut.\n\nOffre valable jusqu'à la fin du mois.\nRéservez directement : https://exalt-beauty.up.railway.app/rdv\n\nCordialement,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nPour vous remercier de votre fidélité, une remise de 15% vous est proposée avec le code *PROMO15* 🎁 sur *[Nouvelle Prestation]*.\n\nOffre valable jusqu'à la fin du mois : https://exalt-beauty.up.railway.app/rdv\n\nAu plaisir de vous accueillir,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez merveilleusement bien. Une offre spéciale vous est réservée : 15% de remise avec le code *PROMO15* 🎁 sur votre prochain *[Nouvelle Prestation]*.\n\nValable jusqu'à la fin du mois. Réservez ici : https://exalt-beauty.up.railway.app/rdv\n\nBien à vous,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nToute l'équipe pense à vous. Pour cette fin de mois, profitez de 15% de remise avec le code *PROMO15* 🎁 sur *[Nouvelle Prestation]*.\n\nRéservez votre créneau ici : https://exalt-beauty.up.railway.app/rdv\n\nÀ très vite,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. Une petite attention pour vous : 15% de remise avec le code *PROMO15* 🎁 sur votre prochain *[Nouvelle Prestation]*, jusqu'à la fin du mois.\n\nRéservez ici : https://exalt-beauty.up.railway.app/rdv\n\nAvec toute notre reconnaissance,\n_L'équipe Exalt_ ✨`
      ],
      en: [
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. As a valued client, enjoy an immediate 15% discount (up to 50,000 FCFA) with code *PROMO15* 🎁 on your upcoming *[Nouvelle Prestation]* at Exalt Institute.\n\nOffer valid until the end of this month.\nBook directly: https://exalt-beauty.up.railway.app/rdv\n\nBest regards,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nTo thank you for your loyalty, we are offering a 15% discount with code *PROMO15* 🎁 on *[Nouvelle Prestation]*.\n\nValid until the end of this month: https://exalt-beauty.up.railway.app/rdv\n\nLooking forward to welcoming you,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing wonderfully well. A special offer awaits you: 15% off with code *PROMO15* 🎁 on your upcoming *[Nouvelle Prestation]*.\n\nValid until the end of the month. Book here: https://exalt-beauty.up.railway.app/rdv\n\nKind regards,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nThe whole team is thinking of you. For this end of month, enjoy 15% off with code *PROMO15* 🎁 on *[Nouvelle Prestation]*.\n\nBook your slot here: https://exalt-beauty.up.railway.app/rdv\n\nSee you very soon,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. A small token of appreciation: 15% off with code *PROMO15* 🎁 on your upcoming *[Nouvelle Prestation]*, valid until the end of the month.\n\nBook here: https://exalt-beauty.up.railway.app/rdv\n\nWith our sincere gratitude,\n_The Exalt Team_ ✨`
      ]
    },
    ctaText: {
      fr: 'Activer le code promo',
      en: 'Apply Promo Code'
    }
  },
  {
    id: 'tpl-disc-sms',
    relanceType: 'discount',
    title: {
      fr: 'Remise Flash SMS',
      en: 'Flash Discount SMS'
    },
    category: {
      fr: 'Offres & Remises',
      en: 'Offers & Discounts'
    },
    channel: 'SMS',
    content: {
      fr: [
        `Exalt Institut : Bonjour 👋 [Nom], profitez de -10% sur votre prochain rendez-vous avec le code VIP10 🎁. Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Bonjour 👋 [Nom], une remise de 10% vous attend avec le code VIP10 🎁 chez Exalt Institut. Réservez ici : https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institut : [Nom], le code VIP10 🎁 vous offre 10% sur votre prochain soin. Réservez votre créneau : https://exalt-beauty.up.railway.app/rdv`,
        `Bonjour 👋 [Nom], pour vous remercier de votre fidélité : -10% avec le code VIP10 🎁. Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institut : [Nom], une belle surprise vous attend : 10% de remise avec VIP10 🎁. Réservez ici : https://exalt-beauty.up.railway.app/rdv`
      ],
      en: [
        `Exalt Institute: Hello 👋 [Nom], enjoy 10% off your next appointment with code VIP10 🎁. Book now: https://exalt-beauty.up.railway.app/rdv`,
        `Hello 👋 [Nom], a 10% discount awaits you with code VIP10 🎁 at Exalt Institute. Book here: https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institute: [Nom], code VIP10 🎁 gives you 10% off your next treatment. Book your slot: https://exalt-beauty.up.railway.app/rdv`,
        `Hello 👋 [Nom], to thank you for your loyalty: -10% with code VIP10 🎁. Book now: https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institute: [Nom], a nice surprise awaits you: 10% off with VIP10 🎁. Book here: https://exalt-beauty.up.railway.app/rdv`
      ]
    },
    ctaText: {
      fr: 'Réserver avec code',
      en: 'Book with Code'
    }
  },
  {
    id: 'tpl-disc-email',
    relanceType: 'discount',
    title: {
      fr: 'Campagne Offre Spéciale Email',
      en: 'Special Offer Campaign Email'
    },
    category: {
      fr: 'Offres & Remises',
      en: 'Offers & Discounts'
    },
    channel: 'Email',
    subject: {
      fr: 'Votre bon de réduction exclusif - Exalt Institut',
      en: 'Your exclusive discount voucher - Exalt Institute'
    },
    content: {
      fr: [
        `Bonjour 👋 [Nom],\n\nNous espérons que vous allez bien. En tant que cliente fidèle d'Exalt Institut, nous avons le plaisir de vous offrir une remise spéciale de 10% à 20% sur l'ensemble de nos forfaits de soins.\n\nUtilisez le code promo : VIPFCFA 🎁 lors de votre prochaine réservation.\n\nN'hésitez pas à réserver en ligne ou à nous contacter.\n\nL'équipe Exalt ✨`,
        `Bonjour 👋 [Nom],\n\nPour vous remercier de votre confiance, une remise de 10% à 20% vous est proposée sur nos forfaits de soins avec le code VIPFCFA 🎁.\n\nRéservez dès aujourd'hui en ligne ou contactez notre équipe.\n\nCordialement,\nL'équipe Exalt ✨`,
        `Bonjour 👋 [Nom],\n\nUne offre exclusive vous attend chez Exalt Institut : 10% à 20% de remise sur nos soins avec le code VIPFCFA 🎁.\n\nRéservez en ligne dès maintenant.\n\nBien à vous,\nL'équipe Exalt ✨`,
        `Bonjour 👋 [Nom],\n\nNous espérons que vous allez merveilleusement bien. Toute l'équipe souhaitait vous faire profiter d'une remise de 10% à 20% sur nos soins avec le code VIPFCFA 🎁.\n\nRéservez quand vous le souhaitez, en ligne.\n\nAvec plaisir,\nL'équipe Exalt ✨`,
        `Bonjour 👋 [Nom],\n\nUne attention spéciale pour vous : 10% à 20% de remise sur nos forfaits de soins avec le code VIPFCFA 🎁, valable prochainement.\n\nRéservez en ligne en quelques clics.\n\nCordialement,\nL'équipe Exalt ✨`
      ],
      en: [
        `Dear [Nom],\n\nWe hope you are doing well. As a valued client of Exalt Institute, we are pleased to offer you a special discount of 10% to 20% across our treatment packages.\n\nUse promo code: VIPFCFA 🎁 when booking your next visit.\n\nFeel free to book online or contact our team directly.\n\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nTo thank you for your trust, we are offering a 10% to 20% discount on our treatment packages with code VIPFCFA 🎁.\n\nBook online today or reach out to our team.\n\nKind regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nAn exclusive offer awaits you at Exalt Institute: 10% to 20% off our treatments with code VIPFCFA 🎁.\n\nBook online now.\n\nBest regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nWe hope you are doing wonderfully well. The whole team wanted you to enjoy a 10% to 20% discount on our treatments with code VIPFCFA 🎁.\n\nBook online whenever suits you.\n\nWith pleasure,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nA special token for you: 10% to 20% off our treatment packages with code VIPFCFA 🎁, valid soon.\n\nBook online in just a few clicks.\n\nKind regards,\nThe Exalt Team ✨`
      ]
    },
    ctaText: {
      fr: 'Réserver avec ma remise',
      en: 'Book with Discount'
    }
  },

  // 4. Periodic Reminder / Maintenance Due
  {
    id: 'tpl-per-wa',
    relanceType: 'periodic_reminder',
    title: {
      fr: 'Rappel Échéance Entretien WhatsApp',
      en: 'Routine Care Reminder WhatsApp'
    },
    category: {
      fr: 'Rappel Périodique & Entretien',
      en: 'Periodic Reminder & Upkeep'
    },
    channel: 'WhatsApp',
    content: {
      fr: [
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. Cela fait plusieurs semaines depuis votre dernier soin *[Prestation]*. Pour prolonger les bienfaits obtenus, il serait bon de prévoir votre prochain rendez-vous.\n\nSoin suggéré : *[Nouvelle Prestation]*\nChoisissez votre créneau : https://exalt-beauty.up.railway.app/rdv\n\nCordialement,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nVotre soin *[Prestation]* approche de son échéance d'entretien recommandée. Nous vous conseillons de planifier votre prochaine visite.\n\nSoin suggéré : *[Nouvelle Prestation]*\nRéservez ici : https://exalt-beauty.up.railway.app/rdv\n\nAu plaisir de vous revoir,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. Il est temps de penser à l'entretien de votre *[Prestation]* pour en conserver tous les bienfaits.\n\nNous vous recommandons : *[Nouvelle Prestation]*\nPrenez rendez-vous : https://exalt-beauty.up.railway.app/rdv\n\nBien à vous,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nToute l'équipe pense à vous. Votre *[Prestation]* mériterait un petit rafraîchissement bientôt pour rester impeccable.\n\nNous vous suggérons : *[Nouvelle Prestation]*\nRéservez ici : https://exalt-beauty.up.railway.app/rdv\n\nÀ très bientôt,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez merveilleusement bien. Quelques semaines se sont écoulées depuis votre *[Prestation]* : le bon moment pour reprendre rendez-vous.\n\nSoin recommandé : *[Nouvelle Prestation]*\nChoisissez votre créneau ici : https://exalt-beauty.up.railway.app/rdv\n\nAvec plaisir,\n_L'équipe Exalt_ ✨`
      ],
      en: [
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. It has been several weeks since your last *[Prestation]*. To maintain the results, we recommend scheduling your next appointment.\n\nSuggested treatment: *[Nouvelle Prestation]*\nPick your time slot: https://exalt-beauty.up.railway.app/rdv\n\nBest regards,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nYour *[Prestation]* is approaching its recommended maintenance schedule. We suggest planning your next visit.\n\nSuggested treatment: *[Nouvelle Prestation]*\nBook here: https://exalt-beauty.up.railway.app/rdv\n\nLooking forward to seeing you,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. It's a good time to consider upkeep for your *[Prestation]* to preserve its full benefits.\n\nWe recommend: *[Nouvelle Prestation]*\nBook your appointment: https://exalt-beauty.up.railway.app/rdv\n\nKind regards,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nThe whole team is thinking of you. Your *[Prestation]* could use a little refresh soon to stay flawless.\n\nWe suggest: *[Nouvelle Prestation]*\nBook here: https://exalt-beauty.up.railway.app/rdv\n\nSee you very soon,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing wonderfully well. A few weeks have passed since your *[Prestation]*: a good moment to book again.\n\nRecommended treatment: *[Nouvelle Prestation]*\nPick your slot here: https://exalt-beauty.up.railway.app/rdv\n\nWith pleasure,\n_The Exalt Team_ ✨`
      ]
    },
    ctaText: {
      fr: 'Choisir mon créneau',
      en: 'Pick Time Slot'
    }
  },
  {
    id: 'tpl-per-sms',
    relanceType: 'periodic_reminder',
    title: {
      fr: 'Rappel Entretien SMS',
      en: 'Periodic Reminder SMS'
    },
    category: {
      fr: 'Rappel Périodique & Entretien',
      en: 'Periodic Reminder & Upkeep'
    },
    channel: 'SMS',
    content: {
      fr: [
        `Exalt Institut : Bonjour 👋 [Nom], il est temps de reprendre rendez-vous pour l'entretien de votre [Prestation]. Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Bonjour 👋 [Nom], pensez à planifier l'entretien de votre [Prestation] chez Exalt Institut. Réservez ici : https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institut : [Nom], votre prochain entretien [Prestation] approche. Prenez rendez-vous : https://exalt-beauty.up.railway.app/rdv`,
        `Bonjour 👋 [Nom], votre [Prestation] mériterait un petit rafraîchissement. Réservez ici : https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institut : [Nom], le bon moment pour reprendre rendez-vous après votre [Prestation]. Réservez : https://exalt-beauty.up.railway.app/rdv`
      ],
      en: [
        `Exalt Institute Reminder: Hello 👋 [Nom], it's time to book your follow-up appointment for your [Prestation]. Book: https://exalt-beauty.up.railway.app/rdv`,
        `Hello 👋 [Nom], it's time to plan the upkeep of your [Prestation] at Exalt Institute. Book here: https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institute: [Nom], your next [Prestation] upkeep is approaching. Schedule now: https://exalt-beauty.up.railway.app/rdv`,
        `Hello 👋 [Nom], your [Prestation] could use a little refresh. Book here: https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institute: [Nom], a good time to book again after your [Prestation]. Book: https://exalt-beauty.up.railway.app/rdv`
      ]
    },
    ctaText: {
      fr: 'Prendre RDV',
      en: 'Schedule Now'
    }
  },
  {
    id: 'tpl-per-email',
    relanceType: 'periodic_reminder',
    title: {
      fr: 'Alerte Calendrier Entretien Email',
      en: 'Routine Care Schedule Email'
    },
    category: {
      fr: 'Rappel Périodique & Entretien',
      en: 'Periodic Reminder & Upkeep'
    },
    channel: 'Email',
    subject: {
      fr: 'Rappel d\'échéance : votre prochain rendez-vous beauté',
      en: 'Scheduled Reminder: your next beauty appointment is due'
    },
    content: {
      fr: [
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez bien. Selon notre carnet de suivi beauté, il est temps de renouveler votre soin suite à votre prestation "[Prestation]" effectuée le [Date].\n\nNous vous recommandons de planifier : [Nouvelle Prestation].\n\nRéservez votre créneau en ligne en quelques clics.\n\nCordialement,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nVotre soin "[Prestation]" du [Date] approche de son échéance d'entretien recommandée.\n\nNous vous conseillons : [Nouvelle Prestation].\n\nVous pouvez réserver directement en ligne.\n\nBien cordialement,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nNous vous rappelons qu'il est temps de prévoir votre prochain rendez-vous suite à "[Prestation]" du [Date].\n\nSoin recommandé : [Nouvelle Prestation].\n\nRéservation en ligne disponible à tout moment.\n\nCordialement,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez merveilleusement bien. Toute l'équipe pense à vous : votre "[Prestation]" du [Date] mériterait un petit entretien.\n\nNous recommandons : [Nouvelle Prestation].\n\nRéservez en ligne quand cela vous conviendra.\n\nAvec plaisir,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nQuelques semaines après votre "[Prestation]" du [Date], c'est le bon moment pour reprendre rendez-vous et conserver tous les bienfaits obtenus.\n\nSoin suggéré : [Nouvelle Prestation].\n\nRéservation en ligne en quelques clics.\n\nBien à vous,\nL'équipe Exalt ✨`
      ],
      en: [
        `Dear [Nom],\n\nWe hope you are doing well. According to our beauty tracking records, it is time to renew your treatment following your "[Prestation]" completed on [Date].\n\nWe advise scheduling: [Nouvelle Prestation].\n\nBook your convenient time slot online in seconds.\n\nBest regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nYour "[Prestation]" from [Date] is approaching its recommended maintenance schedule.\n\nWe recommend: [Nouvelle Prestation].\n\nYou may book directly online.\n\nKind regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nThis is a reminder that it's time to plan your next appointment following "[Prestation]" on [Date].\n\nRecommended treatment: [Nouvelle Prestation].\n\nOnline booking is available at any time.\n\nBest regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nWe hope you are doing wonderfully well. The whole team is thinking of you: your "[Prestation]" from [Date] could use a little upkeep.\n\nWe recommend: [Nouvelle Prestation].\n\nBook online whenever it suits you.\n\nWith pleasure,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nA few weeks after your "[Prestation]" on [Date], now is a good time to book again and preserve all the benefits gained.\n\nSuggested treatment: [Nouvelle Prestation].\n\nOnline booking in just a few clicks.\n\nKind regards,\nThe Exalt Team ✨`
      ]
    },
    ctaText: {
      fr: 'Prendre rendez-vous',
      en: 'Book Appointment'
    }
  },

  // 5. Re-engagement
  {
    id: 'tpl-re-wa',
    relanceType: 'reengagement',
    title: {
      fr: 'Réengagement Inactivité WhatsApp',
      en: 'Re-engagement WhatsApp'
    },
    category: {
      fr: 'Réengagement Inactivité',
      en: 'Re-engagement & Reactivation'
    },
    channel: 'WhatsApp',
    content: {
      fr: [
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. Cela fait un moment que nous n'avons pas eu le plaisir de vous accueillir chez Exalt Institut depuis votre *[Prestation]*.\n\nPour votre retour, un diagnostic beauté complet vous est offert.\nPrenez contact ou réservez ici : https://exalt-beauty.up.railway.app/rdv\n\nAu plaisir de vous revoir,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. Votre dernier passage pour *[Prestation]* remonte à quelque temps. Nous serions ravis de vous accueillir à nouveau.\n\nUn diagnostic beauté offert vous attend pour votre retour : https://exalt-beauty.up.railway.app/rdv\n\nCordialement,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nToute l'équipe d'Exalt Institut espère que vous allez bien. Cela fait un moment depuis votre *[Prestation]*.\n\nProfitez d'un diagnostic beauté offert pour votre prochaine visite : https://exalt-beauty.up.railway.app/rdv\n\nBien à vous,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez merveilleusement bien. Vous nous manquez un peu depuis votre *[Prestation]* ! Nous serions ravis de prendre à nouveau soin de vous.\n\nDiagnostic beauté offert pour votre retour : https://exalt-beauty.up.railway.app/rdv\n\nAu plaisir de vous revoir très bientôt,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nCela fait plusieurs semaines depuis votre *[Prestation]* et nous pensions à vous. Si vous n'avez pas été pleinement satisfait(e) la dernière fois, n'hésitez pas à nous le dire.\n\nUn diagnostic beauté offert vous attend pour votre retour : https://exalt-beauty.up.railway.app/rdv\n\nBien à vous,\n_L'équipe Exalt_ ✨`
      ],
      en: [
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. It has been a while since we last had the pleasure of welcoming you to Exalt Institute following your *[Prestation]*.\n\nFor your return, a complete beauty diagnostic is offered.\nGet in touch or book here: https://exalt-beauty.up.railway.app/rdv\n\nLooking forward to seeing you again,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. Your last visit for *[Prestation]* was some time ago. We would be delighted to welcome you back.\n\nA complimentary beauty diagnostic awaits your return: https://exalt-beauty.up.railway.app/rdv\n\nBest regards,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nThe whole Exalt Institute team hopes you are doing well. It has been a while since your *[Prestation]*.\n\nEnjoy a complimentary beauty diagnostic on your next visit: https://exalt-beauty.up.railway.app/rdv\n\nKind regards,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing wonderfully well. We've missed you a little since your *[Prestation]*! We would love to take care of you again.\n\nComplimentary beauty diagnostic for your return: https://exalt-beauty.up.railway.app/rdv\n\nLooking forward to seeing you very soon,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nIt has been several weeks since your *[Prestation]* and we were thinking of you. If your last visit didn't fully meet your expectations, please tell us.\n\nA complimentary beauty diagnostic awaits your return: https://exalt-beauty.up.railway.app/rdv\n\nKind regards,\n_The Exalt Team_ ✨`
      ]
    },
    ctaText: {
      fr: 'Revenir chez nous',
      en: 'Welcome Back Offer'
    }
  },
  {
    id: 'tpl-re-sms',
    relanceType: 'reengagement',
    title: {
      fr: 'Réengagement SMS Flash',
      en: 'Re-engagement SMS Flash'
    },
    category: {
      fr: 'Réengagement Inactivité',
      en: 'Re-engagement & Reactivation'
    },
    channel: 'SMS',
    content: {
      fr: [
        `Bonjour 👋 [Nom], cela fait un moment ! Profitez d'un diagnostic beauté offert lors de votre prochain passage chez Exalt Institut. Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institut : [Nom], nous serions ravis de vous revoir. Diagnostic beauté offert pour votre retour : https://exalt-beauty.up.railway.app/rdv`,
        `Bonjour 👋 [Nom], votre prochaine visite chez Exalt Institut vous donne droit à un diagnostic beauté offert. Réservez ici : https://exalt-beauty.up.railway.app/rdv`,
        `Bonjour 👋 [Nom], vous nous manquez un peu ! Un diagnostic beauté offert vous attend pour votre retour. Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institut : [Nom], cela fait un moment depuis votre dernière visite. Revenez avec un diagnostic offert : https://exalt-beauty.up.railway.app/rdv`
      ],
      en: [
        `Hello 👋 [Nom], it's been a while! Enjoy a complimentary beauty diagnostic on your next visit to Exalt Institute. Book: https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institute: [Nom], we would be delighted to see you again. Complimentary beauty diagnostic for your return: https://exalt-beauty.up.railway.app/rdv`,
        `Hello 👋 [Nom], your next visit to Exalt Institute includes a complimentary beauty diagnostic. Book here: https://exalt-beauty.up.railway.app/rdv`,
        `Hello 👋 [Nom], we've missed you a little! A complimentary beauty diagnostic awaits your return. Book: https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institute: [Nom], it's been a while since your last visit. Come back with a complimentary diagnostic: https://exalt-beauty.up.railway.app/rdv`
      ]
    },
    ctaText: {
      fr: 'Activer mon offre',
      en: 'Claim Offer'
    }
  },
  {
    id: 'tpl-re-email',
    relanceType: 'reengagement',
    title: {
      fr: 'Campagne de Réactivation Email',
      en: 'Reactivation Campaign Email'
    },
    category: {
      fr: 'Réengagement Inactivité',
      en: 'Re-engagement & Reactivation'
    },
    channel: 'Email',
    subject: {
      fr: 'Cela fait un moment - profitez d\'un cadeau de bienvenue',
      en: 'It has been a while - enjoy a complimentary welcome back gift'
    },
    content: {
      fr: [
        `Bonjour 👋 [Nom],\n\nNous espérons que vous allez bien. Cela fait plusieurs mois que nous n'avons pas eu le plaisir de vous voir dans notre institut.\n\nPour fêter votre retour, nous vous offrons un diagnostic beauté complet ainsi que 15% de réduction sur votre prochain soin ([Nouvelle Prestation]).\n\nRéservez votre créneau dès aujourd'hui.\n\nL'équipe Exalt ✨`,
        `Bonjour 👋 [Nom],\n\nNous espérons que vous allez bien. Votre dernière visite chez Exalt Institut remonte à quelque temps.\n\nPour votre retour, profitez d'un diagnostic beauté offert et de 15% de réduction sur [Nouvelle Prestation].\n\nRéservez en ligne quand vous le souhaitez.\n\nCordialement,\nL'équipe Exalt ✨`,
        `Bonjour 👋 [Nom],\n\nToute l'équipe d'Exalt Institut serait ravie de vous accueillir à nouveau.\n\nÀ l'occasion de votre retour, bénéficiez d'un diagnostic beauté offert et de 15% de réduction sur [Nouvelle Prestation].\n\nNous restons à votre disposition pour réserver.\n\nBien à vous,\nL'équipe Exalt ✨`,
        `Bonjour 👋 [Nom],\n\nNous espérons que vous allez merveilleusement bien. Vous nous manquez depuis votre dernière visite !\n\nPour votre retour, un diagnostic beauté offert et 15% de réduction sur [Nouvelle Prestation] vous attendent.\n\nRéservez dès que vous le souhaitez.\n\nAvec plaisir,\nL'équipe Exalt ✨`,
        `Bonjour 👋 [Nom],\n\nCela fait un moment, et si votre dernière expérience n'a pas été à la hauteur, nous aimerions le savoir et y remédier.\n\nPour votre retour : diagnostic beauté offert et 15% de réduction sur [Nouvelle Prestation].\n\nBien cordialement,\nL'équipe Exalt ✨`
      ],
      en: [
        `Dear [Nom],\n\nWe hope you are doing well. It has been several months since we last had the pleasure of welcoming you to our institute.\n\nTo celebrate your return, we are offering you a complimentary full beauty diagnostic and 15% off your next treatment ([Nouvelle Prestation]).\n\nBook your slot today.\n\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nWe hope you are doing well. It has been a while since your last visit to Exalt Institute.\n\nFor your return, enjoy a complimentary beauty diagnostic and 15% off [Nouvelle Prestation].\n\nBook online whenever it suits you.\n\nKind regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nThe entire Exalt Institute team would be delighted to welcome you back.\n\nTo mark your return, enjoy a complimentary beauty diagnostic and 15% off [Nouvelle Prestation].\n\nWe remain available to help you book.\n\nBest regards,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nWe hope you are doing wonderfully well. We've missed you since your last visit!\n\nFor your return, a complimentary beauty diagnostic and 15% off [Nouvelle Prestation] await you.\n\nBook whenever you like.\n\nWith pleasure,\nThe Exalt Team ✨`,
        `Dear [Nom],\n\nIt has been a while, and if your last experience didn't fully meet your expectations, we would love to know so we can make it right.\n\nFor your return: complimentary beauty diagnostic and 15% off [Nouvelle Prestation].\n\nKind regards,\nThe Exalt Team ✨`
      ]
    },
    ctaText: {
      fr: 'Réserver mon créneau',
      en: 'Book My Slot'
    }
  },

  // 6. Birthday / Special Event
  {
    id: 'tpl-bd-wa',
    relanceType: 'birthday',
    title: {
      fr: 'Anniversaire & Cadeau WhatsApp',
      en: 'Birthday & Gift WhatsApp'
    },
    category: {
      fr: 'Anniversaire & Événement',
      en: 'Birthday & Special Event'
    },
    channel: 'WhatsApp',
    content: {
      fr: [
        `Joyeux anniversaire 🎂, Mme/M. *[Nom]* !\n\nToute l'équipe Exalt vous souhaite une très belle journée, remplie de douceur.\n\nPour célébrer, profitez d'un soin spa offert ou de 20 000 FCFA de remise sur votre prochaine visite.\nActivez votre cadeau : https://exalt-beauty.up.railway.app/rdv\n\nCordialement,\n_L'équipe Exalt_ ✨`,
        `Joyeux anniversaire 🎂, Mme/M. *[Nom]* !\n\nNous vous souhaitons une excellente journée de la part de toute l'équipe Exalt Institut.\n\nÀ cette occasion, un soin spa offert ou 20 000 FCFA de remise vous attend : https://exalt-beauty.up.railway.app/rdv\n\nBien à vous,\n_L'équipe Exalt_ ✨`,
        `Bon anniversaire 🎉, Mme/M. *[Nom]* !\n\nL'équipe Exalt Institut tient à vous souhaiter une merveilleuse journée.\n\nPour l'occasion, profitez d'un soin spa offert ou d'une remise de 20 000 FCFA : https://exalt-beauty.up.railway.app/rdv\n\nAu plaisir de vous accueillir,\n_L'équipe Exalt_ ✨`,
        `Joyeux anniversaire 🎂, Mme/M. *[Nom]* !\n\nNous espérons que cette journée vous apporte plein de belles choses. Toute l'équipe pense fort à vous aujourd'hui.\n\nUn petit cadeau pour vous : soin spa offert ou 20 000 FCFA de remise : https://exalt-beauty.up.railway.app/rdv\n\nAvec toute notre affection,\n_L'équipe Exalt_ ✨`,
        `Bon anniversaire 🎉, Mme/M. *[Nom]* !\n\nQue cette nouvelle année vous apporte joie et sérénité. Nous serions ravis de célébrer ça avec vous.\n\nSoin spa offert ou 20 000 FCFA de remise disponibles pour l'occasion : https://exalt-beauty.up.railway.app/rdv\n\nBelle journée,\n_L'équipe Exalt_ ✨`
      ],
      en: [
        `Happy Birthday 🎂, Mr/Ms *[Nom]*!\n\nThe entire Exalt team wishes you a wonderful day, full of sweetness.\n\nTo celebrate, enjoy a complimentary spa treatment or a 20,000 FCFA discount on your next visit.\nClaim your gift: https://exalt-beauty.up.railway.app/rdv\n\nBest regards,\n_The Exalt Team_ ✨`,
        `Happy Birthday 🎂, Mr/Ms *[Nom]*!\n\nWe wish you a wonderful day on behalf of the entire Exalt Institute team.\n\nFor the occasion, a complimentary spa treatment or a 20,000 FCFA discount awaits you: https://exalt-beauty.up.railway.app/rdv\n\nKind regards,\n_The Exalt Team_ ✨`,
        `Happy Birthday 🎂, Mr/Ms *[Nom]*!\n\nThe Exalt Institute team would like to wish you a wonderful day.\n\nFor the occasion, enjoy a complimentary spa treatment or a 20,000 FCFA discount: https://exalt-beauty.up.railway.app/rdv\n\nLooking forward to welcoming you,\n_The Exalt Team_ ✨`,
        `Happy Birthday 🎂, Mr/Ms *[Nom]*!\n\nWe hope this day brings you all sorts of wonderful things. The whole team is thinking of you today.\n\nA small gift for you: complimentary spa treatment or a 20,000 FCFA discount: https://exalt-beauty.up.railway.app/rdv\n\nWith our warmest affection,\n_The Exalt Team_ ✨`,
        `Happy Birthday 🎂, Mr/Ms *[Nom]*!\n\nMay this new year bring you joy and serenity. We would love to celebrate it with you.\n\nComplimentary spa treatment or a 20,000 FCFA discount available for the occasion: https://exalt-beauty.up.railway.app/rdv\n\nHave a wonderful day,\n_The Exalt Team_ ✨`
      ]
    },
    ctaText: {
      fr: 'Activer mon cadeau',
      en: 'Claim Gift'
    }
  },
  {
    id: 'tpl-bd-sms',
    relanceType: 'birthday',
    title: {
      fr: 'Anniversaire SMS',
      en: 'Birthday SMS'
    },
    category: {
      fr: 'Anniversaire & Événement',
      en: 'Birthday & Special Event'
    },
    channel: 'SMS',
    content: {
      fr: [
        `Joyeux anniversaire 🎂 [Nom] ! Exalt Institut vous offre 20 000 FCFA de remise sur votre prochain soin avec le code BDAY 🎂. Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institut vous souhaite un joyeux anniversaire, [Nom] ! Code BDAY 🎂 : 20 000 FCFA de remise sur votre prochaine visite. https://exalt-beauty.up.railway.app/rdv`,
        `Bon anniversaire 🎉 [Nom] ! Un cadeau de 20 000 FCFA vous attend chez Exalt Institut avec le code BDAY 🎂. Réservez : https://exalt-beauty.up.railway.app/rdv`,
        `Joyeux anniversaire 🎂 [Nom] ! Toute l'équipe pense à vous aujourd'hui. Code BDAY 🎂 : 20 000 FCFA offerts. https://exalt-beauty.up.railway.app/rdv`,
        `Bon anniversaire 🎉 [Nom] ! Belle journée de la part d'Exalt Institut. Code BDAY 🎂 : 20 000 FCFA de remise. https://exalt-beauty.up.railway.app/rdv`
      ],
      en: [
        `Happy Birthday 🎂 [Nom]! Exalt Institute is gifting you 20,000 FCFA off your next treatment with code BDAY 🎂. Book: https://exalt-beauty.up.railway.app/rdv`,
        `Exalt Institute wishes you a happy birthday, [Nom]! Code BDAY 🎂: 20,000 FCFA off your next visit. https://exalt-beauty.up.railway.app/rdv`,
        `Happy Birthday 🎂 [Nom]! A 20,000 FCFA gift awaits you at Exalt Institute with code BDAY 🎂. Book: https://exalt-beauty.up.railway.app/rdv`,
        `Happy Birthday 🎂 [Nom]! The whole team is thinking of you today. Code BDAY 🎂: 20,000 FCFA off. https://exalt-beauty.up.railway.app/rdv`,
        `Happy Birthday 🎂 [Nom]! Wishing you a wonderful day from Exalt Institute. Code BDAY 🎂: 20,000 FCFA off. https://exalt-beauty.up.railway.app/rdv`
      ]
    },
    ctaText: {
      fr: 'Profiter du cadeau',
      en: 'Claim Gift'
    }
  },
  {
    id: 'tpl-bd-email',
    relanceType: 'birthday',
    title: {
      fr: 'Vœux d\'Anniversaire Email',
      en: 'Birthday Wishes Email'
    },
    category: {
      fr: 'Anniversaire & Événement',
      en: 'Birthday & Special Event'
    },
    channel: 'Email',
    subject: {
      fr: 'Joyeux anniversaire de la part d\'Exalt Institut',
      en: 'Happy Birthday from Exalt Institute'
    },
    content: {
      fr: [
        `Cher(e) [Nom] 🎂,\n\nToute l'équipe Exalt vous souhaite un très bel anniversaire.\n\nPour vous remercier de votre fidélité, bénéficiez d'un bon d'achat de 20 000 FCFA valable pendant 30 jours sur l'ensemble de nos soins et produits.\n\nPrenez rendez-vous dès que vous le souhaitez.\n\nChaleureusement,\nL'équipe Exalt ✨`,
        `Cher(e) [Nom] 🎂,\n\nNous vous souhaitons un joyeux anniversaire de la part de toute l'équipe Exalt Institut.\n\nÀ cette occasion, profitez d'un bon d'achat de 20 000 FCFA valable 30 jours sur nos soins et produits.\n\nN'hésitez pas à réserver dès que vous le souhaitez.\n\nBien cordialement,\nL'équipe Exalt ✨`,
        `Cher(e) [Nom] 🎂,\n\nL'équipe Exalt Institut vous adresse ses meilleurs vœux pour cette journée particulière.\n\nPour marquer l'occasion, un bon d'achat de 20 000 FCFA valable 30 jours vous est offert.\n\nAu plaisir de vous accueillir,\nL'équipe Exalt ✨`,
        `Cher(e) [Nom] 🎂,\n\nNous espérons que cette nouvelle année de vie vous apporte plein de belles surprises. Toute l'équipe pense à vous aujourd'hui.\n\nUn bon d'achat de 20 000 FCFA valable 30 jours vous attend.\n\nAvec toute notre affection,\nL'équipe Exalt ✨`,
        `Cher(e) [Nom] 🎂,\n\nJoyeux anniversaire ! Que cette journée soit à la hauteur de votre beauté.\n\nPour l'occasion, profitez d'un bon d'achat de 20 000 FCFA valable 30 jours sur nos soins et produits.\n\nBien à vous,\nL'équipe Exalt ✨`
      ],
      en: [
        `Dear [Nom] 🎂,\n\nThe entire Exalt family wishes you a wonderful birthday.\n\nTo thank you for your loyalty, please enjoy a 20,000 FCFA voucher valid for 30 days on all our treatments and products.\n\nSchedule your visit whenever it suits you.\n\nWarmest regards,\nThe Exalt Team ✨`,
        `Dear [Nom] 🎂,\n\nWe wish you a happy birthday on behalf of the entire Exalt Institute team.\n\nFor the occasion, enjoy a 20,000 FCFA voucher valid for 30 days on our treatments and products.\n\nFeel free to book whenever you like.\n\nKind regards,\nThe Exalt Team ✨`,
        `Dear [Nom] 🎉,\n\nThe Exalt Institute team sends you their warmest wishes on this special day.\n\nTo mark the occasion, please enjoy a 20,000 FCFA voucher valid for 30 days.\n\nLooking forward to welcoming you,\nThe Exalt Team ✨`,
        `Dear [Nom] 🎂,\n\nWe hope this new year of life brings you all sorts of wonderful surprises. The whole team is thinking of you today.\n\nA 20,000 FCFA voucher valid for 30 days awaits you.\n\nWith our warmest affection,\nThe Exalt Team ✨`,
        `Dear [Nom] 🎉,\n\nHappy Birthday! May this day be as radiant as you are.\n\nFor the occasion, enjoy a 20,000 FCFA voucher valid for 30 days on our treatments and products.\n\nBest regards,\nThe Exalt Team ✨`
      ]
    },
    ctaText: {
      fr: 'Activer mon bon cadeau',
      en: 'Claim Birthday Voucher'
    }
  },

  // 7. Prise de Nouvelles / Bonne Journée — message chaleureux sans offre,
  // pensé pour être envoyé à plusieurs clients en même temps (pas de référence
  // obligatoire à une prestation précise).
  {
    id: 'tpl-ci-wa',
    relanceType: 'checkin',
    title: {
      fr: 'Prise de Nouvelles WhatsApp',
      en: 'Checking In WhatsApp'
    },
    category: {
      fr: 'Prise de Nouvelles',
      en: 'Just Checking In'
    },
    channel: 'WhatsApp',
    content: {
      fr: [
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien et que votre semaine se déroule dans la douceur.\n\nCela fait un moment que nous n'avons pas eu le plaisir de vous accueillir, et toute l'équipe pensait justement à vous : nous voulions simplement prendre de vos nouvelles, sans arrière-pensée.\n\nSi l'envie d'un moment rien que pour vous se présente, sachez que notre porte vous est toujours grande ouverte, à votre rythme.\n\nBelle journée à vous,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nUn petit mot, sans autre raison que le plaisir de prendre de vos nouvelles.\n\nNous espérons sincèrement que vous allez bien, et que la vie vous sourit ces derniers temps. Si un jour vous avez envie d'un instant rien que pour vous, notre équipe sera ravie de vous recevoir.\n\nEn attendant, prenez soin de vous,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nToute l'équipe Exalt pense à vous et espère que tout va bien de votre côté.\n\nPas de promotion ni de rendez-vous à caser dans ce message, juste l'envie sincère de savoir comment vous allez. N'hésitez pas à nous répondre, même simplement pour dire bonjour.\n\nAvec toute notre bienveillance,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien. Cela fait un moment que nos chemins ne se sont pas croisés, et vous nous manquez un peu.\n\nNous serions ravis d'avoir de vos nouvelles, ou de vous accueillir à nouveau quand cela vous conviendra, sans aucune pression.\n\nBien à vous,\n_L'équipe Exalt_ ✨`,
        `Bonjour 👋 Mme/M. *[Nom]*,\n\nNous espérons que vous allez bien et que tout se passe doucement pour vous.\n\nToute l'équipe Exalt vous envoie de bonnes ondes aujourd'hui, avec l'espoir sincère d'avoir bientôt le plaisir de vous relire ou de vous revoir.\n\nPrenez soin de vous,\n_L'équipe Exalt_ ✨`
      ],
      en: [
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well and that your week is off to a gentle start.\n\nIt has been a while since we last had the pleasure of welcoming you, and the whole team was thinking of you today: we simply wanted to check in, with nothing else in mind.\n\nIf you ever feel like a moment just for yourself, know that our door is always wide open, whenever suits you.\n\nHave a wonderful day,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nJust a short note, for no other reason than the pleasure of checking in.\n\nWe sincerely hope you are doing well, and that life has been treating you kindly lately. If you ever feel like a moment for yourself, our team would be delighted to welcome you.\n\nUntil then, take good care of yourself,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nThe whole Exalt team is thinking of you and hopes everything is going well on your end.\n\nNo offer to squeeze in and no appointment to book here, just a genuine wish to know how you're doing. Feel free to write back, even just to say hello.\n\nWith our warmest thoughts,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well. It has been a while since our paths last crossed, and we've missed you a little.\n\nWe would love to hear how you're doing, or to welcome you back whenever it suits you, with absolutely no pressure.\n\nKind regards,\n_The Exalt Team_ ✨`,
        `Hello 👋 Mr/Ms *[Nom]*,\n\nWe hope you are doing well and that things are unfolding gently for you.\n\nThe whole Exalt team is sending good thoughts your way today, with the sincere hope of hearing from you or seeing you again soon.\n\nTake care of yourself,\n_The Exalt Team_ ✨`
      ]
    },
    ctaText: {
      fr: 'Dire bonjour',
      en: 'Say Hello'
    }
  },
  {
    id: 'tpl-ci-sms',
    relanceType: 'checkin',
    title: {
      fr: 'Prise de Nouvelles SMS',
      en: 'Checking In SMS'
    },
    category: {
      fr: 'Prise de Nouvelles',
      en: 'Just Checking In'
    },
    channel: 'SMS',
    content: {
      fr: [
        `Bonjour 👋 [Nom], toute l'équipe Exalt pense à vous et espère que vous allez bien. Aucune raison particulière, juste l'envie de prendre de vos nouvelles. Belle journée !`,
        `Bonjour 👋 [Nom], un petit mot sans autre but que de vous souhaiter une belle journée. Nous espérons que vous allez bien. L'équipe Exalt Institut.`,
        `Exalt Institut : [Nom], nous pensions à vous aujourd'hui et espérons que tout va bien. Prenez soin de vous !`,
        `Bonjour 👋 [Nom], ça fait un moment ! Nous espérons que vous allez bien, sans autre intention que de prendre de vos nouvelles. Belle journée à vous.`,
        `Exalt Institut vous envoie de bonnes ondes, [Nom]. Nous espérons que vous allez bien. Prenez soin de vous !`
      ],
      en: [
        `Hello 👋 [Nom], the whole Exalt team is thinking of you and hopes you're well. No particular reason, just wanted to check in. Have a great day!`,
        `Hello 👋 [Nom], just a quick note to wish you a lovely day, no other reason. We hope you're doing well. The Exalt Institute team.`,
        `Exalt Institute: [Nom], we were thinking of you today and hope all is well. Take care!`,
        `Hello 👋 [Nom], it's been a while! We hope you're doing well, simply wanted to check in. Have a wonderful day.`,
        `Exalt Institute is sending good thoughts your way, [Nom]. We hope you're well. Take care!`
      ]
    },
    ctaText: {
      fr: 'Dire bonjour',
      en: 'Say Hello'
    }
  },
  {
    id: 'tpl-ci-email',
    relanceType: 'checkin',
    title: {
      fr: 'Prise de Nouvelles Email',
      en: 'Checking In Email'
    },
    category: {
      fr: 'Prise de Nouvelles',
      en: 'Just Checking In'
    },
    channel: 'Email',
    subject: {
      fr: 'Nous pensions à vous',
      en: 'We were thinking of you'
    },
    content: {
      fr: [
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez bien et que votre semaine se déroule dans la douceur.\n\nCela fait un moment que nous n'avons pas eu le plaisir de vous accueillir, et toute l'équipe pensait justement à vous : nous voulions simplement prendre de vos nouvelles, sans arrière-pensée.\n\nSi l'envie d'un moment rien que pour vous se présente, sachez que notre porte vous est toujours grande ouverte, à votre rythme.\n\nBelle journée à vous,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nUn petit mot, sans autre raison que le plaisir de prendre de vos nouvelles.\n\nNous espérons sincèrement que vous allez bien, et que la vie vous sourit ces derniers temps. Si un jour vous avez envie d'un instant rien que pour vous, notre équipe sera ravie de vous recevoir.\n\nEn attendant, prenez soin de vous,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nToute l'équipe Exalt pense à vous et espère que tout va bien de votre côté.\n\nPas de promotion ni de rendez-vous à caser dans ce message, juste l'envie sincère de savoir comment vous allez. N'hésitez pas à nous répondre, même simplement pour dire bonjour.\n\nAvec toute notre bienveillance,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez bien. Cela fait un moment que nos chemins ne se sont pas croisés, et vous nous manquez un peu.\n\nNous serions ravis d'avoir de vos nouvelles, ou de vous accueillir à nouveau quand cela vous conviendra, sans aucune pression.\n\nBien à vous,\nL'équipe Exalt ✨`,
        `Bonjour 👋 Mme/M. [Nom],\n\nNous espérons que vous allez bien et que tout se passe doucement pour vous.\n\nToute l'équipe Exalt vous envoie de bonnes ondes aujourd'hui, avec l'espoir sincère d'avoir bientôt le plaisir de vous relire ou de vous revoir.\n\nPrenez soin de vous,\nL'équipe Exalt ✨`
      ],
      en: [
        `Hello 👋 Mr/Ms [Nom],\n\nWe hope you are doing well and that your week is off to a gentle start.\n\nIt has been a while since we last had the pleasure of welcoming you, and the whole team was thinking of you today: we simply wanted to check in, with nothing else in mind.\n\nIf you ever feel like a moment just for yourself, know that our door is always wide open, whenever suits you.\n\nHave a wonderful day,\nThe Exalt Team ✨`,
        `Hello 👋 Mr/Ms [Nom],\n\nJust a short note, for no other reason than the pleasure of checking in.\n\nWe sincerely hope you are doing well, and that life has been treating you kindly lately. If you ever feel like a moment for yourself, our team would be delighted to welcome you.\n\nUntil then, take good care of yourself,\nThe Exalt Team ✨`,
        `Hello 👋 Mr/Ms [Nom],\n\nThe whole Exalt team is thinking of you and hopes everything is going well on your end.\n\nNo offer to squeeze in and no appointment to book here, just a genuine wish to know how you're doing. Feel free to write back, even just to say hello.\n\nWith our warmest thoughts,\nThe Exalt Team ✨`,
        `Hello 👋 Mr/Ms [Nom],\n\nWe hope you are doing well. It has been a while since our paths last crossed, and we've missed you a little.\n\nWe would love to hear how you're doing, or to welcome you back whenever it suits you, with absolutely no pressure.\n\nKind regards,\nThe Exalt Team ✨`,
        `Hello 👋 Mr/Ms [Nom],\n\nWe hope you are doing well and that things are unfolding gently for you.\n\nThe whole Exalt team is sending good thoughts your way today, with the sincere hope of hearing from you or seeing you again soon.\n\nTake care of yourself,\nThe Exalt Team ✨`
      ]
    },
    ctaText: {
      fr: 'Dire bonjour',
      en: 'Say Hello'
    }
  }
];
