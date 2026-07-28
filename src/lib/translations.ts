/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export interface Translations {
  welcome: string;
  playground: string;
  dashboard: string;
  profile: string;
  subscription: string;
  apiKeys: string;
  docs: string;
  contact: string;
  settings: string;
  logIn: string;
  signUp: string;
  signOut: string;
  features: string;
  pricing: string;
  faq: string;
  blog: string;
  privacy: string;
  terms: string;
  
  // Home / Hero Page
  hero_title: string;
  hero_subtitle: string;
  cta_start: string;
  cta_docs: string;
  
  // Settings Page
  settings_title: string;
  settings_desc: string;
  theme_label: string;
  theme_desc: string;
  language_label: string;
  language_desc: string;
  model_pref_label: string;
  model_pref_desc: string;
  save_settings: string;
  settings_success: string;
  
  // Dashboard
  monthly_queries: string;
  generated_tokens: string;
  favorite_threads: string;
  current_plan: string;
  telemetry_latency: string;
  streak_active: string;

  // New keys for complete ecosystem translation
  scut_pay: string;
  scut_token: string;
  scut_credits: string;
  marketplace: string;
  business_portal: string;
  mica_bucurie: string;
  scut_women: string;
  support_center: string;
  help_center: string;
  save: string;
  cancel: string;
  submit: string;
  search: string;
  send: string;
  loading: string;
  notifications: string;
  emails: string;
  dashboards: string;
  system_messages: string;
  validation_messages: string;
  legal_pages: string;
}

// Order of keys for the compact compiler
const keys: (keyof Translations)[] = [
  'welcome', 'playground', 'dashboard', 'profile', 'subscription', 'apiKeys', 'docs', 'contact', 'settings', 'logIn', 'signUp', 'signOut', 'features', 'pricing', 'faq', 'blog', 'privacy', 'terms',
  'hero_title', 'hero_subtitle', 'cta_start', 'cta_docs',
  'settings_title', 'settings_desc', 'theme_label', 'theme_desc', 'language_label', 'language_desc', 'model_pref_label', 'model_pref_desc', 'save_settings', 'settings_success',
  'monthly_queries', 'generated_tokens', 'favorite_threads', 'current_plan', 'telemetry_latency', 'streak_active',
  'scut_pay', 'scut_token', 'scut_credits', 'marketplace', 'business_portal', 'mica_bucurie', 'scut_women', 'support_center', 'help_center', 'save', 'cancel', 'submit', 'search', 'send', 'loading', 'notifications', 'emails', 'dashboards', 'system_messages', 'validation_messages', 'legal_pages'
];

