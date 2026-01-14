# Stripe Integration Skills

**Plugin:** `stripe`

## Available Skills

### explain-error
**Invoke:** `/explain-error`

Explain Stripe error codes and provide solutions with code examples.

**Example:**
```
/explain-error card_declined
/explain-error insufficient_funds
```

### test-cards
**Invoke:** `/test-cards`

Display Stripe test card numbers for various testing scenarios.

**Example:**
```
/test-cards
```

**Common Test Cards:**
| Card Number | Scenario |
|-------------|----------|
| 4242424242424242 | Successful payment |
| 4000000000000002 | Card declined |
| 4000000000009995 | Insufficient funds |
| 4000000000000069 | Expired card |
| 4000000000000127 | Incorrect CVC |

### stripe-best-practices
**Invoke:** Use when implementing Stripe

Best practices for building Stripe integrations including payment processing, checkout flows, subscriptions, webhooks, and Connect platforms.

## Common Error Codes

| Error Code | Meaning |
|------------|---------|
| `card_declined` | Card was declined |
| `expired_card` | Card has expired |
| `incorrect_cvc` | CVC is incorrect |
| `processing_error` | Processing error occurred |
| `incorrect_number` | Card number is incorrect |
| `insufficient_funds` | Insufficient funds |

## Integration Patterns

### Payment Intent Flow
```javascript
// 1. Create PaymentIntent on server
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
});

// 2. Confirm on client
const {error} = await stripe.confirmCardPayment(clientSecret);
```

### Webhook Handling
```javascript
app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body, sig, endpointSecret
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      break;
  }

  res.json({received: true});
});
```

## Best Practices

1. **Always use webhooks** - Don't rely solely on client responses
2. **Idempotency keys** - Use for retry safety
3. **Test mode first** - Always test before going live
4. **Error handling** - Handle all error scenarios gracefully
5. **PCI compliance** - Use Stripe Elements or Checkout
6. **Metadata** - Store relevant info in Stripe metadata
