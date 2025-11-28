// タグヅケくん script.js

const STORAGE_KEY = "tagduke-data-v1";
const STORAGE_PREVIEW_KEY = "tagduke-preview-v1";

const defaultCategories = [
  {
    id: "basic",
    name: "基本",
    tags: ["＃ジャムデザイン", "＃デザイン会社", "＃グラフィックデザイン"],
  },
  {
    id: "photo",
    name: "撮影",
    tags: ["＃撮影", "＃スチール撮影", "＃撮影依頼", "＃出張撮影"],
  },
  {
    id: "movie",
    name: "動画",
    tags: ["＃動画制作", "＃動画編集", "＃PR動画", "＃採用動画"],
  },
];

let categories = [];
let selectedTags = [];
let currentDelimiter = "space";

// ===== Utility =====

function loadData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      categories = JSON.parse(raw);
    } else {
      categories = defaultCategories;
    }
  } catch (e) {
    console.error("Failed to load data:", e);
    categories = defaultCategories;
  }

  try {
    const previewRaw = window.localStorage.getItem(STORAGE_PREVIEW_KEY);
    if (previewRaw) {
      const parsed = JSON.parse(previewRaw);
      selectedTags = parsed.selectedTags || [];
      currentDelimiter = parsed.delimiter || "space";
    }
  } catch (e) {
    console.error("Failed to load preview:", e);
  }
}

function saveData() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

function savePreview() {
  window.localStorage.setItem(
    STORAGE_PREVIEW_KEY,
    JSON.stringify({
      selectedTags,
      delimiter: currentDelimiter,
    })
  );
}

function refreshPreview() {
  const textarea = document.getElementById("previewArea");
  const delimiter = currentDelimiter === "newline" ? "\n" : " ";
  textarea.value = selectedTags.join(delimiter);
  savePreview();
}

function addTag(tag) {
  if (!selectedTags.includes(tag)) {
    selectedTags.push(tag);
    refreshPreview();
  }
}

function addTags(tags) {
  let updated = false;
  tags.forEach((tag) => {
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag);
      updated = true;
    }
  });
  if (updated) {
    refreshPreview();
  }
}

// ===== Category Rendering =====

function renderCategories() {
  const container = document.getElementById("categoryList");
  container.innerHTML = "";

  if (!categories.length) {
    const empty = document.createElement("p");
    empty.textContent = "カテゴリがまだありません。「カテゴリ追加」から作成してください。";
    empty.className = "helper-text";
    container.appendChild(empty);
    return;
  }

  categories.forEach((cat) => {
    const card = document.createElement("div");
    card.className = "category-card";
    card.dataset.categoryId = cat.id;

    const header = document.createElement("div");
    header.className = "category-header";

    const title = document.createElement("div");
    title.className = "category-title";
    title.textContent = cat.name;

    const actions = document.createElement("div");
    actions.className = "category-actions";

    const addAllBtn = document.createElement("button");
    addAllBtn.className = "button button-secondary button-small";
    addAllBtn.textContent = "＋ まとめて追加";
    addAllBtn.dataset.action = "addAll";
    addAllBtn.dataset.categoryId = cat.id;

    const editBtn = document.createElement("button");
    editBtn.className = "button button-secondary button-small";
    editBtn.textContent = "編集";
    editBtn.dataset.action = "edit";
    editBtn.dataset.categoryId = cat.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "button button-danger button-small";
    deleteBtn.textContent = "削除";
    deleteBtn.dataset.action = "deleteCategory";
    deleteBtn.dataset.categoryId = cat.id;

    actions.appendChild(addAllBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    header.appendChild(title);
    header.appendChild(actions);

    const tagsWrap = document.createElement("div");
    tagsWrap.className = "category-tags";
    tagsWrap.dataset.categoryId = cat.id;

    if (!cat.tags.length) {
      const small = document.createElement("span");
      small.className = "helper-text";
      small.textContent = "タグが未登録です。編集から追加してください。";
      tagsWrap.appendChild(small);
    } else {
      cat.tags.forEach((tag) => {
        const pill = document.createElement("div");
        pill.className = "tag-pill";

        const span = document.createElement("span");
        span.className = "tag-text";
        span.textContent = tag;

        const btn = document.createElement("button");
        btn.className = "tag-add-btn";
        btn.textContent = "＋";
        btn.title = "このタグを追加";
        btn.dataset.action = "addTag";
        btn.dataset.categoryId = cat.id;
        btn.dataset.tag = tag;

        pill.appendChild(span);
        pill.appendChild(btn);
        tagsWrap.appendChild(pill);
      });
    }

    card.appendChild(header);
    card.appendChild(tagsWrap);
    container.appendChild(card);
  });
}

// ===== Editing =====

function enterEditMode(categoryId) {
  const card = document.querySelector(
    `.category-card[data-category-id="${categoryId}"]`
  );
  if (!card) return;

  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return;

  card.classList.add("editing");

  const tagsWrap = card.querySelector(".category-tags");
  tagsWrap.innerHTML = "";

  const editArea = document.createElement("div");
  editArea.className = "edit-area";

  const textarea = document.createElement("textarea");
  textarea.className = "edit-textarea";
  textarea.value = cat.tags.join("\n");
  textarea.dataset.categoryId = categoryId;

  const helper = document.createElement("div");
  helper.className = "edit-helper";
  helper.textContent = "1行につき1タグで入力してください。";

  const actions = document.createElement("div");
  actions.className = "edit-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "button button-secondary button-small";
  cancelBtn.textContent = "キャンセル";
  cancelBtn.dataset.action = "cancelEdit";
  cancelBtn.dataset.categoryId = categoryId;

  const saveBtn = document.createElement("button");
  saveBtn.className = "button button-primary button-small";
  saveBtn.textContent = "保存";
  saveBtn.dataset.action = "saveEdit";
  saveBtn.dataset.categoryId = categoryId;

  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);

  editArea.appendChild(textarea);
  editArea.appendChild(helper);
  editArea.appendChild(actions);

  tagsWrap.appendChild(editArea);
}

