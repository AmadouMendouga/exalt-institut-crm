import os

from . import models
from .config import settings
from .database import SessionLocal
from .security import hash_password

FORCE_RESEED = os.getenv("FORCE_RESEED_ONCE", "").lower() == "true"
FORCE_ADMIN_RESET = os.getenv("FORCE_ADMIN_RESET", "").lower() == "true"
WIPE_DEMO_ONCE = os.getenv("WIPE_DEMO_ONCE", "").lower() == "true"
REPLACE_SERVICES_ONCE = os.getenv("REPLACE_SERVICES_ONCE", "").lower() == "true"
REFRESH_CAMPAIGN_TEXT_ONCE = os.getenv("REFRESH_CAMPAIGN_TEXT_ONCE", "").lower() == "true"

INITIAL_CLIENTS = [
    dict(name='Elena Martinez', prefix='Mme.', gender='F', initials='EM', email='elena.martinez@example.com', phone='+237 6 71 23 45 67', last_service='Soin Capillaire Kératine', last_service_date='15 Oct 2023', raw_date='2023-10-15', status='Follow-up Needed', suggested_upsell='Masque Hydratant Longue Tenue', preferred_channel='WhatsApp', total_visits=5, total_spent=420000, avatar_bg='bg-emerald-100 text-emerald-800'),
    dict(name='Marcus Dubois', prefix='M.', gender='M', initials='MD', email='marcus.dubois@example.com', phone='+237 6 99 87 65 43', last_service='Coupe & Barbe Premium', last_service_date='18 Oct 2023', raw_date='2023-10-18', status='Follow-up Needed', suggested_upsell='Soin Barbe Hydratant', preferred_channel='SMS', total_visits=3, total_spent=185000, avatar_bg='bg-blue-100 text-blue-800'),
    dict(name='Sophie Laurent', prefix='Mme.', gender='F', initials='SL', email='sophie.laurent@example.com', phone='+237 6 55 43 21 09', last_service='Manucure Gel & Nail Art', last_service_date='12 Oct 2023', raw_date='2023-10-12', status='Follow-up Needed', suggested_upsell='Pack Vernis Semi-Permanent', preferred_channel='WhatsApp', total_visits=8, total_spent=820000, avatar_bg='bg-indigo-100 text-indigo-800'),
    dict(name='Jean Dupont', prefix='M.', gender='M', initials='JD', email='jean.dupont@example.com', phone='+237 6 77 11 22 33', last_service='Soin Visage Homme Complet', last_service_date='28 Sep 2023', raw_date='2023-09-28', status='Up to date', suggested_upsell='Gommage Corps Relaxant', preferred_channel='WhatsApp', total_visits=12, total_spent=1650000, avatar_bg='bg-sky-100 text-sky-800'),
    dict(name='Claire Dubois', prefix='Mme.', gender='F', initials='CD', email='claire.dubois@example.com', phone='+237 6 98 44 55 66', last_service='Coloration & Mèches Balayage', last_service_date='05 Nov 2023', raw_date='2023-11-05', status='Follow-up Needed', suggested_upsell='Kit Entretien Coloration à Domicile', preferred_channel='SMS', total_visits=4, total_spent=345000, avatar_bg='bg-teal-100 text-teal-800'),
    dict(name='Alexandre Moreau', prefix='M.', gender='M', initials='AM', email='alex.moreau@example.com', phone='+237 6 70 88 99 00', last_service='Consultation Bien-être & Bilan Peau', last_service_date='20 Oct 2023', raw_date='2023-10-20', status='Up to date', suggested_upsell='Abonnement Soins Mensuel', preferred_channel='Email', total_visits=2, total_spent=125000, avatar_bg='bg-purple-100 text-purple-800'),
    dict(name='Nathalie Bernard', prefix='Mme.', gender='F', initials='NB', email='nathalie.bernard@example.com', phone='+237 6 91 22 33 44', last_service='Spa Relaxant Corps & Visage', last_service_date='22 Oct 2023', raw_date='2023-10-22', status='Follow-up Needed', suggested_upsell='Rituel Massage Prolongé', preferred_channel='WhatsApp', total_visits=6, total_spent=590000, avatar_bg='bg-rose-100 text-rose-800'),
    dict(name='Thomas Petit', prefix='M.', gender='M', initials='TP', email='thomas.petit@example.com', phone='+237 6 79 33 44 55', last_service='Coupe Homme & Soin Cuir Chevelu', last_service_date='01 Nov 2023', raw_date='2023-11-01', status='Up to date', suggested_upsell='Shampoing Traitant Anti-Chute', preferred_channel='Email', total_visits=7, total_spent=730000, avatar_bg='bg-amber-100 text-amber-800'),
    dict(name='Camille Roux', prefix='Mme.', gender='F', initials='CR', email='camille.roux@example.com', phone='+237 6 93 45 67 89', last_service='Pédicure Spa Complète', last_service_date='19 Sep 2023', raw_date='2023-09-19', status='Follow-up Needed', suggested_upsell='Soin Callosités & Hydratation Pieds', preferred_channel='WhatsApp', total_visits=3, total_spent=240000, avatar_bg='bg-emerald-100 text-emerald-800'),
    dict(name='Lucas Fournier', prefix='M.', gender='M', initials='LF', email='lucas.fournier@example.com', phone='+237 6 74 56 78 90', last_service='Défrisage & Soin Profond', last_service_date='14 Oct 2023', raw_date='2023-10-14', status='Up to date', suggested_upsell='Sérum Réparateur Pointes', preferred_channel='SMS', total_visits=9, total_spent=1100000, avatar_bg='bg-cyan-100 text-cyan-800'),
    dict(name='Isabelle Leroy', prefix='Mme.', gender='F', initials='IL', email='isabelle.leroy@example.com', phone='+237 6 95 67 89 01', last_service='Extensions de Cils & Soin Regard', last_service_date='29 Oct 2023', raw_date='2023-10-29', status='Follow-up Needed', suggested_upsell='Teinture Sourcils & Cils', preferred_channel='Email', total_visits=5, total_spent=480000, avatar_bg='bg-violet-100 text-violet-800'),
    dict(name='Guillaume Henry', prefix='M.', gender='M', initials='GH', email='guillaume.henry@example.com', phone='+237 6 76 78 90 12', last_service='Rasage Traditionnel & Soin Visage', last_service_date='03 Nov 2023', raw_date='2023-11-03', status='Follow-up Needed', suggested_upsell='Soin Hydratant Post-Rasage', preferred_channel='WhatsApp', total_visits=4, total_spent=275000, avatar_bg='bg-stone-100 text-stone-800'),
]