const values: Record<Language, string[]> = {
  en: [
    "Welcome to SCUT AI", "Playground", "Dashboard", "Profile Workspace", "Subscription", "API Keys", "Documentation", "Contact SLA", "Settings", "Log In", "Sign Up", "Sign Out", "Features", "Pricing", "FAQ", "Blog", "Privacy Policy", "Terms of Service",
    "Next-Gen AI Workspace Powered by Gemini 3.5", "Access high-performance reasoning engines with real-time streaming, advanced telemetry audit logs, and secure Firestore replication.", "Initialize Free Session", "Read Documentation",
    "Control Console & Settings", "Configure global parameters, interface styles, system locales, and default generation parameters.", "Visual Interface Theme", "Switch between Cosmic Dark theme or Crisp Light theme for active screens.", "System Display Language", "Select the locale translation dictionary for your active session.", "Default AI Model Model Weight", "Specify your preferred model weights for the active chat playground.", "Save All System Settings", "System parameters successfully synchronized.",
    "Monthly Queries Used", "Generated Tokens", "Favorite Threads", "Subscription Tier", "Telemetry is pristine. Latency is 42ms.", "Active session streak: 4 Days",
    "SCUT Pay", "SCUT Token", "SCUT Credits", "Marketplace", "Business Portal", "Mica Bucurie", "SCUT Women & Girls", "Support Center", "Help Center", "Save Settings", "Cancel", "Submit", "Search", "Send", "Loading...", "Notifications", "Emails", "Dashboards", "System Messages", "Validation Messages", "Legal Pages"
  ],
  ro: [
    "Bun venit la SCUT AI", "Spațiu de lucru", "Panou control", "Profil utilizator", "Abonament", "Chei API", "Documentație", "Asistență SLA", "Setări", "Autentificare", "Înregistrare", "Deconectare", "Funcționalități", "Tarife", "Întrebări frecvente", "Blog Tehnic", "Confidențialitate", "Termeni și condiții",
    "Spațiu de lucru AI din Generația Următoare bazat pe Gemini 3.5", "Accesați motoare de raționament de înaltă performanță cu streaming în timp real, jurnale avansate de telemetrie și replicare securizată în Firestore.", "Inițiază Sesiunea Gratuită", "Citiți Documentația",
    "Consola de Control și Setări", "Configurați parametrii globali, stilul interfeței, limba sistemului și opțiunile implicite de generare.", "Tema Vizuală a Interfeței", "Comutați între tema Întunecată (Cosmic) sau tema Luminoasă (Crisp) pentru ecranele active.", "Limba de Afișare a Sistemului", "Selectați dicționarul de traduceri local pentru sesiunea curentă.", "Modelul AI Implicit", "Specificați modelul preferat pentru spațiul de joacă interactiv.", "Salvează Setările Sistemului", "Parametrii sistemului au fost sincronizați cu succes.",
    "Interogări Lunare Utilizate", "Tokeni Generați", "Conversații Favorite", "Nivel Abonament", "Telemetria este perfectă. Latenta este de 42ms.", "Zile consecutive active: 4 zile",
    "SCUT Pay", "SCUT Token", "Credite SCUT", "Piață", "Portal Business", "Mica Bucurie", "Femei și Fete SCUT", "Centru Asistență", "Centru Ajutor", "Salvează setările", "Anulează", "Trimite", "Caută", "Trimite", "Se încarcă...", "Notificări", "E-mailuri", "Panouri", "Mesaje sistem", "Mesaje validare", "Pagini legale"
  ],
  es: [
    "Bienvenido a SCUT AI", "Área de juegos", "Panel de control", "Espacio de perfil", "Suscripción", "Claves API", "Documentación", "Soporte SLA", "Configuración", "Iniciar Sesión", "Registrarse", "Cerrar Sesión", "Características", "Precios", "Preguntas frecuentes", "Blog", "Privacidad", "Términos de servicio",
    "Espacio de trabajo AI de última generación impulsado por Gemini 3.5", "Acceda a motores de razonamiento de alto rendimiento con transmisión en tiempo real, registros avanzados de telemetría y replicación segura en Firestore.", "Iniciar sesión gratuita", "Leer documentación",
    "Consola de Control y Ajustes", "Configure parámetros globales, estilos de interfaz, idiomas del sistema y parámetros de generación predeterminados.", "Tema de interfaz visual", "Cambie entre el tema Cósmico Oscuro o el tema Claro para las pantallas activas.", "Idioma del sistema", "Seleccione el diccionario de traducción local para su sesión activa.", "Peso predeterminado del modelo AI", "Especifique sus pesos de modelo preferidos para el chat interactivo.", "Guardar configuración del sistema", "Los parámetros del sistema se sincronizaron correctamente.",
    "Consultas mensuales usadas", "Tokens Generados", "Hilos favoritos", "Plan de suscripción", "La telemetría es impecable. La latencia es de 42 ms.", "Racha de sesiones activas: 4 días",
    "SCUT Pay", "SCUT Token", "Créditos SCUT", "Mercado", "Portal de Negocios", "Mica Bucurie", "SCUT Mujeres y Niñas", "Centro de Soporte", "Centro de Ayuda", "Guardar configuración", "Cancelar", "Enviar", "Buscar", "Enviar", "Cargando...", "Notificaciones", "Correos", "Paneles", "Mensajes del sistema", "Mensajes de validación", "Páginas legales"
  ],
  fr: [
    "Bienvenue sur SCUT AI", "Espace d'essai", "Tableau de bord", "Profil utilisateur", "Abonnement", "Clés API", "Documentation", "Support SLA", "Paramètres", "Connexion", "S'inscrire", "Déconnexion", "Fonctionnalités", "Tarification", "FAQ", "Blog", "Confidentialité", "Conditions d'utilisation",
    "Espace de travail IA de nouvelle génération propulsé par Gemini 3.5", "Accédez à des moteurs de raisonnement haute performance avec streaming en temps réel, audits de télémétrie avancés et réplication Firestore sécurisée.", "Initialiser une session gratuite", "Lire la documentation",
    "Console de contrôle et paramètres", "Configurez les paramètres globaux, les styles d'interface, les langues du système et les options de génération.", "Thème visuel de l'interface", "Basculez entre le thème Sombre (Cosmic) ou Clair (Crisp) pour les écrans actifs.", "Langue d'affichage du système", "Sélectionnez le dictionnaire de traduction pour votre session active.", "Modèle d'IA par défaut", "Spécifiez vos modèles préférés pour l'espace d'essai interactif.", "Enregistrer tous les paramètres", "Les paramètres du système ont été synchronisés avec succès.",
    "Requêtes mensuelles utilisées", "Jetons générés", "Fils favoris", "Niveau d'abonnement", "La télémétrie est parfaite. Latence de 42ms.", "Série de sessions actives: 4 jours",
    "SCUT Pay", "SCUT Token", "Crédits SCUT", "Marketplace", "Portail d'Affaires", "Mica Bucurie", "Femmes & Filles SCUT", "Centre de Support", "Centre d'Aide", "Enregistrer", "Annuler", "Soumettre", "Rechercher", "Envoyer", "Chargement...", "Notifications", "E-mails", "Tableaux", "Messages système", "Messages de validation", "Pages juridiques"
  ],
  de: [
    "Willkommen bei SCUT AI", "Spielwiese", "Dashboard", "Profilbereich", "Abonnement", "API-Schlüssel", "Dokumentation", "SLA Support", "Einstellungen", "Anmelden", "Registrieren", "Abmelden", "Funktionen", "Preise", "FAQ", "Blog", "Datenschutz", "Nutzungsbedingungen",
    "KI-Arbeitsplatz der nächsten Generation, betrieben mit Gemini 3.5", "Greifen Sie auf leistungsstarke Logik-Engines mit Echtzeit-Streaming, fortschrittlichen Telemetrie-Überwachungsprotokollen und sicherer Firestore-Replikation zu.", "Kostenlose Sitzung starten", "Dokumentation lesen",
    "Steuerungskonsole & Einstellungen", "Konfigurieren Sie globale Parameter, Oberflächenstile, Systemsprachen und standardmäßige Generierungsoptionen.", "Visuelles Oberflächen-Theme", "Wechseln Sie zwischen dem Cosmic Dark-Theme oder dem Crisp Light-Theme für aktive Bildschirme.", "System-Anzeigesprache", "Wählen Sie das lokale Übersetzungsverzeichnis für Ihre aktive Sitzung aus.", "Standard-KI-Modell Gewichtung", "Geben Sie Ihre bevorzugten Modellgewichte für den aktiven Chat-Spielplatz an.", "Alle Systemeinstellungen speichern", "Systemparameter erfolgreich synchronisiert.",
    "Monatliche Abfragen verwendet", "Generierte Token", "Favorisierte Threads", "Abonnement-Stufe", "Die Telemetrie ist fehlerfrei. Die Latenz beträgt 42 ms.", "Aktive Sitzungssträhne: 4 Tage",
    "SCUT Pay", "SCUT Token", "SCUT Kredite", "Marktplatz", "Business-Portal", "Mica Bucurie", "SCUT Frauen & Mädchen", "Support-Center", "Hilfe-Center", "Speichern", "Abbrechen", "Senden", "Suchen", "Senden", "Laden...", "Benachrichtigungen", "E-Mails", "Dashboards", "Systemmeldungen", "Validierungsmeldungen", "Rechtliche Seiten"
  ],
  it: [
    "Benvenuto su SCUT AI", "Area di prova", "Cruscotto", "Profilo utente", "Abbonamento", "Chiavi API", "Documentazione", "Supporto SLA", "Impostazioni", "Accedi", "Registrati", "Disconnetti", "Funzioni", "Prezi", "FAQ", "Blog", "Privacy", "Termini",
    "Spazio di lavoro IA di nuova generazione con Gemini 3.5", "Accedi a potenti motori logici con streaming in tempo real, log di telemetria e sincronizzazione Firestore.", "Inizia sessione gratuita", "Leggi documentazione",
    "Console di controllo", "Configura parametri, stili interfaccia, lingua sistema e parametri di generazione.", "Tema Interfaccia", "Scegli tra Cosmic Dark o Crisp Light per i tuoi schermi.", "Lingua del Sistema", "Seleziona la lingua per la sessione attiva.", "Modello predefinito AI", "Specifica il modello preferito per la chat.", "Salva impostazioni", "Impostazioni salvate con successo.",
    "Query mensili usate", "Token generati", "Conversazioni preferite", "Piano", "La telemetria è perfetta. Latenza 42ms.", "Sessioni consecutive: 4 Giorni",
    "SCUT Pay", "SCUT Token", "Crediti SCUT", "Marketplace", "Portale Aziende", "Mica Bucurie", "Donne & Ragazze SCUT", "Centro Supporto", "Centro Aiuto", "Salva", "Annulla", "Invia", "Cerca", "Invia", "Caricamento...", "Notifiche", "Email", "Cruscotti", "Messaggi di sistema", "Validazioni", "Pagine legali"
  ],
  pt: [
    "Bem-vindo ao SCUT AI", "Área de testes", "Painel", "Perfil do Usuário", "Assinatura", "Chaves API", "Documentação", "Suporte SLA", "Configurações", "Entrar", "Cadastrar-se", "Sair", "Recursos", "Preços", "FAQ", "Blog", "Privacidade", "Termos",
    "Espaço de trabalho de IA de última geração com Gemini 3.5", "Acesse mecanismos de raciocínio de alta performance com logs em tempo real e replicação segura.", "Iniciar sessão gratuita", "Ler documentação",
    "Console de controle", "Configure parâmetros globais, estilo de interface e idioma.", "Tema de interface visual", "Alterne entre o tema Cósmico Escuro ou Claro.", "Idioma do sistema", "Selecione o idioma de exibição.", "Modelo AI padrão", "Especifique o modelo de chat padrão.", "Salvar configurações", "Sincronizado com sucesso.",
    "Consultas mensais", "Tokens gerados", "Conversas favoritas", "Plano atual", "Telemetria impecável. Latência de 42ms.", "Sessões consecutivas: 4 Dias",
    "SCUT Pay", "SCUT Token", "Créditos SCUT", "Mercado", "Portal de Negócios", "Mica Bucurie", "Mulheres & Meninas SCUT", "Centro de Suporte", "Centro de Ajuda", "Salvar", "Cancelar", "Enviar", "Buscar", "Enviar", "Carregando...", "Notificações", "E-mails", "Painéis", "Mensagens do sistema", "Mensagens de validação", "Páginas legais"
  ],
  nl: [
    "Welkom bij SCUT AI", "Speeltuin", "Dashboard", "Gebruikersprofiel", "Abonnement", "API-sleutels", "Documentatie", "SLA Ondersteuning", "Instellingen", "Inloggen", "Registreren", "Uitloggen", "Functies", "Prijzen", "FAQ", "Blog", "Privacy", "Voorwaarden",
    "Volgende generatie AI-werkplek aangedreven door Gemini 3.5", "Krijg toegang tot krachtige redeneermotoren met real-time streaming en telemetrie.", "Start gratis sessie", "Lees documentatie",
    "Besturingsconsole", "Configureer parameters, interface-stijlen, landinstellingen en generatie.", "Visuele interface thema", "Schakel tussen Cosmic Dark of Crisp Light thema.", "Systeemmaatstaaf taal", "Selecteer de taal voor je actieve sessie.", "Standaard AI-model", "Kies je standaard chatmodel.", "Systeem opslaan", "Parameters succesvol gesynchroniseerd.",
    "Maandelijkse zoekopdrachten", "Gegenereerde tokens", "Favoriete threads", "Abonnementstype", "Telemetrie is perfect. Latency is 42ms.", "Actieve sessie streak: 4 Dagen",
    "SCUT Pay", "SCUT Token", "SCUT Credits", "Marktplaats", "Zakelijk Portal", "Mica Bucurie", "SCUT Vrouwen & Meisjes", "Ondersteuningscentrum", "Helpcentrum", "Opslaan", "Annuleren", "Verzenden", "Zoeken", "Verzenden", "Laden...", "Meldingen", "E-mails", "Dashboards", "Systeemberichten", "Validatieberichten", "Juridische pagina's"
  ],
  da: [
    "Velkommen til SCUT AI", "Legeplads", "Kontrolpanel", "Brugerprofil", "Abonnement", "API-nøgler", "Dokumentation", "SLA Support", "Indstillinger", "Log ind", "Tilmeld", "Log ud", "Funktioner", "Priser", "FAQ", "Blog", "Fortrolighed", "Vilkår",
    "Næste generations AI-arbejdsområde drevet af Gemini 3.5", "Få adgang til højtydende ræsonnementsmotorer med realtidsstreaming.", "Start gratis session", "Læs dokumentation",
    "Kontrolkonsol", "Konfigurer globale parametre, grænsefladestile og systemsprog.", "Visuelt tema", "Skift mellem Cosmic Dark eller Crisp Light tema.", "Systemsprog", "Vælg oversættelsesordbog for din session.", "Standard AI-model", "Angiv foretrukne modelvægte.", "Gem indstillinger", "Symptomparametre synkroniseret.",
    "Månedlige forespørgsler", "Genererede tokens", "Favorittråde", "Abonnementsniveau", "Telemetri er perfekt. Latens er 42ms.", "Aktiv sessionsrække: 4 dage",
    "SCUT Pay", "SCUT Token", "SCUT Kreditter", "Markedsplads", "Erhvervsportal", "Mica Bucurie", "SCUT Kvinder & Piger", "Supportcenter", "Hjælpecenter", "Gem", "Annuller", "Indsend", "Søg", "Send", "Indlæser...", "Notifikationer", "E-mails", "Dashboards", "Systemmeddelelser", "Valideringsmeddelelser", "Juridiske sider"
  ],
  sv: [
    "Välkommen till SCUT AI", "Lekplats", "Kontrollpanel", "Användarprofil", "Prenumeration", "API-nycklar", "Dokumentation", "SLA Support", "Inställningar", "Logga in", "Registrera dig", "Logga ut", "Funktioner", "Priser", "FAQ", "Blogg", "Integritet", "Villkor",
    "Nästa generations AI-arbetsyta som drivs av Gemini 3.5", "Få tillgång till högpresterande logikmotorer med realtidsströmning.", "Starta gratis session", "Läs dokumentation",
    "Kontrollkonsol", "Konfigurera globala parametrar, gränssnittsstilar och systemspråk.", "Visuellt tema", "Välj mellan Cosmic Dark eller Crisp Light.", "Systemspråk", "Välj språk för din aktiva session.", "Standard AI-modell", "Välj föredragen modell.", "Spara alla", "Synkronisering slutförd.",
    "Månadsvisa frågor", "Genererade tokens", "Favorittrådar", "Prenumeration", "Telemetri är utmärkt. Latens är 42ms.", "Aktiv sessionssvit: 4 Dagar",
    "SCUT Pay", "SCUT Token", "SCUT Krediter", "Marknadsplats", "Företagsportal", "Mica Bucurie", "SCUT Kvinnor & Flickor", "Supportcenter", "Hjälpcenter", "Spara", "Avbryt", "Skicka", "Sök", "Skicka", "Laddar...", "Notiser", "E-post", "Paneler", "Systemmeddelanden", "Validering", "Juridiska sidor"
  ],
  no: [
    "Velkommen til SCUT AI", "Lekeplass", "Dashbord", "Brukerprofil", "Abonnement", "API-nøkler", "Dokumentasjon", "SLA Kundestøtte", "Innstillinger", "Logg inn", "Registrer", "Logg ut", "Funksjoner", "Priser", "FAQ", "Blogg", "Personvern", "Vilkår",
    "Neste generasjons AI-arbeidsområde drevet av Gemini 3.5", "Tilgang til logikkmotorer med sanntidsstrømming og telemetri.", "Start gratis økt", "Les dokumentasjon",
    "Kontrollkonsoll", "Konfigurer globale parametere, grensesnittstiler og språk.", "Visuelt tema", "Bytt mellom mørkt og lyst tema.", "Systemspråk", "Velg visningsspråk for økten.", "Standard AI-modell", "Velg din foretrukne modell.", "Lagre alt", "Suksessfullt synkronisert.",
    "Månedlige søk", "Genererte tokens", "Favorittråder", "Abonnement", "Målinger er utmerket. Latens er 42ms.", "Aktiv sessionsrekke: 4 dager",
    "SCUT Pay", "SCUT Token", "SCUT Kreditter", "Markedsplads", "Bedriftsportal", "Mica Bucurie", "SCUT Kvinner & Jenter", "Kundestøttesenter", "Hjelpesenter", "Lagre", "Avbryt", "Send", "Søk", "Send", "Laster...", "Varsler", "E-post", "Dashbord", "Systemmeldinger", "Validering", "Juridiske sider"
  ],
  fi: [
    "Tervetuloa SCUT AI", "Hiekkalaatikko", "Käyttöliittymä", "Profiili", "Tilaus", "API-avaimet", "Dokumentaatio", "SLA Tuki", "Asetukset", "Kirjaudu sisään", "Rekisteröidy", "Kirjaudu ulos", "Ominaisuudet", "Hinnoittelu", "UKK", "Blogi", "Tietosuoja", "Ehdot",
    "Seuraavan sukupolven tekoäly-työtila Gemini 3.5:llä", "Huippuluokan tekoälymoottorit reaaliaikaisella suoratoistolla.", "Aloita ilmainen istunto", "Lue dokumentaatio",
    "Hallintakonsoli", "Määritä globaalit parametrit, tyylit ja kieli.", "Käyttöliittymän teema", "Vaihda Cosmic Dark- ja Crisp Light -teemojen välillä.", "Järjestelmän kieli", "Valitse kieli istuntoasi varten.", "Tekoäly-malli", "Määritä suosikkimallisi istuntoon.", "Tallenna kaikki", "Synkronointi onnistui.",
    "Kuukausittaiset haut", "Generoidut tokenit", "Suosikkiketjut", "Tilaustaso", "Telemetria on täydellinen. Viive on 42ms.", "Aktiivinen sarja: 4 päivää",
    "SCUT Pay", "SCUT Token", "SCUT Krediitit", "Kauppapaikka", "Yritysportaali", "Mica Bucurie", "SCUT Naiset & Tytöt", "Tukikeskus", "Ohjekeskus", "Tallenna", "Peruuta", "Lähetä", "Hae", "Lähetä", "Ladataan...", "Ilmoitukset", "Sähköpostit", "Näkymät", "Järjestelmäviestit", "Validointi", "Lakitiedot"
  ],
  pl: [
    "Witamy w SCUT AI", "Piaskownica", "Panel", "Profil Użytkownika", "Subskrypcja", "Klucze API", "Dokumentacja", "Wsparcie SLA", "Ustawienia", "Zaloguj się", "Zarejestruj się", "Wyloguj się", "Funkcje", "Cennik", "FAQ", "Blog", "Prywatność", "Regulamin",
    "Przestrzeń robocza AI nowej generacji oparta na Gemini 3.5", "Dostęp do silników wnioskowania o wysokiej wydajności z telemetrycznym audytem.", "Uruchom darmową sesję", "Przeczytaj dokumentację",
    "Konsola sterowania", "Konfiguruj globalne parametry, style interfejsu i języki.", "Motyw interfejsu", "Przełączaj między motywem Ciemnym a Jasnym.", "Język systemu", "Wybierz słownik tłumaczeń dla sesji.", "Model AI", "Wskaż preferowany model dla czatu.", "Zapisz ustawienia", "Parametry pomyślnie zsynchronizowane.",
    "Miesięczne zapytania", "Wygenerowane tokeny", "Ulubione wątki", "Subskrypcja", "Telemetria bez zarzutu. Opóźnienie 42ms.", "Seria aktywnych dni: 4 dni",
    "SCUT Pay", "SCUT Token", "Kredyty SCUT", "Rynek", "Portal Biznesowy", "Mica Bucurie", "SCUT Kobiety i Dziewczęta", "Centrum Wsparcia", "Centrum Pomocy", "Zapisz", "Anuluj", "Wyślij", "Szukaj", "Wyślij", "Ładowanie...", "Powiadomienia", "E-maile", "Panele", "Komunikaty systemowe", "Walidacja", "Strony prawne"
  ],
  cs: [
    "Vítejte v SCUT AI", "Hřiště", "Nástěnka", "Uživatelský Profil", "Předplatné", "API klíče", "Dokumentace", "SLA Podpora", "Nastavení", "Přihlásit se", "Registrovat", "Odhlásit se", "Funkce", "Ceník", "Časté dotazy", "Blog", "Soukromí", "Podmínky",
    "Pracovní prostor AI nové generace poháněný Gemini 3.5", "Získejte přístup k vysoce výkonným logickým motorům s telemetrií.", "Zahájit bezplatnou relaci", "Číst dokumentaci",
    "Ovládací konzole", "Nakonfigurujte globální parametry, styly rozhraní a jazyky.", "Vizuální téma", "Přepínejte mezi tmavým a světlým motivem.", "Jazyk systému", "Vyberte překladový slovník pro relaci.", "Výchozí AI model", "Zadejte preferovaný model.", "Uložit nastavení", "Parametry úspěšně synchronizovány.",
    "Měsíční dotazy", "Generované tokeny", "Oblíbená vlákna", "Úroveň předplatného", "Telemetrie je v pořádku. Latence je 42ms.", "Aktivní série: 4 dny",
    "SCUT Pay", "SCUT Token", "Kredity SCUT", "Tržiště", "Business Portál", "Mica Bucurie", "SCUT Ženy a Dívky", "Centrum Podpory", "Centrum Nápovědy", "Uložit", "Zrušit", "Odeslat", "Hledat", "Odeslat", "Načítání...", "Oznámení", "E-maily", "Nástěnky", "Systémové zprávy", "Validace", "Právní stránky"
  ],
  sk: [
    "Vitajte v SCUT AI", "Ihrisko", "Ovládací Panel", "Profil Používateľa", "Predplatné", "API Kľúče", "Dokumentácia", "SLA Podpora", "Nastavenia", "Prihlásiť sa", "Registrovať sa", "Odhlásiť sa", "Funkcie", "Cenník", "FAQ", "Blog", "Súkromie", "Podmienky",
    "Pracovný priestor AI novej generácie poháňaný Gemini 3.5", "Získajte prístup k výkonným logickým motorom s telemetriou.", "Spustiť bezplatnú reláciu", "Čítať dokumentáciu",
    "Ovládacia konzola", "Nakonfigurujte globálne parametre, štýly rozhrania a jazyky.", "Vizuálna téma", "Prepnúť medzi tmavou a svetlou témou.", "Jazyk systému", "Vyberte prekladový slovník pre reláciu.", "Predvolený AI model", "Zadajte preferovaný model.", "Uložiť nastavenia", "Parametre úspešne synchronizované.",
    "Mesačné dopyty", "Generované tokeny", "Obľúbené vlákna", "Predplatné", "Telemetria je v poriadku. Latencia je 42ms.", "Aktívna séria: 4 dni",
    "SCUT Pay", "SCUT Token", "Kredity SCUT", "Trhovisko", "Biznis Portál", "Mica Bucurie", "SCUT Ženy a Dievčatá", "Centrum Podpory", "Centrum Pomoci", "Uložiť", "Zrušiť", "Odoslať", "Hľadať", "Odoslať", "Načítavanie...", "Oznámenia", "E-maily", "Panely", "Systémové správy", "Validačné správy", "Právne stránky"
  ],
  hu: [
    "Üdvözöljük a SCUT AI", "Homokozó", "Vezérlőpult", "Felhasználói profil", "Előfizetés", "API kulcsok", "Dokumentáció", "SLA támogatás", "Beállítások", "Bejelentkezés", "Regisztráció", "Kijelentkezés", "Funkciók", "Árak", "GYIK", "Blog", "Adatvédelem", "Feltételek",
    "Új generációs AI munkaterület Gemini 3.5 alapokon", "Nagy teljesítményű logikai motorok elérése valós idejű telemetriával.", "Ingyenes munkamenet indítása", "Dokumentáció olvasása",
    "Vezérlőpult", "Globális paraméterek, felületi stílusok és nyelvek konfigurálása.", "Vizuális téma", "Váltás Cosmic Dark és Crisp Light témák között.", "Rendszer nyelve", "Válasszon nyelvet a munkamenethez.", "Alapértelmezett AI modell", "Adja meg a preferált modellt.", "Minden mentése", "Sikeresen szinkronizálva.",
    "Havi lekérdezések", "Generált tokenek", "Kedvenc beszélgetések", "Előfizetés", "A telemetria kiváló. A késleltetés 42 ms.", "Aktív sorozat: 4 nap",
    "SCUT Pay", "SCUT Token", "SCUT Kreditek", "Piactér", "Üzleti Portál", "Mica Bucurie", "SCUT Nők és Lányok", "Támogatási Központ", "Súgóközpont", "Mentés", "Mégse", "Küldés", "Keresés", "Küldés", "Betöltés...", "Értesítések", "E-mailek", "Vezérlőpultok", "Rendszerüzenetek", "Validáció", "Jogi oldalak"
  ],
  el: [
    "Καλώς ήρθατε στο SCUT AI", "Χώρος Δοκιμών", "Πίνακας Ελέγχου", "Προφίλ Χρήστη", "Συνδρομή", "Κλειδιά API", "Τεκμηρίωση", "Υποστήριξη SLA", "Ρυθμίσεις", "Σύνδεση", "Εγγραφή", "Αποσύνδεση", "Χαρακτηριστικά", "Τιμολόγηση", "Συχνές Ερωτήσεις", "Ιστολόγιο", "Απόρρητο", "Όροι",
    "Χώρος εργασίας AI επόμενης γενιάς με Gemini 3.5", "Πρόσβαση σε μηχανές λογικής υψηλής απόδοσης με ροή σε πραγματικό χρόνο.", "Έναρξη δωρεάν συνεδρίας", "Ανάγνωση τεκμηρίωσης",
    "Κονσόλα ελέγχου", "Ρύθμιση παραμέτρων, στυλ διεπαφής και γλωσσών συστήματος.", "Θέμα διεπαφής", "Εναλλαγή μεταξύ Cosmic Dark ή Crisp Light.", "Γλώσσα συστήματος", "Επιλέξτε λεξικό μετάφρασης για τη συνεδρία.", "Μοντέλο AI", "Καθορίστε το προτιμώμενο μοντέλο.", "Αποθήκευση όλων", "Ολοκληρώθηκε ο συγχρονισμός.",
    "Μηνιαία ερωτήματα", "Δημιουργημένα token", "Αγαπημένες συνομιλίες", "Κατηγορία συνδρομής", "Η τηλεμετρία είναι τέλεια. Καθυστέρηση 42ms.", "Συνεχόμενες ημέρες: 4 Ημέρες",
    "SCUT Pay", "SCUT Token", "Πιστώσεις SCUT", "Αγορά", "Επιχειρηματική Πύλη", "Mica Bucurie", "SCUT Γυναίκες & Κορίτσια", "Κέντρο Υποστήριξης", "Κέντρο Βοήθειας", "Αποθήκευση", "Ακύρωση", "Υποβολή", "Αναζήτηση", "Αποστολή", "Φόρτωση...", "Ειδοποιήσεις", "E-mail", "Πίνακες", "Μηνύματα συστήματος", "Επικύρωση", "Νομικές Σελίδες"
  ],
  tr: [
    "SCUT AI'ye Hoş Geldiniz", "Oyun Alanı", "Kontrol Paneli", "Kullanıcı Profili", "Abonelik", "API Anahtarları", "Belgeler", "SLA Desteği", "Ayarlar", "Giriş Yap", "Kaydol", "Çıkış Yap", "Özellikler", "Fiyatlandırma", "SSS", "Blog", "Gizlilik", "Koşullar",
    "Gemini 3.5 Tarafından Desteklenen Yeni Nesil AI Çalışma Alanı", "Gerçek zamanlı akışa sahip yüksek performanslı akıl yürütme motorları.", "Ücretsiz Oturum Başlat", "Belgeleri Oku",
    "Kontrol Konsolu ve Ayarlar", "Küresel parametreleri, arayüz stillerini ve sistem dillerini yapılandırın.", "Görsel Arayüz Teması", "Cosmic Dark ile Crisp Light temaları arasında geçiş yapın.", "Sistem Ekran Dili", "Aktif oturumunuz için yerel çeviri sözlüğünü seçin.", "Varsayılan AI Modeli", "Etkileşimli sohbet için tercih edilen modeli belirtin.", "Sistem Ayarlarını Kaydet", "Sistem parametreleri başarıyla senkronize edildi.",
    "Aylık Kullanılan Sorgu", "Üretilen Tokenlar", "Sık Kullanılan Sohbetler", "Abonelik Seviyesi", "Telemetri mükemmel durumda. Gecikme süresi 42ms.", "Aktif oturum serisi: 4 Gün",
    "SCUT Pay", "SCUT Token", "SCUT Kredileri", "Pazaryeri", "İş Portalı", "Mica Bucurie", "SCUT Kadınlar ve Kızlar", "Destek Merkezi", "Yardım Merkezi", "Kaydet", "İptal", "Gönder", "Ara", "Gönder", "Yükleniyor...", "Bildirimler", "E-postalar", "Paneller", "Sistem Mesajları", "Doğrulama", "Yasal Sayfalar"
  ],
  uk: [
    "Ласкаво просимо до SCUT AI", "Ігровий майданчик", "Панель управління", "Профіль користувача", "Підписка", "Ключі API", "Документація", "Підтримка SLA", "Налаштування", "Увійти", "Реєстрація", "Вийти", "Функції", "Ціни", "FAQ", "Блог", "Конфіденційність", "Умови",
    "Робочий простір AI нового покоління на базі Gemini 3.5", "Доступ до високопродуктивних логічних двигунів з телеметрією.", "Почати безкоштовну сесію", "Читати документацію",
    "Панель керування та налаштування", "Конфігурація глобальних параметрів, стилів інтерфейсу та мов.", "Візуальна тема інтерфейсу", "Перемикання між темною та світлою темою.", "Системна мова", "Виберіть мову для поточної сесії.", "Модель AI за замовчуванням", "Оберіть модель для чату.", "Зберегти налаштування", "Параметри успішно синхронізовано.",
    "Місячні запити", "Згенеровані токени", "Улюблені гілки", "Рівень підписки", "Телеметрія ідеальна. Затримка становить 42 мс.", "Активна серія: 4 дні",
    "SCUT Pay", "SCUT Token", "Кредити SCUT", "Маркетплейс", "Бізнес Портал", "Mica Bucurie", "SCUT Жінки та Дівчата", "Центр Підтримки", "Довідковий Центр", "Зберегти", "Скасувати", "Надіслати", "Пошук", "Надіслати", "Завантаження...", "Сповіщення", "Листи", "Панелі", "Системні повідомлення", "Валідація", "Юридичні сторінки"
  ],
  ar: [
    "مرحباً بك في SCUT AI", "مساحة العمل", "لوحة التحكم", "الملف الشخصي", "الاشتراك", "مفاتيح API", "التوثيق", "دعم SLA", "الإعدادات", "تسجيل الدخول", "إنشاء حساب", "تسجيل الخروج", "الميزات", "الأسعار", "الأسئلة الشائعة", "المدونة", "الخصوصية", "الشروط",
    "بيئة عمل الذكاء الاصطناعي من الجيل القادم المدعومة بـ Gemini 3.5", "الوصول إلى محركات استدلال عالية الأداء مع بث فوري وتحليلات.", "بدء جلسة عمل مجانية", "قراءة التوثيق",
    "لوحة التحكم والإعدادات", "تكوين المعلمات العامة، وأنماط الواجهة، ولغة النظام.", "مظهر الواجهة المرئية", "التبديل بين المظهر المظلم الكوني والمظهر الفاتح.", "لغة عرض النظام", "اختر قاموس الترجمة لجلسة العمل الخاصة بك.", "نموذج الذكاء الاصطناعي الافتراضي", "حدد الطراز المفضل للدردشة.", "حفظ الإعدادات", "تم مزامنة معلمات النظام بنجاح.",
    "الاستفسارات الشهرية المستهلكة", "الرموز المميزة التي تم إنشاؤها", "المحادثات المفضلة", "فئة الاشتراك", "التحليلات ممتازة. زمن الوصول 42 ملي ثانية.", "سلسلة النشاط: 4 أيام",
    "SCUT Pay", "SCUT Token", "رصيد SCUT", "المتجر", "بوابة الأعمال", "Mica Bucurie", "SCUT للنساء والفتيات", "مركز الدعم", "مركز المساعدة", "حفظ", "إلغاء", "إرسال", "بحث", "إرسال", "جاري التحميل...", "الإشعارات", "الرسائل", "لوحات المعلومات", "رسائل النظام", "التحقق", "الصفحات القانونية"
  ],
  he: [
    "ברוכים הבאים ל-SCUT AI", "סביבת עבודה", "לוח בקרה", "פרופיל משתמש", "מנוי", "מפתחות API", "תיעוד", "תמיכת SLA", "הגדרות", "התחברות", "הרשמה", "התנתקות", "תכונות", "תמחור", "שאלות נפוצות", "בלוג", "פרטיות", "תנאי שימוש",
    "סביבת עבודה של בינה מלאכותית מהדור הבא עם Gemini 3.5", "גישה למנועי לוגיקה בעלי ביצועים גבוהים עם הזרמת נתונים.", "התחל מפגש חינם", "קרא את התיעוד",
    "לוח בקרה והגדרות", "קביעת פרמטרים גלובליים, סגנונות ממשק ושפות.", "ערכת נושא של הממשק", "מעבר בין ערכת נושא כהה קוסמית או בהירה.", "שפת המערכת", "בחירת שפת תצוגה עבור המפגש.", "מודל AI כברירת מחדל", "בחירת מודל מועדף לצ'אט.", "שמור הגדרות", "הפרמטרים סונכרנו בהצלחה.",
    "שאילתות חודשיות בשימוש", "אסימונים שנוצרו", "שיחות מועדפות", "רמת המנוי", "הטלמטריה מושלמת. השהיה של 42 מילישניות.", "רצף פעילות: 4 ימים",
    "SCUT Pay", "SCUT Token", "נקודות SCUT", "חנות", "פורטל עסקי", "Mica Bucurie", "SCUT נשים ונערות", "מרכז תמיכה", "מרכז עזרה", "שמור", "ביטול", "שלח", "חיפוש", "שלח", "טוען...", "התראות", "אימיילים", "לוחות בקרה", "הודעות מערכת", "אימות", "דפים משפטיים"
  ],
  hi: [
    "SCUT AI में आपका स्वागत है", "प्लेग्राउंड", "डैशबोर्ड", "प्रोफ़ाइल", "सदस्यता", "API कुंजी", "दस्तावेज़", "SLA समर्थन", "सेटिंग्स", "लॉग इन", "साइन अप", "साइन आउट", "विशेषताएं", "मूल्य निर्धारण", "FAQ", "ब्लॉग", "गोपनीयता", "शर्तें",
    "Gemini 3.5 द्वारा संचालित अगली पीढ़ी का AI वर्कस्पेस", "वास्तविक समय स्ट्रीमिंग के साथ उच्च प्रदर्शन वाले तर्क इंजन तक पहुंचें।", "नि:शुल्क सत्र शुरू करें", "दस्तावेज़ पढ़ें",
    "नियंत्रण कंसोल और सेटिंग्स", "वैश्विक मापदंडों, इंटरफ़ेस शैलियों और सिस्टम भाषाओं को कॉन्फ़िगर करें।", "दृश्य इंटरफ़ेस थीम", "कॉस्मिक डार्क थीम या क्रिस्प लाइट थीम के बीच स्विच करें।", "सिस्टम प्रदर्शन भाषा", "सत्र के लिए स्थानीय अनुवाद शब्दकोश का चयन करें।", "डिफ़ॉल्ट एआई मॉडल", "बातचीत के लिए पसंदीदा मॉडल निर्दिष्ट करें।", "सेटिंग्स सहेजें", "सिस्टम पैरामीटर सफलतापूर्वक सिंक्रनाइज़ किए गए।",
    "मासिक उपयोग की गई प्रश्न संख्या", "जेनरेट किए गए टोकन", "पसंदीदा चैट थ्रेड", "सदस्यता स्तर", "टेलीमेट्री त्रुटिहीन है। विलंबता 42ms है।", "सक्रिय सत्र सिलसिला: 4 दिन",
    "SCUT Pay", "SCUT Token", "SCUT क्रेडिट", "मार्केटप्लेस", "बिजनेस पोर्टल", "Mica Bucurie", "SCUT महिलाएं और लड़कियां", "सहायता केंद्र", "मदद केंद्र", "सहेजें", "रद्द करें", "भेजें", "खोजें", "भेजें", "लोड हो रहा है...", "सूचनाएं", "ईमेल", "डैशबोर्ड", "सिस्टम संदेश", "सत्यापन संदेश", "कानूनी पृष्ठ"
  ],
  zh: [
    "欢迎使用 SCUT AI", "演练场", "控制台", "用户资料", "订阅", "API 密钥", "文档说明", "SLA 支持", "系统设置", "账户登录", "账户注册", "安全退出", "功能特性", "服务定价", "常见问题", "技术博客", "隐私政策", "服务条款",
    "基于 Gemini 3.5 的下一代人工智能工作空间", "实时流式处理、高级遥测审计和安全存储同步的高性能推理引擎。", "开启免费体验", "阅读开发文档",
    "控制台与系统设置", "配置全局参数、界面样式、系统语言和默认生成选项。", "界面视觉主题", "可在宇宙深邃暗黑或清爽明亮主题之间切换。", "系统显示语言", "选择当前会话的本地化翻译字典。", "默认人工智能模型", "指定交互式对话的推荐模型权重。", "保存所有设置", "系统参数已成功同步。",
    "本月已用查询次数", "累计生成 Token", "收藏会话主题", "当前订阅级别", "遥测状态完美，当前系统延迟为 42ms。", "已连续登录活跃: 4 天",
    "SCUT Pay", "SCUT 代币", "SCUT 积分", "应用市场", "商业门户", "Mica Bucurie", "SCUT 妇女与女童", "支持中心", "帮助中心", "保存设置", "取消", "提交", "搜索", "发送", "加载中...", "通知消息", "电子邮件", "仪表盘", "系统消息", "验证信息", "法律条款"
  ],
  ja: [
    "SCUT AIへようこそ", "プレイグラウンド", "ダッシュボード", "プロファイル", "サブスクリプション", "APIキー", "ドキュメント", "SLAサポート", "設定", "ログイン", "新規登録", "ログアウト", "機能", "料金プラン", "よくある質問", "ブログ", "プライバシー", "規約",
    "Gemini 3.5搭載の次世代型インテリジェントAIワークスペース", "リアルタイムストリーミングと高度なテレメトリ監査を備えた推論エンジンへのアクセス。", "無料セッションを開始", "ドキュメントを読む",
    "コントロールコンソールと各種設定", "グローバルパラメータ、インターフェーススタイル、表示言語を設定します。", "ビジュアルテーマ", "コズミックダークまたはクリスプライトを選択できます。", "システム表示言語", "セッションで使用する言語を設定します。", "デフォルトAIモデル", "対話で使用する推奨モデルを指定します。", "設定を保存する", "パラメータが正常に同期されました。",
    "月間クエリ使用量", "生成トークン数", "お気に入りのチャット", "プラン", "テレメトリは正常です。遅延は 42ms です。", "連続アクティブ：4 日間",
    "SCUT Pay", "SCUTトークン", "SCUTクレジット", "マーケットプレイス", "ビジネスポータル", "Mica Bucurie", "SCUT女性と女児支援", "サポートセンター", "ヘルプセンター", "保存する", "キャンセル", "送信する", "検索する", "送信する", "読み込み中...", "通知", "メール", "ダッシュボード一覧", "システムメッセージ", "検証エラー", "法的ページ"
  ],
  ko: [
    "SCUT AI에 오신 것을 환영합니다", "플레이그라운드", "대시보드", "프로필", "구독", "API 키", "문서", "SLA 지원", "설정", "로그인", "회원가입", "로그아웃", "기능", "요금", "자주 묻는 질문", "블로그", "개인정보 처리방침", "이용약관",
    "Gemini 3.5 기반 차세대 인공지능 워크스페이스", "실시간 스트리밍 및 고급 원격 측정 감사 기능을 제공하는 고성능 추론 엔진.", "무료 세션 시작", "문서 읽기",
    "제어 콘솔 및 시스템 설정", "전역 매개변수, 인터페이스 스타일 및 시스템 언어를 구성합니다.", "인터페이스 비주얼 테마", "우주형 다크 또는 선명한 라이트 테마를 선택할 수 있습니다.", "시스템 표시 언어", "활성 세션에 사용할 로컬 번역 사전을 선택합니다.", "기본 AI 모델", "대화식 세션에 적용할 추천 모델 가중치 설정.", "설정 저장", "시스템 매개변수가 성공적으로 동기화되었습니다.",
    "이번 달 사용한 쿼리", "생성된 토큰 수", "즐겨찾기 대화", "구독 등급", "원격 측정이 완벽합니다. 대기 시간은 42ms입니다.", "연속 활성 일수: 4일",
    "SCUT Pay", "SCUT 토큰", "SCUT 크레딧", "마켓플레이스", "비즈니스 포털", "Mica Bucurie", "SCUT 여성 및 소녀", "지원 센터", "도움말 센터", "저장", "취소", "제출", "검색", "전송", "로딩 중...", "알림", "이메일", "대시보드", "시스템 메시지", "유효성 검사 메시지", "법적 문서"
  ],
  th: [
    "ยินดีต้อนรับสู่ SCUT AI", "สนามเด็กเล่น", "แผงควบคุม", "โปรไฟล์ผู้ใช้", "การสมัครสมาชิก", "รหัส API", "เอกสารประกอบ", "ฝ่ายสนับสนุน SLA", "การตั้งค่า", "เข้าสู่ระบบ", "ลงทะเบียน", "ออกจากระบบ", "คุณสมบัติ", "ราคา", "คำถามที่พบบ่อย", "บล็อก", "นโยบายความเป็นส่วนตัว", "ข้อกำหนดการใช้งาน",
    "พื้นที่ทำงาน AI ยุคใหม่ที่ขับเคลื่อนโดย Gemini 3.5", "เข้าถึงเครื่องมือวิเคราะห์ประสิทธิภาพสูงพร้อมการสตรีมแบบเรียลไทม์และการบันทึกข้อมูลแบบละเอียด", "เริ่มเซสชันฟรี", "อ่านเอกสารประกอบ",
    "คอนโซลควบคุมและการตั้งค่า", "กำหนดค่าพารามิเตอร์ทั่วไป สไตล์อินเทอร์เฟซ และภาษาของระบบ", "ธีมอินเทอร์เฟซภาพ", "สลับระหว่างธีม Cosmic Dark หรือ Crisp Light", "ภาษาที่แสดงผลระบบ", "เลือกพจนานุกรมแปลภาษาสำหรับเซสชันที่ใช้งานอยู่", "โมเดล AI เริ่มต้น", "ระบุน้ำหนักโมเดลที่คุณต้องการสำหรับสนามเล่นแชท", "บันทึกการตั้งค่าทั้งหมด", "ซิงโครไนซ์พารามิเตอร์ระบบเรียบร้อยแล้ว",
    "จำนวนการสอบถามรายเดือน", "โทเค็นที่สร้างขึ้น", "หัวข้อโปรด", "ระดับการสมัครสมาชิก", "การวัดข้อมูลปกติดี ความล่าช้าคือ 42ms", "สถิติการใช้งานต่อเนื่อง: 4 วัน",
    "SCUT Pay", "SCUT Token", "SCUT Credits", "ตลาดออนไลน์", "พอร์ทัลธุรกิจ", "Mica Bucurie", "SCUT สตรีและเด็กหญิง", "ศูนย์สนับสนุน", "ศูนย์ช่วยเหลือ", "บันทึก", "ยกเลิก", "ส่ง", "ค้นหา", "ส่ง", "กำลังโหลด...", "การแจ้งเตือน", "อีเมล", "แผงข้อมูล", "ข้อความระบบ", "ข้อความตรวจสอบ", "หน้ากฎหมาย"
  ],
  vi: [
    "Chào mừng đến với SCUT AI", "Sân chơi thử nghiệm", "Bảng điều khiển", "Hồ sơ người dùng", "Đăng ký", "Khóa API", "Tài liệu hướng dẫn", "Hỗ trợ SLA", "Cài đặt hệ thống", "Đăng nhập", "Đăng ký tài khoản", "Đăng xuất", "Tính năng", "Bảng giá", "Câu hỏi thường gặp", "Blog kỹ thuật", "Chính sách bảo mật", "Điều khoản dịch vụ",
    "Không gian làm việc AI thế hệ mới được hỗ trợ bởi Gemini 3.5", "Truy cập các công cụ suy luận hiệu suất cao với tính năng phát trực tiếp và đo lường từ xa.", "Bắt đầu phiên miễn phí", "Đọc tài liệu hướng dẫn",
    "Bảng điều khiển & Cài đặt hệ thống", "Cấu hình các tham số toàn cầu, phong cách giao diện và ngôn ngữ hệ thống.", "Chủ đề giao diện trực quan", "Chuyển đổi giữa chủ đề Cosmic Dark hoặc Crisp Light.", "Ngôn ngữ hiển thị hệ thống", "Chọn từ điển dịch thuật cho phiên hoạt động.", "Mô hình AI mặc định", "Chỉ định mô hình yêu thích cho không gian trò chuyện.", "Lưu toàn bộ cài đặt", "Các tham số hệ thống đã được đồng bộ hóa thành công.",
    "Truy vấn đã dùng trong tháng", "Số lượng Token đã tạo", "Cuộc trò chuyện yêu thích", "Cấp độ đăng ký", "Trạng thái đo lường từ xa hoàn hảo. Độ trễ là 42ms.", "Số ngày hoạt động liên tục: 4 ngày",
    "SCUT Pay", "SCUT Token", "Điểm thưởng SCUT", "Chợ ứng dụng", "Cổng doanh nghiệp", "Mica Bucurie", "SCUT Phụ nữ & Trẻ em gái", "Trung tâm hỗ trợ", "Trung tâm trợ giúp", "Lưu cài đặt", "Hủy bỏ", "Gửi đi", "Tìm kiếm", "Gửi", "Đang tải...", "Thông báo", "Thư điện tử", "Bảng quản trị", "Thông báo hệ thống", "Thông báo xác thực", "Trang pháp lý"
  ],
  id: [
    "Selamat datang di SCUT AI", "Taman bermain", "Dasbor", "Profil Pengguna", "Langganan", "Kunci API", "Dokumentasi", "Dukungan SLA", "Pengaturan", "Masuk", "Daftar", "Keluar", "Fitur", "Harga", "FAQ", "Blog", "Privasi", "Ketentuan",
    "Ruang Kerja AI Generasi Seterusnya Didukung oleh Gemini 3.5", "Akses mesin penalaran berkinerja tinggi dengan transmisi real-time.", "Mulai Sesi Gratis", "Baca Dokumentasi",
    "Konsol Kontrol & Pengaturan", "Konfigurasikan parameter global, gaya antarmuka, dan bahasa sistem.", "Tema Antarmuka Visual", "Beralih antara tema Cosmic Dark atau Crisp Light.", "Bahasa Tampilan Sistem", "Pilih kamus terjemahan lokal untuk sesi aktif Anda.", "Model AI Default", "Tentukan model default untuk sesi interaktif.", "Simpan Pengaturan", "Parameter sistem berhasil disinkronisasi.",
    "Kueri Bulanan Digunakan", "Token yang Dihasilkan", "Utas Favorit", "Tingkat Berlangganan", "Telemetri sangat baik. Latensi adalah 42ms.", "Sesi aktif berturut-turut: 4 Hari",
    "SCUT Pay", "SCUT Token", "Kredit SCUT", "Pasar", "Portal Bisnis", "Mica Bucurie", "SCUT Perempuan & Anak Perempuan", "Pusat Dukungan", "Pusat Bantuan", "Simpan", "Batal", "Kirim", "Cari", "Kirim", "Memuat...", "Notifikasi", "Email", "Dasbor", "Pesan Sistem", "Pesan Validasi", "Halaman Hukum"
  ],
  ms: [
    "Selamat datang ke SCUT AI", "Kawasan uji", "Papan pemuka", "Profil Pengguna", "Langganan", "Kunci API", "Dokumentasi", "Sokongan SLA", "Tetapan", "Log Masuk", "Daftar", "Log Keluar", "Ciri-ciri", "Harga", "FAQ", "Blog", "Privasi", "Syarat",
    "Ruang Kerja AI Generasi Seterusnya Dikuasakan oleh Gemini 3.5", "Akses enjin pemikiran berprestasi tinggi dengan penstriman masa nyata.", "Mulakan Sesi Percuma", "Baca Dokumentasi",
    "Konsol Kawalan & Tetapan", "Konfigurasikan parameter global, gaya antarmuka dan bahasa sistem.", "Tema Antarmuka Visual", "Tukar antara tema Cosmic Dark atau Crisp Light.", "Bahasa Paparan Sistem", "Pilih kamus terjemahan tempatan untuk sesi anda.", "Model AI Lalai", "Tentukan model lalai untuk sembang aktif.", "Simpan Tetapan", "Parameter sistem berjaya disinkronkan.",
    "Pertanyaan Bulanan Digunakan", "Token yang Dijana", "Utas Kegemaran", "Tahap Langganan", "Telemetri sangat baik. Latensi adalah 42ms.", "Sesi berturut-turut aktif: 4 Hari",
    "SCUT Pay", "SCUT Token", "Kredit SCUT", "Pasar", "Portal Perniagaan", "Mica Bucurie", "SCUT Wanita & Gadis", "Pusat Sokongan", "Pusat Bantuan", "Simpan", "Batal", "Hantar", "Cari", "Hantar", "Memuatkan...", "Notifikasi", "E-mel", "Papan Pemuka", "Mesej Sistem", "Mesej Pengesahan", "Halaman Undang-undang"
  ]
};

