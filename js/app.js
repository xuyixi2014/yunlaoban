/* ============ 云老板 · 应用逻辑 ============ */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const D = window.DATA;
  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const money = n => "￥" + Number(n || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); };

  const state = { user: null, pageSize: 10, page: {}, current: "home" };

  /* ================= 菜单定义 ================= */
  const MENU = [
    { name: "首页", icon: "🏠", children: [{ label: "工作台", route: "home" }] },
    { name: "销售", icon: "🛒", children: [
        { label: "销售单", route: "sale" },
        { label: "销售历史", route: "saleHistory" },
        { label: "零售单", route: "retail" },
        { label: "销售退货单", route: "saleReturn" },
        { label: "客户销售价", route: "customerPrice" }
    ]},
    { name: "采购", icon: "🚚", children: [
        { label: "采购单", route: "purchase" },
        { label: "采购历史", route: "purchaseHistory" },
        { label: "采购退货单", route: "purchaseReturn" },
        { label: "供应商采购价", route: "supplierPrice" }
    ]},
    { name: "仓库", icon: "📦", children: [
        { label: "调拨单", route: "transfer" },
        { label: "盘点单", route: "stocktake" },
        { label: "预警设置", route: "warnSet" },
        { label: "预警查询", route: "warnQuery" }
    ]},
    { name: "资金", icon: "💰", children: [
        { label: "收款单", route: "receipt" },
        { label: "付款单", route: "payment" },
        { label: "费用单", route: "expense" },
        { label: "收入单", route: "income" }
    ]},
    { name: "查询", icon: "🔍", children: [
        { label: "查库存", route: "stock" },
        { label: "查资金", route: "balance" },
        { label: "查应收", route: "receivable" },
        { label: "查应付", route: "payable" }
    ]},
    { name: "分析", icon: "📊", children: [
        { label: "商品分析", route: "analysisProduct" },
        { label: "客户分析", route: "analysisCustomer" },
        { label: "趋势分析", route: "analysisTrend" },
        { label: "职员业绩", route: "analysisStaff" },
        { label: "供应商分析", route: "analysisSupplier" },
        { label: "经营分析", route: "analysisManage" }
    ]},
    { name: "设置", icon: "⚙️", children: [
        { label: "商品", route: "settingProduct" },
        { label: "客户", route: "settingCustomer" },
        { label: "供应商", route: "settingSupplier" },
        { label: "职员", route: "settingStaff" },
        { label: "收支账户", route: "settingAccount" },
        { label: "系统参数", route: "settingParam" },
        { label: "系统重建", route: "settingRebuild" },
        { label: "操作日志", route: "settingLog" }
    ]},
    { name: "商城", icon: "🏪", children: [
        { label: "商城订单", route: "mallOrder" },
        { label: "店铺设置", route: "mallStore" }
    ]},
    { name: "数据报表", icon: "📈", children: [{ label: "报表中心", route: "report" }] },
    { name: "老板中心", icon: "👔", children: [{ label: "经营看板", route: "boss" }] },
    { name: "帮助中心", icon: "❓", children: [{ label: "操作指南", route: "help" }] }
  ];
  const FLAT = {};
  MENU.forEach(g => g.children.forEach(c => { FLAT[c.route] = { label: c.label, group: g.name, icon: c.icon }; }));

  /* ================= 通用 UI ================= */
  function toast(msg, type) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast " + (type === "error" ? "toast-error" : type === "success" ? "toast-success" : "");
    t.style.display = "block";
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.display = "none"; }, 2200);
  }

  function openModal(title, bodyHtml, footHtml) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = bodyHtml;
    $("#modal-foot").innerHTML = footHtml || "";
    $("#modal").style.display = "flex";
    $("#modal-mask").style.display = "block";
  }
  function closeModal() {
    $("#modal").style.display = "none";
    $("#modal-mask").style.display = "none";
  }

  /* 微信红包弹窗 */
  function showRedPacket() {
    $("#rp-mask").style.display = "flex";
    $("#rp-card").classList.remove("opened");
  }
  function hideRedPacket() {
    $("#rp-mask").style.display = "none";
    $("#rp-card").classList.remove("opened");
  }

  function renderGrid(route, cols, rows, opts) {
    opts = opts || {};
    const key = route;
    if (!state.page[key]) state.page[key] = { page: 1, size: state.pageSize, fields: {} };
    const st = state.page[key];
    let filtered = rows;
    if (opts.filter) filtered = opts.filter(rows, st.fields || {});
    const total = filtered.length;
    const size = st.size;
    const pages = Math.max(1, Math.ceil(total / size));
    if (st.page > pages) st.page = pages;
    const start = (st.page - 1) * size;
    const slice = filtered.slice(start, start + size);
    let html = "";
    if (opts.toolbar) html += opts.toolbar({ total });
    html += '<div class="grid-wrap"><div class="table-scroll"><table class="grid"><thead><tr>';
    cols.forEach(c => html += "<th" + (c.cls ? ' class="' + c.cls + '"' : "") + ">" + (c.label || "") + "</th>");
    html += "</tr></thead><tbody>";
    if (!slice.length) {
      html += '<tr class="grid-empty"><td colspan="' + cols.length + '" class="grid-empty-cell"><div class="empty"><span class="empty-ico">📭</span>暂无数据</div></td></tr>';
    } else {
      slice.forEach((r, i) => {
        html += "<tr>";
        cols.forEach(c => {
          let v = r[c.key];
          if (c.render) v = c.render(r, i);
          let clsAttr = "";
          let cls = (opts.rowClass && opts.rowClass(r)) || (c.cls || "");
          if (cls) clsAttr = ' class="' + cls + '"';
          const labelAttr = c.label ? ' data-label="' + esc(c.label) + '"' : "";
          html += "<td" + clsAttr + labelAttr + ">" + (v == null ? "" : v) + "</td>";
        });
        html += "</tr>";
      });
    }
    html += "</tbody></table></div>";
    // 分页
    if (pages > 1 || total > 0) {
      html += '<div class="pagination"><span>共 ' + total + ' 条</span>'
        + '<button class="page-btn" data-action="grid-go" data-route="' + route + '" data-p="1"' + (st.page <= 1 ? " disabled" : "") + '>«</button>'
        + '<button class="page-btn" data-action="grid-go" data-route="' + route + '" data-p="' + (st.page - 1) + '"' + (st.page <= 1 ? " disabled" : "") + '>‹上一页</button>';
      let startP = Math.max(1, st.page - 2), endP = Math.min(pages, startP + 4);
      startP = Math.max(1, endP - 4);
      for (let p = startP; p <= endP; p++) {
        html += '<button class="page-btn' + (p === st.page ? " active" : "") + '" data-action="grid-go" data-route="' + route + '" data-p="' + p + '">' + p + "</button>";
      }
      html += '<button class="page-btn" data-action="grid-go" data-route="' + route + '" data-p="' + (st.page + 1) + '"' + (st.page >= pages ? " disabled" : "") + '>下一页›</button>'
        + '<button class="page-btn" data-action="grid-go" data-route="' + route + '" data-p="' + pages + '"' + (st.page >= pages ? " disabled" : "") + '>»</button>'
        + '<span>每页</span><input type="text" value="' + size + '" data-role="page-size" data-route="' + route + '"><span>条</span>'
        + '<span>跳转到 </span><input type="text" data-role="page-jump" data-route="' + route + '"><span>页</span>'
        + '<button class="page-btn" data-action="grid-jump" data-route="' + route + '">跳转</button>'
        + '</div>';
    }
    return html;
  }

  /* ================= 页面渲染 ================= */
  function searchBox(route, fields) {
    const st = state.page[route] = state.page[route] || { page: 1, size: state.pageSize, fields: {} };
    st.fields = st.fields || {};
    let html = '<div class="toolbar"><div class="filter-item"><span>快捷查询</span></div>';
    fields.forEach(f => {
      const val = st.fields[f.key] || "";
      html += '<div class="filter-item"><span>' + esc(f.label) + '</span><input type="text" id="q-' + f.key + '" placeholder="' + esc(f.ph || "请输入") + '" value="' + esc(val) + '"></div>';
    });
    html += '<button class="btn btn-primary" data-action="grid-search" data-route="' + route + '">查询</button>'
      + '<button class="btn" data-action="grid-reset" data-route="' + route + '">重置</button>';
    if (fields.extra) html += fields.extra;
    html += "</div>";
    return html;
  }

  function captureFields(route) {
    const st = state.page[route] = state.page[route] || { page: 1, size: state.pageSize, fields: {} };
    st.fields = st.fields || {};
    $$("#content-body input[id^=q-]").forEach(inp => { st.fields[inp.id.slice(2)] = inp.value; });
    return st.fields;
  }
  function clearFields(route) {
    const st = state.page[route];
    if (st) st.fields = {};
    $$("#content-body input[id^=q-]").forEach(inp => inp.value = "");
  }

  function setContentHead(title, actions) {
    $("#breadcrumb").textContent = title;
    $("#content-actions").innerHTML = actions || "";
  }

  /* ---- 首页 ---- */
  function pageHome() {
    const totalStock = D.products.reduce((a, p) => a + p.stock, 0);
    const totalValue = D.products.reduce((a, p) => a + p.stock * p.cost, 0);
    const receiv = D.customers.reduce((a, c) => a + c.balance, 0);
    const payab = D.suppliers.reduce((a, s) => a + s.balance, 0);
    const monthSale = D.sales.reduce((a, s) => a + s.amount, 0);
    const warns = D.warns.length;
    const acts = '<span class="info-note">快捷功能</span><button class="btn btn-primary btn-sm" data-action="quick-sale">📝 快速开销售单</button><button class="btn btn-sm" data-action="quick-stock">📦 查库存</button><button class="btn btn-sm" data-action="quick-report">📈 报表中心</button>';
    let h = '<div class="stats-row">'
      + stat("本月销售额", money(monthSale), "较上月 +12.5%", "up", "💹")
      + stat("库存金额", money(totalValue), "共 " + totalStock + " 件商品", "", "📦")
      + stat("应收欠款", money(receiv), D.customers.length + " 家客户", "down", "🧾")
      + stat("应付欠款", money(payab), D.suppliers.length + " 家供应商", "", "💳")
      + stat("库存预警", warns + " 项", "需及时补货", "down", "⚠️")
      + "</div>";
    h += '<div style="display:grid;grid-template-columns:2fr 1fr;gap:14px">';
    // 左：经营概览 + 快捷菜单
    h += '<div>';
    h += '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">经营概览（近 7 日销售）</div>' + barChart(salesTrend(), "金额(元)") + '</div>';
    h += '<div class="card card-pad"><div class="section-title">常用菜单</div><div class="quick-menu-grid">' + quickMenu() + '</div></div>';
    h += "</div>";
    // 右：公告 + 帮助 + 下载
    h += '<div>';
    h += '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">系统公告</div><div class="notice">'
      + notice("更新", "云老板 v_stable 版本已更新，新增保质期管理功能。", "2026-07-20")
      + notice("公告", "关于推行电子发票的通知，请各位老板及时配置。", "2026-07-18")
      + notice("教程", "“扫码快速开单”功能上线，扫码即可录入销售。", "2026-07-15")
      + '</div></div>';
    h += '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">帮助中心</div><div class="help-list">'
      + helpItem("🎥", "语音快速开销售单", "语音识别，开单更省时")
      + helpItem("🔳", "扫码快速开销售单", "扫条码一键录入商品")
      + helpItem("📋", "销售单详细操作", "从建单到打印全流程")
      + '</div></div>';
    h += '<div class="card card-pad"><div class="section-title">扫码访问网站</div>'
      + '<div class="qr-site"><img class="qr-site-img" src="assets/qr-website.svg" alt="扫码进入云老板网站"><span class="qr-site-tip">扫码进入云老板网站</span></div>'
      + '<div class="dl-row">' + dlBtn("电脑端 (Windows)", "download_win.png") + '</div></div>';
    h += '</div></div>';
    return buildPage("工作台", h, acts);
  }
  function stat(label, value, extra, dir, icon) {
    return '<div class="card stat-card"><span class="stat-icon">' + icon + '</span><span class="stat-label">' + esc(label) + '</span><span class="stat-value">' + value + '</span><span class="stat-extra ' + (dir === "up" ? "stat-up" : dir === "down" ? "stat-down" : "") + '">' + esc(extra) + "</span></div>";
  }
  function notice(tag, text, time) { return '<div class="notice-item"><span class="n-tag">[' + esc(tag) + ']</span><span>' + esc(text) + '</span><span class="n-time">' + esc(time) + "</span></div>"; }
  function helpItem(ico, t, d) { return '<div class="help-item"><span class="help-ico">' + ico + '</span><div><div style="font-weight:600">' + esc(t) + '</div><div style="font-size:12px;color:var(--muted)">' + esc(d) + "</div></div></div>"; }
  function quickMenu() {
    const items = [["商品", "settingProduct"], ["客户", "settingCustomer"], ["供应商", "settingSupplier"], ["职员", "settingStaff"], ["收支账户", "settingAccount"], ["系统参数", "settingParam"], ["商城订单", "mallOrder"], ["库存预警", "warnQuery"]];
    return items.map(it => '<div class="qm-item" data-action="nav" data-route="' + it[1] + '"><span class="qm-ico">' + iconFor(it[1]) + "</span><span>" + it[0] + "</span></div>").join("");
  }
  function iconFor(route) { return (FLAT[route] && FLAT[route].icon) || "📄"; }
  function dlBtn(t, img) { return '<div class="dl-item"><img src="assets/' + img + '" alt=""><span>' + t + "</span></div>"; }
  function salesTrend() {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      arr.push({ label: (d.getMonth() + 1) + "/" + d.getDate(), value: Math.round(2000 + Math.random() * 6000) });
    }
    return arr;
  }
  function barChart(data, unit) {
    const max = Math.max.apply(null, data.map(d => d.value));
    let bars = "", xs = "";
    data.forEach(d => {
      const h = Math.round(d.value / max * 100);
      bars += '<div class="chart-bar" style="height:' + h + '%"><span class="bar-val">' + d.value + '</span></div>';
      xs += "<span>" + d.label + "</span>";
    });
    return '<div class="chart-box"><div class="chart-bars">' + bars + '</div><div class="chart-x">' + xs + "</div></div>";
  }
  function donutChart(items) {
    // items: [{label, value, color}]
    const total = items.reduce((a, i) => a + i.value, 0) || 1;
    let acc = 0; const segs = [];
    const palette = ["#2f6fed", "#22a06b", "#f5a623", "#e5484d", "#8b5cf6", "#14b8a6", "#f97316"];
    items.forEach((it, i) => {
      const pct = it.value / total * 360;
      segs.push(palette[i % palette.length] + " " + acc + "deg " + (acc + pct) + "deg");
      acc += pct;
    });
    const bg = "conic-gradient(" + segs.join(",") + ")";
    let legend = "";
    items.forEach((it, i) => {
      legend += '<div class="legend-item"><span class="legend-dot" style="background:' + palette[i % palette.length] + '"></span><span>' + esc(it.label) + '</span><span class="lv">' + money(it.value) + '</span></div>';
    });
    let donut = '<div style="width:150px;height:150px;border-radius:50%;background:' + bg + ';position:relative;flex:none"><div style="position:absolute;inset:28px;background:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:20px;font-weight:700">' + money(total) + '</span><span style="font-size:11px;color:var(--muted)">合计</span></div></div>';
    return '<div class="chart-box"><div class="chart-pie">' + donut + '<div class="chart-legend">' + legend + "</div></div></div>";
  }

  /* ---- 销售类页面 ---- */
  function pageSale() {
    const acts = '<button class="btn btn-primary btn-sm" data-action="add-sale">+ 新增销售单</button><button class="btn btn-sm" data-action="quick-sale">快速开单</button>';
    const cols = [
      { label: "单据编号", key: "id" },
      { label: "日期", key: "date" },
      { label: "客户", key: "customer" },
      { label: "业务员", key: "staff" },
      { label: "仓库", key: "warehouse" },
      { label: "金额", key: "amount", cls: "money", render: r => money(r.amount) },
      { label: "已收", key: "paid", cls: "money", render: r => money(r.paid) },
      { label: "状态", key: "status", render: r => tag(r.status) }
    ];
    const opts = { actions: acts,
      filter: (rows, f) => { const q = ((f && f.kw) || "").trim(); if (!q) return rows; return rows.filter(r => (r.id + r.customer + r.staff).toLowerCase().includes(q.toLowerCase())); }
    };
    return buildPage("销售单", searchBox("sale", [{ key: "kw", label: "" }]) + renderGrid("sale", cols, D.sales, opts), acts);
  }
  function pageSaleHistory() { return simpleDocPage("销售历史", D.sales, "saleHistory", ["id", "date", "customer", "staff", "amount", "status"], "已结算", "sale"); }
  function pageRetail() {
    const cols = [{ label: "小票号", key: "id" }, { label: "日期", key: "date" }, { label: "收银员", key: "cashier" }, { label: "门店", key: "store" }, { label: "件数", key: "count", cls: "num" }, { label: "金额", key: "amount", cls: "money", render: r => money(r.amount) }];
    return buildPage("零售单", searchBox("retail", [{ key: "kw", label: "" }]) + renderGrid("retail", cols, D.retails, { filter: docFilter }), '<button class="btn btn-primary btn-sm" data-action="add-retail">+ 新增零售单</button><button class="btn btn-sm" data-action="quick-retail">收银台</button>');
  }
  function pageSaleReturn() { return simpleDocPage2("销售退货单", D.sales, "saleReturn", ["id", "date", "customer", "staff", "amount", "status"], "退货", "sale"); }
  function pageCustomerPrice() { return pricePage("客户销售价", "settingCustomer", "customerPrice", "客户"); }
  function pagePurchase() {
    const cols = [{ label: "单据编号", key: "id" }, { label: "日期", key: "date" }, { label: "供应商", key: "supplier" }, { label: "采购员", key: "staff" }, { label: "仓库", key: "warehouse" }, { label: "金额", key: "amount", cls: "money", render: r => money(r.amount) }, { label: "已付", key: "paid", cls: "money", render: r => money(r.paid) }, { label: "状态", key: "status", render: r => tag(r.status) }];
    return buildPage("采购单", searchBox("purchase", [{ key: "kw", label: "" }]) + renderGrid("purchase", cols, D.purchases, { filter: docFilter }), '<button class="btn btn-primary btn-sm" data-action="add-purchase">+ 新增采购单</button>');
  }
  function pagePurchaseHistory() { return simpleDocPage("采购历史", D.purchases, "purchaseHistory", ["id", "date", "supplier", "staff", "amount", "status"], "已结算", "purchase"); }
  function pagePurchaseReturn() { return simpleDocPage2("采购退货单", D.purchases, "purchaseReturn", ["id", "date", "supplier", "staff", "amount", "status"], "退货", "purchase"); }
  function pageSupplierPrice() { return pricePage("供应商采购价", "settingSupplier", "supplierPrice", "供应商"); }

  /* ---- 仓库 ---- */
  function pageTransfer() { return buildPage("调拨单", searchBox("transfer", [{ key: "kw", label: "" }]) + renderGrid("transfer", transferCols(), [], { filter: docFilter }), '<button class="btn btn-primary btn-sm" data-action="add-transfer">+ 新增调拨单</button>'); }
  function transferCols() { return [{ label: "单据编号", key: "id" }, { label: "日期", key: "date" }, { label: "调出仓库", key: "out" }, { label: "调入仓库", key: "in" }, { label: "商品数", key: "count", cls: "num" }, { label: "状态", key: "status", render: r => tag(r.status) }]; }
  function pageStocktake() { return buildPage("盘点单", searchBox("stocktake", [{ key: "kw", label: "" }]) + renderGrid("stocktake", stocktakeCols(), [], { filter: docFilter }), '<button class="btn btn-primary btn-sm" data-action="add-stocktake">+ 新增盘点单</button>'); }
  function stocktakeCols() { return [{ label: "单据编号", key: "id" }, { label: "日期", key: "date" }, { label: "仓库", key: "warehouse" }, { label: "商品数", key: "count", cls: "num" }, { label: "盘盈", key: "profit", cls: "num" }, { label: "盘亏", key: "loss", cls: "num" }, { label: "状态", key: "status", render: r => tag(r.status) }]; }
  function pageWarnSet() {
    let h = '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">预警规则设置</div><div class="form-grid">'
      + fLabel("启用库存预警", '<select id="param-warn"><option>开</option><option>关</option></select>')
      + fLabel("预警方式", '<select id="param-method"><option>商品下限</option><option>商品上限</option><option>两者都预警</option></select>')
      + fLabel("预警仓库", '<select id="param-wh"><option>全部仓库</option><option>总仓</option><option>二库</option></select>')
      + fLabel("预警渠道", '<select id="param-chan"><option>消息中心</option><option>短信</option><option>微信</option></select>')
      + '</div><div class="info-note">保存后，系统将按规则在“预警查询”中列出库存异常的明细。</div></div>';
    h += '<div class="card card-pad"><div class="section-title">默认预警值</div><div class="form-grid">'
      + fLabel("默认库存下限", 10)
      + fLabel("默认库存上限", 200)
      + '</div></div>';
    return buildPage("预警设置", h, '<button class="btn btn-primary btn-sm" data-action="save-warnset">保存设置</button>');
  }
  function pageWarnQuery() {
    const cols = [{ label: "商品", key: "name", render: r => "<span class='ellipsis'>" + esc(r.name) + "</span>" }, { label: "规格", key: "spec" }, { label: "仓库", key: "warehouse" }, { label: "实际库存", key: "stock", cls: "num" }, { label: "标准值", key: "std", cls: "num" }, { label: "预警类型", key: "type", render: r => tag(r.type, "tag-red") }];
    return buildPage("预警查询", searchBox("warnQuery", [{ key: "kw", label: "" }]) + renderGrid("warnQuery", cols, D.warns, { filter: docFilter, rowClass: () => "row-danger" }), '<button class="btn btn-sm" data-action="warn-restock">一键补货</button><button class="btn btn-primary btn-sm" data-action="quick-purchase">采购补货</button>');
  }

  /* ---- 资金 ---- */
  function pageReceipt() { return moneyDocPage("收款单", D.receipts, "receipt", "customer", "收款", "add-receipt"); }
  function pagePayment() { return moneyDocPage("付款单", D.payments, "payment", "supplier", "付款", "add-payment"); }
  function pageExpense() { return moneyDocPage("费用单", D.expenses, "expense", null, "费用", "add-expense", true); }
  function pageIncome() { return moneyDocPage("收入单", D.incomes, "income", null, "收入", "add-income", true); }
  function moneyDocPage(title, rows, route, partyKey, typeName, addAction, isSingle) {
    const cols = [{ label: "单据编号", key: "id" }, { label: "日期", key: "date" }];
    if (partyKey === "customer") cols.push({ label: "往来单位", key: "customer" });
    else if (partyKey === "supplier") cols.push({ label: "往来单位", key: "supplier" });
    else cols.push({ label: "类别", key: "category" });
    cols.push({ label: "结算账户", key: "account" }, { label: "金额", key: "amount", cls: "money", render: r => money(r.amount) }, { label: "结算方式", key: "method" }, { label: "状态", key: "status", render: r => tag(r.status) });
    if (isSingle) cols.splice(cols.length - 1, 0, { label: "备注", key: "remark" });
    return buildPage(title, searchBox(route, [{ key: "kw", label: "" }]) + renderGrid(route, cols, rows, { filter: docFilter }), '<button class="btn btn-primary btn-sm" data-action="' + addAction + '">+ 新增' + typeName + '</button>');
  }

  /* ---- 查询 ---- */
  function pageStock() {
    // 分类树 + 商品表格
    const acts = '<button class="btn btn-sm" data-action="export">导出</button><button class="btn btn-sm" data-action="print">打印</button><button class="btn btn-primary btn-sm" data-action="export">查询库</button>';
    const cls = state.categoryFilter || "全部商品";
    let rows = D.products.filter(p => cls === "全部商品" || p.cat === cls || catHas(cls, p.cat));
    // 分类树
    let tree = '<div class="card card-pad" style="width:210px;flex:none;height:fit-content"><div style="font-size:13px;color:var(--muted);margin-bottom:8px">商品分类</div>';
    tree += catNode("全部商品", "");
    D.categories.forEach(c => tree += catNode(c.name, c.children));
    tree += "</div>";
    const cols = [{ label: "商品名称", key: "name", render: r => "<span class='ellipsis'>" + esc(r.name) + "</span>" }, { label: "货号", key: "id" }, { label: "规格", key: "spec" }, { label: "条码", key: "barCode" }, { label: "常用单位", key: "unit" }, { label: "产地", key: "origin" }, { label: "仓库", key: "warehouse" }, { label: "实际库存", key: "stock", cls: "num", render: r => stockCell(r) }, { label: "库存上限", key: "stockUpper", cls: "num" }, { label: "库存下限", key: "stockLower", cls: "num" }];
    const left = exportFilterBar("stock");
    const body = '<div style="display:flex;gap:14px;align-items:flex-start">' + tree + '<div style="flex:1">' + left + renderGrid("stock", cols, rows, { filter: docFilter }) + "</div></div>";
    return { html: body, after: function () { setContentHead("查库存", acts); selectMenu("stock"); } };
  }
  function catHas(group, cat) { // 判断子分类归属
    const c = D.categories.find(x => x.name === group);
    return c && c.children.indexOf(cat) > -1;
  }
  function catNode(name, children) {
    let sub = "";
    if (children && children.length) {
      sub = '<div style="padding-left:10px">' + children.map(ch => '<div class="cat-node sub' + (state.categoryFilter === ch ? " active" : "") + '" data-action="cat-filter" data-cat="' + esc(ch) + '">' + esc(ch) + "</div>").join("") + "</div>";
    }
    return '<div class="cat-node' + (state.categoryFilter === name ? " active" : "") + '" data-action="cat-filter" data-cat="' + esc(name) + '">' + esc(name) + "</div>" + sub;
  }
  function stockCell(r) {
    const d = r.stock < r.stockLower;
    return '<span' + (d ? ' style="color:var(--danger);font-weight:700"' : "") + ">" + r.stock + "</span>";
  }
  function exportFilterBar(route) {
    return '<div class="toolbar"><div class="filter-item"><span>快捷查询</span></div>'
      + '<div class="filter-item"><span>仓库</span><select><option>全部仓库</option><option>总仓</option><option>二库</option></select></div>'
      + '<div class="filter-item"><span>品牌</span><select><option>全部</option><option>心相印</option><option>洁柔</option><option>安井</option><option>维达</option></select></div>'
      + '<div class="filter-item"><input type="text" id="q-kw" placeholder="商品名称/条码/货号"></div>'
      + '<button class="btn btn-primary btn-sm" data-action="grid-search" data-route="' + route + '">查询</button>'
      + '<button class="btn btn-sm" data-action="grid-reset" data-route="' + route + '">重置</button></div>';
  }
  function pageBalance() {
    const acts = '<button class="btn btn-sm" data-action="transfer-acct">+ 内部转账</button>';
    const cols = [{ label: "账户名称", key: "name" }, { label: "账户类型", key: "type" }, { label: "当前余额", key: "balance", cls: "money", render: r => money(r.balance) }];
    const total = D.accounts.reduce((a, a2) => a + a2.balance, 0);
    const statr = '<div class="stats-row">' + stat("账户总资金", money(total), D.accounts.length + " 个账户", "", "💰") + "</div>";
    return buildPage("查资金", statr + renderGrid("balance", cols, D.accounts, {}), acts);
  }
  function pageReceivable() {
    const cols = [{ label: "客户", key: "name" }, { label: "地区", key: "area" }, { label: "类型", key: "type" }, { label: "欠款金额", key: "balance", cls: "money", render: r => money(r.balance) }, { label: "信用额度", key: "credit", cls: "money", render: r => money(r.credit) }, { label: "状态", key: "st", render: r => tag(r.balance > 0 ? "未结清" : "已结清", r.balance > 0 ? "tag-orange" : "tag-green") }];
    return buildPage("查应收", searchBox("receivable", [{ key: "kw", label: "" }]) + renderGrid("receivable", cols, D.customers, { filter: docFilter }), '<button class="btn btn-primary btn-sm" data-action="add-receipt-new">登记收款</button>');
  }
  function pagePayable() {
    const cols = [{ label: "供应商", key: "name" }, { label: "地区", key: "area" }, { label: "账户", key: "account" }, { label: "应付金额", key: "balance", cls: "money", render: r => money(r.balance) }, { label: "状态", key: "st", render: r => tag(r.balance > 0 ? "未结清" : "已结清", r.balance > 0 ? "tag-orange" : "tag-green") }];
    return buildPage("查应付", searchBox("payable", [{ key: "kw", label: "" }]) + renderGrid("payable", cols, D.suppliers, { filter: docFilter }), '<button class="btn btn-primary btn-sm" data-action="add-payment-new">登记付款</button>');
  }

  /* ---- 分析 ---- */
  function pageAnalysisProduct() {
    const h = '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">商品销售排行（按销售额）</div>' + barChart(productTop(), "销售额") + "</div>";
    const cols = [{ label: "排名", key: "rank", cls: "num" }, { label: "商品", key: "name", render: r => "<span class='ellipsis'>" + esc(r.name) + "</span>" }, { label: "销量", key: "qty", cls: "num" }, { label: "销售额", key: "amount", cls: "money", render: r => money(r.amount) }, { label: "毛利", key: "profit", cls: "money", render: r => money(r.profit) }];
    return buildPage("商品分析", h + renderGrid("analysisProduct", cols, prodRows(), {}), '<button class="btn btn-sm" data-action="export">导出</button>');
  }
  function productTop() { return D.products.slice(0, 7).map((p, i) => ({ label: p.name.slice(0, 4) + "…", value: Math.round(3000 - i * 350 + Math.random() * 400) })); }
  function prodRows() { return D.products.slice(0, 10).map((p, i) => ({ rank: i + 1, name: p.name, qty: 80 - i * 6, amount: 3000 - i * 300, profit: 900 - i * 80 })); }
  function pageAnalysisCustomer() { return topPage("客户分析", D.customers, "客户"); }
  function pageAnalysisSupplier() { return topPage("供应商分析", D.suppliers.filter(s => s.balance > 0), "供应商"); }
  function topPage(title, list, kind) {
    const h = '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">' + kind + '交易占比</div>' + donutChart(list.map(x => ({ label: x.name, value: 2000 + Math.round(Math.random() * 6000) }))) + "</div>";
    const cols = [{ label: kind, key: "name" }, { label: "地区", key: "area" }, { label: "交易金额", key: "amt", cls: "money", render: r => money(r.amt) }, { label: "占比", key: "pct", cls: "num", render: r => r.pct + "%" }];
    const rows = list.map((x, i) => ({ name: x.name, area: x.area || "", amt: 5000 - i * 400, pct: (100 - i * 8).toFixed(1) }));
    return buildPage(title, h + renderGrid(title, cols, rows, {}), '<button class="btn btn-sm" data-action="export">导出</button>');
  }
  function pageAnalysisTrend() {
    const h = '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">近 30 日销售趋势</div>' + barChart(salesTrend(), "销售额") + "</div>";
    const h2 = '<div class="card card-pad"><div class="section-title">近 30 日采购趋势</div>' + barChart(salesTrend(), "采购额") + "</div>";
    return buildPage("趋势分析", h + h2, '<button class="btn btn-sm" data-action="export">导出</button>');
  }
  function pageAnalysisStaff() {
    const cols = [{ label: "职员", key: "name" }, { label: "角色", key: "role" }, { label: "销量", key: "qty", cls: "num" }, { label: "销售额", key: "amount", cls: "money", render: r => money(r.amount) }, { label: "提成比例", key: "commission", cls: "num", render: r => (r.commission * 100).toFixed(1) + "%" }, { label: "提成金额", key: "comm", cls: "money", render: r => money(r.comm) }];
    const rows = D.staff.filter(s => s.role === "销售员").map((s, i) => ({ name: s.name, role: s.role, qty: 200 - i * 40, amount: 12000 - i * 2000, commission: s.commission, comm: (12000 - i * 2000) * s.commission }));
    return buildPage("职员业绩", searchBox("analysisStaff", [{ key: "kw", label: "" }]) + renderGrid("analysisStaff", cols, rows, { filter: docFilter }), '<button class="btn btn-sm" data-action="export">导出</button>');
  }
  function pageAnalysisManage() {
    const acts = '<button class="btn btn-sm" data-action="export">导出</button>';
    const receiv = D.customers.reduce((a, c) => a + c.balance, 0);
    const payab = D.suppliers.reduce((a, s) => a + s.balance, 0);
    const cash = D.accounts.reduce((a, a2) => a + a2.balance, 0);
    let h = '<div class="stats-row">' + stat("库存金额", money(D.products.reduce((a, p) => a + p.stock * p.cost, 0)), "期初 -3.2%", "", "📦") + stat("应收账期", "42 天", "较上期 +3 天", "", "🧾") + stat("应付账期", "35 天", "较上期 -2 天", "", "💳") + stat("现金流", money(cash), "充足", "up", "💰") + "</div>";
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div class="card card-pad"><div class="section-title">本月收支结构</div>' + donutChart([{ label: "销售收入", value: 26800 }, { label: "采购成本", value: 14600 }, { label: "费用开销", value: 5400 }]) + '</div><div class="card card-pad"><div class="section-title">关键经营指标</div>' + kpi("毛利率", "32.5%", "up") + kpi("库存周转天数", "18 天", "up") + kpi("客单价", "￥1,286", "down") + kpi("回款率", "76.4%", "up") + "</div></div>";
    return buildPage("经营分析", h, acts);
  }
  function kpi(k, v, d) { return '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f2f6"><span style="color:#5a6478">' + k + '</span><span class="' + (d === "up" ? "stat-up" : d === "down" ? "stat-down" : "") + '" style="font-size:18px;font-weight:700">' + v + "</span></div>"; }

  /* ---- 设置/基础资料 ---- */
  function pageSettingProduct() {
    const acts = '<button class="btn btn-primary btn-sm" data-action="add-product">+ 新增商品</button><button class="btn btn-sm" data-action="import-product">导入</button><button class="btn btn-sm" data-action="export">导出</button>';
    const cols = [{ label: "商品名称", key: "name", render: r => "<span class='ellipsis'>" + esc(r.name) + "</span>" }, { label: "货号", key: "id" }, { label: "规格", key: "spec" }, { label: "品牌", key: "brand" }, { label: "单位", key: "unit" }, { label: "分类", key: "cat" }, { label: "进价", key: "cost", cls: "money", render: r => money(r.cost) }, { label: "售价", key: "price", cls: "money", render: r => money(r.price) }, { label: "库存", key: "stock", cls: "num" }, { label: "操作", key: "o", render: r => opsBtns("edit-product", "del-product", r.id) }];
    return buildPage("商品", searchBox("settingProduct", [{ key: "name", label: "名称" }, { key: "kw", label: "关键词" }]) + renderGrid("settingProduct", cols, D.products, { filter: (rows, f) => { const q = ((f && (f.name || f.kw)) || "").trim(); if (!q) return rows; return rows.filter(r => (r.name + r.id + r.brand + r.cat).toLowerCase().includes(q.toLowerCase())); } }), acts);
  }
  function pageSettingCustomer() {
    const acts = '<button class="btn btn-primary btn-sm" data-action="add-customer">+ 新增客户</button><button class="btn btn-sm" data-action="export">导出</button>';
    const cols = [{ label: "客户名称", key: "name" }, { label: "联系人", key: "contact" }, { label: "电话", key: "phone" }, { label: "地区", key: "area" }, { label: "客户类型", key: "type", render: r => tag(r.type) }, { label: "应付欠款", key: "balance", cls: "money", render: r => money(r.balance) }, { label: "操作", key: "o", render: r => opsBtns("edit-customer", "del-customer", r.id) }];
    return buildPage("客户", searchBox("settingCustomer", [{ key: "kw", label: "" }]) + renderGrid("settingCustomer", cols, D.customers, { filter: docFilter }), acts);
  }
  function pageSettingSupplier() {
    const acts = '<button class="btn btn-primary btn-sm" data-action="add-supplier">+ 新增供应商</button><button class="btn btn-sm" data-action="export">导出</button>';
    const cols = [{ label: "供应商名称", key: "name" }, { label: "联系人", key: "contact" }, { label: "电话", key: "phone" }, { label: "地区", key: "area" }, { label: "账户", key: "account" }, { label: "应付金额", key: "balance", cls: "money", render: r => money(r.balance) }, { label: "操作", key: "o", render: r => opsBtns("edit-supplier", "del-supplier", r.id) }];
    return buildPage("供应商", searchBox("settingSupplier", [{ key: "kw", label: "" }]) + renderGrid("settingSupplier", cols, D.suppliers, { filter: docFilter }), acts);
  }
  function pageSettingStaff() {
    const acts = '<button class="btn btn-primary btn-sm" data-action="add-staff">+ 新增职员</button><button class="btn btn-sm" data-action="export">导出</button>';
    const cols = [{ label: "职员", key: "name" }, { label: "角色", key: "role" }, { label: "电话", key: "phone" }, { label: "提成比例", key: "commission", cls: "num", render: r => (r.commission * 100).toFixed(1) + "%" }, { label: "状态", key: "status", render: r => tag(r.status, r.status === "在职" ? "tag-green" : "tag-gray") }, { label: "操作", key: "o", render: r => opsBtns("edit-staff", "del-staff", r.id) }];
    return buildPage("职员", searchBox("settingStaff", [{ key: "kw", label: "" }]) + renderGrid("settingStaff", cols, D.staff, { filter: docFilter }), acts);
  }
  function pageSettingAccount() {
    const acts = '<button class="btn btn-primary btn-sm" data-action="add-account">+ 新增账户</button><button class="btn btn-sm" data-action="transfer-acct">内部转账</button>';
    const cols = [{ label: "账户名称", key: "name" }, { label: "账户类型", key: "type", render: r => tag(r.type) }, { label: "当前余额", key: "balance", cls: "money", render: r => money(r.balance) }, { label: "操作", key: "o", render: r => opsBtns("edit-account", "del-account", r.id) }];
    return buildPage("收支账户", renderGrid("settingAccount", cols, D.accounts, {}), acts);
  }
  function pageSettingParam() {
    const acts = '<button class="btn btn-primary btn-sm" data-action="save-param">保存设置</button>';
    let h = '<div class="card card-pad"><div class="section-title">系统参数</div><table class="grid"><thead><tr><th>参数分组</th><th>参数名称</th><th>参数值</th></tr></thead><tbody>';
    D.sysParams.forEach(p => { h += "<tr><td>" + esc(p.group) + "</td><td>" + esc(p.key) + "</td><td>" + (p.editable ? '<input type="text" class="param-input" data-key="' + esc(p.key) + '" value="' + esc(p.value) + '">' : esc(p.value)) + "</td></tr>"; });
    h += "</tbody></table><div class='info-note'>提示：带输入框的参数可直接修改；“软件版本”及“打印服务版本”由系统自动维护。</div></div>";
    return buildPage("系统参数", h, acts);
  }
  function pageSettingRebuild() {
    const acts = '<button class="btn btn-primary btn-sm" data-action="rebuild-now">立即重建</button>';
    let h = '<div class="card card-pad"><div class="section-title">系统重建</div><div class="warn-banner">⚠️ 系统重建将清空当前账套的全部业务数据，并恢复为初始状态，该操作不可撤销。</div>'
      + '<div class="form-grid">' + fLabel("请选择重建范围", '<select><option>仅重建基础资料</option><option>全部数据（含单据）</option></select>') + fLabel("确认口令", '<input type="text" placeholder="请输入“确认重建”">') + "</div>"
      + '<div class="info-note">重建前请务必导出备份，或联系客服协助处理。</div></div>';
    return buildPage("系统重建", h, acts);
  }
  function pageSettingLog() {
    const cols = [{ label: "时间", key: "time" }, { label: "操作人", key: "user" }, { label: "模块", key: "mod" }, { label: "操作内容", key: "action", render: r => "<span class='ellipsis'>" + esc(r.action) + "</span>" }, { label: "IP", key: "ip" }];
    const rows = D.sysLogs || defaultLogs();
    return buildPage("操作日志", searchBox("settingLog", [{ key: "kw", label: "" }]) + renderGrid("settingLog", cols, rows, { filter: (rs, f) => { const q = ((f && f.kw) || "").trim(); if (!q) return rs; return rs.filter(r => (r.action + r.mod + r.user).toLowerCase().includes(q.toLowerCase())); } }), "");
  }
  function defaultLogs() {
    const d = new Date();
    return [
      { time: d.getFullYear() + "-07-20 14:32", user: "陈总", mod: "销售", action: "新增销售单 XS20260720001", ip: "192.168.1.10" },
      { time: d.getFullYear() + "-07-20 11:05", user: "王小明", mod: "商品", action: "修改商品【心相印茶语丝享系列抽纸】售价", ip: "192.168.1.22" },
      { time: d.getFullYear() + "-07-19 16:40", user: "钱会计", mod: "资金", action: "确认收款单 SK20260719002", ip: "192.168.1.12" },
      { time: d.getFullYear() + "-07-19 09:18", user: "陈总", mod: "设置", action: "修改系统参数【启用保质期】", ip: "192.168.1.10" },
      { time: d.getFullYear() + "-07-18 17:22", user: "孙采购", mod: "采购", action: "新增采购单 CG20260719001", ip: "192.168.1.30" },
      { time: d.getFullYear() + "-07-18 10:01", user: "陈总", mod: "登录", action: "登录系统", ip: "192.168.1.10" }
    ];
  }

  /* ---- 商城 ---- */
  function pageMallOrder() {
    const cols = [{ label: "订单号", key: "id" }, { label: "下单时间", key: "date" }, { label: "客户", key: "customer" }, { label: "线上店铺", key: "store" }, { label: "商品数", key: "count", cls: "num" }, { label: "金额", key: "amount", cls: "money", render: r => money(r.amount) }, { label: "状态", key: "status", render: r => tag(r.status) }];
    const rows = mallOrders();
    return buildPage("商城订单", searchBox("mallOrder", [{ key: "kw", label: "" }]) + renderGrid("mallOrder", cols, rows, { filter: docFilter }), '<button class="btn btn-primary btn-sm" data-action="add-mall">+ 同步订单</button>');
  }
  function mallOrders() {
    return [
      { id: "DD20260720001", date: "2026-07-20 10:12", customer: "线上-张女士", store: "云老板旗舰店", count: 3, amount: 128.00, status: "待发货" },
      { id: "DD20260720002", date: "2026-07-20 09:30", customer: "线上-李先生", store: "云老板旗舰店", count: 6, amount: 388.00, status: "待发货" },
      { id: "DD20260719003", date: "2026-07-19 21:05", customer: "线上-王女士", store: "云老板二店", count: 2, amount: 96.50, status: "已发货" },
      { id: "DD20260718004", date: "2026-07-18 15:44", customer: "线上-陈先生", store: "云老板旗舰店", count: 8, amount: 726.00, status: "已完成" }
    ];
  }
  function pageMallStore() {
    const acts = '<button class="btn btn-primary btn-sm" data-action="save-store">保存店铺设置</button>';
    let h = '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">店铺信息</div><div class="form-grid">'
      + fLabel("店铺名称", '<input type="text" value="云老板旗舰店">')
      + fLabel("店铺分类", '<select><option>综合</option><option>食品</option><option>日化</option></select>')
      + fLabel("店铺介绍", '<textarea rows="2" class="full">主营酒水、日化、粮油等快消品批发零售，支持一件代发。</textarea>', true)
      + '</div></div>';
    h += '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">配送设置</div><div class="form-grid">'
      + fLabel("运费模板", '<select><option>全国包邮</option><option>按件计费</option><option>按重量</option></select>')
      + fLabel("发货地", '<input type="text" value="辽宁省沈阳市">')
      + "</div></div>";
    h += '<div class="card card-pad"><div class="section-title">上架商品</div><div class="info-note">已上架 ' + D.products.length + ' 件商品，可在「商品」模块批量上架/下架。</div></div>';
    return buildPage("店铺设置", h, acts);
  }

  /* ---- 报表 / 老板中心 / 帮助 ---- */
  function pageReport() {
    const acts = '<button class="btn btn-sm" data-action="print">打印</button><button class="btn btn-primary btn-sm" data-action="export">导出</button>';
    let h = '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">数据报表</div><div class="toolbar">'
      + '<div class="filter-item"><span>统计时间</span><select><option>最近7天</option><option>最近30天</option><option>本月</option><option>本季度</option></select></div>'
      + '<div class="filter-item"><span>报表类型</span><select><option>销售汇总</option><option>采购汇总</option><option>库存汇总</option><option>毛利报表</option></select></div>'
      + '<button class="btn btn-primary btn-sm" data-action="run-report">生成报表</button></div><div class="info-note">选择统计时间与报表类型后点击“生成报表”查看汇总数据。</div></div>';
    h += '<div class="card card-pad"><div class="section-title">销售汇总（示例）</div>' + barChart(salesTrend(), "销售额") + "</div>";
    return buildPage("数据报表", h, acts);
  }
  function pageBoss() {
    const receiv = D.customers.reduce((a, c) => a + c.balance, 0);
    const payab = D.suppliers.reduce((a, s) => a + s.balance, 0);
    let h = '<div class="stats-row">' + stat("本月销售额", money(D.sales.reduce((a, s) => a + s.amount, 0)), "环比 +12.5%", "up", "💹") + stat("毛利额", money(8600), "毛利率 32.1%", "up", "📊") + stat("应收账款", money(receiv), "需跟进", "down", "🧾") + stat("应付账款", money(payab), "待支付", "", "💳") + "</div>";
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><div class="card card-pad"><div class="section-title">销售额变化</div>' + barChart(salesTrend(), "销售额") + '</div><div class="card card-pad"><div class="section-title">回款进度</div>' + progress("已回款", 76, "#2f6fed") + progress("在途应收", 18, "#f5a623") + progress("逾期应收", 6, "#e5484d") + "</div></div>";
    return buildPage("经营看板", h, '<button class="btn btn-sm" data-action="export">导出</button>');
  }
  function progress(label, pct, color) {
    var bar = '<div style="height:12px;background:#eef1f6;border-radius:6px"><div style="width:' + pct + "%;height:100%;background:" + color + ";border-radius:6px\"></div></div>";
    return '<div style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px"><span>' + label + "</span><span>" + pct + "%</span></div>" + bar + "</div>";
  }
  function pageHelp() {
    let h = '<div class="card card-pad" style="margin-bottom:14px"><div class="section-title">操作指南</div><div class="help-list">'
      + helpItem("🎥", "语音快速开销售单", "通过语音输入快速录入销售明细")
      + helpItem("🔳", "扫码快速开销售单", "使用扫码枪扫描条码自动带出商品")
      + helpItem("📋", "销售单详细操作", "新建、审核、打印销售单的完整流程")
      + helpItem("📦", "库存管理入门", "如何做好库存预警与盘点")
      + helpItem("💰", "资金收付款", "收款单、付款单与内部转账操作")
      + helpItem("📈", "经营分析", "看懂老板中心的关键指标")
      + "</div></div>";
    h += '<div class="card card-pad"><div class="section-title">常见问题</div><div class="help-list">'
      + helpItem("❓", "如何新增商品？", "进入【设置】→【商品】→ 新增商品")
      + helpItem("❓", "忘记密码怎么办？", "在登录页点击“忘记密码”，通过手机号重置")
      + helpItem("❓", "如何切换账套？", "进入【个人设置】→【切换账套】")
      + helpItem("❓", "数据如何备份？", "进入【设置】→【系统重建】前请先导出备份")
      + "</div></div>";
    h += '<div class="card card-pad" style="margin-top:14px"><div class="section-title">联系我们</div><div class="info-note">客服电话：400-XXX-XXXX　客服微信：yunlaoban-kf　工作时间：周一至周日 9:00-21:00</div></div>';
    return buildPage("帮助中心", h, "");
  }

  /* ---- 通用辅助 ---- */
  function tag(t, cls) { const map = { "已结算": "tag-green", "已发货": "tag-blue", "已完成": "tag-green", "已审核": "tag-green", "待发货": "tag-orange", "待审核": "tag-orange", "未结清": "tag-orange", "销售": "tag-blue", "采购": "tag-orange", "零售": "tag-green", "批发": "tag-blue", "现金": "tag-green", "银行": "tag-blue", "第三方支付": "tag-orange", "停用": "tag-gray", "离职": "tag-gray" }; return '<span class="tag ' + (cls || map[t] || "tag-gray") + '">' + esc(t) + "</span>"; }
  function opsBtns(editAction, delAction, id) { return '<button class="btn-text" data-action="' + editAction + '" data-id="' + id + '">编辑</button><button class="btn-text" style="color:var(--danger)" data-action="' + delAction + '" data-id="' + id + '">删除</button>'; }
  function fLabel(label, inputHtml, full) { return '<div class="' + (full ? "full" : "") + '"><label>' + label + "</label>" + inputHtml + "</div>"; }
  function docFilter(rows, f) { const q = ((f && f.kw) || "").trim(); if (!q) return rows; return rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase())); }
  function buildPage(title, bodyHtml, actions) { return { html: bodyHtml, after: function () { setContentHead(title, actions); selectMenu(state.current); } }; }
  function simpleDocPage(title, items, route, colsKey, tagStr, kind) {
    const cols = [{ label: "单据编号", key: "id" }, { label: "日期", key: "date" }, { label: kind === "sale" ? "客户" : "供应商", key: kind === "sale" ? "customer" : "supplier" }, { label: kind === "sale" ? "业务员" : "采购员", key: "staff" }, { label: "金额", key: "amount", cls: "money", render: r => money(r.amount) }, { label: "状态", key: "status", render: r => tag(r.status) }];
    return buildPage(title, searchBox(route, [{ key: "kw", label: "" }]) + renderGrid(route, cols, items, { filter: docFilter }), '<button class="btn btn-sm" data-action="export">导出</button><button class="btn btn-primary btn-sm" data-action="' + (kind === "sale" ? "add-sale" : "add-purchase") + '">+ 新增</button>');
  }
  function simpleDocPage2(title, items, route, colsKey, tagStr, kind) {
    const rows = items.map(it => Object.assign({}, it, { status: "退货" }));
    const cols = [{ label: "单据编号", key: "id" }, { label: "日期", key: "date" }, { label: kind === "sale" ? "客户" : "供应商", key: kind === "sale" ? "customer" : "supplier" }, { label: "金额", key: "amount", cls: "money", render: r => money(r.amount) }, { label: "状态", key: "status", render: r => tag("退货", "tag-red") }];
    return buildPage(title, searchBox(route, [{ key: "kw", label: "" }]) + renderGrid(route, cols, rows, { filter: docFilter }), '<button class="btn btn-primary btn-sm" data-action="' + (kind === "sale" ? "sale-return" : "purchase-return") + '">+ 退货单</button>');
  }
  function pricePage(title, baseRoute, route, kind) {
    const rows = (baseRoute === "settingCustomer" ? D.customers : D.suppliers).map((x, i) => ({ name: x.name, id: x.id, price: 10 + i * 5, qty: 1 }));
    const cols = [{ label: kind, key: "name" }, { label: "商品", key: "pname", render: r => "<span class='ellipsis'>心相印茶语丝享系列抽纸</span>" }, { label: "规格", key: "spec", render: () => "3层*120抽" }, { label: "价格", key: "price", cls: "money", render: r => money(r.price) }, { label: "默认数量", key: "qty", cls: "num" }];
    return buildPage(title, renderGrid(route, cols, rows.map(r => Object.assign(r, { pname: "心相印茶语丝享系列抽纸", spec: "3层*120抽" })), {}), '<button class="btn btn-primary btn-sm" data-action="add-price">+ 新增</button>');
  }
  function selectMenu(route) {
    state.current = route;
    $$("#menu-tree .menu-item").forEach(el => el.classList.toggle("active", el.dataset.route === route));
    $$("#menu-tree .menu-group").forEach(g => {
      const has = Array.prototype.some.call(g.querySelectorAll(".menu-item"), el => el.dataset.route === route);
      g.classList.remove("closed");
      if (has) g.classList.add("open");
    });
  }

  /* ================= 菜单渲染 ================= */
  function renderMenu() {
    let h = "";
    MENU.forEach(g => {
      const children = g.children.map(c => '<div class="menu-item" data-action="nav" data-route="' + c.route + '"><span class="micon">' + (c.icon || "•") + "</span><span>" + esc(c.label) + "</span></div>").join("");
      h += '<div class="menu-group"><div class="group-head" data-action="toggle-group"><span><span class="micon">' + g.icon + "</span>" + esc(g.name) + '</span><span class="arrow">▾</span></div><div class="group-children">' + children + "</div></div>";
    });
    $("#menu-tree").innerHTML = h;
  }

  /* ================= 弹窗表单构建 ================= */
  function productForm(p) {
    const d = p || { name: "", spec: "", brand: "", unit: "个", origin: "", cat: "日杂", barCode: "", cost: "", price: "", stockUpper: "", stockLower: "", warehouse: "总仓" };
    return '<div class="form-grid">'
      + fLabel("商品名称 *", '<input type="text" id="f-name" value="' + esc(d.name) + '">', true)
      + fLabel("规格", '<input type="text" id="f-spec" value="' + esc(d.spec) + '">')
      + fLabel("品牌", '<input type="text" id="f-brand" value="' + esc(d.brand) + '">')
      + fLabel("常用单位", '<input type="text" id="f-unit" value="' + esc(d.unit) + '">')
      + fLabel("商品分类", '<select id="f-cat">' + flatCats().map(c => '<option ' + (d.cat === c ? "selected" : "") + ">" + c + "</option>").join("") + "</select>")
      + fLabel("产地", '<input type="text" id="f-origin" value="' + esc(d.origin) + '">')
      + fLabel("条码", '<input type="text" id="f-barcode" value="' + esc(d.barCode) + '">')
      + fLabel("默认仓库", '<select id="f-warehouse"><option' + (d.warehouse === "总仓" ? " selected" : "") + ">总仓</option><option" + (d.warehouse === "二库" ? " selected" : "") + ">二库</option></select>")
      + fLabel("进价(元)", '<input type="number" id="f-cost" value="' + d.cost + '">')
      + fLabel("售价(元)", '<input type="number" id="f-price" value="' + d.price + '">')
      + fLabel("库存上限", '<input type="number" id="f-upper" value="' + d.stockUpper + '">')
      + fLabel("库存下限", '<input type="number" id="f-lower" value="' + d.stockLower + '">')
      + "</div>";
    function flatCats() { const arr = ["未分类"]; D.categories.forEach(c => { arr.push(c.name); c.children.forEach(ch => arr.push(ch)); }); return arr; }
  }
  function personForm(kind, d) {
    d = d || {};
    if (kind === "customer") {
      return '<div class="form-grid">' + fLabel("客户名称 *", '<input id="f-name" value="' + esc(d.name || "") + '">') + fLabel("联系人", '<input id="f-contact" value="' + esc(d.contact || "") + '">') + fLabel("电话", '<input id="f-phone" value="' + esc(d.phone || "") + '">') + fLabel("地区", '<input id="f-area" value="' + esc(d.area || "") + '">') + fLabel("客户类型", '<select id="f-type"><option' + (d.type === "零售" ? " selected" : "") + ">零售</option><option" + (d.type === "批发" ? " selected" : "") + ">批发</option></select>") + fLabel("初始欠款", '<input type="number" id="f-balance" value="' + (d.balance || 0) + '">') + "</div>";
    } else if (kind === "supplier") {
      return '<div class="form-grid">' + fLabel("供应商名称 *", '<input id="f-name" value="' + esc(d.name || "") + '">') + fLabel("联系人", '<input id="f-contact" value="' + esc(d.contact || "") + '">') + fLabel("电话", '<input id="f-phone" value="' + esc(d.phone || "") + '">') + fLabel("地区", '<input id="f-area" value="' + esc(d.area || "") + '">') + fLabel("结算账户", '<input id="f-account" value="' + esc(d.account || "") + '">') + fLabel("初始应付", '<input type="number" id="f-balance" value="' + (d.balance || 0) + '">') + "</div>";
    }
    return '<div class="form-grid">' + fLabel("职员名称 *", '<input id="f-name" value="' + esc(d.name || "") + '">') + fLabel("角色", '<select id="f-role"><option' + (d.role === "销售员" ? " selected" : "") + ">销售员</option><option" + (d.role === "仓管员" ? " selected" : "") + ">仓管员</option><option" + (d.role === "财务" ? " selected" : "") + ">财务</option><option" + (d.role === "采购员" ? " selected" : "") + ">采购员</option></select>") + fLabel("电话", '<input id="f-phone" value="' + esc(d.phone || "") + '">') + fLabel("提成比例(%)", '<input type="number" id="f-comm" value="' + (d.commission * 100 || 0) + '" placeholder="如 2 = 2%">') + "</div>";
  }
  function accountForm(d) {
    d = d || {};
    return '<div class="form-grid">' + fLabel("账户名称 *", '<input id="f-name" value="' + esc(d.name || "") + '">') + fLabel("账户类型", '<select id="f-type"><option' + (d.type === "现金" ? " selected" : "") + ">现金</option><option" + (d.type === "银行" ? " selected" : "") + ">银行</option><option" + (d.type === "第三方支付" ? " selected" : "") + ">第三方支付</option></select>") + fLabel("期初余额", '<input type="number" id="f-balance" value="' + (d.balance || 0) + '">') + "</div>";
  }
  function saleForm() {
    return '<div class="form-grid">'
      + fLabel("客户 *", '<select id="f-customer">' + D.customers.map(c => "<option>" + esc(c.name) + "</option>").join("") + "</select>")
      + fLabel("业务员", '<select id="f-staff">' + D.staff.filter(s => s.role === "销售员").map(s => "<option>" + esc(s.name) + "</option>").join("") + "</select>")
      + fLabel("仓库", '<select id="f-warehouse"><option>总仓</option><option>二库</option></select>')
      + fLabel("商品", '<select id="f-product">' + D.products.map(p => "<option>" + esc(p.name) + "</option>").join("") + "</select>")
      + fLabel("数量", '<input type="number" id="f-qty" value="1">')
      + fLabel("单价(元)", '<input type="number" id="f-price">')
      + "</div>";
  }
  function purchaseForm() {
    return '<div class="form-grid">'
      + fLabel("供应商 *", '<select id="f-supplier">' + D.suppliers.map(s => "<option>" + esc(s.name) + "</option>").join("") + "</select>")
      + fLabel("采购员", '<select id="f-staff">' + D.staff.filter(s => s.role === "采购员").map(s => "<option>" + esc(s.name) + "</option>").join("") + "</select>")
      + fLabel("仓库", '<select id="f-warehouse"><option>总仓</option><option>二库</option></select>')
      + fLabel("商品", '<select id="f-product">' + D.products.map(p => "<option>" + esc(p.name) + "</option>").join("") + "</select>")
      + fLabel("数量", '<input type="number" id="f-qty" value="1">')
      + fLabel("单价(元)", '<input type="number" id="f-price">')
      + "</div>";
  }
  function moneyForm(kind) {
    if (kind === "receipt") {
      return '<div class="form-grid">' + fLabel("客户 *", '<select id="f-party">' + D.customers.map(c => "<option>" + esc(c.name) + "</option>").join("") + "</select>") + fLabel("金额 *", '<input type="number" id="f-amount" value="500">') + fLabel("结算账户", '<select id="f-account">' + D.accounts.map(a => "<option>" + esc(a.name) + "</option>").join("") + "</select>") + fLabel("结算方式", '<select id="f-method"><option>转账</option><option>现金</option><option>微信</option><option>支付宝</option></select>') + "</div>";
    }
    if (kind === "payment") {
      return '<div class="form-grid">' + fLabel("供应商 *", '<select id="f-party">' + D.suppliers.map(s => "<option>" + esc(s.name) + "</option>").join("") + "</select>") + fLabel("金额 *", '<input type="number" id="f-amount" value="500">') + fLabel("结算账户", '<select id="f-account">' + D.accounts.map(a => "<option>" + esc(a.name) + "</option>").join("") + "</select>") + fLabel("结算方式", '<select id="f-method"><option>转账</option><option>现金</option><option>微信</option><option>支付宝</option></select>') + "</div>";
    }
    return '<div class="form-grid">' + fLabel("类别", '<input id="f-category" value="' + (kind === "expense" ? "其他费用" : "其他收入") + '">') + fLabel("金额 *", '<input type="number" id="f-amount" value="100">') + fLabel("结算账户", '<select id="f-account">' + D.accounts.map(a => "<option>" + esc(a.name) + "</option>").join("") + "</select>") + fLabel("备注", '<input id="f-remark">') + "</div>";
  }

  /* ================= 事件处理 ================= */
  const actions = {
    /* 全局 */
    "nav": function (el) { navigate(el.dataset.route); },
    "toggle-sidebar": function () { $("#app-view").classList.toggle("drawer-open"); },
    "close-sidebar": function () { $("#app-view").classList.remove("drawer-open"); },
    "toggle-group": function (el) { el.parentElement.classList.toggle("closed"); },
    "refresh": function () { toast("页面已刷新"); },
    "download-win": function () { toast("开始下载电脑端安装包…"); },
    "download-app": function () { toast("已生成手机App下载二维码，请扫码安装"); },
    "download-mac": function () { toast("正在准备 Mac 版下载…"); },
    "service": function () { promptModal("在线客服", '<div class="info-note">客服热线：400-XXX-XXXX<br>工作日 9:00 - 21:00 在线，请选择一种方式：</div><div style="margin-top:12px;display:flex;gap:10px"><button class="btn" data-action="modal-close">电话咨询</button><button class="btn btn-primary" data-action="modal-close">在线聊天</button></div>'); },
    "message": function () { messageCenter(); },
    "buy": function () { toast("已跳转至续费页面"); },
    "expire-close": function () { $("#expire-bar").classList.add("hidden"); },
    "profile": function () { promptModal("个人设置", '<div class="form-grid">' + fLabel("姓名", '<input value="陈总">') + fLabel("手机号", '<input value="137****7001">') + fLabel("角色", '<input value="老板" disabled>') + '</div><div class="info-note">修改后点击保存生效。</div>'); },
    "logout": function () { doLogout(); },
    "register": function () { toast("注册功能暂未开放，演示环境请直接登录"); },
    "forgot": function () { toast("演示环境：请直接使用任意账号登录"); },
    "guide": function () { navigate("help"); },
    "grid-go": function (el) { state.page[el.dataset.route].page = +el.dataset.p; render(); },
    "grid-jump": function (el) { const inp = el.parentElement.querySelector("[data-role=page-jump]"); const st = state.page[el.dataset.route]; st.page = +inp.value || 1; render(); },
    "grid-search": function (el) { const st = state.page[el.dataset.route] = state.page[el.dataset.route] || { page: 1, size: state.pageSize, fields: {} }; captureFields(el.dataset.route); st.page = 1; render(); },
    "grid-reset": function (el) { const st = state.page[el.dataset.route]; if (st) { st.fields = {}; st.page = 1; } clearFields(el.dataset.route); render(); },
    "modal-close": function () { closeModal(); },
    "mask-close": function () { closeModal(); },
    "rp-open": function () { $("#rp-card").classList.add("opened"); },
    "rp-close": function () { hideRedPacket(); },
    "rp-card": function () { /* 阻止点击红包内部冒泡关闭 */ },
    "rp-register": function () { hideRedPacket(); toast("注册成功，尽享宇少的一万元红包！", "success"); },
    "cat-filter": function (el) { state.categoryFilter = el.dataset.cat; render(); },
    /* 首页快捷 */
    "quick-sale": function () { navigate("sale"); },
    "quick-stock": function () { navigate("stock"); },
    "quick-report": function () { navigate("report"); },
    "quick-retail": function () { openSaleModal("retail"); },
    "quick-purchase": function () { navigate("purchase"); },
    /* 商品 */
    "add-product": function () { promptModal("新增商品", productForm(), actionBtn("保存商品", "save-product")); },
    "edit-product": function (el) { const p = D.products.find(x => x.id === el.dataset.id); promptModal("编辑商品", productForm(p), actionBtn("保存修改", "save-product", p.id)); },
    "del-product": function (el) { confirmModal("确定删除该商品吗？", function () { const i = D.products.findIndex(x => x.id === el.dataset.id); D.products.splice(i, 1); toast("已删除", "success"); render(); }); },
    "save-product": function (el) { const id = el.dataset.id; const vals = fVals(["name", "spec", "brand", "unit", "cat", "origin", "barcode", "warehouse", "cost", "price", "upper", "lower"]); if (!vals.name) { return toast("请填写商品名称", "error"); } if (id) { const p = D.products.find(x => x.id === id); Object.assign(p, { name: vals.name, spec: vals.spec, brand: vals.brand, unit: vals.unit, cat: vals.cat, origin: vals.origin, barCode: vals.barcode, warehouse: vals.warehouse, cost: +vals.cost || 0, price: +vals.price || 0, stockUpper: +vals.upper || 0, stockLower: +vals.lower || 0 }); } else { D.products.unshift({ id: "P" + String(1000 + D.products.length + 1), name: vals.name, spec: vals.spec, brand: vals.brand, unit: vals.unit, origin: vals.origin, cat: vals.cat, barCode: vals.barcode || "", warehouse: vals.warehouse, cost: +vals.cost || 0, price: +vals.price || 0, stock: 0, stockUpper: +vals.upper || 0, stockLower: +vals.lower || 0 }); } closeModal(); toast("保存成功", "success"); render(); },
    "import-product": function () { toast("已开始导入商品数据"); },
    /* 客户/供应商/职员/账户 */
    "add-customer": function () { promptModal("新增客户", personForm("customer"), actionBtn("保存客户", "save-customer")); },
    "edit-customer": function (el) { const d = D.customers.find(x => x.id === el.dataset.id); promptModal("编辑客户", personForm("customer", d), actionBtn("保存修改", "save-customer", d.id)); },
    "del-customer": function (el) { confirmModal("确定删除该客户吗？", function () { D.customers.splice(D.customers.findIndex(x => x.id === el.dataset.id), 1); toast("已删除", "success"); render(); }); },
    "save-customer": function (el) { const id = el.dataset.id; const vals = fVals(["name", "contact", "phone", "area", "type", "balance"]); if (!vals.name) return toast("请填写客户名称", "error"); if (id) { Object.assign(D.customers.find(x => x.id === id), { name: vals.name, contact: vals.contact, phone: vals.phone, area: vals.area, type: vals.type, balance: +vals.balance || 0 }); } else { D.customers.unshift({ id: "C" + String(1000 + D.customers.length + 1), name: vals.name, contact: vals.contact, phone: vals.phone, area: vals.area, type: vals.type, balance: +vals.balance || 0 }); } closeModal(); toast("保存成功", "success"); render(); },
    "add-supplier": function () { promptModal("新增供应商", personForm("supplier"), actionBtn("保存供应商", "save-supplier")); },
    "edit-supplier": function (el) { const d = D.suppliers.find(x => x.id === el.dataset.id); promptModal("编辑供应商", personForm("supplier", d), actionBtn("保存修改", "save-supplier", d.id)); },
    "del-supplier": function (el) { confirmModal("确定删除该供应商吗？", function () { D.suppliers.splice(D.suppliers.findIndex(x => x.id === el.dataset.id), 1); toast("已删除", "success"); render(); }); },
    "save-supplier": function (el) { const id = el.dataset.id; const vals = fVals(["name", "contact", "phone", "area", "account", "balance"]); if (!vals.name) return toast("请填写供应商名称", "error"); if (id) { Object.assign(D.suppliers.find(x => x.id === id), { name: vals.name, contact: vals.contact, phone: vals.phone, area: vals.area, account: vals.account, balance: +vals.balance || 0 }); } else { D.suppliers.unshift({ id: "S" + String(1000 + D.suppliers.length + 1), name: vals.name, contact: vals.contact, phone: vals.phone, area: vals.area, account: vals.account || "", balance: +vals.balance || 0 }); } closeModal(); toast("保存成功", "success"); render(); },
    "add-staff": function () { promptModal("新增职员", personForm("staff"), actionBtn("保存职员", "save-staff")); },
    "edit-staff": function (el) { const d = D.staff.find(x => x.id === el.dataset.id); promptModal("编辑职员", personForm("staff", d), actionBtn("保存修改", "save-staff", d.id)); },
    "del-staff": function (el) { confirmModal("确定删除该职员吗？", function () { D.staff.splice(D.staff.findIndex(x => x.id === el.dataset.id), 1); toast("已删除", "success"); render(); }); },
    "save-staff": function (el) { const id = el.dataset.id; const vals = fVals(["name", "role", "phone", "comm"]); if (!vals.name) return toast("请填写职员名称", "error"); if (id) { Object.assign(D.staff.find(x => x.id === id), { name: vals.name, role: vals.role, phone: vals.phone, commission: (+vals.comm || 0) / 100 }); } else { D.staff.unshift({ id: "U" + String(1000 + D.staff.length + 1), name: vals.name, role: vals.role, phone: vals.phone, commission: (+vals.comm || 0) / 100, status: "在职" }); } closeModal(); toast("保存成功", "success"); render(); },
    "add-account": function () { promptModal("新增账户", accountForm(), actionBtn("保存账户", "save-account")); },
    "edit-account": function (el) { const d = D.accounts.find(x => x.id === el.dataset.id); promptModal("编辑账户", accountForm(d), actionBtn("保存修改", "save-account", d.id)); },
    "del-account": function (el) { confirmModal("确定删除该账户吗？", function () { D.accounts.splice(D.accounts.findIndex(x => x.id === el.dataset.id), 1); toast("已删除", "success"); render(); }); },
    "save-account": function (el) { const id = el.dataset.id; const vals = fVals(["name", "type", "balance"]); if (!vals.name) return toast("请填写账户名称", "error"); if (id) { Object.assign(D.accounts.find(x => x.id === id), { name: vals.name, type: vals.type, balance: +vals.balance || 0 }); } else { D.accounts.unshift({ id: "A" + String(1000 + D.accounts.length + 1), name: vals.name, type: vals.type, balance: +vals.balance || 0 }); } closeModal(); toast("保存成功", "success"); render(); },
    "transfer-acct": function () { promptModal("内部转账", '<div class="form-grid">' + fLabel("转出账户", '<select id="f-from">' + D.accounts.map(a => "<option>" + esc(a.name) + "</option>").join("") + "</select>") + fLabel("转入账户", '<select id="f-to">' + D.accounts.map(a => "<option>" + esc(a.name) + "</option>").join("") + "</select>") + fLabel("金额", '<input type="number" id="f-amount" value="1000">') + "</div>", actionBtn("确认转账", "do-transfer")); },
    "do-transfer": function () { closeModal(); toast("转账成功", "success"); },
    "save-param": function () { $$(".param-input").forEach(i => { const row = D.sysParams.find(p => p.key === i.dataset.key); if (row) row.value = i.value; }); toast("系统参数已保存", "success"); },
    "save-warnset": function () { toast("预警设置已保存", "success"); },
    "warn-restock": function () { toast("已生成补货建议单"); },
    "rebuild-now": function () { confirmModal("确认立即重建系统？此操作将清空业务数据且不可恢复！", function () { toast("系统重建完成", "success"); }); },
    "save-store": function () { toast("店铺设置已保存", "success"); },
    "run-report": function () { toast("报表已生成"); },
    "export": function () { toast("已导出 Excel 文件"); },
    "print": function () { toast("已发送到打印机"); },
    /* 单据 */
    "add-sale": function () { openSaleModal("sale"); },
    "sale-return": function () { openSaleModal("saleReturn"); },
    "add-retail": function () { openSaleModal("retail"); },
    "add-purchase": function () { promptModal("新增采购单", purchaseForm(), actionBtn("保存采购单", "save-purchase")); },
    "purchase-return": function () { promptModal("新增采购退货单", purchaseForm(), actionBtn("保存退货单", "save-purchase")); },
    "save-purchase": function () { const vals = fVals(["supplier", "staff", "warehouse", "product", "qty", "price"]); D.purchases.unshift({ id: "CG" + autoId(D.purchases), date: today(), supplier: vals.supplier, staff: vals.staff, warehouse: vals.warehouse, amount: (+vals.qty || 0) * (+vals.price || 0), paid: 0, status: "未结清" }); closeModal(); toast("采购单已保存", "success"); render(); },
    "add-receipt": function () { promptModal("新增收款单", moneyForm("receipt"), actionBtn("保存收款单", "save-money")); },
    "add-payment": function () { promptModal("新增付款单", moneyForm("payment"), actionBtn("保存付款单", "save-money")); },
    "add-expense": function () { promptModal("新增费用单", moneyForm("expense"), actionBtn("保存费用单", "save-money")); },
    "add-income": function () { promptModal("新增收入单", moneyForm("income"), actionBtn("保存收入单", "save-money")); },
    "add-receipt-new": function () { actions["add-receipt"](); },
    "add-payment-new": function () { actions["add-payment"](); },
    "save-money": function () { const kind = state.current; let row; if (kind === "receipt") { const v = fVals(["party", "amount", "account", "method"]); row = { id: "SK" + autoId(D.receipts), date: today(), customer: v.party, account: v.account, amount: +v.amount || 0, method: v.method, status: "待审核" }; D.receipts.unshift(row); } else if (kind === "payment") { const v = fVals(["party", "amount", "account", "method"]); row = { id: "FK" + autoId(D.payments), date: today(), supplier: v.party, account: v.account, amount: +v.amount || 0, method: v.method, status: "待审核" }; D.payments.unshift(row); } else if (kind === "expense") { const v = fVals(["category", "amount", "account", "remark"]); row = { id: "FY" + autoId(D.expenses), date: today(), category: v.category, account: v.account, amount: +v.amount || 0, remark: v.remark, status: "待审核" }; D.expenses.unshift(row); } else { const v = fVals(["category", "amount", "account", "remark"]); row = { id: "SR" + autoId(D.incomes), date: today(), category: v.category, account: v.account, amount: +v.amount || 0, remark: v.remark, status: "待审核" }; D.incomes.unshift(row); } closeModal(); toast("单据已保存（待审核）", "success"); render(); },
    "add-transfer": function () { promptModal("新增调拨单", '<div class="form-grid">' + fLabel("调出仓库", '<select id="f-out"><option>总仓</option><option>二库</option></select>') + fLabel("调入仓库", '<select id="f-in"><option>二库</option><option>总仓</option></select>') + fLabel("商品", '<select id="f-product">' + D.products.map(p => "<option>" + esc(p.name) + "</option>").join("") + "</select>") + fLabel("数量", '<input type="number" id="f-qty" value="10">') + "</div>", actionBtn("保存调拨单", "save-transfer")); },
    "save-transfer": function () { closeModal(); toast("调拨单已保存", "success"); render(); },
    "add-stocktake": function () { promptModal("新增盘点单", '<div class="form-grid">' + fLabel("盘点仓库", '<select id="f-warehouse"><option>总仓</option><option>二库</option></select>') + '<div class="full info-note">选择仓库后系统将列出全部商品供逐项盘点。</div></div>', actionBtn("开始盘点", "save-stocktake")); },
    "save-stocktake": function () { closeModal(); toast("盘点单已保存", "success"); render(); },
    "add-mall": function () { toast("已从平台同步最新订单"); render(); },
    "add-price": function () { promptModal("新增价格", '<div class="form-grid">' + fLabel("商品", '<select>' + D.products.map(p => "<option>" + esc(p.name) + "</option>").join("") + "</select>") + fLabel("价格(元)", '<input type="number" id="f-price">') + "</div>", actionBtn("保存", "save-price")); },
    "save-price": function () { closeModal(); toast("价格已保存", "success"); }
  };
  function autoId(arr) { let max = 0; arr.forEach(r => { const m = /(\d+)$/.exec(r.id); if (m) max = Math.max(max, +m[1]); }); return String(max + 1).padStart(5, "0"); }
  function actionBtn(label, action, id) { return '<button class="btn btn-primary" data-action="' + action + '"' + (id ? ' data-id="' + id + '"' : "") + ">" + label + "</button>"; }
  function promptModal(title, bodyHtml, footHtml) { openModal(title, bodyHtml, footHtml); }
  function confirmModal(text, onYes) { openModal("提示", '<div style="padding:8px 0">' + esc(text) + "</div>", '<button class="btn" data-action="modal-close">取消</button><button class="btn btn-primary" data-action="__confirm">确定</button>'); currentConfirm = onYes; }
  let currentConfirm = null;
  function fVals(keys) { const o = {}; keys.forEach(k => { const el = $("#f-" + k); o[k] = el ? el.value.trim() : ""; }); return o; }
  function openSaleModal(type) {
    if (type === "retail") { promptModal("收银台", '<div class="form-grid">' + fLabel("商品", '<select id="f-product">' + D.products.map(p => "<option>" + esc(p.name) + "</option>").join("") + "</select>") + fLabel("数量", '<input type="number" id="f-qty" value="1">') + fLabel("收银员", '<input id="f-cashier" value="周客服">') + fLabel("门店", '<select id="f-store"><option>总仓门店</option><option>二库门店</option></select>') + "</div>", actionBtn("结算", "save-retail")); return; }
    promptModal(type === "saleReturn" ? "新增销售退货单" : "新增销售单", saleForm(), actionBtn(type === "saleReturn" ? "保存退货单" : "保存销售单", "save-sale"));
  }
  actions["save-sale"] = function () { const v = fVals(["customer", "staff", "warehouse", "product", "qty", "price"]); D.sales.unshift({ id: "XS" + autoId(D.sales), date: today(), customer: v.customer, staff: v.staff, warehouse: v.warehouse, amount: (+v.qty || 0) * (+v.price || 0), paid: 0, status: "未结清" }); closeModal(); toast("销售单已保存", "success"); render(); };
  actions["save-retail"] = function () { const v = fVals(["product", "qty", "cashier", "store"]); D.retails.unshift({ id: "LS" + autoId(D.retails), date: today(), cashier: v.cashier, store: v.store, count: +v.qty || 1, amount: +(v.qty || 1) * 5 }); closeModal(); toast("收银结算完成", "success"); render(); };

  function messageCenter() {
    let h = '<div class="notice">'
      + notice("预警", "3 件商品库存低于下限，请及时补货。", today())
      + notice("系统", "您的产品服务还有 28 天到期，请及时续费。", today())
      + notice("通知", "《销售单详细操作》教程已更新。", today())
      + "</div>";
    promptModal("消息中心", '<div class="stats-row" style="margin-bottom:14px">' + stat("未读消息", "3 条", "预警 3 · 通知 2 · 系统 1", "", "🔔") + "</div>" + h, '<button class="btn" data-action="modal-close">全部标为已读</button>');
  }

  /* ================= 路由 ================= */
  const routes = {
    home: pageHome, sale: pageSale, saleHistory: pageSaleHistory, retail: pageRetail, saleReturn: pageSaleReturn, customerPrice: pageCustomerPrice,
    purchase: pagePurchase, purchaseHistory: pagePurchaseHistory, purchaseReturn: pagePurchaseReturn, supplierPrice: pageSupplierPrice,
    transfer: pageTransfer, stocktake: pageStocktake, warnSet: pageWarnSet, warnQuery: pageWarnQuery,
    receipt: pageReceipt, payment: pagePayment, expense: pageExpense, income: pageIncome,
    stock: pageStock, balance: pageBalance, receivable: pageReceivable, payable: pagePayable,
    analysisProduct: pageAnalysisProduct, analysisCustomer: pageAnalysisCustomer, analysisTrend: pageAnalysisTrend, analysisStaff: pageAnalysisStaff, analysisSupplier: pageAnalysisSupplier, analysisManage: pageAnalysisManage,
    settingProduct: pageSettingProduct, settingCustomer: pageSettingCustomer, settingSupplier: pageSettingSupplier, settingStaff: pageSettingStaff, settingAccount: pageSettingAccount, settingParam: pageSettingParam, settingRebuild: pageSettingRebuild, settingLog: pageSettingLog,
    mallOrder: pageMallOrder, mallStore: pageMallStore,
    report: pageReport, boss: pageBoss, help: pageHelp
  };
  function currentRoute() { let h = location.hash.replace(/^#\/?/, ""); if (!h) h = "home"; return routes[h] ? h : "home"; }
  function navigate(route) { location.hash = "#/" + route; }
  function render() {
    const route = currentRoute();
    state.current = route;
    const page = routes[route] || pageHome;
    const result = page();
    $("#content-body").innerHTML = result.html;
    if (result.after) result.after();
    // 移动端：导航后自动收起抽屉
    $("#app-view").classList.remove("drawer-open");
    $$("#menu-tree .menu-group").forEach(g => {
      const has = Array.prototype.some.call(g.querySelectorAll(".menu-item"), el => el.dataset.route === route);
      if (has) g.classList.remove("closed");
    });
  }

  /* ================= 登录 ================= */
  function doLogin(user, opts) {
    opts = opts || {};
    state.user = user || $("#login-user").value.trim() || "陈总";
    try { sessionStorage.setItem("yxp_user", state.user); } catch (e) {}
    $("#app-view").style.display = "flex";
    $("#login-view").style.display = "none";
    const w = document.querySelector(".user-welcome");
    if (w) w.textContent = "欢迎您，" + state.user;
    render();
    toast("欢迎回来，" + state.user + "！");
    if (opts.showPacket) setTimeout(showRedPacket, 650);
  }
  function doLogout() {
    $("#app-view").style.display = "none";
    $("#login-view").style.display = "flex";
    state.user = null;
    closeModal();
  }

  /* ================= 初始化 ================= */
  document.addEventListener("DOMContentLoaded", function () {
    renderMenu();
    $("#login-form").addEventListener("submit", function (e) { e.preventDefault(); doLogin(undefined, { showPacket: true }); });
    // 全局事件委托
    document.addEventListener("click", function (e) {
      const el = e.target.closest("[data-action]");
      // 顶部下拉：点击触发器切换展开（兼容移动端点击，不依赖 hover）
      const dd = e.target.closest(".dropdown");
      if (dd && !dd.querySelector(".dropdown-menu").contains(e.target)) {
        dd.classList.toggle("open");
      } else if (dd) {
        dd.classList.remove("open");
      }
      if (!el) return;
      const act = el.dataset.action;
      if (act === "__confirm") { const cb = currentConfirm; currentConfirm = null; closeModal(); cb && cb(); return; }
      if (actions[act]) actions[act](el);
    });
    // 页码输入回车
    document.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target.dataset && e.target.dataset.route) { const st = state.page[e.target.dataset.route]; if (st) { st.page = +e.target.value || 1; } render(); } });
    window.addEventListener("hashchange", render);
    // 默认进入登录，若已有会话直接进入
    if (sessionStorage.getItem("yxp_user")) { doLogin(sessionStorage.getItem("yxp_user")); }
  });
})();