INITIAL_SERVICES = [
    # Épilation
    dict(name='Sourcil à la Pince', category='Épilation', price=2000),
    dict(name='Sourcil à la Cire', category='Épilation', price=2000),
    dict(name='Duvet', category='Épilation', price=1000),
    dict(name='Menton', category='Épilation', price=2000),
    dict(name='Aisselles', category='Épilation', price=5000),
    dict(name='Torse/Dos', category='Épilation', price=10000),
    dict(name='Maillot', category='Épilation', price=10000),
    dict(name='Bras', category='Épilation', price=10000),
    dict(name='Jambes et Cuisses', category='Épilation', price=20000),
    dict(name='Vajacial', category='Épilation', price=20000),
    dict(name='Corps au Complet', category='Épilation', price=50000),

    # Massage
    dict(name='Massage 30 Min', category='Massage', price=10000),
    dict(name='Massage aux Huiles Essentielles 1h', category='Massage', price=15000),
    dict(name='Massage aux Pierres Chaudes 1h', category='Massage', price=20000),
    dict(name='Maderothérapie Bodyslim 1h', category='Massage', price=25000),
    dict(name='Massage Relaxant 4 Mains', category='Massage', price=20000),

    # Hammam & Gommage
    dict(name='Hammam Gommage Éclat', category='Hammam & Gommage', price=15000),
    dict(name="Hammam Gommage Rituel d'Orient", category='Hammam & Gommage', price=25000),
    dict(name='Hammam Gommage Volupté', category='Hammam & Gommage', price=30000),

    # Enveloppement
    dict(name='Enveloppement Purifiant & Éclaircissant', category='Enveloppement', price=10000),
    dict(name='Enveloppement Détoxifiant (Spiruline ou Boue Marine)', category='Enveloppement', price=12000),
    dict(name='Enveloppement Gourmand au Chocolat Chaud', category='Enveloppement', price=13000),
    dict(name='Enveloppement Douceur (Coco ou Argile Rose)', category='Enveloppement', price=15000),
    dict(name='Enveloppement Relaxant (Lavande ou 3 Thés)', category='Enveloppement', price=15000),
    dict(name="Charmes d'Orient (Rituel 45 Min)", category='Enveloppement', price=35000),
    dict(name='Rituel Volupté (Rituel 1h)', category='Enveloppement', price=40000),

    # Soins de Visage
    dict(name='Diagnostic de la Peau (IA)', category='Soins de Visage', price=5000),
    dict(name='Soin Pureté et Éclat', category='Soins de Visage', price=10000),
    dict(name='Soin Spécifique Peaux Sensibles (Caudalie)', category='Soins de Visage', price=20000),
    dict(name='Soin Rajeunissant Lifting Coréen', category='Soins de Visage', price=25000),
    dict(name='Soin Traitant Peeling AHA/BHA/PHA', category='Soins de Visage', price=30000),
    dict(name='Soin Hydra Facial', category='Soins de Visage', price=40000),
    dict(name='Soin Microneedling', category='Soins de Visage', price=45000),

    # Beauté des Mains
    dict(name='Manucure Express', category='Beauté des Mains', price=2000),
    dict(name='Manucure Refresh', category='Beauté des Mains', price=3000),
    dict(name='Manucure Prestige', category='Beauté des Mains', price=5000),
    dict(name='Spa Manucure', category='Beauté des Mains', price=7500),
    dict(name='Pose Vernis', category='Beauté des Mains', price=6000),
    dict(name='Changement Vernis Gel Capsule', category='Beauté des Mains', price=4000),
    dict(name='Dépose Vernis', category='Beauté des Mains', price=2000),
    dict(name='Dépose Vernis Maison + Vernis Simple', category='Beauté des Mains', price=4000),
    dict(name='Gainage', category='Beauté des Mains', price=10000),
    dict(name='Remplissage Gainage Ongles Courts', category='Beauté des Mains', price=10000),
    dict(name='Remplissage Gainage Ongles Longs', category='Beauté des Mains', price=12000),
    dict(name='Pose Chablon', category='Beauté des Mains', price=20000),
    dict(name='Remplissage Gel', category='Beauté des Mains', price=15000),
    dict(name='Dépose Gel sans Vernis', category='Beauté des Mains', price=3000),
    dict(name='Dépose Gel + Vernis Simple', category='Beauté des Mains', price=8000),
    dict(name='Pose Capsules Vernis Simple', category='Beauté des Mains', price=6000),
    dict(name='Pose Capsules Vernis Gel', category='Beauté des Mains', price=10000),
    dict(name="Flash Extension 60 Min XXL Nail'Art", category='Beauté des Mains', price=15000),
    dict(name='Pose Capsules + Gel/Polygel', category='Beauté des Mains', price=15000),
    dict(name='Remplissage Capsules', category='Beauté des Mains', price=10000),
    dict(name='Dépose Capsules sans Vernis', category='Beauté des Mains', price=3000),
    dict(name='Dépose Capsules + Vernis Simple', category='Beauté des Mains', price=5000),
    dict(name="Nail'Art French Manucure", category='Beauté des Mains', price=2000),
    dict(name="Nail'Art Effet Main", category='Beauté des Mains', price=1000),
    dict(name="Nail'Art Baby Milk / Effet Naturel Gel", category='Beauté des Mains', price=4000),
    dict(name="Nail'Art Baby Boomer Dégradé", category='Beauté des Mains', price=1000),
    dict(name="Nail'Art Cat Eye", category='Beauté des Mains', price=8000),

    # Beauté des Pieds
    dict(name='Pédicure Express', category='Beauté des Pieds', price=2000),
    dict(name='Pédicure Refresh', category='Beauté des Pieds', price=3000),
    dict(name='Pédicure Prestige', category='Beauté des Pieds', price=10000),
    dict(name='Pédicure Prestige Callus', category='Beauté des Pieds', price=12500),
    dict(name='Spa Pédicure', category='Beauté des Pieds', price=12500),
    dict(name='Spa Luxe', category='Beauté des Pieds', price=15000),
    dict(name='Pose Vernis Gel (Pieds)', category='Beauté des Pieds', price=5000),
    dict(name='Dépose Vernis Gel (Pieds)', category='Beauté des Pieds', price=3000),
    dict(name='Gainage (Pieds)', category='Beauté des Pieds', price=10000),
    dict(name='Reconstruction Orteils', category='Beauté des Pieds', price=5000),
    dict(name='Remplissage Gel Pieds (-8 Semaines)', category='Beauté des Pieds', price=3000),
    dict(name='Dépose Gel (Pieds)', category='Beauté des Pieds', price=3000),
    dict(name='Dépose Gel + Vernis Simple (Pieds)', category='Beauté des Pieds', price=4000),
    dict(name='Pose Capsules Vernis Simple (Pieds)', category='Beauté des Pieds', price=4000),
    dict(name='Pose Capsules Vernis Gel (Pieds)', category='Beauté des Pieds', price=7500),
    dict(name='Dépose Capsules (Pieds)', category='Beauté des Pieds', price=3000),
    dict(name="Nail'Art French Manucure (Pieds)", category='Beauté des Pieds', price=2000),
    dict(name="Nail'Art Effet Pieds (Paire)", category='Beauté des Pieds', price=1000),
    dict(name="Nail'Art Effet Pieds (+2 Ongles)", category='Beauté des Pieds', price=3000),
    dict(name="Nail'Art French Pédicure Gel", category='Beauté des Pieds', price=3000),
    dict(name="Nail'Art Effet Pieds Gel (Paire)", category='Beauté des Pieds', price=1000),
    dict(name="Nail'Art Effet Pieds Gel (Full)", category='Beauté des Pieds', price=5000),

    # Coiffure Femmes
    dict(name='Diagnostic Capillaire', category='Coiffure Femmes', price=2000),
    dict(name='Shampooing (Produits de la Cliente)', category='Coiffure Femmes', price=2500),
    dict(name='Shampooing Classique', category='Coiffure Femmes', price=2500),
    dict(name='Shampoing Spécifique (Nos Produits)', category='Coiffure Femmes', price=5000),
    dict(name='Traitement (Produits Cliente)', category='Coiffure Femmes', price=5000),
    dict(name='Traitement (Nos Produits)', category='Coiffure Femmes', price=8000),
    dict(name='Headspa', category='Coiffure Femmes', price=10000),
    dict(name='Machine Stimulante + Soin Vitaminé', category='Coiffure Femmes', price=10000),
    dict(name='Headspa + Machine Stimulante + Soin Vitaminé', category='Coiffure Femmes', price=15000),
    dict(name='Traitement Complet Head Spa & Machine (Produit Cliente)', category='Coiffure Femmes', price=25000),
    dict(name='Traitement Complet Head Spa & Machine (Produits Maison)', category='Coiffure Femmes', price=28000),
    dict(name="Traitement Complet Head Spa & Machine (Produits L'Oréal)", category='Coiffure Femmes', price=30000),
    dict(name='Machine Traitante Cuir Chevelu (Séance)', category='Coiffure Femmes', price=15000),
    dict(name='Machine Traitante Cuir Chevelu (4 Séances)', category='Coiffure Femmes', price=50000),
    dict(name='Traitement Alopécie (Séance)', category='Coiffure Femmes', price=20000),
    dict(name='Traitement Alopécie (4 Séances)', category='Coiffure Femmes', price=70000),
    dict(name='Nattes Protectrices (Max 10)', category='Coiffure Femmes', price=2000),
    dict(name='Brushing + Lissage Steampod', category='Coiffure Femmes', price=5000),
    dict(name='Brushing + Boucles', category='Coiffure Femmes', price=8000),
    dict(name='Rouleaux', category='Coiffure Femmes', price=5000),
    dict(name='Défrisage (Produits Cliente)', category='Coiffure Femmes', price=3500),
    dict(name='Défrisage Maison', category='Coiffure Femmes', price=8000),
    dict(name='Défrisage Maison + Traitement', category='Coiffure Femmes', price=10000),
    dict(name='Défrisage Maison + Headspa + Coiffure Protectrice', category='Coiffure Femmes', price=20000),
    dict(name='Défrisage Maison + Traitement + Brushing/Coiffure Protectrice', category='Coiffure Femmes', price=15000),
    dict(name='Coupe de Cheveux', category='Coiffure Femmes', price=5000),
    dict(name='Coupe Mini Cheveux + Coiffure', category='Coiffure Femmes', price=5000),
    dict(name='Grosses Tresses Renversées (Mèches Fournies)', category='Coiffure Femmes', price=5000),
    dict(name='Tresses Moyennes', category='Coiffure Femmes', price=8000),
    dict(name='Tresses Petites', category='Coiffure Femmes', price=10000),
    dict(name='Tresses Très Petites', category='Coiffure Femmes', price=15000),
    dict(name='Gros Rastas', category='Coiffure Femmes', price=8000),
    dict(name='Moyens Rastas', category='Coiffure Femmes', price=11000),
    dict(name='Petits Rastas', category='Coiffure Femmes', price=15000),
    dict(name='Très Petits Rastas', category='Coiffure Femmes', price=25000),
    dict(name='Traitement Perruque', category='Coiffure Femmes', price=5000),
    dict(name='Customisation Perruque', category='Coiffure Femmes', price=5000),
    dict(name='Pose Lace', category='Coiffure Femmes', price=8000),
    dict(name='Pose Closure', category='Coiffure Femmes', price=5000),
    dict(name='Tissage Simple', category='Coiffure Femmes', price=5000),
    dict(name='Tissage Ouvert avec Closure', category='Coiffure Femmes', price=8000),
    dict(name='Tissage Frontal avec Customisation', category='Coiffure Femmes', price=12000),
    dict(name='Confection Perruque avec Customisation', category='Coiffure Femmes', price=12000),
    dict(name='Hairneedling (Séance)', category='Coiffure Femmes', price=20000),
    dict(name='Forfait Coiffure + Manucure + Pédicure Sèche', category='Coiffure Femmes', price=15000),
    dict(name='Forfait Coiffure + Manucure + Pédicure Spa + Soin Visage', category='Coiffure Femmes', price=20000),
    dict(name='Forfait Coiffure + Manucure Spa + Pédicure Spa + Soin Visage + Massage 30 Min', category='Coiffure Femmes', price=30000),
    dict(name='Forfait Coiffure + Manucure Spa + Pédicure Spa + Soin Visage + Hammam + Massage 1h', category='Coiffure Femmes', price=40000),

    # Coiffure Hommes
    dict(name='Coiffure Adulte + Barbe', category='Coiffure Hommes', price=2000),
    dict(name='Coiffure + Coupe Refresh', category='Coiffure Hommes', price=5000),
    dict(name='Coiffure Enfant', category='Coiffure Hommes', price=1000),
    dict(name='Locks', category='Coiffure Hommes', price=15000),
    dict(name='Tresses Homme', category='Coiffure Hommes', price=2000),
    dict(name='Curl', category='Coiffure Hommes', price=10000),
    dict(name='Wave', category='Coiffure Hommes', price=6000),
    dict(name='Coiffure + Teinture', category='Coiffure Hommes', price=4000),
    dict(name='Soin de Visage Gentleman', category='Coiffure Hommes', price=10000),

    # Makeup
    dict(name='Maquillage Naturel (Nude)', category='Makeup', price=10000),
    dict(name="Maquillage de Jour (Coup d'Éclat)", category='Makeup', price=10000),
    dict(name='Maquillage de Soirée Glamour', category='Makeup', price=15000),
    dict(name='Maquillage de Cérémonie / Mariage', category='Makeup', price=25000),
    dict(name='Maquillage Artistique & Effets Spéciaux', category='Makeup', price=30000),

    # Extension de Cils
    dict(name='Extension de Cils Classic', category='Extension de Cils', price=5000),
    dict(name='Extension de Cils Hybrid', category='Extension de Cils', price=8000),
    dict(name='Extension de Cils Cat Eye', category='Extension de Cils', price=10000),
    dict(name='Extension de Cils Wispy', category='Extension de Cils', price=15000),
    dict(name='Extension de Cils Mega Volume', category='Extension de Cils', price=20000),
]