// Compile dynamic record at module loading time
export const translations: Record<Language, Translations> = {} as any;

Object.keys(values).forEach((langKey) => {
  const lang = langKey as Language;
  const list = values[lang];
  const item: any = {};
  keys.forEach((key, index) => {
    item[key] = list[index] || values.en[index] || key;
  });
  translations[lang] = item as Translations;
});

// Helper for dynamic language configuration list
export interface LanguageConfig {
  code: Language;
  name: string;
  flag: string;
}

export const LANGUAGES_CONFIG: LanguageConfig[] = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' }
];

/**
 * Automatically detects the user's browser language on first visit.
 * Returns the matched Language code, or 'en' as default.
 */
export function detectUserLanguage(): Language {
  if (typeof window === 'undefined' || !navigator) return 'en';
  
  // Try to read browser languages list or navigator.language
  const primaryLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase().split('-')[0];
  
  const isSupported = LANGUAGES_CONFIG.some(cfg => cfg.code === primaryLang);
  if (isSupported) {
    return primaryLang as Language;
  }
  
  // Try checking alternate languages list in preferences
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      const code = lang.toLowerCase().split('-')[0];
      if (LANGUAGES_CONFIG.some(cfg => cfg.code === code)) {
        return code as Language;
      }
    }
  }
  
  return 'en';
}

