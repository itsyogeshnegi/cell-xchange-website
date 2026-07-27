const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const belowHundred = (value) => value < 20 ? ones[value] : [tens[Math.floor(value / 10)], ones[value % 10]].filter(Boolean).join(" ");
const belowThousand = (value) => {
  const hundred = Math.floor(value / 100);
  const remainder = value % 100;
  return [hundred ? `${ones[hundred]} Hundred` : "", remainder ? belowHundred(remainder) : ""].filter(Boolean).join(" ");
};

export function amountInWords(value) {
  let amount = Math.max(0, Math.round(Number(value) || 0));
  if (!amount) return "Zero Rupees Only";
  const parts = [];
  const groups = [
    [10_000_000, "Crore"],
    [100_000, "Lakh"],
    [1_000, "Thousand"],
  ];
  for (const [size, label] of groups) {
    const count = Math.floor(amount / size);
    if (count) { parts.push(`${belowThousand(count)} ${label}`); amount %= size; }
  }
  if (amount) parts.push(belowThousand(amount));
  return `${parts.join(" ")} Rupees Only`;
}
