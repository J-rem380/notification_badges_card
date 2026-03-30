# Notification Badges Card (Home Assistant)

Carte personnalisée pour Home Assistant permettant d’afficher des **badges de notification dynamiques**, multi-domaines, avec gestion du dismiss, templating et mode lecture seule.

---

## Fonctionnalités

- Affichage de notifications sous forme de badges
- Personnalisation (couleurs, icônes, taille)
- Dismiss des notifications par clic
- Mode `readonly` pour désactiver le dismiss par clic
- ⚡ Support multi-domaines :
  - `input_boolean`
  - `persistent_notification`
  - `binary_sensor`

---

## 📦 Installation

### Via HACS (recommandé)
1. Ajouter ce dépôt comme dépôt personnalisé
2. Installer la carte
3. Ajouter la ressource dans Lovelace si nécessaire

### Manuelle
1. Copier `notification-badges-card.js` dans : /config/www/
2. Ajouter dans les ressources Lovelace : 
url: /local/notification-badges-card.js
type: module JavaScript

---

## ⚙️ Configuration

### Exemple basique

```yaml
type: custom:notification-badges-card
layout_options:
  grid_columns: 9
  grid_rows: 1
badge_height: "36px"
font_size: "0.85em"
notifications:
  - entity: input_boolean.notif_machine
    message: "🧺 Machine terminée — {{state}}"
    color: "#e67e22"
    icon: mdi:washing-machine
    readonly: true

  - entity: persistent_notification.backup_failed
    message: "💾 Sauvegarde en erreur"
    color: "#8e44ad"
    icon: mdi:backup-restore

  - entity: binary_sensor.porte_garage
    message: "🚪 Garage : {{state}}"
    color: "#c0392b"
    icon: mdi:garage-open

  - entity: sensor.temp_salon
    trigger_state: "25"
    message: "🌡️ Salon : {{state}}"
    color: "#2980b9"
    icon: mdi:thermometer
    dismiss_service: script.clear_temp_alert
    dismiss_data:
      entity_id: input_boolean.temp_alert_visible
```

---

## 🧩 Options

| Option          | Type   | Défaut   | Description        |
| --------------- | ------ | -------- | ------------------ |
| `notifications` | array  | `[]`     | Liste des badges   |
| `badge_height`  | string | `36px`   | Hauteur des badges |
| `font_size`     | string | `0.85em` | Taille du texte    |

---

## 🔔 Configuration des notifications

Chaque objet dans `notifications` supporte :

| Clé               | Description                      |
| ----------------- | -------------------------------- |
| `entity`          | Entité principale                |
| `message`         | Texte affiché (support template) |
| `icon`            | Icône MDI                        |
| `color`           | Couleur du badge                 |
| `text_color`      | Couleur du texte                 |
| `readonly`        | Désactive le clic                |
| `trigger_state`   | État déclencheur (défaut : `on`) |
| `dismiss_service` | Service custom de dismiss        |
| `dismiss_data`    | Données du service               |

---

## 🧠 Templates supportés

### État de l’entité principale

```yaml
message: "État : {{state}}"
```

### Attribut

```yaml
message: "Température : {{attr:temperature}}"
```

### Entité externe

```yaml
message: "Compteur : {{sensor.compteur}}"
```

---

## 🖱️ Comportement au clic

Selon le type d’entité :

| Domaine                   | Action                 |
| ------------------------- | ---------------------- |
| `input_boolean`           | `turn_off`             |
| `persistent_notification` | `dismiss`              |
| autre                     | configurable ou ignoré |

---

## 🔒 Mode lecture seule

Empêche toute interaction :

```yaml
readonly: true
```

---

## 📐 Layout

Compatible avec les dashboards en grille :

```yaml
layout_options:
  grid_columns: 12
  grid_rows: auto
```

---

## 🧪 Exemple complet

```yaml
type: custom:notification-badges-card
badge_height: 38px
font_size: 0.8em

notifications:
  - entity: input_boolean.courrier
    message: Vous avez du courrier
    color: firebrick
    icon: mdi:mailbox

  - entity: input_boolean.poubelle_jaune
    message: Recyclage à sortir
    color: "#e67e22"
    icon: mdi:recycle

  - entity: input_boolean.orage_en_cours
    message: "Orage: {{sensor.blitzortung_lightning_counter}}"
    color: darkolivegreen
    icon: mdi:lightning-bolt
    readonly: true
```

---

## 🚀 Roadmap

* Conditions avancées (AND / OR)
* Animations
* Support des templates Jinja complets
* Actions personnalisées au clic

---

## 🤝 Contribution

Les PR sont bienvenues !
Merci de décrire clairement les changements proposés.

---

## 📄 Licence

MIT

```
```
