import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SajuResult } from '@/lib/saju/engine';

export const dynamic = 'force-dynamic';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const fortuneTypePrompts: Record<string, string> = {
  total: '총운 (전반적인 인생운 종합)',
  personality: '타고난 성격과 기질 (일간 중심)',
  health: '건강운',
  love: '연애운',
  marriage: '결혼운',
  business: '사업운',
  career: '취업·커리어운',
  work: '직장운',
  wealth: '재물·금전운',
  study: '학업·시험운',
  relationship: '대인관계운',
  moving: '이동·역마운 (이사·해외·변동)',
  children: '자녀운',
  latterLife: '말년운 (노년의 흐름)',
};

function buildSajuSummary(saju: SajuResult): string {
  const pillars = [
    `연주: ${saju.yearPillar.stemHanja}${saju.yearPillar.branchHanja}(${saju.yearPillar.stemKor}${saju.yearPillar.branchKor})`,
    `월주: ${saju.monthPillar.stemHanja}${saju.monthPillar.branchHanja}(${saju.monthPillar.stemKor}${saju.monthPillar.branchKor})`,
    `일주: ${saju.dayPillar.stemHanja}${saju.dayPillar.branchHanja}(${saju.dayPillar.stemKor}${saju.dayPillar.branchKor})`,
  ];
  if (saju.hourPillar) {
    pillars.push(`시주: ${saju.hourPillar.stemHanja}${saju.hourPillar.branchHanja}(${saju.hourPillar.stemKor}${saju.hourPillar.branchKor})`);
  }
  const ohaengStr = saju.ohaengCounts.map(o => `${o.name}(${o.hanja})${o.count}개`).join(', ');
  return `
사주팔자: ${pillars.join(' / ')}
일간(日干): ${saju.dayMasterHanja}(${saju.dayMasterKor}) - ${saju.dayMasterOhaeng}의 기운
띠: ${saju.animal}
오행 분포: ${ohaengStr}
성별: ${saju.gender === 'male' ? '남성' : '여성'}
시간모름: ${saju.timeUnknown ? '예' : '아니오'}
  `.trim();
}

