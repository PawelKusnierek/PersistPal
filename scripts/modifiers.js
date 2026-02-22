(function () {
  const TABLE_BODY_ID = 'modifiers-table-body';
  const MODIFIERS_JSON_PATH = 'modifiers.json';

  let allModifiers = [];

  function buildRow(name, data) {
    const tr = document.createElement('tr');
    const validSlots = (data.validSlots || []).slice().sort(function (a, b) {
      return a.localeCompare(b, undefined, { sensitivity: 'base' });
    });
    const maxValue = data.maxValue != null && data.maxValue !== '' ? String(data.maxValue) : '—';
    tr.innerHTML =
      '<td>' + escapeHtml(name) + '</td>' +
      '<td>' + escapeHtml(String(maxValue)) + '</td>' +
      '<td>' + escapeHtml(validSlots.join(', ')) + '</td>';
    return tr;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getSelectedSlotFilter() {
    const radio = document.querySelector('input[name="slotFilter"]:checked');
    return radio ? (radio.value || '') : '';
  }

  function getSearchQuery() {
    const input = document.getElementById('modifiers-search-input');
    return input ? (input.value || '').trim() : '';
  }

  function filterModifiers(modifiers, slot) {
    if (!slot) return modifiers;
    return modifiers.filter(function (entry) {
      const slots = entry.data.validSlots || [];
      return slots.indexOf(slot) !== -1;
    });
  }

  function filterBySearch(modifiers, query) {
    if (!query) return modifiers;
    const lower = query.toLowerCase();
    return modifiers.filter(function (entry) {
      return entry.name.toLowerCase().indexOf(lower) !== -1;
    });
  }

  function renderTable(modifiers) {
    const tbody = document.getElementById(TABLE_BODY_ID);
    if (!tbody) return;
    tbody.innerHTML = '';
    modifiers.forEach(function (entry) {
      tbody.appendChild(buildRow(entry.name, entry.data));
    });
  }

  function refreshTable() {
    const slot = getSelectedSlotFilter();
    const query = getSearchQuery();
    var filtered = filterModifiers(allModifiers, slot);
    filtered = filterBySearch(filtered, query);
    renderTable(filtered);
  }

  function init() {
    fetch(MODIFIERS_JSON_PATH)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load modifiers.json');
        return res.json();
      })
      .then(function (json) {
        allModifiers = Object.keys(json)
          .map(function (name) {
            return { name: name, data: json[name] };
          })
          .sort(function (a, b) {
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
          });
        refreshTable();
      })
      .catch(function (err) {
        console.error(err);
        var tbody = document.getElementById(TABLE_BODY_ID);
        if (tbody) {
          tbody.innerHTML =
            '<tr><td colspan="3">Could not load modifiers. Check the console.</td></tr>';
        }
      });

    document.querySelectorAll('input[name="slotFilter"]').forEach(function (radio) {
      radio.addEventListener('change', refreshTable);
    });

    var searchInput = document.getElementById('modifiers-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', refreshTable);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