INITIAL_CAMPAIGNS = [
    dict(key='camp-1', name='Suivi Post-Prestation WhatsApp VIP', category='Post-Service', action_event='After a Service', delay_time=3, delay_unit='Days', channel='WhatsApp', subject_line='Votre dernier passage chez Exalt Institut', message_body="👋 Bonjour Mme/M. *[Nom]*, suite à votre soin (*[Prestation]*), tout s'est-il bien passé ?\n\n⭐ Bénéficiez d'une réduction spéciale de 10% sur votre prochain *[Nouvelle Prestation]* en réservant ici : https://srv-crm.co/rdv\n\nÀ très vite,\n_L'équipe Exalt_", cta_text='Prendre Rendez-vous', cta_url='https://service-crm.com/rendez-vous', status='active', target_audience='Clients ayant complété un soin il y a 3 jours', last_triggered='Il y a 15 minutes', stats={'sent': 1840, 'opened': 1720, 'clicked': 890, 'converted': 425}),
    dict(key='camp-2', name='Welcome Series - J+1 Email', category='Onboarding', action_event='New Client Registration', delay_time=1, delay_unit='Days', channel='Email', subject_line='Bienvenue chez Exalt Institut - Votre pack privilège offert', message_body='Bonjour [Nom],\n\nBienvenue dans notre communauté ! Nous sommes ravis de vous compter parmi nos clientes privilégiées.\n\nPour vous souhaiter la bienvenue, profitez d\'un diagnostic beauté offert (valeur 25 000 FCFA) lors de votre prochain passage.\n\nCordialement,\nL\'équipe Exalt', cta_text='Activer mon offre', cta_url='https://service-crm.com/welcome', status='active', target_audience='Nouveaux clients enregistrés', last_triggered="Aujourd'hui à 10:00", stats={'sent': 520, 'opened': 412, 'clicked': 215, 'converted': 110}),
    dict(key='camp-3', name='Rappel Échéance Entretien SMS Flash', category='Rappel Événement', action_event='Scheduled Event', delay_time=2, delay_unit='Hours', channel='SMS', subject_line='Rappel SMS: Votre prochain rendez-vous approche', message_body='Bonjour [Nom], rappel Exalt Institut : votre rendez-vous pour [Prestation] arrive à échéance. Confirmez votre créneau en 1 clic: https://srv-crm.co/rdv', cta_text='Confirmer', cta_url='https://srv-crm.co/rdv', status='active', target_audience='Clients avec rendez-vous programmé', last_triggered="Aujourd'hui à 14:30", stats={'sent': 610, 'opened': 580, 'clicked': 310, 'converted': 242}),
    dict(key='camp-4', name='Campagne Réengagement Inactifs (60j+)', category='Réengagement', action_event='Inactivity Period', delay_time=60, delay_unit='Days', channel='WhatsApp', subject_line='Vous nous manquez ! Profitez de 20 000 FCFA de remise', message_body="✨ Bonjour *[Nom]*, vous nous manquez chez Exalt Institut !\n\nCela fait un moment depuis votre dernière visite pour *[Prestation]*.\n\n🎁 Pour célébrer votre retour, profitez d'un bon d'achat immédiat de *20 000 FCFA* avec le code *RETOUR24* sur votre prochain *[Nouvelle Prestation]*.\n\n👉 Réservez en ligne : https://srv-crm.co/rdv", cta_text='Réserver mon créneau', cta_url='https://service-crm.com/reengagement', status='active', target_audience='Clients inactifs depuis plus de 60 jours', last_triggered='Hier à 09:00', stats={'sent': 890, 'opened': 795, 'clicked': 360, 'converted': 185}),
    dict(key='camp-5', name='Cadeau Anniversaire Client', category='Anniversaire', action_event='Birthday', delay_time=0, delay_unit='Days', channel='WhatsApp', subject_line='Joyeux anniversaire de la part d\'Exalt Institut', message_body="🎂 *Joyeux Anniversaire Mme/M. [Nom] !* 🎁\n\nToute l'équipe Exalt vous souhaite une merveilleuse journée !\n\nPour célébrer, profitez d'un soin spa premium offert ou de 20 000 FCFA de remise sur votre prochaine visite.\n\n👉 Activer mon cadeau : https://srv-crm.co/rdv", cta_text='Activer mon cadeau', cta_url='https://srv-crm.co/rdv', status='active', target_audience="Clients dont c'est l'anniversaire aujourd'hui", last_triggered=None, stats={'sent': 0, 'opened': 0, 'clicked': 0, 'converted': 0}),
]

