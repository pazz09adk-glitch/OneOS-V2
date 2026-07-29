import type { HubMessage, MessageClient, ResolveResult, RouteRule } from './types';

function fillTemplate(template: string, msg: HubMessage): string {
  return template
    .replace(/\{bizId\}/g, encodeURIComponent(msg.bizId))
    .replace(/\{id\}/g, encodeURIComponent(msg.id));
}

function findRule(
  rules: RouteRule[],
  sourceSystem: HubMessage['sourceSystem'],
  bizType: string,
  client: MessageClient,
): RouteRule | undefined {
  return rules.find(
    (r) => r.sourceSystem === sourceSystem && r.bizType === bizType && r.client === client,
  );
}

export function resolveMessageTarget(
  msg: HubMessage,
  client: MessageClient,
  rules: RouteRule[],
): ResolveResult {
  const primary = findRule(rules, msg.sourceSystem, msg.bizType, client);
  if (primary) {
    const useFallback =
      (!primary.targetTemplate || primary.targetTemplate.trim() === '') && primary.fallbackClient;
    if (useFallback && primary.fallbackClient) {
      const fb = findRule(rules, msg.sourceSystem, msg.bizType, primary.fallbackClient);
      if (fb?.targetTemplate?.trim()) {
        return {
          ok: true,
          uri: fillTemplate(fb.targetTemplate.trim(), msg),
          label: primary.label || fb.label,
          externalApp: fb.externalApp ?? primary.externalApp,
          rule: fb,
        };
      }
    }
    if (primary.targetTemplate?.trim()) {
      return {
        ok: true,
        uri: fillTemplate(primary.targetTemplate, msg),
        label: primary.label,
        externalApp: primary.externalApp,
        rule: primary,
      };
    }
  }
  return { ok: false, reason: 'no_rule', message: '当前端暂无可跳转目标' };
}