/**
 * Dynamic translator helper that falls back to dictionary, phrase map, or fallback text.
 */
export const PHRASE_DICTIONARY: Record<string, Record<string, string>> = {
  ro: {
    'scutwater': 'SCUT Apă 🌊',
    'SCUT Water 🌊': 'SCUT Apă 🌊',
    'marketplace': 'Piață SCUT 🛍️',
    'Marketplace': 'Piață SCUT 🛍️',
    'scut_pay': 'SCUT Pay 💳',
    'SCUT Pay': 'SCUT Pay 💳',
    'scut_token': 'Token SCUT 🪙',
    'SCUT Token': 'Token SCUT 🪙',
    'scut_credits': 'Credite SCUT ⚡',
    'SCUT Credits': 'Credite SCUT ⚡',
    'business': 'Portal Afaceri 💼',
    'Business Portal': 'Portal Afaceri 💼',
    'mica_bucurie': 'Mica Bucurie 🎁',
    'Mica Bucurie': 'Mica Bucurie 🎁',
    'scutwomen': 'Femei & Fete SCUT 🌸',
    'SCUT Women & Girls': 'Femei & Fete SCUT 🌸',
    'scutmen': 'Bărbați & Băieți SCUT 🛡️',
    'SCUT Men & Boys': 'Bărbați & Băieți SCUT 🛡️',
    'checkout': 'Finalizare Comandă',
    'Checkout': 'Finalizare Comandă',
    'cart': 'Coș de Cumpărături',
    'Cart': 'Coș de Cumpărături',
    'Shopping Cart': 'Coș de Cumpărături',
    'add_to_cart': 'Adaugă în Coș',
    'Add to Cart': 'Adaugă în Coș',
    'buy_now': 'Cumpără Acum',
    'Buy Now': 'Cumpără Acum',
    'pending': 'În Așteptare',
    'Pending': 'În Așteptare',
    'preparing': 'În Pregătire',
    'Preparing': 'În Pregătire',
    'shipped': 'Expediat',
    'Shipped': 'Expediat',
    'delivered': 'Livrat',
    'Delivered': 'Livrat',
    'cancelled': 'Anulat',
    'Cancelled': 'Anulat',
    'accepted': 'Acceptat',
    'Accepted': 'Acceptat',
    'rejected': 'Respins',
    'Rejected': 'Respins',
    'shipping_address': 'Adresă de Livrare',
    'Shipping Address': 'Adresă de Livrare',
    'full_name': 'Nume și Prenume',
    'Full Name': 'Nume și Prenume',
    'street_address': 'Adresă (Stradă și Număr)',
    'Street Address': 'Adresă (Stradă și Număr)',
    'city': 'Oraș',
    'City': 'Oraș',
    'state': 'Județ / Regiune',
    'State / Region': 'Județ / Regiune',
    'postal_code': 'Cod Poștal',
    'Postal Code / Zip': 'Cod Poștal',
    'country': 'Țară',
    'Country': 'Țară',
    'phone': 'Număr de Telefon',
    'Phone Number': 'Număr de Telefon',
    'email': 'Adresă de Email',
    'Email Address': 'Adresă de Email',
    'payment_method': 'Metodă de Plată',
    'Payment Method': 'Metodă de Plată',
    'order_history': 'Istoric Comenzi',
    'Order History': 'Istoric Comenzi',
    'seller_dashboard': 'Panou Vânzător',
    'Seller Dashboard': 'Panou Vânzător',
    'buyer_dashboard': 'Panou Cumpărător',
    'Buyer Dashboard': 'Panou Cumpărător',
    'invoice': 'Factură Fiscală',
    'Invoice': 'Factură Fiscală',
    'receipt': 'Chitanță de Plată',
    'Receipt': 'Chitanță de Plată',
    'notifications': 'Notificări',
    'Notifications': 'Notificări',
    'subtotal': 'Subtotal',
    'Subtotal': 'Subtotal',
    'shipping': 'Cost Livrare',
    'Shipping': 'Cost Livrare',
    'taxes': 'Taxe & TVA',
    'Taxes': 'Taxe & TVA',
    'total': 'Total de Plată',
    'Total': 'Total de Plată',
    'accept_order': 'Acceptă Comanda',
    'Accept Order': 'Acceptă Comanda',
    'reject_order': 'Respinge Comanda',
    'Reject Order': 'Respinge Comanda',
    'mark_shipped': 'Marchează Expediată',
    'Mark as Shipped': 'Marchează Expediată',
    'mark_delivered': 'Marchează Livrată',
    'Mark as Delivered': 'Marchează Livrată',
    'about': 'Despre Noi',
    'About': 'Despre Noi',
    'contact': 'Contact & Suport',
    'Contact': 'Contact & Suport',
    'admin': 'Administrare System',
    'Admin': 'Administrare System',
    'settings': 'Setări Sistem',
    'Settings': 'Setări Sistem',
    'search': 'Căutare',
    'Search': 'Căutare',
    'save': 'Salvează',
    'Save': 'Salvează',
    'cancel': 'Anulează',
    'Cancel': 'Anulează',
    'Start Chatting Free': 'Începe Chat Gratuit',
    'Explore Capabilities': 'Explorează Capabilitățile',
    'SCUT Platform Presentation Video': 'Video Prezentare Platformă SCUT',
    'Welcome to SCUT AI Ecosystem — Official Introduction': 'Bun venit în Ecosistemul SCUT AI — Introducere Oficială',
    'Get Started Now': 'Începe Acum',
    'View Plans & Pricing': 'Vezi Planuri & Tarife',
    'Play Embedded Presentation': 'Redă Prezentarea Încorporată',
    'Moderation': 'Moderare',
    'Close': 'Închide',
    'SCUT Video Media Center': 'Centru Media Video SCUT',
    'Explore Video Tutorials & Presentations': 'Explorează Tutoriale Video & Prezentări',
    'videos found': 'videoclipuri găsite',
    'Căutați videoclipuri după titlu, categorie, autor sau cuvinte-cheie...': 'Căutați videoclipuri după titlu, categorie, autor sau cuvinte-cheie...',
    'Șterge căutarea': 'Șterge căutarea',
    'Filtre': 'Filtre',
    'Toate': 'Toate',
    'Tutoriale': 'Tutoriale',
    'Noutăți': 'Noutăți',
    'Comunitate': 'Comunitate',
    'Ghiduri': 'Ghiduri',
    'Toate Videoclipurile': 'Toate Videoclipurile',
    'Resetează căutarea și filtrele': 'Resetează căutarea și filtrele',
    'Niciun videoclip nu se potrivește căutării': 'Niciun videoclip nu se potrivește căutării',
    'Încearcă alt cuvânt-cheie sau resetează categoria selectată.': 'Încearcă alt cuvânt-cheie sau resetează categoria selectată.',
    'Arată toate videoclipurile': 'Arată toate videoclipurile'
  },
  es: {
    'scutwater': 'SCUT Agua 🌊',
    'SCUT Water 🌊': 'SCUT Agua 🌊',
    'marketplace': 'Mercado SCUT 🛍️',
    'Marketplace': 'Mercado SCUT 🛍️',
    'checkout': 'Finalizar Compra',
    'Checkout': 'Finalizar Compra',
    'cart': 'Carrito de Compras',
    'Cart': 'Carrito de Compras',
    'add_to_cart': 'Añadir al Carrito',
    'buy_now': 'Comprar Ahora',
    'pending': 'Pendiente',
    'preparing': 'En Preparación',
    'shipped': 'Enviado',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado',
    'accepted': 'Aceptado',
    'rejected': 'Rechazado',
    'shipping_address': 'Dirección de Envío',
    'full_name': 'Nombre Completo',
    'city': 'Ciudad',
    'country': 'País',
    'postal_code': 'Código Postal',
    'phone': 'Teléfono',
    'payment_method': 'Método de Pago',
    'invoice': 'Factura',
    'Order History': 'Historial de Pedidos',
    'Seller Dashboard': 'Panel del Vendedor',
    'Start Chatting Free': 'Iniciar Chat Gratis',
    'Explore Capabilities': 'Explorar Funciones',
    'SCUT Platform Presentation Video': 'Video de Presentación de SCUT',
    'Welcome to SCUT AI Ecosystem — Official Introduction': 'Bienvenido al Ecosistema SCUT AI — Introducción Oficial',
    'Get Started Now': 'Empezar Ahora',
    'View Plans & Pricing': 'Ver Planes y Precios',
    'Play Embedded Presentation': 'Reproducir Presentación Integrada',
    'Moderation': 'Moderación',
    'Close': 'Cerrar',
    'Cancel': 'Cancelar'
  },
  fr: {
    'scutwater': 'SCUT Eau 🌊',
    'SCUT Water 🌊': 'SCUT Eau 🌊',
    'marketplace': 'Marché SCUT 🛍️',
    'Marketplace': 'Marché SCUT 🛍️',
    'checkout': 'Paiement Sécurisé',
    'Checkout': 'Paiement Sécurisé',
    'cart': 'Panier d\'Achat',
    'Cart': 'Panier d\'Achat',
    'add_to_cart': 'Ajouter au Panier',
    'buy_now': 'Acheter Maintenant',
    'pending': 'En Attente',
    'preparing': 'En Préparation',
    'shipped': 'Expédié',
    'delivered': 'Livré',
    'cancelled': 'Annulé',
    'accepted': 'Accepté',
    'rejected': 'Rejeté',
    'shipping_address': 'Adresse de Livraison',
    'full_name': 'Nom Complet',
    'city': 'Ville',
    'country': 'Pays',
    'postal_code': 'Code Postal',
    'phone': 'Téléphone',
    'payment_method': 'Moyen de Paiement',
    'invoice': 'Facture',
    'Order History': 'Historique des Commandes',
    'Seller Dashboard': 'Tableau de Bord Vendeur',
    'Start Chatting Free': 'Démarrer le Chat Gratuit',
    'Explore Capabilities': 'Explorer les Fonctionnalités',
    'SCUT Platform Presentation Video': 'Vidéo de Présentation SCUT',
    'Welcome to SCUT AI Ecosystem — Official Introduction': 'Bienvenue dans l\'Écosystème SCUT AI — Présentation Officielle',
    'Get Started Now': 'Commencer Maintenant',
    'View Plans & Pricing': 'Voir les Plans et Tarifs',
    'Play Embedded Presentation': 'Lire la Présentation Intégrée',
    'Moderation': 'Modération',
    'Close': 'Fermer',
    'Cancel': 'Annuler'
  },
  de: {
    'scutwater': 'SCUT Wasser 🌊',
    'SCUT Water 🌊': 'SCUT Wasser 🌊',
    'SCUT Water Network 🌊': 'SCUT Wasser-Netzwerk 🌊',
    'marketplace': 'SCUT Marktplatz 🛍️',
    'Marketplace': 'SCUT Marktplatz 🛍️',
    'checkout': 'Zur Kasse',
    'Checkout': 'Zur Kasse',
    'cart': 'Warenkorb',
    'Cart': 'Warenkorb',
    'add_to_cart': 'In den Warenkorb',
    'buy_now': 'Jetzt Kaufen',
    'pending': 'Ausstehend',
    'preparing': 'In Vorbereitung',
    'shipped': 'Versendet',
    'delivered': 'Zugestellt',
    'cancelled': 'Storniert',
    'accepted': 'Akzeptiert',
    'rejected': 'Abgelehnt',
    'shipping_address': 'Lieferadresse',
    'full_name': 'Vollständiger Name',
    'city': 'Stadt',
    'country': 'Land',
    'postal_code': 'Postleitzahl',
    'phone': 'Telefonnummer',
    'payment_method': 'Zahlungsmethode',
    'invoice': 'Rechnung',
    'Order History': 'Bestellhistorie',
    'Seller Dashboard': 'Verkäufer-Dashboard',
    'Start Chatting Free': 'Kostenlos Chat Starten',
    'Explore Capabilities': 'Funktionen Erkunden',
    'SCUT Platform Presentation Video': 'SCUT Plattform Präsentationsvideo',
    'Welcome to SCUT AI Ecosystem — Official Introduction': 'Willkommen im SCUT AI Ökosystem — Offizielle Einführung',
    'Discover how SCUT AI, SCUT Water, Marketplace, and Decentralized Services seamlessly interact in a unified web platform.': 'Entdecken Sie, wie SCUT AI, SCUT Wasser, Marktplatz und dezentrale Dienste nahtlos in einer einheitlichen Webplattform interagieren.',
    'Unified Gemini-Powered Intelligence Workspace': 'Einheitlicher Gemini-gestützter KI-Arbeitsbereich',
    'Intelligence Amplified.': 'Intelligenz Verstärkt.',
    'Meet': 'Treffen Sie',
    'A cohesive production-ready portal. Manage secure bearer API keys, run custom sandbox requests, utilize persistent multi-device chat histories, and navigate our multi-module ecosystem.': 'Ein zusammenhängendes, produktionsbereites Portal. Verwalten Sie sichere Bearer-API-Schlüssel, führen Sie benutzerdefinierte Sandbox-Anfragen aus und navigieren Sie durch unser Mehrmodul-Ökosystem.',
    'Engineered for Precision Workflows': 'Entwickelt für Präzisions-Workflows',
    'SCUT AI matches clean, accessible interface design with Google Gemini API models to provide a stable, responsive developer-focused workspace.': 'SCUT AI kombiniert sauberes, zugängliches Schnittstellendesign mit Google Gemini API-Modellen für einen stabilen Entwickler-Arbeitsbereich.',
    'Ready to unleash elite intelligence?': 'Bereit, Elite-Intelligenz freizusetzen?',
    'Create an account in seconds. Access free premium chats, run system prompt mockups, and inspect comprehensive usage panels.': 'Erstellen Sie in Sekundenschnelle ein Konto. Greifen Sie auf kostenlose Premium-Chats zu und prüfen Sie Nutzungs-Panels.',
    'Get Started Now': 'Jetzt Loslegen',
    'View Plans & Pricing': 'Pläne & Preise Anzeigen',
    'Core AI Engine': 'Kern-KI-Engine',
    'Interactive Dev Sandbox': 'Interaktive Entwickler-Sandbox',
    'Durable Cloud Storage': 'Langlebiger Cloud-Speicher',
    'Ecosystem Portals': 'Ökosystem-Portale',
    'High-fidelity, multimodally capable model weights.': 'Hochpräzise, multimodal fähige Modellgewichte.',
    'Mint credentials and run real JSON payloads in real time.': 'Generieren Sie Zugangsdaten und führen Sie reale JSON-Anfragen in Echtzeit aus.',
    'Securely persists session data, history, and preferences.': 'Sichert Sitzungsdaten, Verlauf und Einstellungen dauerhaft.',
    'Deeply unified tools spanning business, chat, and community.': 'Tief integrierte Tools für Business, Chat und Community.',
    'Intelligent Conversational Workspace': 'Intelligenter Konversations-Arbeitsbereich',
    'An intuitive interface optimized for high-consequence reasoning, rapid research, and creative generation with robust contextual understanding.': 'Eine intuitive Benutzeroberfläche, optimiert für Hochleistungs-Schlussfolgerung, schnelle Recherche und kreative Generierung.',
    'Multimodal Visual Analysis': 'Multimodale Visuelle Analyse',
    'Seamlessly upload images, schemas, and documents. SCUT AI breaks down visual representations to explain logic and output relevant solutions.': 'Laden Sie Bilder, Schemata und Dokumente nahtlos hoch. SCUT AI analysiert visuelle Darstellungen.',
    'Developer Sandbox & Credentials': 'Entwickler-Sandbox & Anmeldeinformationen',
    'Generate custom bearer keys, test queries within our live API Sandbox Playground, and integrate Gemini routing securely.': 'Generieren Sie benutzerdefinierte Bearer-Schlüssel und testen Sie Abfragen in der Live-API-Sandbox.',
    'Video Stream Offline or Unsupported': 'Videostream Offline oder nicht unterstützt',
    'Direct MP4 stream couldn\'t be loaded on this network/browser. Switch to standard embedded video player.': 'Direkter MP4-Stream konnte nicht geladen werden. Wechseln Sie zum eingebetteten Videoplayer.',
    'Play Embedded Presentation': 'Eingebettete Präsentation Abspielen',
    'AI Video Moderation & Report': 'KI-Videomoderation & Bericht',
    'Moderation': 'Moderation',
    'Copyright Violation / DMCA Notice': 'Urheberrechtsverletzung / DMCA-Meldung',
    'Inappropriate / Harmful Content': 'Unangemessener / Schädlicher Inhalt',
    'Misleading Title / Spam': 'Irreführender Titel / Spam',
    'Playback or Broken Video Link': 'Wiedergabe- oder defekter Videolink',
    'Select reason...': 'Grund auswählen...',
    'Submit Report': 'Bericht Einreichen',
    'Close': 'Schließen',
    'Cancel': 'Abbrechen',
    'SCUT Video Node': 'SCUT Video-Knoten'
  },
  it: {
    'scutwater': 'SCUT Acqua 🌊',
    'SCUT Water 🌊': 'SCUT Acqua 🌊',
    'marketplace': 'Mercato SCUT 🛍️',
    'Marketplace': 'Mercato SCUT 🛍️',
    'checkout': 'Cassa',
    'Checkout': 'Cassa',
    'cart': 'Carrello',
    'Cart': 'Carrello',
    'add_to_cart': 'Aggiungi al Carrello',
    'pending': 'In Attesa',
    'preparing': 'In Preparazione',
    'shipped': 'Spedito',
    'delivered': 'Consegnato',
    'shipping_address': 'Indirizzo di Spedizione',
    'invoice': 'Fattura'
  },
  pt: {
    'scutwater': 'SCUT Água 🌊',
    'SCUT Water 🌊': 'SCUT Água 🌊',
    'marketplace': 'Mercado SCUT 🛍️',
    'Marketplace': 'Mercado SCUT 🛍️',
    'checkout': 'Finalizar Compra',
    'Checkout': 'Finalizar Compra',
    'cart': 'Carrinho de Compras',
    'Cart': 'Carrinho de Compras',
    'add_to_cart': 'Adicionar ao Carrinho',
    'pending': 'Pendente',
    'shipped': 'Enviado',
    'delivered': 'Entregue',
    'shipping_address': 'Endereço de Envio',
    'invoice': 'Fatura'
  },
  zh: {
    'scutwater': 'SCUT 优质饮用水 🌊',
    'SCUT Water 🌊': 'SCUT 优质饮用水 🌊',
    'marketplace': 'SCUT 应用与服务市场 🛍️',
    'Marketplace': 'SCUT 应用与服务市场 🛍️',
    'checkout': '安全结账',
    'Checkout': '安全结账',
    'cart': '购物车',
    'Cart': '购物车',
    'add_to_cart': '加入购物车',
    'pending': '待处理',
    'preparing': '准备中',
    'shipped': '已发货',
    'delivered': '已送达',
    'shipping_address': '收货地址',
    'invoice': '电子发票'
  }
};

