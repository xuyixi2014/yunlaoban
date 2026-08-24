/* ============ 云老板 · 模拟数据 ============ */
(function (global) {
  "use strict";

  const now = new Date();
  function dstr(daysBack) {
    const d = new Date(now.getTime() - daysBack * 86400000);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- 商品分类 ---------- */
  const CATEGORIES = [
    { name: "酒水", children: ["白酒", "啤酒", "红酒", "饮料"] },
    { name: "日杂", children: ["日用百货", "清洁用品", "一次性用品"] },
    { name: "熟食", children: ["卤味", "凉菜", "烘焙"] },
    { name: "玩具", children: ["益智玩具", "毛绒玩具"] },
    { name: "食品", children: ["方便食品", "休闲零食", "调味品"] },
    { name: "日化", children: ["化妆品日化", "生活用纸", "洗护用品"] },
    { name: "粮油", children: ["大米", "面粉", "食用油"] },
    { name: "饮料", children: ["碳酸饮料", "茶饮", "乳饮"] },
    { name: "电子产品", children: ["电器", "手机配件", "数码"] },
    { name: "服装", children: ["男装", "女装", "童装"] },
    { name: "宠物用品", children: ["猫粮", "狗粮", "玩具"] },
    { name: "化肥农资", children: ["复合肥", "农药"] }
  ];

  /* ---------- 商品 ---------- */
  const PRODUCTS = [
    { id: "P0001", name: "心相印茶语丝享系列抽纸", spec: "3层*120抽", brand: "心相印", unit: "包", origin: "中国", cat: "生活用纸", barCode: "6901234567890", stock: 120, stockUpper: 200, stockLower: 50, warehouse: "总仓", cost: 3.2, price: 5.0 },
    { id: "P0002", name: "心相印粒装三层卷筒卫生纸", spec: "12卷", brand: "心相印", unit: "提", origin: "中国", cat: "生活用纸", barCode: "6901234567891", stock: 45, stockUpper: 150, stockLower: 60, warehouse: "总仓", cost: 16.5, price: 22.8 },
    { id: "P0003", name: "洁柔天然无香抽纸", spec: "3层*100抽*6包", brand: "洁柔", unit: "提", origin: "中国", cat: "生活用纸", barCode: "6901234567892", stock: 88, stockUpper: 120, stockLower: 40, warehouse: "总仓", cost: 12.0, price: 18.5 },
    { id: "P0004", name: "泸州老窖特曲白酒", spec: "52度 500ml", brand: "泸州老窖", unit: "瓶", origin: "四川", cat: "白酒", barCode: "6901234567893", stock: 30, stockUpper: 100, stockLower: 20, warehouse: "总仓", cost: 68.0, price: 98.0 },
    { id: "P0005", name: "燕京啤酒", spec: "330ml*24听", brand: "燕京", unit: "箱", origin: "北京", cat: "啤酒", barCode: "6901234567894", stock: 180, stockUpper: 300, stockLower: 80, warehouse: "总仓", cost: 42.0, price: 55.0 },
    { id: "P0006", name: "康师傅红烧牛肉面", spec: "110g*24袋", brand: "康师傅", unit: "箱", origin: "天津", cat: "方便食品", barCode: "6901234567895", stock: 66, stockUpper: 200, stockLower: 50, warehouse: "二库", cost: 38.0, price: 46.0 },
    { id: "P0007", name: "安井锁鲜猪肉大葱水饺", spec: "1000g", brand: "安井", unit: "袋", origin: "福建", cat: "冷冻食品", barCode: "6901234567896", stock: 12, stockUpper: 80, stockLower: 30, warehouse: "二库", cost: 18.0, price: 26.0 },
    { id: "P0008", name: "安井鱼丸", spec: "2.5kg", brand: "安井", unit: "袋", origin: "福建", cat: "冷冻食品", barCode: "6901234567897", stock: 5, stockUpper: 60, stockLower: 25, warehouse: "总仓", cost: 32.0, price: 44.0 },
    { id: "P0009", name: "山东冻分割鸡", spec: "9.5kg", brand: "六和", unit: "件", origin: "山东", cat: "冷冻食品", barCode: "6901234567898", stock: 0, stockUpper: 50, stockLower: 20, warehouse: "总仓", cost: 95.0, price: 125.0 },
    { id: "P0010", name: "金龙鱼一级大豆油", spec: "5L", brand: "金龙鱼", unit: "桶", origin: "中国", cat: "食用油", barCode: "6901234567899", stock: 40, stockUpper: 150, stockLower: 30, warehouse: "总仓", cost: 48.0, price: 62.0 },
    { id: "P0011", name: "百岁山天然矿泉水", spec: "570ml*24瓶", brand: "百岁山", unit: "箱", origin: "广东", cat: "饮料", barCode: "6901234567800", stock: 95, stockUpper: 180, stockLower: 50, warehouse: "二库", cost: 36.0, price: 48.0 },
    { id: "P0012", name: "奥利奥夹心饼干", spec: "466g", brand: "奥利奥", unit: "盒", origin: "上海", cat: "休闲零食", barCode: "6901234567801", stock: 22, stockUpper: 90, stockLower: 20, warehouse: "总仓", cost: 15.0, price: 21.9 },
    { id: "P0013", name: "海天味极鲜酱油", spec: "1.9L", brand: "海天", unit: "瓶", origin: "广东", cat: "调味品", barCode: "6901234567802", stock: 58, stockUpper: 120, stockLower: 30, warehouse: "总仓", cost: 12.0, price: 16.8 },
    { id: "P0014", name: "维达超韧抽纸", spec: "3层*130抽*8包", brand: "维达", unit: "提", origin: "广东", cat: "生活用纸", barCode: "6901234567803", stock: 12, stockUpper: 100, stockLower: 40, warehouse: "二库", cost: 20.0, price: 28.9 },
    { id: "P0015", name: "苏州大米", spec: "10kg", brand: "苏垦", unit: "袋", origin: "江苏", cat: "大米", barCode: "6901234567804", stock: 70, stockUpper: 200, stockLower: 40, warehouse: "总仓", cost: 52.0, price: 62.0 },
    { id: "P0016", name: "美的电磁炉", spec: "2100W", brand: "美的", unit: "台", origin: "广东", cat: "电器", barCode: "6901234567805", stock: 15, stockUpper: 50, stockLower: 10, warehouse: "总仓", cost: 185.0, price: 269.0 },
    { id: "P0017", name: "赵一鸣坚果零食大礼包", spec: "1000g", brand: "赵一鸣", unit: "箱", origin: "安徽", cat: "休闲零食", barCode: "6901234567806", stock: 3, stockUpper: 60, stockLower: 15, warehouse: "二库", cost: 72.0, price: 98.0 },
    { id: "P0018", name: "老村长白酒", spec: "42度 450ml", brand: "老村长", unit: "瓶", origin: "黑龙江", cat: "白酒", barCode: "6901234567807", stock: 130, stockUpper: 200, stockLower: 60, warehouse: "总仓", cost: 20.0, price: 32.0 }
  ];

  /* ---------- 客户 ---------- */
  const CUSTOMERS = [
    { id: "C0001", name: "沪上阿姨奶茶店", contact: "张女士", phone: "13800138001", area: "辽宁沈阳", type: "零售", balance: 0, credit: 0 },
    { id: "C0002", name: "千家福超市", contact: "王老板", phone: "13800138002", area: "辽宁沈阳", type: "批发", balance: 12680.50, credit: 50000 },
    { id: "C0003", name: "二库便利店", contact: "李店长", phone: "13800138003", area: "辽宁鞍山", type: "零售", balance: 3200.00, credit: 20000 },
    { id: "C0004", name: "老张批发部", contact: "张先生", phone: "13800138004", area: "辽宁抚顺", type: "批发", balance: 0, credit: 30000 },
    { id: "C0005", name: "好运来商贸", contact: "陈经理", phone: "13800138005", area: "辽宁大连", type: "批发", balance: 8640.00, credit: 80000 },
    { id: "C0006", name: "红旗连锁", contact: "刘总", phone: "13800138006", area: "吉林长春", type: "批发", balance: 45890.00, credit: 150000 },
    { id: "C0007", name: "万科生活超市", contact: "赵主管", phone: "13800138007", area: "辽宁沈阳", type: "零售", balance: 760.00, credit: 0 },
    { id: "C0008", name: "哈尔滨老店", contact: "孙师傅", phone: "13800138008", area: "黑龙江哈尔滨", type: "批发", balance: 0, credit: 60000 },
    { id: "C0009", name: "苏果便利", contact: "周女士", phone: "13800138009", area: "江苏南京", type: "零售", balance: 0, credit: 0 },
    { id: "C0010", name: "沂蒙山货行", contact: "郭老板", phone: "13800138010", area: "山东临沂", type: "批发", balance: 15400.00, credit: 40000 }
  ];

  /* ---------- 供应商 ---------- */
  const SUPPLIERS = [
    { id: "S0001", name: "心相印沈阳总代", contact: "钱经理", phone: "13900139001", area: "辽宁沈阳", account: "中国银行 6217****8888", balance: 0 },
    { id: "S0002", name: "安井食品华北", contact: "吴经理", phone: "13900139002", area: "河北石家庄", account: "工商银行 6222****6666", balance: 24500.00 },
    { id: "S0003", name: "金龙鱼粮油经销", contact: "郑总", phone: "13900139003", area: "辽宁大连", account: "建设银行 6217****3333", balance: 5800.00 },
    { id: "S0004", name: "海天味业", contact: "冯经理", phone: "13900139004", area: "广东佛山", account: "农业银行 6228****1111", balance: 0 },
    { id: "S0005", name: "美的沈阳办", contact: "陈经理", phone: "13900139005", area: "辽宁沈阳", account: "招商银行 6214****5555", balance: 0 },
    { id: "S0006", name: "泸州老窖经销", contact: "蒋总", phone: "13900139006", area: "四川泸州", account: "中国银行 6217****2222", balance: 12000.00 }
  ];

  /* ---------- 职员 ---------- */
  const STAFF = [
    { id: "U0001", name: "陈总", role: "老板", phone: "13700137001", commission: 0, status: "在职" },
    { id: "U0002", name: "王小明", role: "销售员", phone: "13700137002", commission: 0.02, status: "在职" },
    { id: "U0003", name: "李小红", role: "销售员", phone: "13700137003", commission: 0.015, status: "在职" },
    { id: "U0004", name: "赵大厨", role: "仓管员", phone: "13700137004", commission: 0, status: "在职" },
    { id: "U0005", name: "钱会计", role: "财务", phone: "13700137005", commission: 0, status: "在职" },
    { id: "U0006", name: "孙采购", role: "采购员", phone: "13700137006", commission: 0, status: "离职" },
    { id: "U0007", name: "周客服", role: "客服", phone: "13700137007", commission: 0, status: "在职" }
  ];

  /* ---------- 收支账户 ---------- */
  const ACCOUNTS = [
    { id: "A0001", name: "现金", type: "现金", balance: 8560.00 },
    { id: "A0002", name: "工商银行", type: "银行", balance: 128600.00 },
    { id: "A0003", name: "农业银行卡", type: "银行", balance: 58200.00 },
    { id: "A0004", name: "微信收款", type: "第三方支付", balance: 31240.50 },
    { id: "A0005", name: "支付宝", type: "第三方支付", balance: 18930.00 }
  ];

  /* ---------- 销售单 ---------- */
  const SALES = [
    { id: "XS20260720001", date: dstr(0), customer: "沪上阿姨奶茶店", staff: "王小明", warehouse: "总仓", amount: 268.00, paid: 268.00, status: "已结算" },
    { id: "XS20260719002", date: dstr(1), customer: "千家福超市", staff: "王小明", warehouse: "总仓", amount: 4350.00, paid: 2000.00, status: "未结清" },
    { id: "XS20260718003", date: dstr(2), customer: "二库便利店", staff: "李小红", warehouse: "二库", amount: 1200.50, paid: 1200.50, status: "已结算" },
    { id: "XS20260717004", date: dstr(3), customer: "好运来商贸", staff: "李小红", warehouse: "总仓", amount: 8640.00, paid: 0, status: "未结清" },
    { id: "XS20260716005", date: dstr(4), customer: "红旗连锁", staff: "王小明", warehouse: "总仓", amount: 9800.00, paid: 5000.00, status: "未结清" },
    { id: "XS20260715006", date: dstr(5), customer: "沂蒙山货行", staff: "李小红", warehouse: "二库", amount: 7320.00, paid: 7320.00, status: "已结算" },
    { id: "XS20260714007", date: dstr(6), customer: "万科生活超市", staff: "王小明", warehouse: "总仓", amount: 760.00, paid: 760.00, status: "已结算" },
    { id: "XS20260713008", date: dstr(7), customer: "老张批发部", staff: "李小红", warehouse: "总仓", amount: 5250.00, paid: 2000.00, status: "未结清" },
    { id: "XS20260712009", date: dstr(8), customer: "哈尔滨老店", staff: "王小明", warehouse: "二库", amount: 6850.00, paid: 6850.00, status: "已结算" },
    { id: "XS20260711010", date: dstr(9), customer: "沪上阿姨奶茶店", staff: "王小明", warehouse: "总仓", amount: 320.00, paid: 320.00, status: "已结算" },
    { id: "XS20260710011", date: dstr(10), customer: "好运来商贸", staff: "李小红", warehouse: "总仓", amount: 5100.00, paid: 5100.00, status: "已结算" },
    { id: "XS20260709012", date: dstr(11), customer: "苏果便利", staff: "王小明", warehouse: "总仓", amount: 940.00, paid: 940.00, status: "已结算" }
  ];

  /* ---------- 零售单 ---------- */
  const RETAILS = [
    { id: "LS20260720001", date: dstr(0), cashier: "周客服", store: "总仓门店", count: 6, amount: 58.00 },
    { id: "LS20260720002", date: dstr(0), cashier: "周客服", store: "总仓门店", count: 2, amount: 44.00 },
    { id: "LS20260719003", date: dstr(1), cashier: "李小红", store: "总仓门店", count: 12, amount: 186.50 },
    { id: "LS20260718004", date: dstr(2), cashier: "周客服", store: "二库门店", count: 3, amount: 96.00 }
  ];

  /* ---------- 采购单 ---------- */
  const PURCHASES = [
    { id: "CG20260719001", date: dstr(1), supplier: "安井食品华北", staff: "孙采购", warehouse: "总仓", amount: 24500.00, paid: 0, status: "未结清" },
    { id: "CG20260717002", date: dstr(3), supplier: "金龙鱼粮油经销", staff: "孙采购", warehouse: "总仓", amount: 5800.00, paid: 0, status: "未结清" },
    { id: "CG20260715003", date: dstr(5), supplier: "泸州老窖经销", staff: "孙采购", warehouse: "总仓", amount: 12000.00, paid: 6000.00, status: "未结清" },
    { id: "CG20260713004", date: dstr(7), supplier: "心相印沈阳总代", staff: "孙采购", warehouse: "二库", amount: 8600.00, paid: 8600.00, status: "已结算" },
    { id: "CG20260712005", date: dstr(8), supplier: "海天味业", staff: "孙采购", warehouse: "总仓", amount: 4390.00, paid: 4390.00, status: "已结算" },
    { id: "CG20260710006", date: dstr(10), supplier: "美的沈阳办", staff: "孙采购", warehouse: "总仓", amount: 18500.00, paid: 18500.00, status: "已结算" }
  ];

  /* ---------- 资金单据 ---------- */
  const RECEIPTS = [
    { id: "SK20260720001", date: dstr(0), customer: "红旗连锁", account: "工商银行", amount: 5000.00, method: "转账", status: "已审核" },
    { id: "SK20260719002", date: dstr(1), customer: "千家福超市", account: "微信收款", amount: 2000.00, method: "微信", status: "已审核" },
    { id: "SK20260715003", date: dstr(5), customer: "好运来商贸", account: "现金", amount: 8640.00, method: "现金", status: "已审核" },
    { id: "SK20260713004", date: dstr(7), customer: "老张批发部", account: "农业银行卡", amount: 2000.00, method: "转账", status: "待审核" }
  ];
  const PAYMENTS = [
    { id: "FK20260719001", date: dstr(1), supplier: "泸州老窖经销", account: "工商银行", amount: 6000.00, method: "转账", status: "已审核" },
    { id: "FK20260717002", date: dstr(3), supplier: "安井食品华北", account: "工商银行", amount: 12000.00, method: "转账", status: "已审核" },
    { id: "FK20260715003", date: dstr(5), supplier: "金龙鱼粮油经销", account: "农业银行卡", amount: 5800.00, method: "转账", status: "待审核" }
  ];
  const EXPENSES = [
    { id: "FY20260720001", date: dstr(0), category: "房租", account: "现金", amount: 4500.00, remark: "7月门店租金", status: "已审核" },
    { id: "FY20260718002", date: dstr(2), category: "水电费", account: "现金", amount: 880.00, remark: "门店水电", status: "已审核" },
    { id: "FY20260715003", date: dstr(5), category: "物流费", account: "微信收款", amount: 360.00, remark: "配送", status: "待审核" }
  ];
  const INCOMES = [
    { id: "SR20260720001", date: dstr(0), category: "其他收入", account: "现金", amount: 200.00, remark: "包装物回收", status: "已审核" },
    { id: "SR20260717002", date: dstr(3), category: "利息", account: "工商银行", amount: 120.50, remark: "", status: "已审核" }
  ];

  /* ---------- 库存预警 ---------- */
  const WARNS = [
    { id: "P0008", name: "安井鱼丸", spec: "2.5kg", warehouse: "总仓", stock: 5, std: 25, type: "库存下限" },
    { id: "P0009", name: "山东冻分割鸡", spec: "9.5kg", warehouse: "总仓", stock: 0, std: 20, type: "库存下限" },
    { id: "P0012", name: "奥利奥夹心饼干", spec: "466g", warehouse: "总仓", stock: 22, std: 20, type: "库存下限" },
    { id: "P0017", name: "赵一鸣坚果零食大礼包", spec: "1000g", warehouse: "二库", stock: 3, std: 15, type: "库存下限" },
    { id: "P0014", name: "维达超韧抽纸", spec: "3层*130抽*8包", warehouse: "二库", stock: 12, std: 40, type: "库存下限" }
  ];

  /* ---------- 运营参数（系统设置） ---------- */
  const SYS_PARAMS = [
    { group: "基础设置", key: "公司名称", value: "苏家屯宇少科技有限公司", editable: true },
    { group: "基础设置", key: "软件版本", value: "v_stable (20260317)", editable: false },
    { group: "业务设置", key: "启用批次管理", value: "否", editable: true },
    { group: "业务设置", key: "启用保质期", value: "是", editable: true },
    { group: "业务设置", key: "销售价含税", value: "是", editable: true },
    { group: "业务设置", key: "允许负库存", value: "否", editable: true },
    { group: "单据设置", key: "销售单编号前缀", value: "XS", editable: true },
    { group: "单据设置", key: "采购单编号前缀", value: "CG", editable: true },
    { group: "单据设置", key: "自动审核", value: "否", editable: true },
    { group: "打印设置", key: "打印服务版本", value: "4.0.2.6", editable: false },
    { group: "打印设置", key: "打印方式", value: "数据上传到打印管理器 (ajax)", editable: false },
    { group: "通知设置", key: "库存预警提醒", value: "开", editable: true },
    { group: "通知设置", key: "消息中心提醒", value: "开", editable: true }
  ];

  global.DATA = {
    categories: CATEGORIES,
    products: PRODUCTS,
    customers: CUSTOMERS,
    suppliers: SUPPLIERS,
    staff: STAFF,
    accounts: ACCOUNTS,
    sales: SALES,
    retails: RETAILS,
    purchases: PURCHASES,
    receipts: RECEIPTS,
    payments: PAYMENTS,
    expenses: EXPENSES,
    incomes: INCOMES,
    warns: WARNS,
    sysParams: SYS_PARAMS
  };
})(window);
