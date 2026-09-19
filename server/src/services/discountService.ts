import { supabase } from '../config/supabase';

export interface DiscountResult {
  discountAmount: number;
  discountLabel: string | null;
}

export const applyDiscount = async (
  subtotal: number,
  groupType: 'whole_trip' | 'single_leg' | 'multi_leg',
  code?: string
): Promise<DiscountResult> => {
  let appliedRule = null;

  if (code) {
    // Try to find the specific code
    const { data: rule } = await supabase
      .from('discount_rules')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .single();

    if (rule && subtotal >= rule.min_amount) {
      if (rule.applies_to === 'any' || rule.applies_to === groupType) {
        appliedRule = rule;
      }
    }
  }

  // If no explicit code, or it was invalid, try the automatic rule for this group_type
  if (!appliedRule) {
    const { data: automaticRule } = await supabase
      .from('discount_rules')
      .select('*')
      .is('code', null)
      .eq('applies_to', groupType)
      .eq('active', true)
      .single();

    if (automaticRule && subtotal >= automaticRule.min_amount) {
      appliedRule = automaticRule;
    }
  }

  if (!appliedRule) {
    return { discountAmount: 0, discountLabel: null };
  }

  let amount = 0;
  if (appliedRule.type === 'percent') {
    amount = subtotal * (appliedRule.value / 100);
  } else if (appliedRule.type === 'flat') {
    amount = appliedRule.value;
  }

  // Cap discount at subtotal
  if (amount > subtotal) {
    amount = subtotal;
  }

  return {
    discountAmount: Math.round(amount * 100) / 100, // Round to 2 decimals
    discountLabel: appliedRule.code 
      ? `Coupon ${appliedRule.code}`
      : (groupType === 'whole_trip' ? 'Whole-trip bundle savings' : 'Automatic savings')
  };
};
