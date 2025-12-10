import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("STRIPE_SECRET_KEY not set - Stripe features will be disabled");
}

export const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

export const SUBSCRIPTION_PLANS = {
    free: {
        name: "Gratuito",
        price: 0,
        simuladosLimit: 1,
        priceId: null,
    },
    monthly: {
        name: "Mensal",
        price: 3900, // R$ 39,00 em centavos
        simuladosLimit: -1, // ilimitado
        priceId: null as string | null, // será criado dinamicamente
    },
    annual: {
        name: "Anual",
        price: 22800, // R$ 228,00/ano (R$ 19/mês x 12)
        priceId: null as string | null,
        simuladosLimit: -1,
    },
};

let stripeProductId: string | null = null;
let monthlyPriceId: string | null = null;
let annualPriceId: string | null = null;

export async function ensureStripeProductsExist() {
    if (!stripe) return;

    // Buscar ou criar produto
    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find(p => p.name === "ConcurseIA Pro");

    if (!product) {
        product = await stripe.products.create({
            name: "ConcurseIA Pro",
            description: "Acesso ilimitado a simulados, questões e recomendações de estudo com IA",
        });
    }
    stripeProductId = product.id;

    // Buscar ou criar preço mensal
    const prices = await stripe.prices.list({ product: product.id, limit: 100 });

    let monthlyPrice = prices.data.find(
        p => p.recurring?.interval === "month" && p.unit_amount === 3900 && p.active
    );
    if (!monthlyPrice) {
        monthlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: 3900,
            currency: "brl",
            recurring: { interval: "month" },
            nickname: "Plano Mensal",
        });
    }
    monthlyPriceId = monthlyPrice.id;
    SUBSCRIPTION_PLANS.monthly.priceId = monthlyPrice.id;

    // Buscar ou criar preço anual
    let annualPrice = prices.data.find(
        p => p.recurring?.interval === "year" && p.unit_amount === 22800 && p.active
    );
    if (!annualPrice) {
        annualPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: 22800,
            currency: "brl",
            recurring: { interval: "year" },
            nickname: "Plano Anual",
        });
    }
    annualPriceId = annualPrice.id;
    SUBSCRIPTION_PLANS.annual.priceId = annualPrice.id;

    console.log("Stripe products initialized:", {
        productId: stripeProductId,
        monthlyPriceId,
        annualPriceId,
    });
}

export function getMonthlyPriceId() {
    return monthlyPriceId;
}

export function getAnnualPriceId() {
    return annualPriceId;
}

export function getProductId() {
    return stripeProductId;
}
