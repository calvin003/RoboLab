const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  starter: {
    name: 'Micromouse Track',
    description: 'Self-paced curriculum, weekly group Q&A, hardware kit shipped to your door.',
    amount: 14900,
  },
  guided: {
    name: 'AI + Projects Track',
    description: 'Biweekly 1-on-1 live sessions with expert mentor. Hardware kit included.',
    amount: 24900,
  },
  elite: {
    name: 'Full Capstone Track',
    description: 'Weekly 1-on-1 sessions + full capstone mentorship. Ship to a real user.',
    amount: 34900,
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan } = req.body;
  const planData = PLANS[plan];

  if (!planData) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const origin = req.headers.origin || 'https://therobolab.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_options: {
        card: { request_three_d_secure: 'automatic' },
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planData.name,
              description: planData.description,
            },
            unit_amount: planData.amount,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout.html?success=true&plan=${plan}`,
      cancel_url: `${origin}/checkout.html?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
