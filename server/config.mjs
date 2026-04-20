export function createServerConfig(env = process.env) {
  const port = Number.parseInt(String(env.TASKSATS_PORT ?? "4175"), 10);
  const paymentAdapterKey =
    String(env.TASKSATS_PAYMENT_ADAPTER ?? "demo-lightning").trim() || "demo-lightning";
  const notifyEmail = String(env.TASKSATS_NOTIFY_EMAIL ?? "").trim();
  const resendApiKey = String(env.RESEND_API_KEY ?? "").trim();
  const publicBaseUrl = String(env.TASKSATS_PUBLIC_BASE_URL ?? "").trim();
  const domainCom = String(env.TASKSATS_DOMAIN_COM ?? "").trim();
  const domainAi = String(env.TASKSATS_DOMAIN_AI ?? "").trim();
  const databaseUrl = String(env.DATABASE_URL ?? "").trim();
  const authSecret = String(env.TASKSATS_AUTH_SECRET ?? "").trim();
  const btcpayServerUrl = String(env.BTCPAY_SERVER_URL ?? "").trim();
  const btcpayApiKey = String(env.BTCPAY_API_KEY ?? "").trim();
  const btcpayStoreId = String(env.BTCPAY_STORE_ID ?? "").trim();
  const btcpayWebhookSecret = String(env.BTCPAY_WEBHOOK_SECRET ?? "").trim();

  return {
    port: Number.isFinite(port) ? port : 4175,
    paymentAdapterKey,
    notifyEmail,
    resendApiKey,
    publicBaseUrl,
    domainCom,
    domainAi,
    databaseUrl,
    authSecret,
    btcpayServerUrl,
    btcpayApiKey,
    btcpayStoreId,
    btcpayWebhookSecret,
    getPublicSummary() {
      return {
        port: Number.isFinite(port) ? port : 4175,
        paymentAdapterKey,
        notifyEmailConfigured: Boolean(notifyEmail),
        resendConfigured: Boolean(resendApiKey),
        publicBaseUrlConfigured: Boolean(publicBaseUrl),
        domainComConfigured: Boolean(domainCom),
        domainAiConfigured: Boolean(domainAi),
        databaseConfigured: Boolean(databaseUrl),
        authSecretConfigured: Boolean(authSecret),
        btcpayServerConfigured: Boolean(btcpayServerUrl),
        btcpayApiKeyConfigured: Boolean(btcpayApiKey),
        btcpayStoreConfigured: Boolean(btcpayStoreId),
        btcpayWebhookSecretConfigured: Boolean(btcpayWebhookSecret),
      };
    },
  };
}