function cancelEditMode(categoryId) {
  const card = document.querySelector(
    `.category-card[data-category-id="${categoryId}"]`
  );
  if (!card) return;
  card.classList.remove("editing");
  renderCategories();
}

function saveEdit(categoryId) {
  const card = document.querySelector(
    `.category-card[data-category-id="${categoryId}"]`
  );
  if (!card) return;

  const textarea = card.querySelector(".edit-textarea");
  if (!textarea) return;

  const value = textarea.value || "";
  const lines = value
    .split("\n")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return;

  cat.tags = lines;
  saveData();
  renderCategories();
}

// ===== Category Management =====

function createCategory() {
  const name = window.prompt("新しいカテゴリ名を入力してください：", "新しいカテゴリ");
  if (!name) return;

  const idBase = name.replace(/\s+/g, "_").toLowerCase();
  let id = idBase || "cat";
  let counter = 1;
  while (categories.some((c) => c.id === id)) {
    id = `${idBase || "cat"}_${counter}`;
    counter += 1;
  }

  categories.push({
    id,
    name,
    tags: [],
  });

  saveData();
  renderCategories();
}

function deleteCategory(categoryId) {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return;

  const ok = window.confirm(`カテゴリ「${cat.name}」を削除しますか？`);
  if (!ok) return;

  categories = categories.filter((c) => c.id !== categoryId);
  saveData();
  renderCategories();
}

// ===== Clipboard =====

async function copyToClipboard() {
  const textarea = document.getElementById("previewArea");
  const text = textarea.value;
  if (!text.trim()) {
    window.alert("コピーするタグがありません。");
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      textarea.select();
      document.execCommand("copy");
    }
    window.alert("コピーしました！");
  } catch (e) {
    console.error(e);
    window.alert("コピーに失敗しました。手動でコピーしてください。");
  }
}

// ===== Event Binding =====

function bindEvents() {
  const categoryList = document.getElementById("categoryList");
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const copyBtn = document.getElementById("copyBtn");
  const clearBtn = document.getElementById("clearBtn");
  const delimiterRadios = document.querySelectorAll('input[name="delimiter"]');

  addCategoryBtn.addEventListener("click", () => {
    createCategory();
  });

  copyBtn.addEventListener("click", () => {
    copyToClipboard();
  });

  clearBtn.addEventListener("click", () => {
    selectedTags = [];
    refreshPreview();
  });

  delimiterRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      currentDelimiter = e.target.value;
      refreshPreview();
    });
  });

  // init delimiter radio state
  const selectedRadio = document.querySelector(
    `input[name="delimiter"][value="${currentDelimiter}"]`
  );
  if (selectedRadio) {
    selectedRadio.checked = true;
  }

  // イベントデリゲーションでカテゴリ周りを処理
  categoryList.addEventListener("click", (event) => {
    const target = event.target;
    const action = target.dataset.action;
    if (!action) return;

    const categoryId = target.dataset.categoryId;

    switch (action) {
      case "addAll": {
        const cat = categories.find((c) => c.id === categoryId);
        if (cat) addTags(cat.tags);
        break;
      }
      case "addTag": {
        const tag = target.dataset.tag;
        if (tag) addTag(tag);
        break;
      }
      case "edit": {
        enterEditMode(categoryId);
        break;
      }
      case "cancelEdit": {
        cancelEditMode(categoryId);
        break;
      }
      case "saveEdit": {
        saveEdit(categoryId);
        break;
      }
      case "deleteCategory": {
        deleteCategory(categoryId);
        break;
      }
      default:
        break;
    }
  });
}

// ===== Init =====

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  renderCategories();
  bindEvents();
  refreshPreview();
});