// 데모 모드용 풍부한 분량의 해석 생성 (각 항목 4~5문단). 실제 사주 데이터를 반영.
function buildDemoTexts(saju: SajuResult): Record<string, string> {
  const dm = `${saju.dayMasterHanja}(${saju.dayMasterKor})`;
  const el = `${saju.dayMasterOhaengHanja}(${saju.dayMasterOhaeng})`;
  const yy = saju.dayMasterYinYang;
  const animal = saju.animal;
  const strongest = [...saju.ohaengCounts].sort((a, b) => b.count - a.count)[0];
  const weakest = [...saju.ohaengCounts].sort((a, b) => a.count - b.count)[0];
  const lacking = saju.ohaengCounts.filter(o => o.count === 0).map(o => `${o.hanja}(${o.name})`).join(', ');
  const ohaengStr = saju.ohaengCounts.map(o => `${o.hanja}(${o.name}) ${o.count}개`).join(' · ');
  const firstDaewun = saju.daewun[0];
  const midDaewun = saju.daewun[3] || saju.daewun[saju.daewun.length - 1];

  const lackText = lacking
    ? `사주 원국에 ${lacking} 기운이 비어 있어, 이 기운에 해당하는 색·방위·활동을 의식적으로 보완하면 균형이 살아납니다.`
    : '오행이 비교적 고르게 분포되어 있어 큰 결함 없이 안정적인 기반을 갖추고 있습니다.';

  return {
    total: [
      `당신의 일간(日干)은 ${dm}로, ${el} 기운을 본질로 타고난 ${yy}의 사람입니다. ${animal}띠의 해에 태어나 ${el}의 성정을 중심으로 인생의 큰 줄기가 형성되어 있습니다. ${el} 일간은 본래 ${saju.dayMasterOhaeng === '금' ? '결단력과 의리, 절제된 강인함' : saju.dayMasterOhaeng === '목' ? '성장과 인자함, 위로 뻗어가는 추진력' : saju.dayMasterOhaeng === '화' ? '열정과 표현력, 빛나는 사교성' : saju.dayMasterOhaeng === '토' ? '신뢰와 포용력, 중심을 잡는 안정감' : '지혜와 유연함, 깊이 흐르는 통찰력'}을 상징하며, 이는 당신이 세상을 대하는 근본적인 태도가 됩니다.`,
      `사주 전체의 오행 분포를 살펴보면 ${ohaengStr}로 구성되어 있습니다. 그중 ${strongest.hanja}(${strongest.name}) 기운이 ${strongest.count}개로 가장 왕성하여 당신 삶의 동력이자 주된 무기가 됩니다. 반면 ${weakest.hanja}(${weakest.name}) 기운은 ${weakest.count}개로 상대적으로 약하니, 이 부분을 보완하는 사람·환경·습관을 곁에 둘 때 운의 흐름이 한결 부드러워집니다. ${lackText}`,
      `대운(大運)의 흐름을 보면, ${firstDaewun ? `${firstDaewun.age}세 무렵 ${firstDaewun.stemHanja}${firstDaewun.branchHanja} 대운에 접어들며 인생의 첫 전환점을 맞이합니다.` : '초년의 기반을 다진 뒤'} ${midDaewun ? `이후 ${midDaewun.age}세 전후 ${midDaewun.stemHanja}${midDaewun.branchHanja} 대운에서 사회적 성취와 내면의 성숙이 함께 무르익습니다.` : ''} 인생은 한 번의 도약이 아니라 10년 단위 대운의 리듬을 타고 굽이쳐 흐르니, 조급함보다 때를 읽는 지혜가 당신에게 가장 큰 자산이 될 것입니다.`,
      `종합하면, 당신은 ${el}의 본질 위에 ${strongest.name}의 강점을 더해 자신만의 길을 개척해 나가는 사람입니다. 인생 전반에 걸쳐 큰 굴곡 없이 꾸준한 성장이 기대되며, 특히 자신의 약한 오행을 보완하고 대운의 상승기를 잘 활용한다면 중년 이후 사회적 지위와 재물이 함께 무르익는 풍요로운 삶을 누릴 수 있습니다. 무엇보다 당신 안에 이미 길(吉)의 씨앗이 심겨 있으니, 그것을 믿고 꾸준히 나아가십시오.`,
    ].join('\n\n'),

    personality: [
      `${dm} 일간을 가진 당신은 ${el}의 기운을 본질로 하는 ${yy}의 사람으로, ${saju.dayMasterOhaeng === '금' ? '결단력이 뚜렷하고 의리를 중시하며, 원칙 앞에서 타협하지 않는 강단' : saju.dayMasterOhaeng === '목' ? '인자하고 진취적이며, 위로 뻗어 자라는 나무처럼 끊임없이 성장하려는 의지' : saju.dayMasterOhaeng === '화' ? '열정적이고 표현력이 풍부하며, 주변을 밝히는 따뜻한 사교성' : saju.dayMasterOhaeng === '토' ? '듬직하고 포용력이 크며, 어떤 상황에서도 중심을 잡는 안정감' : '지혜롭고 유연하며, 깊은 물처럼 상황을 꿰뚫어 보는 통찰력'}을 타고났습니다.`,
      `오행의 분포로 볼 때 ${strongest.hanja}(${strongest.name}) 기운이 강해, 그 성정이 당신의 성격에 뚜렷하게 드러납니다. 이는 당신의 가장 큰 매력이자 무기가 되지만, 때로는 그 기운이 과해 ${strongest.name === '화' ? '성급함이나 욱하는 면' : strongest.name === '금' ? '고집이나 날카로움' : strongest.name === '토' ? '완고함이나 변화에 대한 둔함' : strongest.name === '목' ? '독선이나 밀어붙임' : '우유부단함이나 과한 생각'}으로 나타날 수 있으니, 스스로를 객관적으로 돌아보는 습관이 인간관계를 부드럽게 합니다.`,
      `반면 ${weakest.hanja}(${weakest.name}) 기운이 약해, ${weakest.name === '수' ? '깊이 생각하고 유연하게 흐르는 면' : weakest.name === '화' ? '자기를 적극적으로 표현하고 드러내는 면' : weakest.name === '목' ? '새로운 것을 시작하고 뻗어가는 추진력' : weakest.name === '금' ? '맺고 끊는 결단력과 마무리' : '중심을 잡고 버티는 끈기'}이 상대적으로 부족할 수 있습니다. 이 부분을 의식적으로 보완하면 한층 균형 잡힌 사람이 됩니다.`,
      `종합하면 당신은 ${saju.dayMasterYinYang === '양(陽)' ? '겉으로 드러나는 에너지가 활발하고 주도적인' : '내면에 힘을 축적하며 신중하게 움직이는'} 기질의 소유자입니다. 자신의 강점을 살리고 약점을 보완하는 균형 감각을 갖춘다면, 어디서든 자신만의 빛을 발하는 사람이 될 것입니다.`,
    ].join('\n\n'),

    health: [
      `${el} 일간을 가진 당신의 건강은 기본적으로 ${saju.dayMasterOhaeng === '금' ? '호흡기·폐·대장' : saju.dayMasterOhaeng === '목' ? '간·담·근육과 신경계' : saju.dayMasterOhaeng === '화' ? '심장·소장·혈관과 순환계' : saju.dayMasterOhaeng === '토' ? '비위·소화기와 위장' : '신장·방광·생식기와 수분대사'}와 깊은 관련이 있습니다. 타고난 체질은 ${yy === '양(陽)' ? '활동적이고 에너지가 밖으로 발산되는 양적 체질' : '내면에 에너지를 축적하는 음적 체질'}로, 평소 생활 리듬을 일정하게 유지하는 것이 건강의 핵심입니다.`,
      `오행 분포상 ${strongest.hanja}(${strongest.name})가 과다하고 ${weakest.hanja}(${weakest.name})가 부족한 편이므로, 기운의 불균형이 신체의 특정 부위로 나타날 수 있습니다. 특히 ${strongest.name} 기운이 지나치게 강할 때는 그에 해당하는 장부에 열이나 긴장이 쌓이기 쉬우니, 의식적으로 휴식과 이완을 취해 균형을 맞추는 지혜가 필요합니다.`,
      `생활 관리 측면에서는 규칙적인 운동과 충분한 수면이 무엇보다 중요합니다. ${saju.dayMasterOhaeng === '수' || saju.dayMasterOhaeng === '금' ? '따뜻한 음식과 충분한 보온' : '시원하고 담백한 식습관'}이 당신의 체질에 잘 맞으며, 무리한 다이어트나 극단적인 생활 변화는 오히려 기운을 흩트릴 수 있으니 피하는 것이 좋습니다.`,
      `시기적으로는 대운과 세운의 흐름에 따라 건강의 기복이 찾아올 수 있으니, 계절이 바뀌는 환절기와 큰 변화를 겪는 해에는 특별히 몸을 살피십시오. 다행히 당신의 사주는 회복력이 좋은 편이라, 평소 예방에 신경 쓰고 작은 신호에 귀 기울인다면 큰 병 없이 건강한 삶을 이어갈 수 있습니다.`,
    ].join('\n\n'),

    love: [
      `${el} 일간의 ${yy} 기운을 지닌 당신은 연애에서 ${saju.dayMasterOhaeng === '화' ? '뜨겁고 표현이 풍부한' : saju.dayMasterOhaeng === '수' ? '깊고 섬세하며 상대의 마음을 읽는' : saju.dayMasterOhaeng === '목' ? '다정하고 헌신적인' : saju.dayMasterOhaeng === '금' ? '의리 있고 한결같은' : '듬직하고 안정감을 주는'} 매력을 발산합니다. 이성에게 자연스러운 끌림을 주는 기운을 타고났으며, 한번 마음을 열면 진심을 다하는 사람입니다.`,
      `다만 오행의 균형으로 볼 때, 당신은 이상이 높아 완벽한 상대를 기다리는 경향이 있습니다. ${strongest.name} 기운이 강해 자기 주관이 뚜렷한 만큼, 연애에서도 자신의 색을 분명히 드러내는 편입니다. 이는 매력이 되기도 하지만, 때로는 상대에게 부담이 될 수 있으니 한 발 물러서서 상대의 호흡을 맞추는 여유가 필요합니다.`,
      `당신에게 잘 맞는 인연은 당신의 부족한 ${weakest.name} 기운을 채워주는 사람입니다. 서로의 결을 보완하는 만남일수록 오래도록 안정적이며, 겉으로 화려한 인연보다 진실된 마음으로 다가오는 사람을 소중히 여길 때 진정한 사랑을 만날 수 있습니다.`,
      `연애운의 흐름을 보면, 대운이 바뀌는 시기에 의미 있는 인연이 찾아올 가능성이 높습니다. 조급하게 인연을 좇기보다 자신을 가꾸며 때를 기다린다면, 운명적인 상대가 자연스럽게 당신의 삶에 들어올 것입니다. 사랑은 결국 타이밍이니, 마음을 열어두되 서두르지 마십시오.`,
    ].join('\n\n'),

    marriage: [
      `결혼운에서 ${dm} 일간의 당신은 ${yy === '양(陽)' ? '주도적이면서도 가정을 든든히 이끄는' : '배우자를 깊이 배려하며 가정을 따뜻하게 보살피는'} 기질을 가지고 있습니다. 가정을 인생의 중요한 기반으로 여기며, 한번 가정을 이루면 책임감 있게 지켜나가는 사람입니다.`,
      `사주의 오행 구성으로 볼 때, 당신은 ${weakest.name} 기운을 보완해 주는 배우자를 만날 때 가장 조화로운 결혼 생활을 누립니다. 서로 다른 기운이 만나 균형을 이룰 때 가정에 안정과 번영이 깃들며, 비슷한 성향보다 상호 보완적인 관계가 장기적으로 더 견고합니다.`,
      `결혼의 시기는 대운의 흐름과 깊이 연관됩니다. ${midDaewun ? `특히 ${midDaewun.age}세 전후의 대운기에 인연이 무르익을 가능성이 높으니,` : '적절한 대운기에 인연이 무르익으니,'} 그 시기에 만나는 인연을 신중하면서도 열린 마음으로 대하십시오. 결혼 후에는 가정이 당신 삶의 든든한 울타리가 되어 사회적 활동에도 큰 힘을 실어줄 것입니다.`,
      `다만 강한 ${strongest.name} 기운으로 인해 때로 자기 주장이 앞설 수 있으니, 부부 사이에서는 양보와 소통을 의식적으로 실천하는 것이 행복의 비결입니다. 작은 배려가 쌓여 평생의 동반자 관계를 더욱 단단하게 만들 것입니다.`,
    ].join('\n\n'),

    business: [
      `사업운에서 ${el} 일간의 당신은 ${saju.dayMasterOhaeng === '금' ? '결단력과 추진력' : saju.dayMasterOhaeng === '목' ? '기획력과 성장 지향' : saju.dayMasterOhaeng === '화' ? '창의성과 마케팅 감각' : saju.dayMasterOhaeng === '토' ? '신뢰와 안정적 운영 능력' : '유연한 전략과 통찰력'}을 무기로 삼습니다. ${strongest.name} 기운이 강해 추진하는 일에 강력한 동력을 실을 수 있으며, 한번 방향을 정하면 끝까지 밀고 나가는 뚝심이 있습니다.`,
      `사업의 형태로는, 당신의 사주 구조상 ${weakest.name} 기운을 보완해 줄 파트너와 함께하는 협업·합작 형태에서 더 큰 성과를 거둘 수 있습니다. 혼자 모든 것을 짊어지기보다 부족한 부분을 채워줄 동업자나 전문가와 손잡을 때 사업이 안정적으로 확장됩니다.`,
      `시기적으로는 대운의 상승기에 과감한 도전이 빛을 발합니다. 다만 ${strongest.name} 기운이 과할 때는 무리한 확장이 독이 될 수 있으니, 호황기일수록 내실을 다지고 리스크를 분산하는 신중함이 필요합니다. 큰 흐름을 읽되 작은 디테일을 놓치지 않는 균형이 성패를 가릅니다.`,
      `종합하면 당신은 사업가로서의 잠재력이 충분한 사람입니다. 자신의 강점을 명확히 인식하고, 부족한 부분을 사람과 시스템으로 보완하며, 대운의 때를 잘 활용한다면 의미 있는 결실을 맺을 수 있습니다. 조급함을 버리고 길게 보는 안목을 기르십시오.`,
    ].join('\n\n'),

    career: [
      `취업과 커리어에서 ${dm} 일간의 당신은 ${saju.dayMasterOhaeng}의 전문성을 살릴 수 있는 분야에서 두각을 나타냅니다. ${strongest.name} 기운이 강한 만큼, 자신의 강점이 분명히 발휘되는 직무에서 빠르게 인정받고 성장하는 유형입니다.`,
      `직업 적성으로는 ${saju.dayMasterOhaeng === '금' ? '금융·법률·기계·의료 등 정밀하고 원칙이 분명한 분야' : saju.dayMasterOhaeng === '목' ? '교육·기획·출판·환경 등 성장과 창조의 분야' : saju.dayMasterOhaeng === '화' ? '예술·미디어·IT·마케팅 등 표현과 빛의 분야' : saju.dayMasterOhaeng === '토' ? '부동산·건축·행정·중개 등 안정과 신뢰의 분야' : '연구·유통·무역·서비스 등 흐름과 지혜의 분야'}가 잘 맞습니다. 자신의 오행 기운과 결이 맞는 일을 선택할 때 성취와 만족이 함께 따라옵니다.`,
      `취업의 시기는 충분히 준비된 상태에서 도전할 때 성공 확률이 높습니다. 당신의 사주는 첫 직장보다 경험을 쌓은 뒤 이직이나 전직을 통해 더 좋은 기회를 만나는 흐름이 강하니, 초반의 어려움에 흔들리지 말고 실력을 축적하는 데 집중하십시오.`,
      `대운의 흐름을 활용하면 커리어의 도약 시점을 포착할 수 있습니다. 상승 대운기에 적극적으로 기회를 잡고, 정체기에는 내실을 다지며 다음 도약을 준비하는 전략이 유효합니다. 꾸준함과 타이밍, 이 둘이 당신의 커리어를 빛나게 할 것입니다.`,
    ].join('\n\n'),

    work: [
      `직장운에서 당신은 ${yy === '양(陽)' ? '적극적이고 주도적으로 일을 이끄는' : '협력과 조화를 중시하며 팀을 안정시키는'} 성향을 보입니다. ${el} 일간의 기질상 조직 내에서 ${saju.dayMasterOhaeng === '토' ? '신뢰받는 중심축' : saju.dayMasterOhaeng === '금' ? '원칙을 지키는 핵심 인재' : saju.dayMasterOhaeng === '화' ? '분위기를 밝히는 활력소' : saju.dayMasterOhaeng === '목' ? '성장을 이끄는 기획자' : '유연하게 소통하는 조율자'}로 인정받는 편입니다.`,
      `상사 및 동료와의 관계에서는, 강한 ${strongest.name} 기운으로 인해 자기 소신이 뚜렷한 만큼 때로 의견 충돌이 생길 수 있습니다. 직접적인 대립보다 유연한 태도와 경청의 자세를 취할 때 조직 생활이 한결 수월해지며, 당신의 진가도 더 잘 드러납니다.`,
      `업무 스타일로는 자신의 강점이 발휘되는 역할을 맡을 때 최고의 성과를 냅니다. 반복적이고 수동적인 업무보다 주도권과 책임이 주어지는 일에서 동기부여가 강해지니, 가능하다면 그런 환경을 찾아가는 것이 좋습니다.`,
      `장기적으로 직장운은 대운의 흐름에 따라 승진과 이동의 기회가 찾아옵니다. 인간관계를 원만히 유지하고 실력을 꾸준히 쌓아둔다면, 결정적인 시기에 좋은 자리로 도약할 수 있습니다. 조직 안에서의 신뢰가 곧 당신의 가장 큰 자산입니다.`,
    ].join('\n\n'),

    wealth: [
      `재물운에서 ${dm} 일간의 당신은 ${saju.dayMasterOhaeng === '금' || saju.dayMasterOhaeng === '토' ? '재물을 모으고 지키는 힘이 강한' : '재물의 흐름을 만들고 순환시키는 감각이 뛰어난'} 기질을 타고났습니다. ${strongest.name} 기운이 왕성하여 돈을 버는 동력은 충분하나, 결국 재물의 크기를 결정하는 것은 관리와 운용의 지혜입니다.`,
      `사주 구조로 볼 때, 당신은 한 번의 큰 횡재보다 꾸준한 축적을 통해 재물을 이루는 유형입니다. 안정적인 저축과 분산 투자가 당신에게 잘 맞으며, 부족한 ${weakest.name} 기운을 보완하는 분야의 재테크가 의외의 도움을 줄 수 있습니다.`,
      `지출 관리에서는, 강한 ${strongest.name} 기운으로 인해 때때로 과감한 소비나 투자 충동이 생길 수 있으니 절제가 필요합니다. 특히 감정적인 판단으로 큰돈을 움직이는 것은 피하고, 충분히 검토한 뒤 결정하는 습관이 재물을 지키는 핵심입니다.`,
      `재물운의 큰 흐름을 보면, ${midDaewun ? `${midDaewun.age}세 전후의 대운기부터 재물의 기반이 본격적으로 무르익습니다.` : '중년 이후 재물의 기반이 본격적으로 무르익습니다.'} 젊을 때 성실히 기반을 다져두면 나이가 들수록 풍요가 따르는 사주이니, 조급해하지 말고 길게 보며 차근차근 쌓아가십시오. 당신의 부(富)는 시간과 함께 깊어집니다.`,
    ].join('\n\n'),

    study: [
      `학업과 시험운에서 ${el} 일간의 당신은 ${saju.dayMasterOhaeng === '수' ? '깊이 사고하고 본질을 꿰뚫는 학자형' : saju.dayMasterOhaeng === '목' ? '꾸준히 성장하며 넓게 배워나가는 탐구형' : saju.dayMasterOhaeng === '금' ? '논리적이고 분석적인 정밀형' : saju.dayMasterOhaeng === '화' ? '이해가 빠르고 응용력이 뛰어난 직관형' : '성실하게 기초를 다지는 축적형'} 두뇌를 타고났습니다. 자신의 학습 스타일을 알고 활용하면 효율이 크게 올라갑니다.`,
      `${strongest.name} 기운이 강해 ${strongest.name === '화' ? '집중력은 높으나 끈기가 흩어지기 쉬우니, 짧고 강하게 몰입하는 전략' : strongest.name === '금' ? '정확하고 꼼꼼하나 융통성이 부족할 수 있으니, 큰 그림을 함께 보는 습관' : strongest.name === '토' ? '꾸준하나 변화에 둔할 수 있으니, 새로운 방법을 시도하는 유연함' : strongest.name === '목' ? '의욕은 넘치나 산만해지기 쉬우니, 우선순위를 정하는 훈련' : '생각이 깊으나 실행이 늦어질 수 있으니, 마감을 정해 추진하는 습관'}이 도움이 됩니다.`,
      `시험운은 대운과 세운의 흐름에 영향을 받습니다. 자신의 ${weakest.name} 기운을 보완하는 환경(방위·색·시간대)에서 공부하면 집중이 잘 되며, 중요한 시험은 컨디션이 오르는 시기에 맞추어 준비하는 것이 유리합니다.`,
      `종합하면 당신은 노력한 만큼 결실을 얻는 학업운을 지녔습니다. 단기 성과에 일희일비하기보다 장기적인 관점에서 꾸준히 쌓아간다면, 원하는 목표에 반드시 도달할 수 있습니다.`,
    ].join('\n\n'),

    relationship: [
      `대인관계에서 ${dm} 일간의 당신은 ${saju.dayMasterYinYang === '양(陽)' ? '먼저 다가가 분위기를 이끄는 적극적인' : '진중하게 신뢰를 쌓아가는 깊이 있는'} 유형입니다. ${el}의 성정으로 인해 ${saju.dayMasterOhaeng === '금' ? '의리와 신의를 중시하여 한번 맺은 인연을 오래 지키는' : saju.dayMasterOhaeng === '화' ? '밝고 따뜻하여 사람을 끌어모으는' : saju.dayMasterOhaeng === '토' ? '믿음직하여 주변이 기대고 싶어 하는' : saju.dayMasterOhaeng === '목' ? '배려심이 깊고 사람을 키워주는' : '지혜롭고 포용적이어서 다양한 사람과 어울리는'} 편입니다.`,
      `다만 ${strongest.name} 기운이 강해 때로 ${strongest.name === '금' ? '날카로운 말투나 단호함' : strongest.name === '화' ? '욱하는 감정 표현' : strongest.name === '토' ? '고집이나 답답함' : strongest.name === '목' ? '자기 주장' : '거리를 두는 냉정함'}이 관계에 부담을 줄 수 있습니다. 상대의 입장에서 한 번 더 생각하는 여유가 인간관계를 한층 원만하게 만듭니다.`,
      `당신에게 도움이 되는 인연은 부족한 ${weakest.name} 기운을 채워주는 사람입니다. 서로 다른 결이 만나 보완될 때 관계가 오래가고 깊어지며, 비슷한 사람보다 나를 자극하고 성장시키는 사람을 곁에 두는 것이 좋습니다.`,
      `종합하면 당신은 진실된 인연을 소중히 하는 사람입니다. 넓게 사귀기보다 깊게 사귀는 편이 잘 맞으며, 신뢰를 바탕으로 한 관계가 평생의 든든한 자산이 될 것입니다.`,
    ].join('\n\n'),

    moving: [
      `이동·역마운에서 당신의 사주는 ${saju.yearPillar.branchKor === '인' || saju.yearPillar.branchKor === '신' || saju.yearPillar.branchKor === '사' || saju.yearPillar.branchKor === '해' || saju.dayPillar.branchKor === '인' || saju.dayPillar.branchKor === '신' || saju.dayPillar.branchKor === '사' || saju.dayPillar.branchKor === '해' ? '역마(驛馬)의 기운이 있어 이동과 변화가 잦고, 활동 반경이 넓은' : '비교적 안정적으로 한곳에 뿌리내리는 경향이 있으나, 대운의 흐름에 따라 변동이 찾아오는'} 구조입니다.`,
      `이사·이직·해외 등 큰 변동은 대운이 바뀌는 시기에 자연스럽게 찾아오는 경우가 많습니다. 이때 두려워하기보다 흐름에 올라타면, 변화가 곧 도약의 기회가 됩니다. 특히 당신의 행운의 방향으로 움직일 때 더 좋은 결과를 얻습니다.`,
      `다만 변동이 잦을수록 중심을 잃지 않는 것이 중요합니다. 부족한 ${weakest.name} 기운을 보완하며 안정의 닻을 내려둔다면, 활발한 이동 속에서도 흔들리지 않고 성취를 쌓아갈 수 있습니다.`,
      `종합하면 당신의 이동운은 ${saju.dayPillar.branchKor === '인' || saju.dayPillar.branchKor === '신' || saju.dayPillar.branchKor === '사' || saju.dayPillar.branchKor === '해' ? '넓은 무대에서 기회를 잡는 활동형' : '신중하게 때를 보아 움직이는 안정형'}입니다. 자신의 리듬에 맞는 변화를 선택한다면, 이동은 늘 새로운 행운의 문이 될 것입니다.`,
    ].join('\n\n'),

    children: [
      `자녀운에서 ${dm} 일간의 당신은 ${saju.dayMasterOhaeng === '목' || saju.dayMasterOhaeng === '화' ? '자녀에게 따뜻하고 헌신적인 양육자' : saju.dayMasterOhaeng === '토' ? '안정적이고 든든한 울타리가 되어주는 부모' : '원칙과 사랑을 함께 가르치는 균형 잡힌 부모'}의 기질을 지녔습니다. 자녀와의 인연이 삶에 큰 기쁨과 의미를 더해줄 것입니다.`,
      `사주의 기운으로 볼 때, 자녀와의 관계는 ${strongest.name} 기운이 강한 만큼 ${strongest.name === '금' || strongest.name === '토' ? '엄격함과 따뜻함의 균형을 맞추는 것' : '자유와 절제 사이의 조화를 찾는 것'}이 중요합니다. 자녀를 자신의 틀에 맞추기보다 그 아이만의 기질을 존중할 때 관계가 깊어집니다.`,
      `자녀의 운을 북돋우려면, 당신과 자녀의 부족한 기운을 서로 보완해 주는 환경을 만들어주는 것이 좋습니다. 가정의 화목이 곧 자녀의 가장 큰 복이 되며, 부모의 안정된 마음이 자녀에게 그대로 전해집니다.`,
      `종합하면 당신은 자녀에게 든든한 버팀목이 되는 사람입니다. 너무 많은 것을 해주려 애쓰기보다, 곁에서 믿고 지켜봐 주는 사랑이 자녀를 가장 크게 자라게 할 것입니다.`,
    ].join('\n\n'),

    latterLife: [
      `말년운에서 당신의 사주는 ${midDaewun ? `${midDaewun.age}세 이후 ${midDaewun.stemHanja}${midDaewun.branchHanja} 대운을 거치며` : '중년 이후의 대운을 거치며'} 점차 안정과 결실의 시기로 접어듭니다. 젊을 때 쌓은 노력과 덕(德)이 노년에 풍요로운 열매로 돌아오는 흐름입니다.`,
      `${el} 일간의 특성상, 말년에는 ${saju.dayMasterOhaeng === '금' || saju.dayMasterOhaeng === '수' ? '내면이 깊어지고 지혜가 무르익어 존경받는 어른' : '따뜻함과 너그러움으로 주변에 베푸는 인생의 선배'}로 자리 잡습니다. 물질적 안정뿐 아니라 정신적 풍요까지 함께 누릴 수 있는 사주입니다.`,
      `다만 건강 관리는 말년 행복의 핵심입니다. 과다한 ${strongest.name} 기운에 해당하는 ${saju.dayMasterOhaeng === '금' ? '호흡기·대장' : '신체 부위'} 등을 평소 살피고, 부족한 ${weakest.name} 기운을 보완하는 생활 습관을 들이면 건강한 노년을 보낼 수 있습니다.`,
      `종합하면 당신의 말년은 '유종의 미'를 거두는 흐름입니다. 가족과의 화목, 베풂의 기쁨, 그리고 평생 쌓아온 지혜가 어우러져, 따뜻하고 품위 있는 노년을 맞이하게 될 것입니다.`,
    ].join('\n\n'),
  };
}

