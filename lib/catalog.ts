import type { Locale, LocaleData } from './i18n';
export type ProductId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const EDITIONS = {
  4: { amount:6900, keys:['love','relationship'], image:'love', title:['나의 연애 사용설명서','Your Love Story','私の恋愛ガイド','我的恋爱指南','我的戀愛指南'], desc:['내가 사랑하는 방식과 관계의 힌트','Your style of love and connection','恋愛傾向と関係のヒント','恋爱风格与相处提示','戀愛風格與相處提示'] },
  5: { amount:6900, keys:['marriage','children','relationship'], image:'love', title:['결혼, 나의 다음 장','The Marriage Chapter','結婚という次の章','婚姻的下一章','婚姻的下一章'], desc:['배우자관·가정·소통의 방향','Partnership, family and communication','結婚観・家庭・コミュニケーション','伴侣观、家庭与沟通','伴侶觀、家庭與溝通'] },
  6: { amount:7900, keys:['wealth','business','work'], image:'wealth', title:['돈의 흐름을 읽는 사주','Your Wealth Blueprint','財運を読む四柱','读懂财富的流向','讀懂財富的流向'], desc:['재물 성향과 사업에서 살펴볼 균형','Money habits and business perspective','金銭感覚と事業のバランス','财务习惯与事业平衡','財務習慣與事業平衡'] },
  7: { amount:6900, keys:['career','work','study','moving'], image:'career', title:['나답게 일하는 법','Your Career Compass','自分らしい働き方','适合我的职场方向','適合我的職場方向'], desc:['취업·이직·배움, 선택의 실마리','Career, transitions and learning','就職・転職・学びのヒント','求职、转职与学习的线索','求職、轉職與學習的線索'] },
  8: { amount:8900, keys:['earlyLife','youth','middleAge','latterLife'], image:'career', title:['10년 대운, 인생의 전환점','Your Decade Map','10年大運・人生の転機','十年大运与人生转折','十年大運與人生轉折'], desc:['시기별 흐름과 전환기를 맞는 전략','Life stages and transition strategies','時期別の流れと転換期の戦略','人生阶段与转折策略','人生階段與轉折策略'] },
} as const;
export function isProductId(id:number): id is ProductId {return Number.isInteger(id)&&id>=1&&id<=8;}
export function editionInfo(id:ProductId,t:LocaleData,locale:Locale){
 if(id<=3)return [t.pricing.service1,t.pricing.service2,t.pricing.service3][id-1];
 const e=EDITIONS[id as keyof typeof EDITIONS];const index=({ko:0,en:1,ja:2,zh:3,tw:4})[locale];
 return {name:e.title[index],desc:e.desc[index],price:new Intl.NumberFormat(locale==='ko'?'ko-KR':'en-US',{style:'currency',currency:'KRW',maximumFractionDigits:0}).format(e.amount),features:[e.desc[index],t.result.profile.title,t.result.download],badge:'THEME EDITION'};
}
