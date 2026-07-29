/**
 * 加氢机品牌 / 型号维护（原型本地 Store）
 * 供「站点信息」维护、「加氢订单 H5」OCR 读取品牌型号线索。
 */
(function initH2DispenserBrandStore(global) {
  var STORAGE_KEY = 'oneos.h2.dispenserBrands.v1';

  var SEED = [
    { id: 'db-1', brand: '海德利森', model: 'H2-D50', remark: '嘉兴站常用', updatedAt: '2026-07-10 09:00:00' },
    { id: 'db-2', brand: '海德利森', model: 'H2-D80', remark: '', updatedAt: '2026-07-10 09:00:00' },
    { id: 'db-3', brand: '舜华新能源', model: 'SH-H35', remark: '面板 OCR 模板 A', updatedAt: '2026-07-12 14:20:00' },
    { id: 'db-4', brand: '厚普股份', model: 'HP-H70', remark: '', updatedAt: '2026-07-14 11:05:00' },
  ];

  function clone(list) {
    return (list || []).map(function (row) {
      return Object.assign({}, row);
    });
  }

  function readRaw() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(SEED);
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) return clone(SEED);
      return parsed.map(function (row) {
        return {
          id: String(row.id || ''),
          brand: String(row.brand || '').trim(),
          model: String(row.model || '').trim(),
          remark: String(row.remark || '').trim(),
          updatedAt: String(row.updatedAt || ''),
        };
      }).filter(function (row) {
        return row.id && row.brand && row.model;
      });
    } catch (e) {
      return clone(SEED);
    }
  }

  function writeRaw(list) {
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
    } catch (e) {
      /* ignore quota */
    }
  }

  function nowText() {
    var d = new Date();
    var pad = function (n) {
      return n < 10 ? '0' + n : String(n);
    };
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      ' ' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes()) +
      ':' +
      pad(d.getSeconds())
    );
  }

  function listBrands() {
    return clone(readRaw()).sort(function (a, b) {
      var brandCmp = a.brand.localeCompare(b.brand, 'zh');
      if (brandCmp !== 0) return brandCmp;
      return a.model.localeCompare(b.model, 'zh');
    });
  }

  function upsertBrand(payload) {
    var brand = String(payload.brand || '').trim();
    var model = String(payload.model || '').trim();
    var remark = String(payload.remark || '').trim();
    if (!brand || !model) {
      return { ok: false, message: '品牌与型号均为必填' };
    }
    var list = readRaw();
    var id = String(payload.id || '').trim();
    var dup = list.some(function (row) {
      return (
        row.brand === brand &&
        row.model === model &&
        row.id !== id
      );
    });
    if (dup) {
      return { ok: false, message: '已存在相同品牌与型号' };
    }
    if (id) {
      var found = false;
      list = list.map(function (row) {
        if (row.id !== id) return row;
        found = true;
        return {
          id: row.id,
          brand: brand,
          model: model,
          remark: remark,
          updatedAt: nowText(),
        };
      });
      if (!found) {
        return { ok: false, message: '记录不存在' };
      }
    } else {
      list.push({
        id: 'db-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        brand: brand,
        model: model,
        remark: remark,
        updatedAt: nowText(),
      });
    }
    writeRaw(list);
    return { ok: true, list: clone(list) };
  }

  function removeBrand(id) {
    var next = readRaw().filter(function (row) {
      return row.id !== id;
    });
    writeRaw(next);
    return { ok: true, list: clone(next) };
  }

  function brandModelLabels() {
    return listBrands().map(function (row) {
      return row.brand + ' · ' + row.model;
    });
  }

  global.H2DispenserBrandStore = {
    list: listBrands,
    upsert: upsertBrand,
    remove: removeBrand,
    labels: brandModelLabels,
    SEED: clone(SEED),
  };
})(typeof window !== 'undefined' ? window : globalThis);
