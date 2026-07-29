// 【重要】必须使用 const Component 作为组件变量名 - Axhub 产品原型
// 帮助中心 - 功能说明书

const Component = function () {
  var antd = window.antd;
  var Layout = antd.Layout;
  var Menu = antd.Menu;
  var Typography = antd.Typography;
  var Button = antd.Button;
  var Space = antd.Space;
  var Divider = antd.Divider;

  var Title = Typography.Title;
  var Paragraph = Typography.Paragraph;
  var Text = Typography.Text;

  var Sider = Layout.Sider;
  var Content = Layout.Content;

  var React = window.React;
  var useState = React.useState;
  var useMemo = React.useMemo;

  // 菜单数据源（依据系统最新结构）
  var menuItems = [
    {
      key: '1',
      label: '工作台'
    },
    {
      key: '2',
      label: '业务管理组',
      children: [
        { key: '2-1', label: '客户管理' },
        { key: '2-2', label: '合同创建' },
        { key: '2-3', label: '提车应收款' },
        { key: '2-4', label: '交还车任务' },
        { key: '2-5', label: '租赁账单' },
        { key: '2-6', label: '还车应结款' },
        { key: '2-7', label: '替换车' },
        { key: '2-8', label: '调拨' }
      ]
    },
    {
      key: '3',
      label: '运维服务组',
      children: [
        { key: '3-1', label: '车辆管理' },
        { key: '3-2', label: '备件库管理' },
        { key: '3-3', label: '备车' },
        { key: '3-4', label: '交车' },
        { key: '3-5', label: '还车' },
        { key: '3-6', label: '异动' }
      ]
    },
    {
      key: '4',
      label: '业务管理组-能源部',
      children: [
        { key: '4-1', label: '加氢记录' },
        { key: '4-2', label: 'ETC记录' },
        { key: '4-3', label: '充电记录' },
        { key: '4-4', label: '能源账单' },
        { key: '4-5', label: '能源账户' },
        { key: '4-6', label: '充值管理' }
      ]
    },
    {
      key: '5',
      label: '安全部',
      children: [
        { key: '5-1', label: '事故管理' },
        { key: '5-2', label: '违章管理' },
        { key: '5-3', label: '司机管理' },
        { key: '5-4', label: '安全培训资料' },
        { key: '5-5', label: '安全培训记录' }
      ]
    },
    {
      key: '6',
      label: '审批中心'
    }
  ];

  // 扁平化数据用于获取上下文和翻页
  var flattenMenu = useMemo(function () {
    var list = [];
    var traverse = function (items) {
      items.forEach(function (item) {
        if (!item.children) {
          list.push(item);
        } else {
          list.push(item);
          traverse(item.children);
        }
      });
    };
    traverse(menuItems);
    return list;
  }, []);

  var ms1 = useState('1');
  var selectedKey = ms1[0];
  var setSelectedKey = ms1[1];

  var currentIndex = flattenMenu.findIndex(function (item) {
    return item.key === selectedKey;
  });
  var currentItem = flattenMenu[currentIndex];
  var prevItem = currentIndex > 0 ? flattenMenu[currentIndex - 1] : null;
  var nextItem = currentIndex < flattenMenu.length - 1 ? flattenMenu[currentIndex + 1] : null;

  var handleMenuClick = function (e) {
    setSelectedKey(e.key);
  };

  // 渲染正文内容
  var renderContent = function () {
    return React.createElement(
      Typography,
      null,
      React.createElement(Title, { level: 2, className: 'acro-text-xxl' }, currentItem ? currentItem.label : '内容建设中'),
      React.createElement(
        Paragraph,
        { className: 'acro-text-base', style: { color: 'rgba(0,0,0,0.45)' } },
        '该章节（' + (currentItem ? currentItem.label : '') + '）的功能说明正在建设中，您可以随时在这里修改补充...'
      )
    );
  };

  var styles = {
    layout: {
      minHeight: '100vh',
      backgroundColor: '#fff',
    },
    sider: {
      backgroundColor: '#fafafa',
      borderRight: '1px solid #f0f0f0',
      overflowY: 'auto',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
    },
    siderHeader: {
      padding: '24px 20px 12px',
      fontSize: 18,
      fontWeight: 600,
      color: 'rgba(0,0,0,0.85)',
      borderBottom: '1px solid #f0f0f0'
    },
    contentWrapper: {
      marginLeft: 280,
      padding: '40px 60px',
      maxWidth: 1000,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    },
    contentInner: {
      flex: 1,
      marginBottom: 40
    },
    footerNav: {
      display: 'flex',
      justifyContent: 'space-between',
      borderTop: '1px solid #f0f0f0',
      paddingTop: 24,
      marginTop: 'auto'
    }
  };

  return React.createElement(
    Layout,
    { style: styles.layout },
    React.createElement(
      Sider,
      { width: 280, style: styles.sider, theme: 'light' },
      React.createElement('div', { style: styles.siderHeader }, '《 功能说明书 》'),
      React.createElement(Menu, {
        mode: 'inline',
        selectedKeys: [selectedKey],
        defaultOpenKeys: ['2', '3', '4', '5'],
        style: { borderRight: 0, padding: '12px 0' },
        items: menuItems,
        onClick: handleMenuClick
      })
    ),
    React.createElement(
      Layout,
      { style: { backgroundColor: '#fff' } },
      React.createElement(
        Content,
        { style: styles.contentWrapper },
        React.createElement(
          'div',
          { style: styles.contentInner },
          renderContent()
        ),
        React.createElement(
          'div',
          { style: styles.footerNav },
          prevItem
            ? React.createElement(
                Button,
                {
                  type: 'link',
                  size: 'large',
                  onClick: function () { setSelectedKey(prevItem.key); },
                  style: { padding: 0 }
                },
                '← 上一页：' + prevItem.label
              )
            : React.createElement('div', null),
          nextItem
            ? React.createElement(
                Button,
                {
                  type: 'link',
                  size: 'large',
                  onClick: function () { setSelectedKey(nextItem.key); },
                  style: { padding: 0 }
                },
                '下一页：' + nextItem.label + ' →'
              )
            : React.createElement('div', null)
        )
      )
    )
  );
};
