import { CurrencyType } from '../types';

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

function convertLessThanThousand(num: number): string {
  let str = '';
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
    if (num > 0) str += 'and ';
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    str += ones[num] + ' ';
  }
  return str.trim();
}

function convertIntegerToWords(num: number): string {
  if (num === 0) return 'Zero';
  let wordResult = '';
  let scaleIndex = 0;

  let temp = num;
  while (temp > 0) {
    const chunk = temp % 1000;
    if (chunk > 0) {
      const chunkStr = convertLessThanThousand(chunk);
      wordResult = chunkStr + ' ' + scales[scaleIndex] + ' ' + wordResult;
    }
    temp = Math.floor(temp / 1000);
    scaleIndex++;
  }

  return wordResult.trim();
}

export function numberToWords(amount: number, currency: CurrencyType): string {
  if (isNaN(amount) || amount < 0) return '';
  
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let currencyName = 'Naira';
  let subunitName = 'Kobo';

  switch (currency) {
    case 'USD':
      currencyName = 'US Dollars';
      subunitName = 'Cents';
      break;
    case 'GBP':
      currencyName = 'Pounds Sterling';
      subunitName = 'Pence';
      break;
    case 'EUR':
      currencyName = 'Euros';
      subunitName = 'Cents';
      break;
    case 'NGN':
    default:
      currencyName = 'Naira';
      subunitName = 'Kobo';
      break;
  }

  const integerWords = convertIntegerToWords(integerPart);
  let result = `${integerWords} ${currencyName}`;

  if (decimalPart > 0) {
    const decimalWords = convertIntegerToWords(decimalPart);
    result += ` and ${decimalWords} ${subunitName}`;
  }

  return result + ' Only';
}
