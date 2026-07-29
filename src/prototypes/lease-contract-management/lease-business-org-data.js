/**
 * 业务部门 / 业务人员级联数据（与列表筛选项、台账样例对齐）
 */

export var LEASE_BUSINESS_ORG_TREE = [
	{ dept: '业务1部', owners: ['张经理', '赵经理'] },
	{ dept: '业务2部', owners: ['李专员', '钱专员'] },
	{ dept: '业务3部', owners: ['王专员'] },
];

export function getBusinessOwnersByDept(dept) {
	var group = LEASE_BUSINESS_ORG_TREE.find(function (item) {
		return item.dept === dept;
	});
	return group ? group.owners.slice() : [];
}

export function flattenBusinessOwnerOptions() {
	return LEASE_BUSINESS_ORG_TREE.reduce(function (list, group) {
		return list.concat(group.owners.map(function (owner) {
			return { dept: group.dept, owner: owner };
		}));
	}, []);
}

export function matchBusinessOwnerOption(item, searchText) {
	if (!searchText) return true;
	var q = searchText.toLowerCase();
	return item.owner.toLowerCase().indexOf(q) >= 0;
}

export function formatBusinessAssignmentLabel(dept, owner) {
	if (dept && owner) return dept + ' · ' + owner;
	if (dept) return dept;
	if (owner) return owner;
	return '';
}
