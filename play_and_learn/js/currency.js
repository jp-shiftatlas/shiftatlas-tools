export function canAfford(balance, price) {
  return balance[price.currency] >= price.amount;
}

export function earn(balance, currency, amount) {
  return { ...balance, [currency]: balance[currency] + amount };
}

export function spend(balance, price) {
  if (!canAfford(balance, price)) {
    throw new Error(`Insufficient ${price.currency}: have ${balance[price.currency]}, need ${price.amount}`);
  }
  return { ...balance, [price.currency]: balance[price.currency] - price.amount };
}
