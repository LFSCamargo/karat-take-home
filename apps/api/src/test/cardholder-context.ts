const CARDHOLDER_ENV_KEY = 'DEFAULT_CARDHOLDER_ID';

export function setDefaultCardholderId(cardholderId: string) {
  process.env[CARDHOLDER_ENV_KEY] = cardholderId;
}

export function clearDefaultCardholderId() {
  delete process.env[CARDHOLDER_ENV_KEY];
}
