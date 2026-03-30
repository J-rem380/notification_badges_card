class NotificationBadgesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  setConfig(config) {
    this._config = {
      notifications: [],
      badge_height: "36px",
      font_size: "0.85em",
      ...config,
    };

    if (
      this._config.notifications !== undefined &&
      !Array.isArray(this._config.notifications)
    ) {
      throw new Error("'notifications' doit etre une liste (array)");
    }

    if (this._hass) this._render();
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: 1,
      min_columns: 3,
      min_rows: 1,
    };
  }

  getCardSize() {
    return 1;
  }

  _isTruthy(val) {
    return val === true || val === "true" || val === 1 || val === "1";
  }

_resolveMessage(n) {
  const stateObj = this._hass.states[n.entity];
  const fallback = stateObj?.attributes?.friendly_name ?? n.entity;
  let msg = n.message ?? fallback;

  const stateValue = stateObj?.attributes?.unit_of_measurement
    ? `${stateObj.state} ${stateObj.attributes.unit_of_measurement}`
    : stateObj?.state ?? "";

  // {{state}}
  msg = msg.replaceAll("{{state}}", stateValue);

  // {{attr:xxx}}
  msg = msg.replace(/{{attr:([^}]+)}}/g, (_, attr) => {
    return stateObj?.attributes?.[attr.trim()] ?? "";
  });

  // ✅ NOUVEAU : {{sensor.xxx}} ou toute entité HA
  msg = msg.replace(/{{([^}]+)}}/g, (_, entityId) => {
    entityId = entityId.trim();

    if (entityId.includes(".")) {
      const extState = this._hass.states[entityId];
      if (!extState) return "";

      return extState.attributes?.unit_of_measurement
        ? `${extState.state} ${extState.attributes.unit_of_measurement}`
        : extState.state;
    }

    return "";
  });

  return msg;
}

  _getDismissAction(n) {
    if (n.dismiss_service) {
      const parts = n.dismiss_service.split(".");
      return {
        domain: parts[0],
        service: parts.slice(1).join("."),
        data: n.dismiss_data ?? { entity_id: n.entity },
      };
    }

    const domain = n.entity.split(".")[0];

    switch (domain) {
      case "input_boolean":
        return {
          domain: "input_boolean",
          service: "turn_off",
          data: { entity_id: n.entity },
        };

      case "persistent_notification":
        return {
          domain: "persistent_notification",
          service: "dismiss",
          data: {
            notification_id: n.entity.split(".").slice(1).join("."),
          },
        };

      default:
        return null;
    }
  }

  _isReadonly(n) {
    if (this._isTruthy(n.readonly)) return true;

    const domain = n.entity.split(".")[0];

    if (domain === "binary_sensor" && !n.dismiss_service) return true;
    if (!this._getDismissAction(n)) return true;

    return false;
  }

  _dismiss(n) {
    if (!this._hass) return;
    if (this._isReadonly(n)) return;

    const action = this._getDismissAction(n);
    if (!action) return;

    this._hass.callService(action.domain, action.service, action.data);
  }

  _isActive(n) {
    if (!n?.entity) return false;

    const stateObj = this._hass.states[n.entity];
    if (!stateObj) return false;

    const domain = n.entity.split(".")[0];
    const defaultTrigger =
      domain === "persistent_notification" ? "active" : "on";
    const triggerState = n.trigger_state ?? defaultTrigger;

    return stateObj.state === triggerState;
  }

  _render() {
    if (!this._config || !this._hass) return;

    const badgeHeight = this._config.badge_height ?? "36px";
    const fontSize = this._config.font_size ?? "0.85em";

    const active = (this._config.notifications ?? []).filter((n) =>
      this._isActive(n)
    );

    if (active.length === 0) {
      this.shadowRoot.innerHTML = "";
      this.style.display = "none";
      return;
    }

    this.style.display = "block";

    const badgesHTML = active
      .map((n) => {
        const color = n.color ?? "#e74c3c";
        const textColor = n.text_color ?? "#ffffff";
        const message = this._resolveMessage(n);
        const icon = n.icon ?? null;
        const isReadonly = this._isReadonly(n);

        const closeBtn = isReadonly
          ? `<span class="lock" title="Lecture seule">&#x1F512;</span>`
          : `<span class="close" aria-label="Fermer">&#x2715;</span>`;

        return `
          <div
            class="badge${isReadonly ? " is-readonly" : ""}"
            data-entity="${n.entity}"
            style="background:${color};color:${textColor};height:${badgeHeight};"
          >
            ${
              icon
                ? `<ha-icon icon="${icon}" style="--mdc-icon-size:16px;color:${textColor};flex-shrink:0;"></ha-icon>`
                : ""
            }
            <span class="label">${message}</span>
            ${closeBtn}
          </div>
        `;
      })
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }

        .container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          align-items: center;
          padding: 8px;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          border-radius: 999px;
          font-size: ${fontSize};
          font-weight: 600;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: opacity 0.15s, transform 0.15s;
          user-select: none;
          white-space: nowrap;
          cursor: default;
        }

        .badge:not(.is-readonly) {
          cursor: pointer;
        }

        .badge:not(.is-readonly):hover {
          opacity: 0.85;
          transform: scale(1.03);
        }

        .badge:not(.is-readonly):active {
          opacity: 0.6;
          transform: scale(0.97);
        }

        .label {
          flex: 1;
        }

        .close {
          font-size: 0.8em;
          opacity: 0.75;
          margin-left: 2px;
        }

        .lock {
          font-size: 0.75em;
          opacity: 0.55;
          margin-left: 2px;
        }
      </style>

      <div class="container">${badgesHTML}</div>
    `;

    this.shadowRoot
      .querySelectorAll(".badge:not(.is-readonly)")
      .forEach((el) => {
        const notif = active.find((n) => n.entity === el.dataset.entity);
        if (notif) {
          el.addEventListener("click", () => {
            if (!this._isReadonly(notif)) {
              this._dismiss(notif);
            }
          });
        }
      });
  }

  static getStubConfig() {
    return {
      notifications: [
        {
          entity: "input_boolean.example",
          message: "Exemple — etat : {{state}}",
          color: "#e74c3c",
          icon: "mdi:alert",
        },
      ],
    };
  }
}

customElements.define("notification-badges-card", NotificationBadgesCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "notification-badges-card",
  name: "Notification Badges Card",
  description:
    "Badges de notification multi-domaines avec dismiss adapte, templates de message et readonly fiable.",
});
