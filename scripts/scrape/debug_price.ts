// Debug script to test price parsing
const testCases = [
  ' S $2.75<br>L $5.00<br>',  // Soup with sizes
  '  $2.00<br>',              // Simple price
  ' Chicken $8.50<br>Vegetarian $8.50<br>Shrimp $9.50<br>', // Option variants
  ' S $2.00<br>L $3.00<br>',  // Rice with sizes
];

function parsePriceCell(priceHtml: string) {
  const text = priceHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  console.log('  Lines:', lines);

  const sizePattern = /^(S|L|SM|LG|Small|Large)\s+\$([0-9]+(?:\.[0-9]{1,2})?)/i;
  const sizeVariants: { size: string; price: number }[] = [];

  const optionPattern = /^([A-Za-z][A-Za-z\s]+)\s+\$([0-9]+(?:\.[0-9]{1,2})?)/;
  const optionVariants: { option: string; price: number }[] = [];

  for (const line of lines) {
    console.log(`  Testing line: "${line}"`);
    const sizeMatch = line.match(sizePattern);
    console.log(`    Size match:`, sizeMatch);
    if (sizeMatch) {
      const sizeCode = sizeMatch[1].toUpperCase();
      const size = (sizeCode === 'S' || sizeCode === 'SM' || sizeCode === 'SMALL') ? 'Small' : 'Large';
      sizeVariants.push({ size, price: Number(sizeMatch[2]) });
      continue;
    }

    const optionMatch = line.match(optionPattern);
    if (optionMatch) {
      const optName = optionMatch[1].trim();
      if (optName.length > 1 && !/^(S|L|SM|LG)$/i.test(optName)) {
        optionVariants.push({ option: optName, price: Number(optionMatch[2]) });
      }
    }
  }

  const simplePrice = text.match(/^\s*\$\s*([0-9]+(?:\.[0-9]{1,2})?)\s*$/m);
  const anyPrice = text.match(/\$\s*([0-9]+(?:\.[0-9]{1,2})?)/);

  console.log('  Size variants:', sizeVariants);
  console.log('  Option variants:', optionVariants);

  if (sizeVariants.length > 0) {
    const basePrice = Math.min(...sizeVariants.map(v => v.price));
    return { basePrice, sizeVariants, optionVariants: null };
  }

  if (optionVariants.length > 0) {
    const basePrice = Math.min(...optionVariants.map(v => v.price));
    return { basePrice, sizeVariants: null, optionVariants };
  }

  return {
    basePrice: (simplePrice || anyPrice) ? Number((simplePrice || anyPrice)![1]) : null,
    sizeVariants: null,
    optionVariants: null
  };
}

for (const tc of testCases) {
  console.log('\n=== Test case:', JSON.stringify(tc), '===');
  const result = parsePriceCell(tc);
  console.log('Result:', result);
}
