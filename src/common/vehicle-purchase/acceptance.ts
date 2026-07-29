/** 对齐《附件4：车辆交接验收表》现场验车单 */

/** 图例：√正常完好齐全 · N缺少 · ×损坏/开裂 · O变形 */
export type HandoverItemMark = 'ok' | 'missing' | 'damage' | 'deform' | 'na';

export const HANDOVER_ITEM_MARK_LABEL: Record<HandoverItemMark, string> = {
  ok: '√ 正常',
  missing: 'N 缺少',
  damage: '× 损坏',
  deform: 'O 变形',
  na: '— 不适用',
};

/** 交接验收表 · 检验项目（按样表归并，原型可全选） */
export const HANDOVER_CHECK_GROUPS: { title: string; items: string[] }[] = [
  {
    title: '外观与标识',
    items: [
      '整车外观状况（与公告目录样车相同）',
      '漆面状况',
      '喇叭状况',
      '车辆照片（左前45°+右后45°）',
      '汽车标识LOGO',
      '车辆底盘状况',
      '整车配置表',
    ],
  },
  {
    title: '动力与续航',
    items: [
      '冷却风扇转动状况',
      '供氢量/续航电量（≥95%）',
      '钥匙（2把）',
      '动力舱状况',
      '车辆启动状况',
      '档位变换（前进档、倒档）',
    ],
  },
  {
    title: '驾驶室与电器',
    items: [
      '车辆内饰状况',
      '灯光状况',
      '前后灯总成状况',
      '风挡玻璃状况',
      '仪表盘功能状况',
      '雨刮器状况',
      '座椅状况',
      '安全带状况',
      '左右后视镜状况',
      '车内反光镜状况',
      '空调状况',
      '刹车系统状况',
      '制动器助力性能状况',
      '方向盘助力性能状况',
    ],
  },
  {
    title: '随车工具与备件',
    items: [
      '灭火器（1个）',
      '备胎（1只）',
      '点烟器（1个）',
      '反光衣',
      '千斤顶',
      '轮胎撬棍',
      '车辆反光贴',
      '三角警示牌',
      '钳子/轮胎扳手',
      '备胎扬撬',
      '轴头保养扳手',
      '挡车器',
      '胎压检测值',
      '标准量去离子水',
      '标准量冷却液',
    ],
  },
  {
    title: '文件资料',
    items: ['用户操作手册', '质量保修手册', '保修IC卡'],
  },
  {
    title: '车身结构',
    items: [
      '四轮轮胎状况',
      '挡泥板状况',
      '侧防护围杠/后部护围杠',
      '左右中后门状况',
      '货箱箱体状况',
    ],
  },
];

export const DEFAULT_ACCEPTANCE_CHECK_ITEMS: string[] = HANDOVER_CHECK_GROUPS.flatMap(
  (g) => g.items,
);

/** 现场验车主单据：车辆交接验收表（附件4） */
export const DEFAULT_SIGNOFF_DOC_NAME = '车辆交接验收表';

/** 合同侧《发送签收单》仍可作为商务签收补充说明 */
export const CONTRACT_SIGNOFF_DOC_NAME = '发送签收单';

export function buildSignoffEsignFileName(
  taskCode: string,
  seq: number,
  docName = DEFAULT_SIGNOFF_DOC_NAME,
) {
  return `${taskCode}-${String(seq).padStart(2, '0')}-${docName}-电子签章.pdf`;
}

export function allHandoverItemsOk(
  marks: Partial<Record<string, HandoverItemMark>> | undefined,
  items: string[] = DEFAULT_ACCEPTANCE_CHECK_ITEMS,
): boolean {
  if (!marks) return false;
  return items.every((item) => marks[item] === 'ok' || marks[item] === 'na');
}