INITIAL_TIMELINE = [
    dict(campaign_key='camp-1', date_group='TODAY, OCT 26', time='09:30 AM', title='Relance Post-Prestation WhatsApp', description="Suivi satisfaction et proposition de masque hydratant après soin kératine.", target_client='Elena Martinez', channel='WhatsApp', status='Upcoming'),
    dict(campaign_key='camp-2', date_group='TODAY, OCT 26', time='10:00 AM', title='Welcome Series - Day 1', description='Automated onboarding email for new signups.', target_client='Amélie Tchoumi', channel='Email', status='Upcoming'),
    dict(campaign_key='camp-3', date_group='TODAY, OCT 26', time='2:30 PM', title='Rappel Entretien SMS', description='Rappel SMS pour retouche de la coupe et soin barbe.', target_client='Marcus Dubois', channel='SMS', status='Upcoming'),
    dict(campaign_key='camp-4', date_group='TOMORROW, OCT 27', time='11:15 AM', title='Offre Spéciale WhatsApp VIP', description='Proposition remise 15% sur rituel massage prolongé.', target_client='Nathalie Bernard', channel='WhatsApp', status='Upcoming'),
    dict(campaign_key='camp-1', date_group='PAST 7 DAYS', time='4:00 PM', title='Annonce Pack Soins Annuel', description='Emailing ciblé pour les clientes VIP fidélité.', target_client='Sophie Laurent & 14 autres', channel='Email', status='Past 7 Days'),
]


