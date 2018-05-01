'use strict';

const oohttp = require('oohttp');

class Prometheus {
  constructor({ url }) {
    this.url = url;
    this.http = new oohttp.Base(url);
    this.http.rejectUnauthorized = false;
  }

  async getActiveAlertManagers() {
    const json = await this.http.request('GET', '/prometheus/api/v1/alertmanagers').toJson();

    return json.data.activeAlertmanagers.map(activeAlertManager =>
      new AlertManager({ url: activeAlertManager.url.replace('/alertmanager/api/v1/alerts', '')})
    );
  }

  async query(query) {
    const json = await this.http.request('GET', `/prometheus/api/v1/query?query=${encodeURIComponent(query)}`).toJson();
    return json.data.result.map(metric => new Metric(metric));
  }
}

class AlertManager {
  constructor({ url }) {
    this.http = new oohttp.Base(url);
    this.http.rejectUnauthorized = false;
  }

  async getAlerts() {
    const json = await this.http.request('GET', '/alertmanager/api/v1/alerts').toJson();
    return json.data.map(alert => new Alert(alert));
  }
}

class Alert {
  constructor(obj) {
    Object.assign(this, obj);

    if (typeof this.startsAt === 'string') {
      this.startsAt = new Date(this.startsAt);
    }

    if (typeof this.endsAt === 'string') {
      this.endsAt = new Date(this.endsAt);
    }
  }
}

class Metric {
  constructor(obj) {
    Object.assign(this, obj);
  }
}

module.exports = { Prometheus, AlertManager };