// Pre-computed sorted key cache for instant ultra-fast phrase lookup without CPU blocking
const PRE_SORTED_KEYS_CACHE: Record<string, string[]> = {};

function getSortedKeys(lang: string): string[] {
  if (!PRE_SORTED_KEYS_CACHE[lang]) {
    const phrases = PHRASE_DICTIONARY[lang] || PHRASE_DICTIONARY['en'] || PHRASE_DICTIONARY['ro'];
    if (phrases) {
      PRE_SORTED_KEYS_CACHE[lang] = Object.keys(phrases).sort((a, b) => b.length - a.length);
    } else {
      PRE_SORTED_KEYS_CACHE[lang] = [];
    }
  }
  return PRE_SORTED_KEYS_CACHE[lang];
}

// Memoized phrase result cache to prevent repeated regex/string operations on identical strings
const DYNAMIC_TRANSLATION_MEMO: Record<string, Record<string, string>> = {};

export function t(lang: Language, key: keyof Translations | string, defaultVal?: string): string {
  const targetLang = lang || 'en';
  const dictionary = translations[targetLang] || translations.en;
  
  if (key in dictionary) {
    return (dictionary as any)[key];
  }

  const textToLookup = defaultVal || String(key);

  // Check Phrase Dictionary for exact match first (O(1) fast path)
  if (PHRASE_DICTIONARY[targetLang]) {
    if (PHRASE_DICTIONARY[targetLang][String(key)]) {
      return PHRASE_DICTIONARY[targetLang][String(key)];
    }
    if (PHRASE_DICTIONARY[targetLang][textToLookup]) {
      return PHRASE_DICTIONARY[targetLang][textToLookup];
    }
  }

  // Fallback to English dictionary if key is defined there and target is 'en'
  if ((targetLang as string) === 'en') {
    const enDict = translations.en;
    if (key in enDict) {
      return (enDict as any)[key];
    }
    return textToLookup;
  }

  // Check memoized cache for dynamic translations
  if (!DYNAMIC_TRANSLATION_MEMO[targetLang]) {
    DYNAMIC_TRANSLATION_MEMO[targetLang] = {};
  }
  if (DYNAMIC_TRANSLATION_MEMO[targetLang][textToLookup]) {
    return DYNAMIC_TRANSLATION_MEMO[targetLang][textToLookup];
  }

  // For non-English languages, perform phrase substitution using pre-sorted keys
  if ((targetLang as string) !== 'en' && textToLookup) {
    let result = textToLookup;
    const phrases = PHRASE_DICTIONARY[targetLang] || PHRASE_DICTIONARY['en'] || PHRASE_DICTIONARY['ro'];
    if (phrases) {
      const keysSorted = getSortedKeys(targetLang);
      for (const phraseKey of keysSorted) {
        if (result.includes(phraseKey)) {
          result = result.replaceAll(phraseKey, phrases[phraseKey]);
        }
      }
    }
    DYNAMIC_TRANSLATION_MEMO[targetLang][textToLookup] = result;
    return result;
  }

  return textToLookup;
}

export const tDynamic = t;