def seed_admin(db):
    email = settings.admin_email.lower().strip()

    if FORCE_ADMIN_RESET:
        db.query(models.User).delete()
        db.commit()
        print("FORCE_ADMIN_RESET set: cleared existing admin account(s).")

    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        print(f"Admin account already exists: {email}")
        return
    db.add(models.User(email=email, password_hash=hash_password(settings.admin_password), name="Admin"))
    db.commit()
    print(f"Admin account ready: {email}")


def force_clear_all(db):
    # Order matters: timeline_items/automation_campaigns hold FKs into clients,
    # so children must go before clients or Postgres raises ForeignKeyViolation.
    db.query(models.TimelineItem).delete()
    db.query(models.AutomationCampaign).delete()
    db.query(models.Client).delete()
    db.query(models.Service).delete()
    db.commit()
    print("FORCE_RESEED_ONCE set: cleared existing clients, campaigns, timeline, and services.")


def wipe_demo_data(db):
    # Leaves services, campaigns, and the admin account untouched — only
    # the demo clients and their timeline entries ("tasks") are removed.
    # Timeline first: it holds an FK into clients.
    db.query(models.TimelineItem).delete()
    db.query(models.Client).delete()
    db.commit()
    print("WIPE_DEMO_ONCE set: cleared all clients and timeline entries, left empty.")


