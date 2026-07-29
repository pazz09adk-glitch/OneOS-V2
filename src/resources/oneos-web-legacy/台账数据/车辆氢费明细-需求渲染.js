/** 将 PRD Markdown 排版为 React 节点（车辆氢费明细） */
function parsePrdInlineText(text) {
	var parts = String(text || '').split(/(\*\*[^*]+\*\*)/g);
	var nodes = [];
	var i;
	for (i = 0; i < parts.length; i++) {
		var p = parts[i];
		if (!p) continue;
		if (p.indexOf('**') === 0 && p.lastIndexOf('**') === p.length - 2) {
			nodes.push(
				React.createElement('strong', { key: i }, p.slice(2, -2))
			);
		} else {
			nodes.push(p);
		}
	}
	return nodes.length === 1 ? nodes[0] : nodes;
}

function isPrdTableRow(line) {
	return /^\|.+\|$/.test(String(line || '').trim());
}

function isPrdTableSep(line) {
	return /^\|[\s\-:|]+\|$/.test(String(line || '').trim());
}

function renderPrdTableRow(line, rowKey, isHeader) {
	var cells = String(line)
		.trim()
		.replace(/^\|/, '')
		.replace(/\|$/, '')
		.split('|')
		.map(function (c) {
			return c.trim();
		});
	return React.createElement(
		'tr',
		{ key: rowKey },
		cells.map(function (cell, ci) {
			var Tag = isHeader ? 'th' : 'td';
			return React.createElement(
				Tag,
				{
					key: ci,
					style: {
						border: '1px solid #e5e7eb',
						padding: '8px 10px',
						textAlign: 'left',
						verticalAlign: 'top',
						fontWeight: isHeader ? 600 : 400,
						background: isHeader ? '#f8fafc' : '#fff',
						fontSize: 13,
						lineHeight: 1.5
					}
				},
				parsePrdInlineText(cell)
			);
		})
	);
}