const interpretCache = new Map<string, { data: Record<string, string>; ts: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saju, locale = 'ko', serviceType = 'full' } = body as {
      saju: SajuResult;
      locale: string;
      serviceType: 'full' | 'monthly';
      year?: number;
      month?: number;
    };

    const cacheKey = `${saju.birthDate}-${saju.birthHour ?? 'x'}-${saju.gender}-${locale}-${serviceType}`;
    const cached = interpretCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 86400000) {
      return NextResponse.json({ interpretations: cached.data });
    }

    const sajuSummary = buildSajuSummary(saju);
    const langInstruction: Record<string, string> = {
      ko: '한국어로 답변하세요.',
      en: 'Answer in English.',
      ja: '日本語で答えてください。',
      zh: '请用简体中文回答。',
      tw: '請用繁體中文回答。',
    };

    const interpretations: Record<string, string> = {};

    if (!process.env.OPENAI_API_KEY) {
      // Demo mode without API key — 풍부한 분량(각 항목 4~5문단)으로 PDF 다페이지 구성
      Object.assign(interpretations, buildDemoTexts(saju));
    } else {
      const prompt = `당신은 5,000년 전통의 사주명리학(四柱命理學) 대가입니다.
아래 사주팔자를 바탕으로, 의뢰인에게 전하는 정식 운세 감정서를 작성합니다.
${langInstruction[locale] || langInstruction.ko}

${sajuSummary}

[작성 지침]
- 8가지 운세 항목을 각각 **최소 4문단, 500자 이상**으로 매우 상세하게 작성하세요.
- 각 항목은 (1) 사주 구조에 근거한 기질 분석 → (2) 현재~중년의 흐름 → (3) 구체적 조언/실천법 → (4) 시기별 주의점 순으로 깊이 있게 풀어주세요.
- 일간(日干)과 오행의 균형, 십신, 대운의 흐름을 근거로 구체적으로 설명하세요.
- 따뜻하면서도 통찰력 있는 전문가의 어조를 유지하세요. 분량이 충분히 길어야 합니다.

다음 8가지 운세를 작성하세요:
${Object.entries(fortuneTypePrompts).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

반드시 아래 JSON 형식으로만 답변하세요(각 값은 긴 문자열):
{"total": "...", "health": "...", "love": "...", "marriage": "...", "business": "...", "career": "...", "work": "...", "wealth": "..."}`;

      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 8000,
        temperature: 0.85,
      });

      const parsed = JSON.parse(completion.choices[0].message.content || '{}');
      Object.assign(interpretations, parsed);
    }

    interpretCache.set(cacheKey, { data: interpretations, ts: Date.now() });
    return NextResponse.json({ interpretations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Interpretation failed' }, { status: 500 });
  }
}
