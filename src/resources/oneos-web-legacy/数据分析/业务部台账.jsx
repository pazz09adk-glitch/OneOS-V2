// 【重要】必须使用 const Component 作为组件变量名
// 数据分析 - 业务部台账（多业务板块：业绩 / 成本 / 利润，按月汇总）

const Component = function () {
	var useState = React.useState;
	var useMemo = React.useMemo;
	var useCallback = React.useCallback;

	var antd = window.antd;
	var App = antd.App;
	var Card = antd.Card;
	var Button = antd.Button;
	var Table = antd.Table;
	var Select = antd.Select;
	var DatePicker = antd.DatePicker;
	var RangePicker = DatePicker.RangePicker;
	var Radio = antd.Radio;
	var Row = antd.Row;
	var Col = antd.Col;
	var Space = antd.Space;
	var Form = antd.Form;
	var Divider = antd.Divider;
	var Typography = antd.Typography;
	var message = antd.message;
	var Input = antd.Input;
	var InputNumber = antd.InputNumber;
	var Popover = antd.Popover;

	var Title = Typography.Title;

	/** 业务板块列（每列下挂：业绩、成本、利润） */
	var SECTOR_COLUMNS = [
		{ key: 'logistics', label: '物流业务' },
		{ key: 'lease', label: '租赁业务' },
		{ key: 'sales', label: '销售业务' },
		{ key: 'hydrogen', label: '氢费业务' },
		{ key: 'elec', label: '电费业务' },
		{ key: 'etc', label: 'ETC业务' },
		{ key: 'other', label: '其他' }
	];

	var ALL_DATA_KEYS = SECTOR_COLUMNS.map(function (s) { return s.key; });

	var SearchIcon = function () { return React.createElement('svg', { viewBox: '0 0 48 48', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 4 }, React.createElement('path', { d: 'M33.072 33.071c6.248-6.248 6.248-16.379 0-22.627-6.249-6.249-16.38-6.249-22.628 0-6.248 6.248-6.248 16.379 0 22.627 6.248 6.248 16.38 6.248 22.628 0Zm0 0 8.485 8.485' })); };
	var ResetIcon = function () { return React.createElement('svg', { viewBox: '0 0 48 48', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 4 }, React.createElement('path', { d: 'M38.837 18C36.463 12.136 30.715 8 24 8 15.163 8 8 15.163 8 24s7.163 16 16 16c7.455 0 13.72-5.1 15.496-12M40 8v10H30' })); };
	var DownloadIcon = function () { return React.createElement('svg', { viewBox: '0 0 48 48', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 4 }, React.createElement('path', { d: 'm33.072 22.071-9.07 9.071-9.072-9.07M24 5v26m16 4v6H8v-6' })); };
	var EditIcon = function () { return React.createElement('svg', { viewBox: '0 0 48 48', width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 4, strokeLinecap: 'butt', strokeLinejoin: 'miter' }, React.createElement('path', { d: 'M29 10l9 9L17 40H8v-9L29 10z' })); };

	function filterOption(input, option) {
		var label = (option && (option.label || option.children)) || '';
		return String(label).toLowerCase().indexOf(String(input || '').toLowerCase()) >= 0;
	}

	/** 主表金额：含 0 与负数，与设计稿一致 */
	function fmtLedgerCell(n) {
		if (n === null || n === undefined || n === '') return '';
		var x = Number(n);
		if (isNaN(x)) return '';
		return x.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	}

	function escapeCsv(v) {
		var s = v == null ? '' : String(v);
		if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1 || s.indexOf('\r') !== -1) {
			return '"' + s.replace(/"/g, '""') + '"';
		}
		return s;
	}

	function downloadCsv(filename, lines) {
		var csv = lines.map(function (row) { return row.map(escapeCsv).join(','); }).join('\n');
		var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}

	function initialYear() {
		try {
			if (window.dayjs) return window.dayjs('2026-01-01');
		} catch (e1) {}
		return null;
	}

	function numOrZero(v) {
		if (v === null || v === undefined || v === '') return 0;
		var n = Number(v);
		return isNaN(n) ? 0 : n;
	}

	function pad2(m) {
		var n = Number(m);
		if (n < 10) return '0' + n;
		return String(n);
	}

	function mockHydrogenCustomerPerf(baseMonth, baseAmount, yearApplied, filters) {
		var year = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '2026';
		var data = [];
		var customers = [
			'嘉兴古道物流有限公司', '杭州张建丽信息咨询有限公司', '嘉兴益顺冷链物流有限公司',
			'嘉兴港区众通快递有限公司', '嘉兴港区韵达快递有限公司新仓分理部', '嘉兴港区韵达快递有限公司'
		];

		var targetMonths = [];
		if (filters && filters.month) {
			targetMonths = [filters.month.month() + 1];
		} else if (baseMonth <= 12) {
			targetMonths = [baseMonth];
		} else {
			targetMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
		}

		var targetCustomer = filters && filters.customerName;

		targetMonths.forEach(function(m) {
			var monthLabel = year + '年' + m + '月';
			var monthCustomers = targetCustomer ? [targetCustomer] : customers;
			
			var monthData = [];
			monthCustomers.forEach(function(c) {
				var count = 50 + Math.floor(Math.random() * 50);
				var amountKg = count * 1.5 + Math.random() * 10;
				var totalAmount = amountKg * 30;
				
				monthData.push({
					month: m,
					monthLabel: monthLabel,
					customerName: c,
					count: count,
					amountKg: Math.round(amountKg * 100) / 100,
					totalAmount: Math.round(totalAmount * 100) / 100
				});
			});
			
			if (targetMonths.length === 1 && !targetCustomer && baseAmount) {
				var currentSum = monthData.reduce(function(sum, r) { return sum + r.totalAmount; }, 0);
				if (currentSum > 0) {
					var ratio = numOrZero(baseAmount) / currentSum;
					monthData.forEach(function(r) {
						r.totalAmount = Math.round(r.totalAmount * ratio * 100) / 100;
						r.amountKg = Math.round(r.amountKg * ratio * 100) / 100;
					});
				}
			}
			
			if (monthData.length > 0) {
				monthData[0].monthSpan = monthData.length;
				for (var i = 1; i < monthData.length; i++) {
					monthData[i].monthSpan = 0;
				}
			}
			
			data = data.concat(monthData);
		});

		data.forEach(function(item, index) {
			item.key = 'h2-perf-' + index;
		});

		return {
			rows: data,
			options: {
				customers: customers.map(function(c) { return { label: c, value: c }; })
			}
		};
	}

	var HYDROGEN_STATION_NAMES = [
		'嘉兴港区羚牛加氢站',
		'杭州余杭加氢示范站',
		'宁波北仑港加氢站',
		'上海临港加氢站',
		'绍兴滨海新区加氢站'
	];

	function hashStr(s) {
		var h = 0;
		for (var hi = 0; hi < s.length; hi++) {
			h = ((h << 5) - h) + s.charCodeAt(hi);
			h |= 0;
		}
		return Math.abs(h);
	}

	function splitCustomerRowToStations(stationNames, totalCount, totalKg, totalAmount, seedStr) {
		var n = stationNames.length;
		if (n === 0) return [];
		var tc = Math.round(numOrZero(totalCount));
		var tkg = numOrZero(totalKg);
		var tm = numOrZero(totalAmount);
		if (tc === 0 && tkg === 0 && tm === 0) return [];

		var weights = [];
		var sumW = 0;
		for (var wi = 0; wi < n; wi++) {
			var w = 0.32 + ((hashStr(seedStr + '|st|' + wi) % 680) / 1000);
			weights.push(w);
			sumW += w;
		}
		var counts = [];
		var acc = 0;
		for (var ci = 0; ci < n; ci++) {
			if (ci === n - 1) {
				counts.push(Math.max(0, tc - acc));
			} else if (tc > 0) {
				var c0 = Math.max(0, Math.floor(tc * (weights[ci] / sumW)));
				counts.push(c0);
				acc += c0;
			} else {
				counts.push(0);
			}
		}
		var rows = [];
		var remK = tkg;
		var remM = tm;
		for (var ki = 0; ki < n; ki++) {
			var ratio = tc > 0 ? (counts[ki] / tc) : (weights[ki] / sumW);
			var isLast = ki === n - 1;
			var kg = isLast ? remK : Math.round(tkg * ratio * 100) / 100;
			var money = isLast ? remM : Math.round(tm * ratio * 100) / 100;
			if (!isLast) {
				remK = Math.round((remK - kg) * 100) / 100;
				remM = Math.round((remM - money) * 100) / 100;
			}
			rows.push({
				stationName: stationNames[ki],
				count: counts[ki],
				amountKg: kg,
				totalAmount: money
			});
		}
		return rows;
	}

	function mockHydrogenStationBreakdown(customerRows, drillMode, drillCustomerName) {
		var filtered = (customerRows || []).filter(function (r) {
			if (drillMode === 'customer' && r.customerName !== drillCustomerName) return false;
			return true;
		});
		if (filtered.length === 0) {
			return {
				rows: [],
				monthLabel: '—',
				drillScopeLabel: drillMode === 'customer' ? (drillCustomerName || '—') : '全部客户'
			};
		}
		var stationOrder = {};
		HYDROGEN_STATION_NAMES.forEach(function (sn, ord) {
			stationOrder[sn] = ord;
		});
		var rawPairs = [];
		filtered.forEach(function (r) {
			var parts = splitCustomerRowToStations(
				HYDROGEN_STATION_NAMES,
				r.count,
				r.amountKg,
				r.totalAmount,
				r.customerName + '|' + r.monthLabel
			);
			parts.forEach(function (p) {
				if (numOrZero(p.count) === 0 && numOrZero(p.amountKg) === 0 && numOrZero(p.totalAmount) === 0) return;
				rawPairs.push({
					monthLabel: r.monthLabel,
					customerName: r.customerName,
					stationName: p.stationName,
					count: p.count,
					amountKg: Math.round(numOrZero(p.amountKg) * 100) / 100,
					totalAmount: Math.round(numOrZero(p.totalAmount) * 100) / 100
				});
			});
		});
		rawPairs.sort(function (a, b) {
			var m = String(a.monthLabel).localeCompare(String(b.monthLabel), 'zh');
			if (m !== 0) return m;
			var c = String(a.customerName).localeCompare(String(b.customerName), 'zh');
			if (c !== 0) return c;
			return (stationOrder[a.stationName] || 0) - (stationOrder[b.stationName] || 0);
		});
		var n = rawPairs.length;
		var i = 0;
		while (i < n) {
			var ml = rawPairs[i].monthLabel;
			var j = i + 1;
			while (j < n && rawPairs[j].monthLabel === ml) j++;
			var mlen = j - i;
			var p = i;
			while (p < j) {
				var cn = rawPairs[p].customerName;
				var q = p + 1;
				while (q < j && rawPairs[q].customerName === cn) q++;
				var clen = q - p;
				for (var t = p; t < q; t++) {
					rawPairs[t].monthSpan = t === i ? mlen : 0;
					rawPairs[t].customerSpan = t === p ? clen : 0;
				}
				p = q;
			}
			i = j;
		}
		var dataRows = rawPairs.map(function (row, idx) {
			return {
				key: 'h2-sta-' + idx + '-' + String(hashStr(row.customerName + '|' + row.stationName)),
				monthLabel: row.monthLabel,
				customerName: row.customerName,
				stationName: row.stationName,
				count: row.count,
				amountKg: row.amountKg,
				totalAmount: row.totalAmount,
				monthSpan: row.monthSpan,
				customerSpan: row.customerSpan
			};
		});
		return {
			rows: dataRows,
			monthLabel: filtered[0].monthLabel,
			drillScopeLabel: drillMode === 'customer' ? drillCustomerName : '全部客户'
		};
	}

	function mockHydrogenRefuelDetailRows(ctx, yearApplied, hydroFilterApplied, salesModal) {
		var customerName = ctx && ctx.customerName;
		var stationFilter = ctx && ctx.stationName;
		var year = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '2026';
		var monthNum = 1;
		if (hydroFilterApplied && hydroFilterApplied.month && hydroFilterApplied.month.format) {
			year = hydroFilterApplied.month.format('YYYY');
			monthNum = hydroFilterApplied.month.month() + 1;
		} else if (salesModal && salesModal.month != null && salesModal.month <= 12) {
			monthNum = salesModal.month;
		}
		if (!customerName) {
			return { rows: [] };
		}
		var daysInMonth = new Date(Number(year), monthNum, 0).getDate();
		if (daysInMonth < 1) daysInMonth = 28;
		var stationsPool = HYDROGEN_STATION_NAMES.concat(['嘉兴嘉锦亭桥北综合供能服务站']);
		var projects = ['宁波港49T*5租赁', '嘉兴大森租赁49T*3', '市区配送项目', '干线运输项目'];
		var plates = ['沪A68122F', '粤AGP3513', '浙A12345F', '沪A69864F', '苏E88888F'];
		var salespeople = ['刘念念', '尚建华', '谯云', '董剑煜'];
		var n = 10 + (hashStr(String(customerName) + '|' + String(stationFilter || '')) % 18);
		var rows = [];
		for (var i = 0; i < n; i++) {
			var day = 1 + (hashStr(String(customerName) + '|d|' + i) % daysInMonth);
			var stName = stationFilter
				? stationFilter
				: stationsPool[(hashStr(String(customerName) + '|s|' + i) % stationsPool.length)];
			var amountKg = Math.round((8 + (hashStr(String(customerName) + '|kg|' + i) % 190) / 10) * 100) / 100;
			var unitPrice = 30;
			var fee = Math.round(amountKg * unitPrice * 100) / 100;
			rows.push({
				key: 'h2-det-' + i + '-' + hashStr(String(customerName) + stName + i),
				refuelDateLabel: year + '年' + monthNum + '月' + day + '日',
				customerName: customerName,
				projectName: projects[hashStr(String(customerName) + '|p|' + i) % projects.length],
				plateNo: plates[hashStr(String(customerName) + '|pl|' + i) % plates.length],
				stationName: stName,
				amountKg: amountKg,
				unitPrice: unitPrice,
				customerFee: fee,
				salesperson: salespeople[hashStr(String(customerName) + '|sp|' + i) % salespeople.length]
			});
		}
		rows.sort(function (a, b) {
			var da = a.refuelDateLabel;
			var db = b.refuelDateLabel;
			if (da !== db) return String(da).localeCompare(String(db), 'zh');
			return String(a.stationName).localeCompare(String(b.stationName), 'zh');
		});
		return { rows: rows };
	}

	function mockCustomerSummary(month, amount, deptApplied, filterApplied, isCost, overrides) {
		var data = [
			{ dept: '业务二部', salesperson: '刘念念', customerName: '安徽驰远供应链管理有限公司', receivable: 10000, received: 8000, unreceived: 2000, vehicleCost: 5000, brokerageFee: 1000, totalCost: 6000 },
			{ dept: '业务二部', salesperson: '刘念念', customerName: '嘉兴港区韵达快递有限公司', receivable: 5000, received: 5000, unreceived: 0, vehicleCost: 2500, brokerageFee: 500, totalCost: 3000 },
			{ dept: '业务二部', salesperson: '谯云', customerName: '无锡双庙运输有限公司', receivable: 8000, received: 0, unreceived: 8000, vehicleCost: 4000, brokerageFee: 800, totalCost: 4800 },
			{ dept: '业务二部', salesperson: '尚建华', customerName: '新疆佳淇信息科技有限公司', receivable: 12000, received: 10000, unreceived: 2000, vehicleCost: 6000, brokerageFee: 1200, totalCost: 7200 },
			{ dept: '业务二部', salesperson: '尚建华', customerName: '嘉兴益顺冷链物流有限公司', receivable: 6000, received: 6000, unreceived: 0, vehicleCost: 3000, brokerageFee: 600, totalCost: 3600 },
			{ dept: '业务二部', salesperson: '尚建华', customerName: '新疆中铁黑豹物流有限公司', receivable: 9000, received: 4000, unreceived: 5000, vehicleCost: 4500, brokerageFee: 900, totalCost: 5400 },
			{ dept: '业务二部', salesperson: '董剑煜', customerName: '嘉兴必出彩供应链有限公司', receivable: 7000, received: 7000, unreceived: 0, vehicleCost: 3500, brokerageFee: 700, totalCost: 4200 }
		];
		
		var currentSum = 0;
		data.forEach(function(r) { currentSum += isCost ? r.totalCost : r.receivable; });
		var targetTotal = numOrZero(amount);
		
		if (targetTotal > 0 && currentSum > 0) {
			var ratio = targetTotal / currentSum;
			data.forEach(function(r) {
				if (isCost) {
					r.vehicleCost = Math.round(r.vehicleCost * ratio * 100) / 100;
					r.baseBrokerageFee = Math.round(r.brokerageFee * ratio * 100) / 100;
					r.brokerageFee = r.baseBrokerageFee;
					r.totalCost = Math.round((r.vehicleCost + r.brokerageFee) * 100) / 100;
				} else {
					r.receivable = Math.round(r.receivable * ratio * 100) / 100;
					r.received = Math.round(r.received * ratio * 100) / 100;
					r.unreceived = Math.round((r.receivable - r.received) * 100) / 100;
				}
			});
		} else {
			data.forEach(function(r) {
				if (isCost) {
					r.baseBrokerageFee = r.brokerageFee;
				}
			});
		}

		if (isCost && overrides) {
			data.forEach(function(r) {
				var p1BaseBF = Math.round(r.baseBrokerageFee * 0.4 * 100) / 100;
				var p2BaseBF = r.baseBrokerageFee - p1BaseBF;
				
				var sum = 0;
				var plates = ['沪A34641F', '沪A69864F', '沪A89546F', '沪A99357F'];
				var projects = [
					{ name: '市区配送项目', base: p1BaseBF },
					{ name: '干线运输项目', base: p2BaseBF }
				];
				
				projects.forEach(function(proj) {
					var projHasOverride = false;
					var projSum = 0;
					for (var i = 0; i < plates.length; i++) {
						var key = r.customerName + '|' + proj.name + '|' + plates[i];
						if (overrides[key] !== undefined) {
							projHasOverride = true;
							projSum += numOrZero(overrides[key]);
						} else {
							var count = 4;
							var plateRatio = (i === count - 1) ? 1 - (Math.floor(100/count)/100)*(count-1) : Math.floor(100/count)/100;
							projSum += Math.round(proj.base * plateRatio * 100) / 100;
						}
					}
					sum += projHasOverride ? projSum : proj.base;
				});
				
				r.brokerageFee = sum;
				r.totalCost = Math.round((r.vehicleCost + r.brokerageFee) * 100) / 100;
			});
		}

		var uniqueCustomers = [];
		data.forEach(function(r) {
			if (uniqueCustomers.indexOf(r.customerName) === -1) uniqueCustomers.push(r.customerName);
		});
		var options = {
			customers: uniqueCustomers.map(function(v) { return { label: v, value: v }; })
		};

		var filteredData = data.filter(function(r) {
			if (filterApplied && filterApplied.customerName && r.customerName !== filterApplied.customerName) return false;
			return true;
		});

		var deptSpan = {};
		var spSpan = {};
		
		filteredData.forEach(function(item, index) {
			if (isCost) {
				var p1Key = item.customerName + '|市区配送项目';
				var p2Key = item.customerName + '|干线运输项目';
				var p1BF = Math.round(item.baseBrokerageFee * 0.4 * 100) / 100;
				var p2BF = item.baseBrokerageFee - p1BF;
				
				if (overrides) {
					if (overrides[p1Key] !== undefined) p1BF = overrides[p1Key];
					if (overrides[p2Key] !== undefined) p2BF = overrides[p2Key];
				}
				
				item.brokerageFee = p1BF + p2BF;
				item.totalCost = item.vehicleCost + item.brokerageFee;
			}

			if (index === 0 || filteredData[index - 1].dept !== item.dept) {
				var count = 0;
				for (var i = index; i < filteredData.length; i++) {
					if (filteredData[i].dept === item.dept) count++;
					else break;
				}
				deptSpan[index] = count;
			} else {
				deptSpan[index] = 0;
			}
			
			if (index === 0 || filteredData[index - 1].salesperson !== item.salesperson) {
				var count = 0;
				for (var i = index; i < filteredData.length; i++) {
					if (filteredData[i].salesperson === item.salesperson) count++;
					else break;
				}
				spSpan[index] = count;
			} else {
				spSpan[index] = 0;
			}
			
			item.deptSpan = deptSpan[index];
			item.spSpan = spSpan[index];
			item.key = 'cust-sum-' + index;
		});

		return { rows: filteredData, options: options };
	}

	function mockProjectSummary(customerRecord, isCost, overrides) {
		function getProjectBrokerage(cName, pName, baseBF) {
			if (!isCost || !overrides) return baseBF;
			var plates = ['沪A34641F', '沪A69864F', '沪A89546F', '沪A99357F'];
			var hasOverride = false;
			var sum = 0;
			for (var i = 0; i < plates.length; i++) {
				var key = cName + '|' + pName + '|' + plates[i];
				if (overrides[key] !== undefined) {
					hasOverride = true;
					sum += numOrZero(overrides[key]);
				} else {
					var count = 4;
					var ratio = (i === count - 1) ? 1 - (Math.floor(100/count)/100)*(count-1) : Math.floor(100/count)/100;
					sum += Math.round(baseBF * ratio * 100) / 100;
				}
			}
			return hasOverride ? sum : baseBF;
		}

		function generateProjects(cRecord) {
			var targetReceivable = numOrZero(cRecord.receivable);
			var targetVehicleCost = numOrZero(cRecord.vehicleCost);
			var baseBrokerageFee = numOrZero(cRecord.baseBrokerageFee || cRecord.brokerageFee);
			
			var p1VC = Math.round(targetVehicleCost * 0.4 * 100) / 100;
			var p2VC = targetVehicleCost - p1VC;
			
			var p1BaseBF = Math.round(baseBrokerageFee * 0.4 * 100) / 100;
			var p2BaseBF = baseBrokerageFee - p1BaseBF;

			var p1BF = getProjectBrokerage(cRecord.customerName, '市区配送项目', p1BaseBF);
			var p2BF = getProjectBrokerage(cRecord.customerName, '干线运输项目', p2BaseBF);

			var p1Rec = Math.round(targetReceivable * 0.4 * 100) / 100;
			var p2Rec = targetReceivable - p1Rec;

			return [
				{ 
					customerName: cRecord.customerName, 
					salesperson: cRecord.salesperson, 
					projectName: '市区配送项目', 
					receivable: p1Rec, 
					received: Math.round(p1Rec * 0.8 * 100) / 100, 
					unreceived: Math.round(p1Rec * 0.2 * 100) / 100,
					vehicleCost: p1VC,
					brokerageFee: p1BF,
					totalCost: Math.round((p1VC + p1BF) * 100) / 100
				},
				{ 
					customerName: cRecord.customerName, 
					salesperson: cRecord.salesperson, 
					projectName: '干线运输项目', 
					receivable: p2Rec, 
					received: Math.round(p2Rec * 0.5 * 100) / 100, 
					unreceived: Math.round(p2Rec * 0.5 * 100) / 100,
					vehicleCost: p2VC,
					brokerageFee: p2BF,
					totalCost: Math.round((p2VC + p2BF) * 100) / 100
				}
			];
		}

		if (customerRecord.isAll) {
			var customerMap = {};
			customerRecord.sourceRows.forEach(function(r) {
				if (!customerMap[r.customerName]) {
					customerMap[r.customerName] = {
						customerName: r.customerName,
						salesperson: r.salesperson,
						receivable: 0, received: 0, unreceived: 0,
						vehicleCost: 0, brokerageFee: 0, baseBrokerageFee: 0, totalCost: 0
					};
				}
				var c = customerMap[r.customerName];
				c.receivable += numOrZero(r.receivable);
				c.received += numOrZero(r.received);
				c.unreceived += numOrZero(r.unreceived);
				c.vehicleCost += numOrZero(r.vehicleCost);
				c.brokerageFee += numOrZero(r.brokerageFee);
				c.baseBrokerageFee += numOrZero(r.baseBrokerageFee || r.brokerageFee);
				c.totalCost += numOrZero(r.totalCost);
			});
			
			var allData = [];
			Object.keys(customerMap).forEach(function(cName) {
				allData = allData.concat(generateProjects(customerMap[cName]));
			});
			
			var currentCust = null;
			var currentCustStartIndex = -1;
			allData.forEach(function(r, idx) {
				r.key = 'proj-sum-all-' + idx;
				if (r.customerName !== currentCust) {
					if (currentCustStartIndex !== -1) {
						allData[currentCustStartIndex].custSpan = idx - currentCustStartIndex;
					}
					currentCust = r.customerName;
					currentCustStartIndex = idx;
					r.custSpan = 1;
				} else {
					r.custSpan = 0;
				}
			});
			if (currentCustStartIndex !== -1) {
				allData[currentCustStartIndex].custSpan = allData.length - currentCustStartIndex;
			}
			return allData;
		} else {
			var data = generateProjects(customerRecord);
			data.forEach(function(item, index) {
				item.custSpan = index === 0 ? data.length : 0;
				item.key = 'proj-sum-' + index;
			});
			return data;
		}
	}

	function mockLeaseOrderDrill(month, amount, deptApplied, deptOptions, yearApplied, drillFilterApplied, detailProject, isCost, overrides) {
		var year = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '2026';
		var billCycle;
		if (month === 13) {
			billCycle = year + '.01.01-' + year + '.12.31';
		} else {
			var mStr = pad2(month);
			var daysInMonth = new Date(year, month, 0).getDate();
			billCycle = year + '.' + mStr + '.01-' + year + '.' + mStr + '.' + daysInMonth;
		}
		
		var rows = [];
		var plates = ['沪A34641F', '沪A69864F', '沪A89546F', '沪A99357F'];
		var count = 4;

		function generateRowsForProject(proj, idxOffset) {
			var targetTotal = proj ? numOrZero(isCost ? proj.totalCost : proj.receivable) : numOrZero(amount);
			var targetVehicleCost = proj ? numOrZero(proj.vehicleCost) : targetTotal * 0.9;
			var targetBrokerageFee = proj ? numOrZero(proj.baseBrokerageFee || proj.brokerageFee) : targetTotal * 0.1;
			
			for (var i = 0; i < count; i++) {
				var ratio = (i === count - 1) ? 1 - (Math.floor(100/count)/100)*(count-1) : Math.floor(100/count)/100;
				var rReceivable = Math.round(targetTotal * ratio * 100) / 100;
				var rVehicleCost = Math.round(targetVehicleCost * ratio * 100) / 100;
				var rBrokerageFee = Math.round(targetBrokerageFee * ratio * 100) / 100;
				
				var plateNo = plates[i] || ('沪A' + Math.floor(10000 + Math.random() * 90000) + 'F');
				var custName = proj ? proj.customerName : '测试客户' + (i + 1);
				var projName = proj ? proj.projectName : '测试项目' + (i + 1);
				var orderKey = custName + '|' + projName + '|' + plateNo;
				if (isCost && overrides && overrides[orderKey] !== undefined) {
					rBrokerageFee = numOrZero(overrides[orderKey]);
				}
				
				rows.push({
					key: 'drill-' + idxOffset + '-' + i,
					billCycle: billCycle,
					billInstallment: '第' + (i+1) + '期/共12期',
					plateNo: plateNo,
					brand: '苏龙',
					vehicleModel: '海格牌18吨双飞翼货车',
					salesperson: proj ? proj.salesperson : '业务员' + (i + 1),
					nature: i % 2 === 0 ? '租赁' : '试用',
					customerName: custName,
					projectName: projName,
					contractDate: '2025.12.1-2026.11.30',
					pickupDate: '2026.01.01',
					deposit: '/',
					receivable: rReceivable,
					received: null,
					unreceived: rReceivable,
					naturalMonthIncome: rReceivable,
					vehicleCost: rVehicleCost,
					brokerageFee: rBrokerageFee,
					totalCost: Math.round((rVehicleCost + rBrokerageFee) * 100) / 100,
					paymentDate: '2026.01.01',
					payMethod: '预付',
					payCycle: '1个月'
				});
			}
		}

		if (detailProject && detailProject.isAll) {
			detailProject.sourceRows.forEach(function(proj, idx) {
				generateRowsForProject(proj, idx);
			});
		} else {
			generateRowsForProject(detailProject, 0);
		}
		
		var uniqueSalespersons = [];
		var uniqueCustomers = [];
		var uniquePlateNos = [];
		rows.forEach(function(r) {
			if (uniqueSalespersons.indexOf(r.salesperson) === -1) uniqueSalespersons.push(r.salesperson);
			if (uniqueCustomers.indexOf(r.customerName) === -1) uniqueCustomers.push(r.customerName);
			if (uniquePlateNos.indexOf(r.plateNo) === -1) uniquePlateNos.push(r.plateNo);
		});
		var options = {
			salespersons: uniqueSalespersons.map(function(v) { return { label: v, value: v }; }),
			customers: uniqueCustomers.map(function(v) { return { label: v, value: v }; }),
			plateNos: uniquePlateNos.map(function(v) { return { label: v, value: v }; })
		};

		var sumReceivable = 0, sumReceived = 0, sumUnreceived = 0, sumNatural = 0, sumVehicleCost = 0, sumBrokerageFee = 0, sumTotalCost = 0;
		
		// 应用筛选条件
		var filteredRows = rows.filter(function(r) {
			if (drillFilterApplied.salesperson && r.salesperson !== drillFilterApplied.salesperson) return false;
			if (drillFilterApplied.customerName && r.customerName !== drillFilterApplied.customerName) return false;
			if (drillFilterApplied.nature && r.nature !== drillFilterApplied.nature) return false;
			if (drillFilterApplied.plateNo && r.plateNo !== drillFilterApplied.plateNo) return false;
			if (drillFilterApplied.paymentDate && drillFilterApplied.paymentDate.length === 2) {
				var start = drillFilterApplied.paymentDate[0].format('YYYY.MM.DD');
				var end = drillFilterApplied.paymentDate[1].format('YYYY.MM.DD');
				if (r.paymentDate < start || r.paymentDate > end) return false;
			}
			return true;
		});

		filteredRows.forEach(function(r) {
			sumReceivable += r.receivable;
			sumReceived += numOrZero(r.received);
			sumUnreceived += r.unreceived;
			sumNatural += r.naturalMonthIncome;
			sumVehicleCost += numOrZero(r.vehicleCost);
			sumBrokerageFee += numOrZero(r.brokerageFee);
			sumTotalCost += numOrZero(r.totalCost);
		});

		return {
			rows: filteredRows,
			options: options,
			totals: {
				receivable: sumReceivable,
				received: sumReceived,
				unreceived: sumUnreceived,
				naturalMonthIncome: sumNatural,
				vehicleCost: sumVehicleCost,
				brokerageFee: sumBrokerageFee,
				totalCost: sumTotalCost
			}
		};
	}

	function mockLeaseOrderDetail(ym, deptName, salesperson, amount) {
		var totalAmount = numOrZero(amount);
		var rows = [];
		var isAll = deptName === '全部';
		var depts = ['业务二部', '华东业务部', '华南业务部'];
		var names = ['尚建华', '刘念念', '谯云'];
		var n = isAll ? 6 : 3;
		var sumDeposit = 0, sumVehicle = 0, sumAdditional = 0, sumTotal = 0, sumReceived = 0, sumUnreceived = 0;
		
		for (var i = 0; i < n; i++) {
			var ratio = (i === n - 1) ? 1 - (Math.floor(100/n)/100)*(n-1) : Math.floor(100/n)/100;
			var rTotal = Math.round(totalAmount * ratio * 100) / 100;
			var rDeposit = Math.round(rTotal * 0.1 * 100) / 100;
			var rVehicle = Math.round(rTotal * 0.8 * 100) / 100;
			var rAdditional = Math.round((rTotal - rDeposit - rVehicle) * 100) / 100;
			var rReceived = Math.round(rTotal * 0.6 * 100) / 100;
			var rUnreceived = Math.round((rTotal - rReceived) * 100) / 100;

			var curDept = isAll ? depts[Math.floor(i / 2) % depts.length] : deptName;
			var curName = isAll ? names[Math.floor(i / 2) % names.length] : salesperson;
			
			// For "全部", we span 2 rows for each person. For specific person, we span n rows for the first one.
			var rowSpan = 0;
			if (isAll) {
				rowSpan = (i % 2 === 0) ? 2 : 0;
			} else {
				rowSpan = (i === 0) ? n : 0;
			}

			rows.push({
				key: 'detail-' + i,
				ym: ym,
				deptName: curDept,
				salesperson: curName,
				billDate: ym + '-15',
				plateNo: '浙A' + (10000 + i),
				vehicleModel: 'XL-100',
				customerName: '测试客户' + (i + 1),
				contractDate: '2026-01-01至2027-01-01',
				pickupDate: '2026-01-05',
				payMethod: i % 2 === 0 ? '预付' : '后付',
				payCycle: '1个月',
				billCalcMethod: '自然月',
				actualDays: '30天',
				depositAmount: rDeposit,
				vehicleAmount: rVehicle,
				additionalAmount: rAdditional,
				totalAmount: rTotal,
				receivedAmount: rReceived,
				unreceivedAmount: rUnreceived,
				groupRowSpan: rowSpan,
				monthRowSpan: i === 0 ? n : 0
			});
			sumDeposit += rDeposit;
			sumVehicle += rVehicle;
			sumAdditional += rAdditional;
			sumTotal += rTotal;
			sumReceived += rReceived;
			sumUnreceived += rUnreceived;
		}
		return {
			rows: rows,
			totals: {
				deposit: sumDeposit,
				vehicle: sumVehicle,
				additional: sumAdditional,
				total: sumTotal,
				received: sumReceived,
				unreceived: sumUnreceived
			}
		};
	}

	/** 计算单行横向合计：业绩合计 / 成本合计 / 利润合计 */
	function calcRowTotals(r) {
		var metrics = ['Perf', 'Cost', 'Profit'];
		metrics.forEach(function (m) {
			var rowSum = ALL_DATA_KEYS.reduce(function (acc, k) { return acc + numOrZero(r[k + m]); }, 0);
			r['rowTotal' + m] = rowSum === 0 ? null : rowSum;
		});
		return r;
	}

	/** 纵向（全年）合计行 */
	function sumLedgerRows(monthRows) {
		var acc = { month: 13, monthLabel: '合计', rowType: 'total', key: 'total' };
		var metrics = ['Perf', 'Cost', 'Profit'];
		var allKeys = ALL_DATA_KEYS.concat(['rowTotal']);

		allKeys.forEach(function (k) {
			metrics.forEach(function (m) {
				acc[k + m] = 0;
			});
		});

		(monthRows || []).forEach(function (r) {
			allKeys.forEach(function (k) {
				metrics.forEach(function (m) {
					acc[k + m] += numOrZero(r[k + m]);
				});
			});
		});

		allKeys.forEach(function (k) {
			metrics.forEach(function (m) {
				if (acc[k + m] === 0) acc[k + m] = null;
			});
		});
		return acc;
	}

	function buildMockYear2026() {
		var rows = [];
		var i;
		for (i = 1; i <= 12; i++) {
			var logisticsPerf = 800000 + Math.random() * 400000;
			var logisticsCost = logisticsPerf * (0.9 + Math.random() * 0.2);
			
			var leasePerf = 200000 + Math.random() * 100000;
			var leaseCost = leasePerf * (0.8 + Math.random() * 0.15);
			
			var salesPerf = 40000 + Math.random() * 60000;
			var salesCost = salesPerf * (0.7 + Math.random() * 0.2);
			
			var hydrogenPerf = 100000 + Math.random() * 50000;
			var hydrogenCost = hydrogenPerf * (0.85 + Math.random() * 0.1);
			
			var elecPerf = 3000 + Math.random() * 2000;
			var elecCost = elecPerf * (0.4 + Math.random() * 0.3);
			
			var etcPerf = 60000 + Math.random() * 30000;
			var etcCost = etcPerf;
			
			var otherPerf = 5000 + Math.random() * 10000;
			var otherCost = otherPerf * (0.6 + Math.random() * 0.3);

			var src = {
				logisticsPerf: Math.round(logisticsPerf * 100) / 100,
				logisticsCost: Math.round(logisticsCost * 100) / 100,
				logisticsProfit: Math.round((logisticsPerf - logisticsCost) * 100) / 100,
				
				leasePerf: Math.round(leasePerf * 100) / 100,
				leaseCost: Math.round(leaseCost * 100) / 100,
				leaseProfit: Math.round((leasePerf - leaseCost) * 100) / 100,
				
				salesPerf: Math.round(salesPerf * 100) / 100,
				salesCost: Math.round(salesCost * 100) / 100,
				salesProfit: Math.round((salesPerf - salesCost) * 100) / 100,
				
				hydrogenPerf: Math.round(hydrogenPerf * 100) / 100,
				hydrogenCost: Math.round(hydrogenCost * 100) / 100,
				hydrogenProfit: Math.round((hydrogenPerf - hydrogenCost) * 100) / 100,
				
				elecPerf: Math.round(elecPerf * 100) / 100,
				elecCost: Math.round(elecCost * 100) / 100,
				elecProfit: Math.round((elecPerf - elecCost) * 100) / 100,
				
				etcPerf: Math.round(etcPerf * 100) / 100,
				etcCost: Math.round(etcCost * 100) / 100,
				etcProfit: 0,
				
				otherPerf: Math.round(otherPerf * 100) / 100,
				otherCost: Math.round(otherCost * 100) / 100,
				otherProfit: Math.round((otherPerf - otherCost) * 100) / 100
			};
			
			var row = { key: 'm' + i, month: i, monthLabel: i, rowType: 'month' };
			ALL_DATA_KEYS.forEach(function (k) {
				['Perf', 'Cost', 'Profit'].forEach(function (m) {
					var v = src[k + m];
					row[k + m] = v !== undefined && v !== null ? v : null;
				});
			});
			calcRowTotals(row);
			rows.push(row);
		}
		rows.push(sumLedgerRows(rows));
		return rows;
	}

	var layoutStyle = {
		padding: '16px 24px 24px',
		minHeight: '100vh',
		background: 'linear-gradient(165deg, #eef4ff 0%, #f5f7fa 42%, #f0f2f5 100%)'
	};
	var filterLabelStyle = { marginBottom: 6, fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 500 };
	var filterItemStyle = { marginBottom: 12 };
	var filterControlStyle = { width: '100%' };
	var filterActionsColStyle = { flex: '0 0 auto', marginLeft: 'auto' };

	var filterCardStyle = {
		marginBottom: 20,
		borderRadius: 16,
		boxShadow: '0 4px 20px -4px rgba(16,24,40,0.03), 0 0 0 1px rgba(16,24,40,0.06)',
		border: 'none',
		background: '#ffffff'
	};

	var tableCardStyle = {
		borderRadius: 16,
		boxShadow: '0 10px 32px -4px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
		border: 'none',
		background: '#ffffff',
		overflow: 'hidden'
	};

	var ledgerTableStyle =
		'.biz-standbook-table-wrap{border-radius:12px;overflow:hidden;box-shadow:0 4px 24px -6px rgba(15,23,42,0.05),0 0 0 1px rgba(22,119,255,0.1)}' +
		'.biz-standbook-table .ant-table-thead>tr>th{white-space:nowrap;color:#1e293b!important;font-weight:600!important;font-size:13px!important;' +
		'background:#f8fafc!important;border-bottom:1px solid #e2e8f0!important;border-inline-end:1px solid #f1f5f9!important;padding:0 8px!important;height:38px!important;transition:background 0.2s}' +
		'.biz-standbook-table .ant-table-thead>tr:first-child>th{text-align:center;background:#f1f5f9!important;color:#0f172a!important;font-size:14px!important;border-bottom:2px solid #e2e8f0!important}' +
		'.biz-standbook-table .ant-table-tbody>tr:not(.ant-table-measure-row)>td{white-space:nowrap;font-variant-numeric:tabular-nums;color:#334155;border-bottom:1px solid #f1f5f9!important;border-inline-end:1px solid #f8fafc!important;padding:0 8px!important;height:38px!important}' +
		'.biz-standbook-table .ant-table-tbody>tr.biz-row-month:hover>td{background:#f0f9ff!important;color:#0f172a}' +
		'.biz-standbook-table .ant-table-tbody>tr[data-row-key=\"total\"]>td{font-weight:700;background:#f8fafc!important;color:#0f172a!important;border-top:2px solid #cbd5e1!important;border-bottom:none!important}' +
		'.biz-standbook-table .ant-table-summary>tr>td{font-weight:700;background:#f8fafc!important;color:#0f172a!important;border-top:2px solid #cbd5e1!important;border-bottom:none!important;border-inline-end:1px solid #f1f5f9!important;padding:0 8px!important;height:38px!important}' +
		'.biz-standbook-perf-link{cursor:pointer;color:#0ea5e9;padding:4px 8px;margin:-4px -8px;border:none;background:transparent;font:inherit;border-radius:6px;transition:all 0.2s}' +
		'.biz-standbook-perf-link:hover{color:#0284c7;background:#e0f2fe}' +
		'.biz-standbook-perf-link:focus{outline:2px solid #38bdf8;outline-offset:2px}' +
		'@media (prefers-reduced-motion:reduce){.biz-standbook-table .ant-table-tbody>tr,.biz-standbook-perf-link{transition:none}}';

	var deptOptions = useMemo(function () {
		return [
			{ value: '业务二部', label: '业务二部' },
			{ value: '华东业务部', label: '华东业务部' },
			{ value: '华南业务部', label: '华南业务部' },
			{ value: '华北业务部', label: '华北业务部' },
			{ value: '西南业务部', label: '西南业务部' }
		];
	}, []);

	var yearDraftState = useState(initialYear);
	var yearDraft = yearDraftState[0];
	var setYearDraft = yearDraftState[1];

	var yearAppliedState = useState(initialYear);
	var yearApplied = yearAppliedState[0];
	var setYearApplied = yearAppliedState[1];

	/** 业务部多选：空数组表示「全部」 */
	var deptDraftState = useState([]);
	var deptDraft = deptDraftState[0];
	var setDeptDraft = deptDraftState[1];

	var deptAppliedState = useState([]);
	var deptApplied = deptAppliedState[0];
	var setDeptApplied = deptAppliedState[1];

	var metricState = useState('Perf');
	var metricType = metricState[0];
	var setMetricType = metricState[1];

	var viewState = useState('main');
	var view = viewState[0];
	var setView = viewState[1];

	var salesModalState = useState({ month: null, monthLabel: '', amount: null, cellType: 'Perf' });
	var salesModal = salesModalState[0];
	var setSalesModal = salesModalState[1];

	var salesDetailModalState = useState({ ym: '', deptName: '', salesperson: '', amount: null });
	var salesDetailModal = salesDetailModalState[0];
	var setSalesDetailModal = salesDetailModalState[1];

	var drillFilterDraftState = useState({ salesperson: undefined, customerName: undefined, nature: undefined, plateNo: undefined, paymentDate: null });
	var drillFilterDraft = drillFilterDraftState[0];
	var setDrillFilterDraft = drillFilterDraftState[1];

	var drillFilterAppliedState = useState({ salesperson: undefined, customerName: undefined, nature: undefined, plateNo: undefined, paymentDate: null });
	var drillFilterApplied = drillFilterAppliedState[0];
	var setDrillFilterApplied = drillFilterAppliedState[1];

	var hydroFilterDraftState = useState({ month: null, customerName: undefined });
	var hydroFilterDraft = hydroFilterDraftState[0];
	var setHydroFilterDraft = hydroFilterDraftState[1];

	var hydroFilterAppliedState = useState({ month: null, customerName: undefined });
	var hydroFilterApplied = hydroFilterAppliedState[0];
	var setHydroFilterApplied = hydroFilterAppliedState[1];

	var hydroStationDrillState = useState({ mode: 'all', customerName: null });
	var hydroStationDrill = hydroStationDrillState[0];
	var setHydroStationDrill = hydroStationDrillState[1];

	var hydroRefuelDetailCtxState = useState({ customerName: '', stationName: null });
	var hydroRefuelDetailCtx = hydroRefuelDetailCtxState[0];
	var setHydroRefuelDetailCtx = hydroRefuelDetailCtxState[1];

	var custSumFilterDraftState = useState({ customerName: undefined });
	var custSumFilterDraft = custSumFilterDraftState[0];
	var setCustSumFilterDraft = custSumFilterDraftState[1];

	var custSumFilterAppliedState = useState({ customerName: undefined });
	var custSumFilterApplied = custSumFilterAppliedState[0];
	var setCustSumFilterApplied = custSumFilterAppliedState[1];

	var detailCustomerState = useState(null);
	var detailCustomer = detailCustomerState[0];
	var setDetailCustomer = detailCustomerState[1];

	var detailProjectState = useState(null);
	var detailProject = detailProjectState[0];
	var setDetailProject = detailProjectState[1];

	var editingBrokerageState = useState(null);
	var editingBrokerage = editingBrokerageState[0];
	var setEditingBrokerage = editingBrokerageState[1];

	var brokerageFeeOverridesState = useState({});
	var brokerageFeeOverrides = brokerageFeeOverridesState[0];
	var setBrokerageFeeOverrides = brokerageFeeOverridesState[1];

	var brokerageBatchPopoverOpenState = useState(false);
	var brokerageBatchPopoverOpen = brokerageBatchPopoverOpenState[0];
	var setBrokerageBatchPopoverOpen = brokerageBatchPopoverOpenState[1];

	var brokerageBatchInputState = useState(null);
	var brokerageBatchInput = brokerageBatchInputState[0];
	var setBrokerageBatchInput = brokerageBatchInputState[1];

	var dataSource = useMemo(function () {
		var y = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : '';
		if (y === '2026') return buildMockYear2026();
		return [];
	}, [yearApplied]);

	var tableTitle = useMemo(function () {
		return '浙江羚牛氢能业务部汇总台账';
	}, []);

	var deptDisplayLabel = useMemo(function () {
		if (!deptApplied || deptApplied.length === 0) return '全部';
		return deptApplied.map(function (v) {
			var o = deptOptions.find(function (x) { return x.value === v; });
			return o ? o.label : v;
		}).join('、');
	}, [deptApplied, deptOptions]);

	var timeDisplayLabel = useMemo(function () {
		return yearApplied && yearApplied.format ? yearApplied.format('YYYY年') : '—';
	}, [yearApplied]);

	var handleQuery = useCallback(function () {
		setYearApplied(yearDraft);
		setDeptApplied(deptDraft);
	}, [yearDraft, deptDraft]);

	var handleReset = useCallback(function () {
		var y0 = initialYear();
		setYearDraft(y0);
		setYearApplied(y0);
		setDeptDraft([]);
		setDeptApplied([]);
	}, []);

	var handleDrillQuery = useCallback(function () {
		setDrillFilterApplied(drillFilterDraft);
	}, [drillFilterDraft]);

	var handleDrillReset = useCallback(function () {
		var empty = { salesperson: undefined, customerName: undefined, nature: undefined, plateNo: undefined, paymentDate: null };
		setDrillFilterDraft(empty);
		setDrillFilterApplied(empty);
	}, []);

	var handleCustSumQuery = useCallback(function () {
		setCustSumFilterApplied(custSumFilterDraft);
	}, [custSumFilterDraft]);

	var handleCustSumReset = useCallback(function () {
		var empty = { customerName: undefined };
		setCustSumFilterDraft(empty);
		setCustSumFilterApplied(empty);
	}, []);

	var openProjectSummary = useCallback(function (record) {
		setDetailCustomer(record);
		setView('projectSummary');
	}, []);

	var openProjectDetail = useCallback(function (record) {
		setDetailProject(record);
		setView('sales');
	}, []);

	var openHydrogenDrill = useCallback(function (row, amount, hydrogenAsCost) {
		if (amount === null || amount === undefined || amount === '' || numOrZero(amount) === 0) {
			message.warning('该单元格无数据');
			return;
		}
		setSalesModal({
			month: row.month,
			monthLabel: row.monthLabel,
			amount: amount,
			cellType: hydrogenAsCost ? 'HydrogenCost' : 'HydrogenPerf'
		});
		var initialMonth = row.month <= 12 && yearApplied && yearApplied.format ? dayjs(yearApplied.format('YYYY') + '-' + pad2(row.month) + '-01') : null;
		var resetState = { month: initialMonth, customerName: undefined };
		setHydroFilterDraft(resetState);
		setHydroFilterApplied(resetState);
		setView('hydrogenCustomerPerf');
	}, [yearApplied]);

	var openHydroStationDrillByCustomer = useCallback(function (record) {
		setHydroStationDrill({ mode: 'customer', customerName: record.customerName });
		setView('hydrogenStationDrill');
	}, []);

	var openHydroStationDrillAllStations = useCallback(function () {
		setHydroStationDrill({ mode: 'all', customerName: null });
		setView('hydrogenStationDrill');
	}, []);

	var openHydroRefuelDetailByCustomer = useCallback(function (customerName) {
		if (!customerName) return;
		setHydroRefuelDetailCtx({ customerName: customerName, stationName: null });
		setView('hydrogenRefuelDetail');
	}, []);

	var openHydroRefuelDetailByStationRow = useCallback(function (record) {
		if (!record || !record.customerName || !record.stationName) return;
		setHydroRefuelDetailCtx({ customerName: record.customerName, stationName: record.stationName });
		setView('hydrogenRefuelDetail');
	}, []);

	var openLeaseDrill = useCallback(function (row, cellKey, amount) {
		if (cellKey !== 'leasePerf' && cellKey !== 'leaseCost') return;
		if (amount === null || amount === undefined || amount === '' || numOrZero(amount) === 0) {
			message.warning('该单元格无数据');
			return;
		}
		setSalesModal({
			month: row.month,
			monthLabel: row.monthLabel,
			amount: amount,
			cellType: cellKey === 'leasePerf' ? 'Perf' : 'Cost'
		});
		setDetailCustomer(null);
		setDetailProject(null);
		setView('customerSummary');
	}, []);

	var openDetailDrill = useCallback(function (row, amount) {
		setSalesDetailModal({
			ym: row.ym,
			deptName: row.deptName,
			salesperson: row.salesperson,
			amount: amount
		});
		setView('sales_detail');
	}, []);

	var drillPayload = useMemo(function () {
		if (view !== 'sales' || salesModal.month == null) {
			return { rows: [], options: { salespersons: [], customers: [], plateNos: [] }, totals: { receivable: 0, received: 0, unreceived: 0, naturalMonthIncome: 0, vehicleCost: 0, brokerageFee: 0, totalCost: 0 } };
		}
		return mockLeaseOrderDrill(salesModal.month, salesModal.amount, deptApplied, deptOptions, yearApplied, drillFilterApplied, detailProject, salesModal.cellType === 'Cost', brokerageFeeOverrides);
	}, [view, salesModal, deptApplied, deptOptions, yearApplied, drillFilterApplied, detailProject, brokerageFeeOverrides]);

	var applyBrokerageBatch = useCallback(function () {
		if (brokerageBatchInput === null || brokerageBatchInput === undefined || brokerageBatchInput === '') {
			message.warning('请填写居间费批量设置');
			return;
		}
		var num = Number(brokerageBatchInput);
		if (isNaN(num)) {
			message.warning('请输入有效数字');
			return;
		}
		var val = Math.round(num * 100) / 100;
		if (view !== 'sales' || salesModal.cellType !== 'Cost') {
			setBrokerageBatchPopoverOpen(false);
			setBrokerageBatchInput(null);
			return;
		}
		var rows = drillPayload.rows || [];
		if (rows.length === 0) {
			message.warning('当前无数据');
			return;
		}
		var next = Object.assign({}, brokerageFeeOverrides);
		rows.forEach(function (r) {
			var compositeKey = r.customerName + '|' + r.projectName + '|' + r.plateNo;
			next[compositeKey] = val;
		});
		setBrokerageFeeOverrides(next);
		setEditingBrokerage(null);
		setBrokerageBatchPopoverOpen(false);
		setBrokerageBatchInput(null);
		message.success('已批量设置居间费');
	}, [brokerageBatchInput, view, salesModal, drillPayload.rows, brokerageFeeOverrides]);

	var hydrogenCustomerPerfPayload = useMemo(function () {
		if (view !== 'hydrogenCustomerPerf' || salesModal.month == null) {
			return { rows: [], options: { customers: [] } };
		}
		return mockHydrogenCustomerPerf(salesModal.month, salesModal.amount, yearApplied, hydroFilterApplied);
	}, [view, salesModal, yearApplied, hydroFilterApplied]);

	var hydrogenStationDrillPayload = useMemo(function () {
		if (view !== 'hydrogenStationDrill' || salesModal.month == null) {
			return { rows: [], monthLabel: '—', drillScopeLabel: '全部客户' };
		}
		var customerRows = mockHydrogenCustomerPerf(salesModal.month, salesModal.amount, yearApplied, hydroFilterApplied).rows;
		return mockHydrogenStationBreakdown(customerRows, hydroStationDrill.mode, hydroStationDrill.customerName);
	}, [view, salesModal, yearApplied, hydroFilterApplied, hydroStationDrill]);

	var hydrogenRefuelDetailPayload = useMemo(function () {
		if (view !== 'hydrogenRefuelDetail' || salesModal.month == null) {
			return { rows: [] };
		}
		return mockHydrogenRefuelDetailRows(hydroRefuelDetailCtx, yearApplied, hydroFilterApplied, salesModal);
	}, [view, salesModal, yearApplied, hydroFilterApplied, hydroRefuelDetailCtx]);

	var customerSummaryPayload = useMemo(function () {
		if (view !== 'customerSummary' || salesModal.month == null) {
			return { rows: [], options: { customers: [] } };
		}
		return mockCustomerSummary(salesModal.month, salesModal.amount, deptApplied, custSumFilterApplied, salesModal.cellType === 'Cost', brokerageFeeOverrides);
	}, [view, salesModal, deptApplied, custSumFilterApplied, brokerageFeeOverrides]);

	var projectSummaryPayload = useMemo(function () {
		if (view !== 'projectSummary' || !detailCustomer) {
			return [];
		}
		return mockProjectSummary(detailCustomer, salesModal.cellType === 'Cost', brokerageFeeOverrides);
	}, [view, detailCustomer, salesModal, brokerageFeeOverrides]);

	var drillColumns = useMemo(function () {
		var isCost = salesModal.cellType === 'Cost';
		var cols = [
			{ title: '账单周期', dataIndex: 'billCycle', key: 'billCycle', width: 160, align: 'center' },
			{ title: '账单期数', dataIndex: 'billInstallment', key: 'billInstallment', width: 120, align: 'center' },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 100, align: 'center' },
			{ title: '品牌', dataIndex: 'brand', key: 'brand', width: 80, align: 'center' },
			{ title: '型号', dataIndex: 'vehicleModel', key: 'vehicleModel', width: 180, align: 'center' },
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', width: 80, align: 'center' },
			{ title: '性质', dataIndex: 'nature', key: 'nature', width: 80, align: 'center' },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 220, align: 'center' },
			{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 160, align: 'center' },
			{ title: '合同有效期', dataIndex: 'contractDate', key: 'contractDate', width: 160, align: 'center' },
			{ title: '提车日期', dataIndex: 'pickupDate', key: 'pickupDate', width: 100, align: 'center' }
		];

		if (isCost) {
			var handleBrokerageBatchPopoverChange = function (nextOpen) {
				setBrokerageBatchPopoverOpen(nextOpen);
				if (!nextOpen) setBrokerageBatchInput(null);
			};
			var brokerageBatchPopoverContent = React.createElement('div', { style: { minWidth: 268 } },
				React.createElement('div', { style: { marginBottom: 12, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
					React.createElement('span', { style: { color: '#ff4d4f' } }, '*'),
					React.createElement('span', { style: { fontSize: 14 } }, '居间费批量设置'),
					React.createElement(InputNumber, {
						min: 0,
						precision: 2,
						step: 0.01,
						controls: true,
						value: brokerageBatchInput,
						onChange: function (val) { setBrokerageBatchInput(val); },
						placeholder: '请输入',
						style: { width: 150 }
					})
				),
				React.createElement(Space, { size: 'small' },
					React.createElement(Button, { type: 'primary', size: 'small', onClick: applyBrokerageBatch }, '确认'),
					React.createElement(Button, { size: 'small', onClick: function () { setBrokerageBatchPopoverOpen(false); setBrokerageBatchInput(null); } }, '关闭')
				)
			);
			var brokerageColumnTitle = React.createElement('div', { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 } },
				React.createElement('span', null, '居间费'),
				React.createElement(Popover, {
					trigger: 'click',
					placement: 'bottomRight',
					content: brokerageBatchPopoverContent,
					open: brokerageBatchPopoverOpen,
					visible: brokerageBatchPopoverOpen,
					onOpenChange: handleBrokerageBatchPopoverChange,
					onVisibleChange: handleBrokerageBatchPopoverChange
				}, React.createElement('span', {
					role: 'button',
					tabIndex: 0,
					style: { cursor: 'pointer', color: '#0ea5e9', display: 'inline-flex', alignItems: 'center' },
					'aria-label': '批量设置居间费'
				}, React.createElement(EditIcon, null)))
			);
			cols.push(
				{ title: '车辆成本', dataIndex: 'vehicleCost', key: 'vehicleCost', width: 100, align: 'right', render: function(v){ return fmtLedgerCell(v); } },
				{
					title: brokerageColumnTitle,
					dataIndex: 'brokerageFee',
					key: 'brokerageFee',
					width: 120,
					align: 'right',
					render: function (v, record) {
						if (record.rowType === 'total') return fmtLedgerCell(v);
						var compositeKey = record.customerName + '|' + record.projectName + '|' + record.plateNo;
						var isEditing = editingBrokerage && editingBrokerage.key === compositeKey;
						if (isEditing) {
							return React.createElement(InputNumber, {
								autoFocus: true,
								value: editingBrokerage.value,
								onChange: function(val) { setEditingBrokerage({ key: compositeKey, value: val }); },
								onBlur: function() {
									setBrokerageFeeOverrides(Object.assign({}, brokerageFeeOverrides, { [compositeKey]: editingBrokerage.value }));
									setEditingBrokerage(null);
								},
								onPressEnter: function() {
									setBrokerageFeeOverrides(Object.assign({}, brokerageFeeOverrides, { [compositeKey]: editingBrokerage.value }));
									setEditingBrokerage(null);
								},
								style: { width: 100 }
							});
						}
						return React.createElement('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 } },
							fmtLedgerCell(v),
							React.createElement('span', { 
								style: { cursor: 'pointer', color: '#165dff', display: 'flex', alignItems: 'center' },
								onClick: function() { setEditingBrokerage({ key: compositeKey, value: v }); }
							}, React.createElement(EditIcon, null))
						);
					}
				},
				{ title: '总成本', dataIndex: 'totalCost', key: 'totalCost', width: 100, align: 'right', render: function(v){ return fmtLedgerCell(v); } }
			);
		} else {
			cols.push(
				{ title: '应收', dataIndex: 'receivable', key: 'receivable', width: 100, align: 'right', render: function(v){ return fmtLedgerCell(v); } },
				{ title: '实收', dataIndex: 'received', key: 'received', width: 100, align: 'right', render: function(v){ return fmtLedgerCell(v); } },
				{ title: '未收', dataIndex: 'unreceived', key: 'unreceived', width: 100, align: 'right', render: function(v){ return React.createElement('span', { style: { color: '#f53f3f' } }, fmtLedgerCell(v)); } },
				{ title: '自然月收入', dataIndex: 'naturalMonthIncome', key: 'naturalMonthIncome', width: 100, align: 'right', render: function(v){ return fmtLedgerCell(v); } },
				{ title: '付款日期', dataIndex: 'paymentDate', key: 'paymentDate', width: 100, align: 'center' },
				{ title: '付款方式', dataIndex: 'payMethod', key: 'payMethod', width: 80, align: 'center' },
				{ title: '付款周期', dataIndex: 'payCycle', key: 'payCycle', width: 80, align: 'center' }
			);
		}
		return cols;
	}, [salesModal.cellType, detailProject, editingBrokerage, brokerageFeeOverrides, brokerageBatchPopoverOpen, brokerageBatchInput, applyBrokerageBatch]);

	var detailPayload = useMemo(function () {
		if (view !== 'sales_detail' || salesDetailModal.ym == null) {
			return { rows: [], totals: { deposit: 0, vehicle: 0, additional: 0, total: 0 } };
		}
		return mockLeaseOrderDetail(salesDetailModal.ym, salesDetailModal.deptName, salesDetailModal.salesperson, salesDetailModal.amount);
	}, [view, salesDetailModal]);

	var detailColumns = useMemo(function () {
		return [
			{ title: '月份', dataIndex: 'ym', key: 'ym', width: 104, align: 'center', onCell: function(r){ return { rowSpan: r.monthRowSpan }; } },
			{ title: '业务部门', dataIndex: 'deptName', key: 'deptName', width: 124, align: 'center', onCell: function(r){ return { rowSpan: r.groupRowSpan }; } },
			{ title: '业务人员', dataIndex: 'salesperson', key: 'salesperson', width: 100, align: 'center', onCell: function(r){ return { rowSpan: r.groupRowSpan }; } },
			{ title: '账单日期', dataIndex: 'billDate', key: 'billDate', width: 110, align: 'center', onCell: function(r){ return { rowSpan: r.groupRowSpan }; } },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', width: 120, align: 'center' },
			{ title: '车辆型号', dataIndex: 'vehicleModel', key: 'vehicleModel', width: 120, align: 'center' },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 180, align: 'center' },
			{ title: '合同日期', dataIndex: 'contractDate', key: 'contractDate', width: 200, align: 'center' },
			{ title: '提车日期', dataIndex: 'pickupDate', key: 'pickupDate', width: 110, align: 'center' },
			{ title: '付款方式', dataIndex: 'payMethod', key: 'payMethod', width: 90, align: 'center' },
			{ title: '付款周期', dataIndex: 'payCycle', key: 'payCycle', width: 90, align: 'center' },
			{ title: '账单计算方式', dataIndex: 'billCalcMethod', key: 'billCalcMethod', width: 110, align: 'center' },
			{ title: '实际计费天数', dataIndex: 'actualDays', key: 'actualDays', width: 110, align: 'center' },
			{ title: '保证金应收', dataIndex: 'depositAmount', key: 'depositAmount', width: 120, align: 'right', render: function(v){ return fmtLedgerCell(v); } },
			{ title: '车辆应收', dataIndex: 'vehicleAmount', key: 'vehicleAmount', width: 120, align: 'right', render: function(v){ return fmtLedgerCell(v); } },
			{ title: '附加费用应收', dataIndex: 'additionalAmount', key: 'additionalAmount', width: 140, align: 'right', render: function(v){ return fmtLedgerCell(v); } },
			{ title: '合计应收', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, align: 'right', render: function(v){ return fmtLedgerCell(v); } }
		];
	}, []);

	var handleExport = useCallback(function () {
		if (!dataSource || dataSource.length === 0) {
			message.warning('当前无数据可导出，请先查询');
			return;
		}
		var y = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : 'ledger';

		var header = ['月份'];
		SECTOR_COLUMNS.forEach(function (s) {
			header.push(s.label + '-业绩', s.label + '-成本', s.label + '-利润');
		});
		header.push('业绩合计', '成本合计', '利润合计');
		var body = [header];

		dataSource.forEach(function (r) {
			var line = [r.monthLabel];
			SECTOR_COLUMNS.forEach(function (s) {
				line.push(fmtLedgerCell(r[s.key + 'Perf']), fmtLedgerCell(r[s.key + 'Cost']), fmtLedgerCell(r[s.key + 'Profit']));
			});
			line.push(fmtLedgerCell(r.rowTotalPerf), fmtLedgerCell(r.rowTotalCost), fmtLedgerCell(r.rowTotalProfit));
			body.push(line);
		});

		var deptCsv = (deptApplied && deptApplied.length)
			? deptApplied.map(function (v) {
				var o = deptOptions.find(function (x) { return x.value === v; });
				return o ? o.label : v;
			}).join('、')
			: '全部';
		body.push(['业务部', deptCsv]);
		
		downloadCsv('业务部台账_' + y + '_' + new Date().getTime() + '.csv', body);
		message.success('已导出');
	}, [dataSource, yearApplied, deptApplied, deptOptions]);

	var ledgerColumns = useMemo(function () {
		var cols = [
			{
				title: '月份',
				dataIndex: 'monthLabel',
				key: 'monthLabel',
				fixed: 'left',
				width: 56,
				align: 'center',
				render: function (t, r) {
					if (r.rowType === 'total') return React.createElement('span', { style: { fontWeight: 700 } }, t);
					return t;
				}
			}
		];

		SECTOR_COLUMNS.forEach(function (sec) {
			cols.push({
				title: sec.label,
				key: 'grp-' + sec.key,
				align: 'center',
				children: [
					{
						title: '业绩',
						dataIndex: sec.key + 'Perf',
						key: sec.key + 'Perf',
						width: 108,
						align: 'center',
						render: function (v, r) {
							if (sec.key === 'lease' && numOrZero(v) !== 0) {
								return React.createElement('button', {
									type: 'button',
									className: 'biz-standbook-perf-link',
									onClick: function () { openLeaseDrill(r, sec.key + 'Perf', v); }
								}, fmtLedgerCell(v));
							}
							if (sec.key === 'hydrogen' && numOrZero(v) !== 0) {
								return React.createElement('button', {
									type: 'button',
									className: 'biz-standbook-perf-link',
									onClick: function () { openHydrogenDrill(r, v, false); }
								}, fmtLedgerCell(v));
							}
							return fmtLedgerCell(v);
						}
					},
					{
						title: '成本',
						dataIndex: sec.key + 'Cost',
						key: sec.key + 'Cost',
						width: 108,
						align: 'center',
						render: function (v, r) {
							if (sec.key === 'lease' && numOrZero(v) !== 0) {
								return React.createElement('button', {
									type: 'button',
									className: 'biz-standbook-perf-link',
									onClick: function () { openLeaseDrill(r, sec.key + 'Cost', v); }
								}, fmtLedgerCell(v));
							}
							if (sec.key === 'hydrogen' && numOrZero(v) !== 0) {
								return React.createElement('button', {
									type: 'button',
									className: 'biz-standbook-perf-link',
									onClick: function () { openHydrogenDrill(r, v, true); }
								}, fmtLedgerCell(v));
							}
							return fmtLedgerCell(v);
						}
					},
					{
						title: '利润',
						dataIndex: sec.key + 'Profit',
						key: sec.key + 'Profit',
						width: 108,
						align: 'center',
						render: function (v) { return fmtLedgerCell(v); }
					}
				]
			});
		});

		cols.push(
			{
				title: '业绩合计',
				dataIndex: 'rowTotalPerf',
				key: 'rowTotalPerf',
				width: 112,
				align: 'center',
				fixed: 'right',
				className: 'col-summary',
				render: function (v) { return fmtLedgerCell(v); }
			},
			{
				title: '成本合计',
				dataIndex: 'rowTotalCost',
				key: 'rowTotalCost',
				width: 112,
				align: 'center',
				fixed: 'right',
				className: 'col-summary',
				render: function (v) { return fmtLedgerCell(v); }
			},
			{
				title: '利润合计',
				dataIndex: 'rowTotalProfit',
				key: 'rowTotalProfit',
				width: 112,
				align: 'center',
				fixed: 'right',
				className: 'col-summary',
				render: function (v) { return fmtLedgerCell(v); }
			}
		);

		return cols;
	}, [openLeaseDrill, openHydrogenDrill]);

	var rowClassName = useCallback(function (record) {
		if (record.rowType === 'total') return '';
		return 'biz-row-month';
	}, []);

	var renderMainView = function () {
		return React.createElement(React.Fragment, null,
			React.createElement(Card, { style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
				React.createElement(Row, { gutter: [16, 16], align: 'bottom' },
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '年份选择'),
							React.createElement(DatePicker, {
								picker: 'year',
								style: filterControlStyle,
								placeholder: '请选择年份',
								format: 'YYYY',
								value: yearDraft,
								onChange: function (v) { setYearDraft(v); }
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '业务部'),
							React.createElement(Select, {
								mode: 'multiple',
								placeholder: '全部',
								style: filterControlStyle,
								value: deptDraft,
								onChange: function (v) { setDeptDraft(v || []); },
								options: deptOptions,
								showSearch: true,
								allowClear: true,
								maxTagCount: 2,
								filterOption: filterOption
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
							React.createElement(Space, { wrap: true },
								React.createElement(Button, { onClick: handleReset }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
							)
						)
					)
				)
			),
			React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '20px 20px 24px' } },
				React.createElement('div', { style: { position: 'relative', marginBottom: 8, minHeight: 36 } },
					React.createElement('div', { style: { textAlign: 'center', fontSize: 18, fontWeight: 700, color: 'rgba(15,23,42,0.92)', letterSpacing: '0.02em', padding: '0 88px' } }, tableTitle),
					React.createElement('div', { style: { position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' } },
						React.createElement(Button, { onClick: handleExport }, '导出')
					)
				),
				React.createElement('div', { style: { textAlign: 'center', marginBottom: 16, fontSize: 13, color: 'rgba(15,23,42,0.55)', fontWeight: 500 } },
					'时间：',
					timeDisplayLabel,
					'\u00A0\u00A0\u00A0\u00A0业务部：',
					deptDisplayLabel
				),
				React.createElement('div', { className: 'biz-standbook-table-wrap' },
					React.createElement(Table, {
						className: 'biz-standbook-table',
						size: 'small',
						bordered: true,
						rowKey: 'key',
						columns: ledgerColumns,
						dataSource: dataSource,
						pagination: false,
						rowClassName: rowClassName,
						scroll: { x: 'max-content', y: 'calc(100vh - 250px)' },
						sticky: true
					})
				)
			)
		);
	};

	var renderHydrogenCustomerPerfView = function () {
		var hydrogenIsCost = salesModal.cellType === 'HydrogenCost';
		var hydroAmountColTitle = hydrogenIsCost ? '成本金额(元)' : '对客总额(元)';
		var hydroCustomerPageTitle = hydrogenIsCost ? '氢费业务客户成本汇总' : '氢费业务客户业绩汇总';
		var columns = [
			{
				title: '月份',
				dataIndex: 'monthLabel',
				key: 'monthLabel',
				align: 'center',
				onCell: function (record) { return { rowSpan: record.monthSpan }; }
			},
			{
				title: '客户名称',
				dataIndex: 'customerName',
				key: 'customerName',
				align: 'center',
				render: function (v, record) {
					return React.createElement('button', {
						type: 'button',
						className: 'biz-standbook-perf-link',
						onClick: function () { openHydroStationDrillByCustomer(record); }
					}, v);
				}
			},
			{
				title: '加氢次数',
				dataIndex: 'count',
				key: 'count',
				align: 'center'
			},
			{
				title: '加氢量（kg）',
				dataIndex: 'amountKg',
				key: 'amountKg',
				align: 'right',
				render: function(v) { return fmtLedgerCell(v); }
			},
			{
				title: hydroAmountColTitle,
				dataIndex: 'totalAmount',
				key: 'totalAmount',
				align: 'right',
				render: function(v) { return fmtLedgerCell(v); }
			}
		];

		var sumCount = 0, sumAmountKg = 0, sumTotalAmount = 0;
		var uniqueCustomers = [];
		hydrogenCustomerPerfPayload.rows.forEach(function(r) {
			if (uniqueCustomers.indexOf(r.customerName) === -1) uniqueCustomers.push(r.customerName);
			sumCount += numOrZero(r.count);
			sumAmountKg += numOrZero(r.amountKg);
			sumTotalAmount += numOrZero(r.totalAmount);
		});

		var handleQuery = function() {
			setHydroFilterApplied(hydroFilterDraft);
		};
		var handleReset = function() {
			var resetState = { month: null, customerName: undefined };
			setHydroFilterDraft(resetState);
			setHydroFilterApplied(resetState);
		};

		var hydroStatMonthStr = hydroFilterApplied.month && hydroFilterApplied.month.format ? hydroFilterApplied.month.format('YYYY-MM') : '—';
		var hydroPerfSubline = hydroFilterApplied.customerName
			? hydroFilterApplied.customerName + '\u00A0\u00A0\u00A0\u00A0统计时间：' + hydroStatMonthStr
			: '统计时间：' + hydroStatMonthStr;

		return React.createElement(React.Fragment, null,
			React.createElement(Card, { style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
				React.createElement(Row, { gutter: [16, 16], align: 'bottom' },
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '月份'),
							React.createElement(DatePicker, {
								picker: 'month',
								placeholder: '日期选择器，精确至月',
								style: filterControlStyle,
								value: hydroFilterDraft.month,
								onChange: function (v) { setHydroFilterDraft(Object.assign({}, hydroFilterDraft, { month: v })); }
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '客户名称'),
							React.createElement(Select, {
								placeholder: '选择器，枚举所有客户',
								style: filterControlStyle,
								value: hydroFilterDraft.customerName,
								onChange: function (v) { setHydroFilterDraft(Object.assign({}, hydroFilterDraft, { customerName: v })); },
								allowClear: true,
								showSearch: true,
								filterOption: filterOption,
								options: hydrogenCustomerPerfPayload.options ? hydrogenCustomerPerfPayload.options.customers : []
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
							React.createElement(Space, { wrap: true },
								React.createElement(Button, { onClick: handleReset }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: handleQuery }, '查询')
							)
						)
					)
				)
			),
			React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '16px 24px' } },
				React.createElement('div', { style: { position: 'relative', marginBottom: 16, minHeight: 52 } },
					React.createElement('div', { style: { position: 'absolute', left: 0, top: 0, zIndex: 1 } },
						React.createElement(Button, { onClick: function () { setView('main'); } }, '返回上一步')
					),
					React.createElement('div', { style: { textAlign: 'center', padding: '0 128px' } },
						React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: 'rgba(15,23,42,0.92)', letterSpacing: '0.02em' } }, hydroCustomerPageTitle),
						React.createElement('div', { style: { marginTop: 6, fontSize: 13, color: 'rgba(15,23,42,0.55)', fontWeight: 500 } }, hydroPerfSubline)
					)
				),
				React.createElement('div', { className: 'biz-standbook-table-wrap' },
					React.createElement(Table, {
						className: 'biz-standbook-table', bordered: true, rowKey: 'key', columns: columns, dataSource: hydrogenCustomerPerfPayload.rows, pagination: false, scroll: { x: 'max-content', y: 'calc(100vh - 250px)' }, sticky: true,
						summary: function () {
							return React.createElement(Table.Summary, { fixed: 'bottom' },
								React.createElement(Table.Summary.Row, { className: 'row-total' },
									React.createElement(Table.Summary.Cell, { index: 0, align: 'center' }, '合计'),
									React.createElement(Table.Summary.Cell, { index: 1, align: 'center' },
										React.createElement('button', {
											type: 'button',
											className: 'biz-standbook-perf-link',
											onClick: openHydroStationDrillAllStations
										}, uniqueCustomers.length)
									),
									React.createElement(Table.Summary.Cell, { index: 2, align: 'center' }, sumCount),
									React.createElement(Table.Summary.Cell, { index: 3, align: 'right' }, fmtLedgerCell(sumAmountKg)),
									React.createElement(Table.Summary.Cell, { index: 4, align: 'right' }, fmtLedgerCell(sumTotalAmount))
								)
							);
						}
					})
				)
			)
		);
	};

	var renderHydrogenStationDrillView = function () {
		var hydrogenIsCost = salesModal.cellType === 'HydrogenCost';
		var stAmountColTitle = hydrogenIsCost ? '成本金额(元)' : '对客总额(元)';
		var stPageTitle = hydrogenIsCost ? '客户各加氢站加氢成本' : '客户各加氢站加氢业绩';
		var stRows = hydrogenStationDrillPayload.rows || [];
		var stSumCount = 0;
		var stSumKg = 0;
		var stSumAmt = 0;
		stRows.forEach(function (r) {
			stSumCount += numOrZero(r.count);
			stSumKg += numOrZero(r.amountKg);
			stSumAmt += numOrZero(r.totalAmount);
		});
		var hydroStatMonthStr2 = hydroFilterApplied.month && hydroFilterApplied.month.format ? hydroFilterApplied.month.format('YYYY-MM') : '—';
		var scopeLbl = hydrogenStationDrillPayload.drillScopeLabel;
		var drillPrefix = scopeLbl && scopeLbl !== '全部客户' ? scopeLbl + '\u00A0\u00A0\u00A0\u00A0' : '';
		var drillSubLabel = drillPrefix + '统计时间：' + hydroStatMonthStr2;

		var stColumns = [
			{
				title: '月份',
				dataIndex: 'monthLabel',
				key: 'monthLabel',
				align: 'center',
				onCell: function (record) { return { rowSpan: record.monthSpan }; }
			},
			{
				title: '客户名称',
				dataIndex: 'customerName',
				key: 'customerName',
				align: 'center',
				onCell: function (record) { return { rowSpan: record.customerSpan }; },
				render: function (v, record) {
					return React.createElement('button', {
						type: 'button',
						className: 'biz-standbook-perf-link',
						onClick: function () { openHydroRefuelDetailByCustomer(v); }
					}, v);
				}
			},
			{
				title: '加氢站名称',
				dataIndex: 'stationName',
				key: 'stationName',
				align: 'center',
				render: function (v, record) {
					return React.createElement('button', {
						type: 'button',
						className: 'biz-standbook-perf-link',
						onClick: function () { openHydroRefuelDetailByStationRow(record); }
					}, v);
				}
			},
			{
				title: '加氢次数',
				dataIndex: 'count',
				key: 'count',
				align: 'center'
			},
			{
				title: '加氢量（kg）',
				dataIndex: 'amountKg',
				key: 'amountKg',
				align: 'right',
				render: function (v) { return fmtLedgerCell(v); }
			},
			{
				title: stAmountColTitle,
				dataIndex: 'totalAmount',
				key: 'totalAmount',
				align: 'right',
				render: function (v) { return fmtLedgerCell(v); }
			}
		];

		return React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '16px 24px' } },
			React.createElement('div', { style: { position: 'relative', marginBottom: 16, minHeight: 52 } },
				React.createElement('div', { style: { position: 'absolute', left: 0, top: 0, zIndex: 1 } },
					React.createElement(Button, { onClick: function () { setView('hydrogenCustomerPerf'); } }, '返回上一步')
				),
				React.createElement('div', { style: { textAlign: 'center', padding: '0 128px' } },
					React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: 'rgba(15,23,42,0.92)', letterSpacing: '0.02em' } }, stPageTitle),
					React.createElement('div', { style: { marginTop: 6, fontSize: 13, color: 'rgba(15,23,42,0.55)', fontWeight: 500 } }, drillSubLabel)
				)
			),
			React.createElement('div', { className: 'biz-standbook-table-wrap' },
				React.createElement(Table, {
					className: 'biz-standbook-table',
					bordered: true,
					rowKey: 'key',
					columns: stColumns,
					dataSource: stRows,
					pagination: false,
					scroll: { x: 'max-content', y: 'calc(100vh - 250px)' },
					sticky: true,
					locale: { emptyText: '暂无加氢站明细' },
					summary: function () {
						return React.createElement(Table.Summary, { fixed: 'bottom' },
							React.createElement(Table.Summary.Row, { className: 'row-total' },
								React.createElement(Table.Summary.Cell, { index: 0, colSpan: 3, align: 'center' }, '合计'),
								React.createElement(Table.Summary.Cell, { index: 3, align: 'center' }, stSumCount),
								React.createElement(Table.Summary.Cell, { index: 4, align: 'right' }, fmtLedgerCell(stSumKg)),
								React.createElement(Table.Summary.Cell, { index: 5, align: 'right' }, fmtLedgerCell(stSumAmt))
							)
						);
					}
				})
			)
		);
	};

	var renderHydrogenRefuelDetailView = function () {
		var hydrogenIsCost = salesModal.cellType === 'HydrogenCost';
		var refuelUnitTitle = hydrogenIsCost ? '成本单价（元/kg）' : '对客单价（元/kg）';
		var refuelFeeTitle = hydrogenIsCost ? '成本费用（元）' : '对客费用（元）';
		var dRows = hydrogenRefuelDetailPayload.rows || [];
		var sumKg = 0;
		var sumFee = 0;
		dRows.forEach(function (r) {
			sumKg += numOrZero(r.amountKg);
			sumFee += numOrZero(r.customerFee);
		});
		var avgUnit = sumKg > 0 ? Math.round((sumFee / sumKg) * 100) / 100 : 0;
		var hydroStatMonthStr3 = hydroFilterApplied.month && hydroFilterApplied.month.format ? hydroFilterApplied.month.format('YYYY-MM') : '—';
		var ctx = hydroRefuelDetailCtx;
		var detailSubParts = ['客户：' + (ctx.customerName || '—')];
		if (ctx.stationName) {
			detailSubParts.push('加氢站：' + ctx.stationName);
		} else {
			detailSubParts.push('加氢站：全部');
		}
		detailSubParts.push('统计时间：' + hydroStatMonthStr3);
		var detailSubline = detailSubParts.join('\u00A0\u00A0\u00A0\u00A0');

		var refuelCols = [
			{ title: '加氢日期', dataIndex: 'refuelDateLabel', key: 'refuelDateLabel', align: 'center' },
			{ title: '客户名称', dataIndex: 'customerName', key: 'customerName', align: 'center' },
			{ title: '项目名称', dataIndex: 'projectName', key: 'projectName', align: 'center' },
			{ title: '车牌号', dataIndex: 'plateNo', key: 'plateNo', align: 'center' },
			{ title: '加氢站名称', dataIndex: 'stationName', key: 'stationName', align: 'center' },
			{ title: '加氢量（kg）', dataIndex: 'amountKg', key: 'amountKg', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
			{ title: refuelUnitTitle, dataIndex: 'unitPrice', key: 'unitPrice', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
			{ title: refuelFeeTitle, dataIndex: 'customerFee', key: 'customerFee', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
			{ title: '业务员', dataIndex: 'salesperson', key: 'salesperson', align: 'center' }
		];

		return React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '16px 24px' } },
			React.createElement('div', { style: { position: 'relative', marginBottom: 16, minHeight: 52 } },
				React.createElement('div', { style: { position: 'absolute', left: 0, top: 0, zIndex: 1 } },
					React.createElement(Button, { onClick: function () { setView('hydrogenStationDrill'); } }, '返回上一步')
				),
				React.createElement('div', { style: { textAlign: 'center', padding: '0 128px' } },
					React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: 'rgba(15,23,42,0.92)', letterSpacing: '0.02em' } }, '加氢明细'),
					React.createElement('div', { style: { marginTop: 6, fontSize: 13, color: 'rgba(15,23,42,0.55)', fontWeight: 500 } }, detailSubline)
				)
			),
			React.createElement('div', { className: 'biz-standbook-table-wrap' },
				React.createElement(Table, {
					className: 'biz-standbook-table',
					bordered: true,
					rowKey: 'key',
					columns: refuelCols,
					dataSource: dRows,
					pagination: false,
					scroll: { x: 'max-content', y: 'calc(100vh - 250px)' },
					sticky: true,
					locale: { emptyText: '暂无加氢明细' },
					summary: function () {
						return React.createElement(Table.Summary, { fixed: 'bottom' },
							React.createElement(Table.Summary.Row, { className: 'row-total' },
								React.createElement(Table.Summary.Cell, { index: 0, colSpan: 5, align: 'center' }, '合计'),
								React.createElement(Table.Summary.Cell, { index: 5, align: 'right' }, fmtLedgerCell(sumKg)),
								React.createElement(Table.Summary.Cell, { index: 6, align: 'right' }, sumKg > 0 ? fmtLedgerCell(avgUnit) : '—'),
								React.createElement(Table.Summary.Cell, { index: 7, align: 'right' }, fmtLedgerCell(sumFee)),
								React.createElement(Table.Summary.Cell, { index: 8, align: 'center' }, '\u00a0')
							)
						);
					}
				})
			)
		);
	};

	var renderCustomerSummaryView = function () {
		var isCost = salesModal.cellType === 'Cost';
		var leaseSummaryMainTitle = isCost ? '租赁业务业务员成本汇总' : '租赁业务业务员业绩汇总';
		var yearStr = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : 'YYYY';
		var leaseStatTimeStr;
		if (salesModal.month != null && salesModal.month <= 12) {
			leaseStatTimeStr = yearStr + '-' + pad2(salesModal.month);
		} else if (salesModal.month === 13) {
			leaseStatTimeStr = yearStr + '（全年）';
		} else {
			leaseStatTimeStr = '—';
		}
		var leaseSumSubline = custSumFilterApplied.customerName
			? custSumFilterApplied.customerName + '\u00A0\u00A0\u00A0\u00A0统计时间：' + leaseStatTimeStr
			: '统计时间：' + leaseStatTimeStr;

		var columns = [
			{
				title: '业务部门',
				dataIndex: 'dept',
				key: 'dept',
				align: 'center',
				onCell: function (record) {
					return { rowSpan: record.deptSpan };
				}
			},
			{
				title: '业务员',
				dataIndex: 'salesperson',
				key: 'salesperson',
				align: 'center',
				onCell: function (record) {
					return { rowSpan: record.spSpan };
				}
			},
			{
				title: '客户名称',
				dataIndex: 'customerName',
				key: 'customerName',
				align: 'center',
				render: function (v, record) {
					return React.createElement('button', {
						className: 'biz-standbook-perf-link',
						onClick: function () { openProjectSummary(record); }
					}, v);
				}
			}
		];

		if (isCost) {
			columns.push(
				{ title: '车辆成本', dataIndex: 'vehicleCost', key: 'vehicleCost', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
				{ title: '居间费', dataIndex: 'brokerageFee', key: 'brokerageFee', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
				{ title: '成本总计', dataIndex: 'totalCost', key: 'totalCost', align: 'right', render: function (v) { return fmtLedgerCell(v); } }
			);
		} else {
			columns.push(
				{ title: '应收', dataIndex: 'receivable', key: 'receivable', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
				{ title: '实收', dataIndex: 'received', key: 'received', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
				{ title: '未收', dataIndex: 'unreceived', key: 'unreceived', align: 'right', render: function (v) { return fmtLedgerCell(v); } }
			);
		}

		var sum1 = 0, sum2 = 0, sum3 = 0;
		var uniqueCustomers = [];
		customerSummaryPayload.rows.forEach(function(r) {
			if (uniqueCustomers.indexOf(r.customerName) === -1) {
				uniqueCustomers.push(r.customerName);
			}
			if (isCost) {
				sum1 += numOrZero(r.vehicleCost);
				sum2 += numOrZero(r.brokerageFee);
				sum3 += numOrZero(r.totalCost);
			} else {
				sum1 += numOrZero(r.receivable);
				sum2 += numOrZero(r.received);
				sum3 += numOrZero(r.unreceived);
			}
		});
		var customerCount = uniqueCustomers.length;

		return React.createElement(React.Fragment, null,
			React.createElement(Card, { style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
				React.createElement(Row, { gutter: [16, 16], align: 'bottom' },
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '客户名称'),
							React.createElement(Select, {
								placeholder: '请选择客户名称',
								style: filterControlStyle,
								value: custSumFilterDraft.customerName,
								onChange: function (v) { setCustSumFilterDraft(Object.assign({}, custSumFilterDraft, { customerName: v })); },
								allowClear: true,
								showSearch: true,
								filterOption: filterOption,
								options: customerSummaryPayload.options ? customerSummaryPayload.options.customers : []
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
							React.createElement(Space, { wrap: true },
								React.createElement(Button, { onClick: handleCustSumReset }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: handleCustSumQuery }, '查询')
							)
						)
					)
				)
			),
			React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '16px 24px' } },
				React.createElement('div', { style: { position: 'relative', marginBottom: 16, minHeight: 52 } },
					React.createElement('div', { style: { position: 'absolute', left: 0, top: 0, zIndex: 1 } },
						React.createElement(Button, { onClick: function () { setView('main'); } }, '返回上一步')
					),
					React.createElement('div', { style: { textAlign: 'center', padding: '0 128px' } },
						React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: 'rgba(15,23,42,0.92)', letterSpacing: '0.02em' } }, leaseSummaryMainTitle),
						React.createElement('div', { style: { marginTop: 6, fontSize: 13, color: 'rgba(15,23,42,0.55)', fontWeight: 500 } }, leaseSumSubline)
					)
				),
				React.createElement('div', { className: 'biz-standbook-table-wrap' },
					React.createElement(Table, {
						className: 'biz-standbook-table',
						size: 'small',
						bordered: true,
						rowKey: 'key',
						columns: columns,
						dataSource: customerSummaryPayload.rows,
						pagination: false,
						scroll: { x: 'max-content', y: 'calc(100vh - 250px)' },
						sticky: true,
						summary: function () {
							return React.createElement(Table.Summary, { fixed: 'bottom' },
								React.createElement(Table.Summary.Row, { className: 'row-total' },
									React.createElement(Table.Summary.Cell, { index: 0, colSpan: 2, align: 'center' }, '合计'),
									React.createElement(Table.Summary.Cell, { index: 1, align: 'center' }, 
										React.createElement('button', {
											className: 'biz-standbook-perf-link',
											onClick: function () { 
												openProjectSummary({ isAll: true, sourceRows: customerSummaryPayload.rows });
											}
										}, customerCount)
									),
									React.createElement(Table.Summary.Cell, { index: 2, align: 'right' }, fmtLedgerCell(sum1)),
									React.createElement(Table.Summary.Cell, { index: 3, align: 'right' }, fmtLedgerCell(sum2)),
									React.createElement(Table.Summary.Cell, { index: 4, align: 'right' }, fmtLedgerCell(sum3))
								)
							);
						}
					})
				)
			)
		);
	};

	var renderProjectSummaryView = function () {
		var isCost = salesModal.cellType === 'Cost';
		var projectPageMainTitle = isCost ? '租赁业务客户各项目成本汇总' : '租赁业务客户各项目业绩汇总';
		var yearStr = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : 'YYYY';
		var projStatTimeStr;
		if (salesModal.month != null && salesModal.month <= 12) {
			projStatTimeStr = yearStr + '-' + pad2(salesModal.month);
		} else if (salesModal.month === 13) {
			projStatTimeStr = yearStr + '（全年）';
		} else {
			projStatTimeStr = '—';
		}
		var projectCustomerScope = detailCustomer
			? (detailCustomer.isAll ? '全部客户' : (detailCustomer.customerName || '—'))
			: '—';
		var projectSumSubline = projectCustomerScope + '\u00A0\u00A0\u00A0\u00A0统计时间：' + projStatTimeStr;

		var columns = [
			{
				title: '客户名称',
				dataIndex: 'customerName',
				key: 'customerName',
				align: 'center',
				onCell: function (record) { return { rowSpan: record.custSpan }; }
			},
			{
				title: '项目名称',
				dataIndex: 'projectName',
				key: 'projectName',
				align: 'center',
				render: function (text, record) {
					return React.createElement('button', {
						className: 'biz-standbook-perf-link',
						onClick: function () { return openProjectDetail(record); }
					}, text);
				}
			}
		];

		if (isCost) {
			columns.push(
				{ title: '车辆成本', dataIndex: 'vehicleCost', key: 'vehicleCost', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
				{
					title: '居间费',
					dataIndex: 'brokerageFee',
					key: 'brokerageFee',
					align: 'right',
					render: function (v) { return fmtLedgerCell(v); }
				},
				{ title: '成本总计', dataIndex: 'totalCost', key: 'totalCost', align: 'right', render: function (v) { return fmtLedgerCell(v); } }
			);
		} else {
			columns.push(
				{ title: '应收', dataIndex: 'receivable', key: 'receivable', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
				{ title: '实收', dataIndex: 'received', key: 'received', align: 'right', render: function (v) { return fmtLedgerCell(v); } },
				{ title: '未收', dataIndex: 'unreceived', key: 'unreceived', align: 'right', render: function (v) { return fmtLedgerCell(v); } }
			);
		}

		var sum1 = 0, sum2 = 0, sum3 = 0;
		var uniqueProjects = [];
		projectSummaryPayload.forEach(function(r) {
			var projKey = r.customerName + '|' + r.projectName;
			if (uniqueProjects.indexOf(projKey) === -1) {
				uniqueProjects.push(projKey);
			}
			if (isCost) {
				sum1 += numOrZero(r.vehicleCost);
				sum2 += numOrZero(r.brokerageFee);
				sum3 += numOrZero(r.totalCost);
			} else {
				sum1 += numOrZero(r.receivable);
				sum2 += numOrZero(r.received);
				sum3 += numOrZero(r.unreceived);
			}
		});
		var projectCount = uniqueProjects.length;

		return React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '16px 24px' } },
			React.createElement('div', { style: { position: 'relative', marginBottom: 16, minHeight: 52 } },
				React.createElement('div', { style: { position: 'absolute', left: 0, top: 0, zIndex: 1 } },
					React.createElement(Button, { onClick: function () { setView('customerSummary'); } }, '返回上一步')
				),
				React.createElement('div', { style: { textAlign: 'center', padding: '0 128px' } },
					React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: 'rgba(15,23,42,0.92)', letterSpacing: '0.02em' } }, projectPageMainTitle),
					React.createElement('div', { style: { marginTop: 6, fontSize: 13, color: 'rgba(15,23,42,0.55)', fontWeight: 500 } }, projectSumSubline)
				)
			),
			React.createElement('div', { className: 'biz-standbook-table-wrap' },
				React.createElement(Table, {
					className: 'biz-standbook-table', bordered: true, rowKey: 'key', columns: columns, dataSource: projectSummaryPayload, pagination: false, scroll: { x: 'max-content', y: 'calc(100vh - 250px)' }, sticky: true,
					summary: function () {
						return React.createElement(Table.Summary, { fixed: 'bottom' },
							React.createElement(Table.Summary.Row, { className: 'row-total' },
								React.createElement(Table.Summary.Cell, { index: 0, align: 'center' }, '合计'),
									React.createElement(Table.Summary.Cell, { index: 1, align: 'center' }, 
										React.createElement('button', {
											className: 'biz-standbook-perf-link',
											onClick: function () { 
												openProjectDetail({ isAll: true, sourceRows: projectSummaryPayload });
											}
										}, projectCount)
									),
								React.createElement(Table.Summary.Cell, { index: 2, align: 'right' }, fmtLedgerCell(sum1)),
								React.createElement(Table.Summary.Cell, { index: 3, align: 'right' }, fmtLedgerCell(sum2)),
								React.createElement(Table.Summary.Cell, { index: 4, align: 'right' }, fmtLedgerCell(sum3))
							)
						);
					}
				})
			)
		);
	};

	var renderSalesView = function () {
		var isCost = salesModal.cellType === 'Cost';
		var typeLabel = '业绩';
		if (isCost) typeLabel = '成本';
		else if (salesModal.cellType === 'Profit') typeLabel = '利润';
		var yearStr = yearApplied && yearApplied.format ? yearApplied.format('YYYY') : 'YYYY';
		var monthStr = salesModal.month === 13 ? '全年' : '-' + pad2(salesModal.month);
		var titleText = '租赁业务' + typeLabel + '钻取明细（' + yearStr + monthStr + '）';
		if (detailProject) {
			if (detailProject.isAll) {
				titleText += ' - 全部项目';
			} else {
				titleText += ' - ' + detailProject.customerName + ' - ' + detailProject.projectName;
			}
		}
		return React.createElement(React.Fragment, null,
			React.createElement(Card, { style: filterCardStyle, bodyStyle: { paddingBottom: 4 } },
				React.createElement(Row, { gutter: [16, 16], align: 'bottom' },
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '业务员'),
							React.createElement(Select, {
								placeholder: '请选择业务员',
								style: filterControlStyle,
								value: drillFilterDraft.salesperson,
								onChange: function (v) { setDrillFilterDraft(Object.assign({}, drillFilterDraft, { salesperson: v })); },
								allowClear: true,
								showSearch: true,
								filterOption: filterOption,
								options: drillPayload.options ? drillPayload.options.salespersons : []
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '客户名称'),
							React.createElement(Select, {
								placeholder: '请选择客户名称',
								style: filterControlStyle,
								value: drillFilterDraft.customerName,
								onChange: function (v) { setDrillFilterDraft(Object.assign({}, drillFilterDraft, { customerName: v })); },
								allowClear: true,
								showSearch: true,
								filterOption: filterOption,
								options: drillPayload.options ? drillPayload.options.customers : []
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '性质'),
							React.createElement(Select, {
								placeholder: '请选择性质',
								style: filterControlStyle,
								value: drillFilterDraft.nature,
								onChange: function (v) { setDrillFilterDraft(Object.assign({}, drillFilterDraft, { nature: v })); },
								allowClear: true,
								options: [
									{ value: '租赁', label: '租赁' },
									{ value: '试用', label: '试用' }
								]
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '车牌号'),
							React.createElement(Select, {
								placeholder: '请选择或输入车牌号',
								style: filterControlStyle,
								value: drillFilterDraft.plateNo,
								onChange: function (v) { setDrillFilterDraft(Object.assign({}, drillFilterDraft, { plateNo: v })); },
								allowClear: true,
								showSearch: true,
								filterOption: filterOption,
								options: drillPayload.options ? drillPayload.options.plateNos : []
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6 },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '付款日期'),
							React.createElement(RangePicker, {
								placeholder: ['开始日期', '结束日期'],
								style: filterControlStyle,
								value: drillFilterDraft.paymentDate,
								onChange: function (v) { setDrillFilterDraft(Object.assign({}, drillFilterDraft, { paymentDate: v })); }
							})
						)
					),
					React.createElement(Col, { xs: 24, sm: 12, md: 8, lg: 6, style: filterActionsColStyle },
						React.createElement('div', { style: filterItemStyle },
							React.createElement('div', { style: filterLabelStyle }, '\u00a0'),
							React.createElement(Space, { wrap: true },
								React.createElement(Button, { onClick: handleDrillReset }, '重置'),
								React.createElement(Button, { type: 'primary', onClick: handleDrillQuery }, '查询')
							)
						)
					)
				)
			),
			React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '16px 24px' } },
				React.createElement('div', { style: { display: 'flex', alignItems: 'center', marginBottom: 20 } },
					React.createElement(Button, {
						onClick: function () { setView('projectSummary'); },
						style: { marginRight: 16 }
					}, '返回上一步'),
					React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: '#0f172a' } }, titleText)
				),
				React.createElement('div', { className: 'biz-standbook-table-wrap' },
					React.createElement(Table, {
						className: 'biz-standbook-table',
						size: 'small',
						bordered: true,
						rowKey: 'key',
						columns: drillColumns,
						dataSource: drillPayload.rows,
						pagination: false,
						scroll: { x: 'max-content', y: 'calc(100vh - 250px)' },
						sticky: true,
						summary: function () {
							var totals = drillPayload.totals;
							var Sm = Table.Summary;
							var Row = Sm.Row;
							var Cell = Sm.Cell;

							return React.createElement(Sm, null,
								React.createElement(Row, null,
									React.createElement(Cell, { index: 0, colSpan: 11, align: 'center' }, '合计'),
									isCost ? React.createElement(
										React.Fragment,
										null,
										React.createElement(Cell, { index: 1, align: 'right' }, fmtLedgerCell(totals.vehicleCost)),
										React.createElement(Cell, { index: 2, align: 'right' }, fmtLedgerCell(totals.brokerageFee)),
										React.createElement(Cell, { index: 3, align: 'right' }, fmtLedgerCell(totals.totalCost))
									) : React.createElement(
										React.Fragment,
										null,
										React.createElement(Cell, { index: 1, align: 'right' }, fmtLedgerCell(totals.receivable)),
										React.createElement(Cell, { index: 2, align: 'right' }, fmtLedgerCell(totals.received)),
										React.createElement(Cell, { index: 3, align: 'right' }, React.createElement('span', { style: { color: '#f53f3f' } }, fmtLedgerCell(totals.unreceived))),
										React.createElement(Cell, { index: 4, align: 'right' }, fmtLedgerCell(totals.naturalMonthIncome)),
										React.createElement(Cell, { index: 5, colSpan: 3 })
									)
								)
							);
						}
					})
				)
			)
		);
	};

	var renderSalesDetailView = function () {
		var deptLabel = salesDetailModal.deptName === '全部' ? '全部业务部门' : salesDetailModal.deptName;
		var personLabel = salesDetailModal.salesperson === '全部' ? '全部业务人员' : salesDetailModal.salesperson;
		var titleText = '应收明细（' + salesDetailModal.ym + ' ' + deptLabel + ' ' + personLabel + '）';
		return React.createElement(Card, { style: tableCardStyle, bodyStyle: { padding: '16px 24px' } },
			React.createElement('div', { style: { display: 'flex', alignItems: 'center', marginBottom: 20 } },
				React.createElement(Button, {
					onClick: function () { setView('sales'); },
					style: { marginRight: 16 }
				}, '返回上一步'),
				React.createElement('div', { style: { fontSize: 18, fontWeight: 700, color: '#0f172a' } }, titleText)
			),
			React.createElement('div', { className: 'biz-standbook-table-wrap' },
				React.createElement(Table, {
					className: 'biz-standbook-table',
					size: 'small',
					bordered: true,
					rowKey: 'key',
					columns: detailColumns,
					dataSource: detailPayload.rows,
					pagination: false,
					rowClassName: rowClassName,
					scroll: { x: 'max-content', y: 'calc(100vh - 250px)' },
					summary: function () {
						var totals = detailPayload.totals;
						var Sm = Table.Summary;
						var Row = Sm.Row;
						var Cell = Sm.Cell;
						return React.createElement(Sm, null,
							React.createElement(Row, null,
								React.createElement(Cell, { index: 0, colSpan: 13, align: 'center' }, '合计'),
								React.createElement(Cell, { index: 13, align: 'right' }, fmtLedgerCell(totals.deposit)),
								React.createElement(Cell, { index: 14, align: 'right' }, fmtLedgerCell(totals.vehicle)),
								React.createElement(Cell, { index: 15, align: 'right' }, fmtLedgerCell(totals.additional)),
								React.createElement(Cell, { index: 16, align: 'right' }, fmtLedgerCell(totals.total))
							)
						);
					}
				})
			)
		);
	};

	var renderContent = function () {
		if (view === 'main') return renderMainView();
		if (view === 'hydrogenCustomerPerf') return renderHydrogenCustomerPerfView();
		if (view === 'hydrogenStationDrill') return renderHydrogenStationDrillView();
		if (view === 'hydrogenRefuelDetail') return renderHydrogenRefuelDetailView();
		if (view === 'customerSummary') return renderCustomerSummaryView();
		if (view === 'projectSummary') return renderProjectSummaryView();
		if (view === 'sales') return renderSalesView();
		if (view === 'sales_detail') return renderSalesDetailView();
		return null;
	};

	var bodyEl = renderContent();

	return React.createElement(App, null,
		React.createElement('style', null, ledgerTableStyle),
		React.createElement('div', { style: layoutStyle },
			bodyEl
		)
	);
};