function renderPrdMarkdown(markdown) {
	var lines = String(markdown || '').split(/\r?\n/);
	var nodes = [];
	var i = 0;
	var inCode = false;
	var codeBuf = [];

	while (i < lines.length) {
		var line = lines[i];
		var trimmed = String(line || '').trim();

		if (trimmed.indexOf('```') === 0) {
			if (inCode) {
				nodes.push(
					React.createElement(
						'pre',
						{
							key: 'code-' + i,
							style: {
								margin: '12px 0',
								padding: '12px 14px',
								background: '#f6f8fa',
								border: '1px solid #e5e7eb',
								borderRadius: 8,
								fontSize: 12,
								lineHeight: 1.6,
								overflow: 'auto',
								color: '#334155',
								whiteSpace: 'pre-wrap'
							}
						},
						codeBuf.join('\n')
					)
				);
				codeBuf = [];
				inCode = false;
			} else {
				inCode = true;
			}
			i += 1;
			continue;
		}

		if (inCode) {
			codeBuf.push(line);
			i += 1;
			continue;
		}

		if (trimmed === '---') {
			nodes.push(
				React.createElement('hr', {
					key: 'hr-' + i,
					style: { border: 'none', borderTop: '1px solid #e8ecf0', margin: '20px 0' }
				})
			);
			i += 1;
			continue;
		}

		if (isPrdTableRow(trimmed)) {
			var tableLines = [];
			while (i < lines.length && isPrdTableRow(String(lines[i]).trim())) {
				tableLines.push(String(lines[i]).trim());
				i += 1;
			}
			var bodyRows = [];
			var ti;
			for (ti = 0; ti < tableLines.length; ti++) {
				if (isPrdTableSep(tableLines[ti])) continue;
				bodyRows.push(
					renderPrdTableRow(tableLines[ti], 'tr-' + i + '-' + ti, ti === 0)
				);
			}
			if (bodyRows.length) {
				nodes.push(
					React.createElement(
						'div',
						{
							key: 'tbl-' + i,
							style: { overflowX: 'auto', margin: '12px 0 16px' }
						},
						React.createElement(
							'table',
							{
								style: {
									width: '100%',
									borderCollapse: 'collapse',
									fontSize: 13
								}
							},
							React.createElement('tbody', null, bodyRows)
						)
					)
				);
			}
			continue;
		}

		if (!trimmed) {
			i += 1;
			continue;
		}

		if (trimmed.indexOf('# ') === 0) {
			nodes.push(
				React.createElement(
					'h1',
					{
						key: 'h1-' + i,
						style: {
							fontSize: 20,
							fontWeight: 700,
							color: '#0f172a',
							margin: '0 0 16px',
							lineHeight: 1.35
						}
					},
					parsePrdInlineText(trimmed.slice(2).trim())
				)
			);
			i += 1;
			continue;
		}

		if (trimmed.indexOf('## ') === 0) {
			nodes.push(
				React.createElement(
					'h2',
					{
						key: 'h2-' + i,
						style: {
							fontSize: 16,
							fontWeight: 700,
							color: '#1e293b',
							margin: '24px 0 12px',
							paddingBottom: 6,
							borderBottom: '2px solid #e0f2fe',
							lineHeight: 1.4
						}
					},
					parsePrdInlineText(trimmed.slice(3).trim())
				)
			);
			i += 1;
			continue;
		}

		if (trimmed.indexOf('### ') === 0) {
			nodes.push(
				React.createElement(
					'h3',
					{
						key: 'h3-' + i,
						style: {
							fontSize: 14,
							fontWeight: 600,
							color: '#334155',
							margin: '16px 0 8px',
							lineHeight: 1.45
						}
					},
					parsePrdInlineText(trimmed.slice(4).trim())
				)
			);
			i += 1;
			continue;
		}

		if (trimmed === '**文档结束**') {
			nodes.push(
				React.createElement(
					'div',
					{
						key: 'end-' + i,
						style: {
							marginTop: 24,
							paddingTop: 16,
							borderTop: '1px dashed #e2e8f0',
							color: '#94a3b8',
							fontSize: 13,
							textAlign: 'center'
						}
					},
					'— 文档结束 —'
				)
			);
			i += 1;
			continue;
		}

		if (/^\d+\.\s/.test(trimmed)) {
			nodes.push(
				React.createElement(
					'div',
					{
						key: 'ol-' + i,
						style: {
							fontSize: 13,
							color: '#475569',
							lineHeight: 1.75,
							margin: '6px 0 6px 4px',
							paddingLeft: 4
						}
					},
					parsePrdInlineText(trimmed)
				)
			);
			i += 1;
			continue;
		}

		if (trimmed.indexOf('- ') === 0) {
			nodes.push(
				React.createElement(
					'div',
					{
						key: 'ul-' + i,
						style: {
							display: 'flex',
							gap: 8,
							fontSize: 13,
							color: '#475569',
							lineHeight: 1.75,
							margin: '4px 0 4px 2px'
						}
					},
					React.createElement('span', { style: { color: '#1677ff', flexShrink: 0 } }, '•'),
					React.createElement('span', { style: { flex: 1 } }, parsePrdInlineText(trimmed.slice(2).trim()))
				)
			);
			i += 1;
			continue;
		}

		nodes.push(
			React.createElement(
				'p',
				{
					key: 'p-' + i,
					style: {
						fontSize: 13,
						color: '#475569',
						lineHeight: 1.75,
						margin: '6px 0'
					}
				},
				parsePrdInlineText(trimmed)
			)
		);
		i += 1;
	}

	return nodes;
}

function renderH2RequirementDocPanel() {
	var md =
		typeof H2_LEDGER_REQUIREMENT_DOC !== 'undefined' && H2_LEDGER_REQUIREMENT_DOC
			? H2_LEDGER_REQUIREMENT_DOC
			: '';
	if (!md) {
		return React.createElement(
			'div',
			{ style: { padding: 24, color: '#64748b', textAlign: 'center' } },
			'需求文档未加载，请确认已引入同目录文件：车辆氢费明细-需求内容.js'
		);
	}
	return React.createElement(
		'div',
		{ className: 'h2-req-doc-panel', style: { padding: '4px 4px 16px' } },
		renderPrdMarkdown(md)
	);
}