def seed_clients(db):
    if db.query(models.Client).count() > 0:
        print("Clients already seeded, skipping.")
        return
    for data in INITIAL_CLIENTS:
        db.add(models.Client(**data))
    db.commit()
    print(f"Seeded {len(INITIAL_CLIENTS)} clients.")


def seed_services(db):
    if REPLACE_SERVICES_ONCE:
        db.query(models.Service).delete()
        db.commit()
        print("REPLACE_SERVICES_ONCE set: cleared existing services catalog.")

    if db.query(models.Service).count() > 0:
        print("Services already seeded, skipping.")
        return
    for data in INITIAL_SERVICES:
        db.add(models.Service(**data))
    db.commit()
    print(f"Seeded {len(INITIAL_SERVICES)} services.")


def refresh_campaign_text(db):
    """One-time text repair for rows already seeded before a copy fix (e.g. a
    rebrand): re-applies subject_line/message_body from INITIAL_CAMPAIGNS by
    matching on the stable `name` column, without touching stats or history.
    """
    updated = 0
    for data in INITIAL_CAMPAIGNS:
        name = data["name"]
        campaign = db.query(models.AutomationCampaign).filter_by(name=name).first()
        if campaign is None:
            continue
        campaign.subject_line = data["subject_line"]
        campaign.message_body = data["message_body"]
        campaign.cta_text = data["cta_text"]
        updated += 1
    db.commit()
    print(f"REFRESH_CAMPAIGN_TEXT_ONCE set: refreshed text on {updated} campaign(s).")


