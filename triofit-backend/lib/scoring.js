export function scoreProfile(profile) {
  const seed = JSON.stringify(profile).length;
  const rand = (min, max, offset) => {
    const x = Math.sin(seed + offset) * 10000;
    const frac = x - Math.floor(x);
    return Math.floor(min + frac * (max - min));
  };
  return {
    confidence: rand(60, 95, 1),
    authority: rand(60, 92, 2),
    trust: rand(65, 96, 3),
    approachability: rand(50, 90, 4),
    styleFit: rand(60, 95, 5),
  };
}

export function scoreFromTemplate(template) {
  return {
    confidence: template.base_confidence,
    authority: template.base_authority,
    trust: template.base_trust,
    approachability: template.base_approachability,
    styleFit: template.base_style_fit,
  };
}

export function finalScore(traits) {
  const vals = Object.values(traits);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