def seed_campaigns_and_timeline(db):
    campaign_id_map: dict[str, str] = {}

    if db.query(models.AutomationCampaign).count() == 0:
        for data in INITIAL_CAMPAIGNS:
            key = data.pop("key")
            campaign = models.AutomationCampaign(**data)
            db.add(campaign)
            db.flush()
            campaign_id_map[key] = campaign.id
        db.commit()
        print(f"Seeded {len(INITIAL_CAMPAIGNS)} campaigns.")
    else:
        print("Campaigns already seeded, skipping.")
        if REFRESH_CAMPAIGN_TEXT_ONCE:
            refresh_campaign_text(db)

    # Timeline demo entries only ever get (re)created via FORCE_RESEED_ONCE.
    # On a normal boot an empty table is left alone — it's just as likely to
    # mean "intentionally cleared" as "never seeded", and row count alone
    # can't tell the difference.
    if FORCE_RESEED and db.query(models.TimelineItem).count() == 0:
        for data in INITIAL_TIMELINE:
            campaign_key = data.pop("campaign_key", None)
            db.add(models.TimelineItem(**data, campaign_id=campaign_id_map.get(campaign_key)))
        db.commit()
        print(f"Seeded {len(INITIAL_TIMELINE)} timeline items.")
    else:
        print("Timeline: leaving as-is (not auto-seeded outside FORCE_RESEED_ONCE).")


def main():
    db = SessionLocal()
    try:
        seed_admin(db)
        if FORCE_RESEED:
            force_clear_all(db)
            seed_clients(db)
        if WIPE_DEMO_ONCE:
            wipe_demo_data(db)
        seed_services(db)
        seed_campaigns_and_timeline(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
