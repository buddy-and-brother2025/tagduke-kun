// タグヅケくん script.js

const STORAGE_KEY = "tagduke-data-v1";
const STORAGE_PREVIEW_KEY = "tagduke-preview-v1";

const defaultCategories = [
  {
    id: "basic",
    name: "基本",
    tags: [
      "#ジャムデザイン",
      "#デザイン会社",
      "#デザイナー",
      "#制作会社",
      "#岩槻",
      "#さいたま市",
      "#さいたま",
      "#埼玉",
      "#ワンストップ",
    ],
  },
  {
    id: "photo",
    name: "撮影",
    tags: [
      "#撮影",
      "#スチール撮影",
      "#スタジオ撮影",
      "#商品撮影",
      "#ビジネスフォト",
      "#出張撮影",
      "#スチール",
      "#写真撮影",
      "#カメラマン",
    ],
  },
  {
    id: "graphic",
    name: "グラフィックデザイン",
    tags: [
      "#グラフィックデザイン",
      "#イラスト制作",
      "#ポスター制作",
      "#キャラクター制作",
      "#ロゴ制作",
      "#印刷",
      "#冊子制作",
    ],
  },
  {
    id: "movie",
    name: "動画",
    tags: [
      "#動画制作",
      "#動画撮影",
      "#動画編集",
      "#ポストプロダクション",
      "#PR動画",
      "#採用動画",
      "#映像制作",
      "#webcm",
    ],
  },
  {
    id: "web",
    name: "WEB",
    tags: [
      "#WEB制作",
      "#WEBデザイン",
      "#WEBデザイナー",
      "#LP制作",
      "#WEBコンテンツ制作",
    ],
  },
  {
    id: "drone",
    name: "ドローン",
    tags: [
      "#空撮",
      "#ドローン",
      "#FPV",
      "#DJI",
      "#Mavic",
      "#ドローン撮影",
      "#室内ドローン",
    ],
  },
];

let categories = [];
let currentDelimiter = "space";
let initialPreviewText = "";

// ===== Utility =====

function getPreviewTextarea() {
  return document.getElementById("previewArea");
}

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
      initialPreviewText = parsed.text || "";
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
  const textarea = getPreviewTextarea();
  if (!textarea) return;
  window.localStorage.setItem(
    STORAGE_PREVIEW_KEY,
    JSON.stringify({
      text: textarea.value,
      delimiter: currentDelimiter,
    })
  );
}

// 現在のプレビュー欄からタグ配列を取得（空白・改行区切り）
function getCurrentTagsFromPreview() {
  const textarea = getPreviewTextarea();
  if (!textarea) return [];
  const raw = textarea.value.trim();
  if (!raw) return [];
  const parts = raw.split(/\s+/).filter(Boolean);
  const seen = new Set();
  const result = [];
  for (const p of parts) {
    if (!seen.has(p)) {
      seen.add(p);
      result.push(p);
    }
  }
  return result;
}

// タグ配列を現在の区切り設定でプレビュー欄に反映
function setPreviewTags(tags) {
  const textarea = getPreviewTextarea();
  if (!textarea) return;
  const delimiter = currentDelimiter === "newline" ? "\n" : " ";
  textarea.value = tags.join(delimiter);
  savePreview();
}

// タグ1つ追加（重複はスキップ）
function addTagToPreview(tag) {
  const tags = getCurrentTagsFromPreview();
  if (!tags.includes(tag)) {
    tags.push(tag);
    setPreviewTags(tags);
  }
}

// タグ配列まとめて追加（重複除去）
function addTagsToPreview(tagsToAdd) {
  const tags = getCurrentTagsFromPreview();
  const seen = new Set(tags);
  let updated = false;
  for (const t of tagsToAdd) {
    if (!seen.has(t)) {
      seen.add(t);
      tags.push(t);
      updated = true;
    }
  }
  if (updated) {
    setPreviewTags(tags);
  }
}
// タグ1つ削除
function removeTagFromPreview(tag) {
  const tags = getCurrentTagsFromPreview();
  const filtered = tags.filter((t) => t !== tag);
  setPreviewTags(filtered);
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
  const textarea = getPreviewTextarea();
  if (!textarea) {
    window.alert("コピーするタグがありません。");
    return;
  }
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
  const textarea = getPreviewTextarea();

  // カテゴリ追加ボタン
  addCategoryBtn.addEventListener("click", () => {
    createCategory();
  });

  // コピー
  copyBtn.addEventListener("click", () => {
    copyToClipboard();
  });

  // クリア：テキストエリアを空にし、選択状態も解除
  clearBtn.addEventListener("click", () => {
    if (textarea) {
      textarea.value = "";
      savePreview();
    }

    // 選択中のタグ枠の色も全部リセット
    document.querySelectorAll(".tag-pill.selected").forEach((pill) => {
      pill.classList.remove("selected");
    });
  });

  // 区切り（スペース / 改行）の変更
  delimiterRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      currentDelimiter = e.target.value;
      const tags = getCurrentTagsFromPreview();
      setPreviewTags(tags);
    });
  });

  // 区切りラジオの初期状態
  const selectedRadio = document.querySelector(
    `input[name="delimiter"][value="${currentDelimiter}"]`
  );
  if (selectedRadio) {
    selectedRadio.checked = true;
  }

  // プレビュー手動編集 → 保存
  if (textarea) {
    textarea.addEventListener("input", () => {
      savePreview();
    });
  }

  // ▼ カテゴリ周りのクリック（まとめて追加 / 編集 / 削除 / タグクリック） ▼
  categoryList.addEventListener("click", (event) => {
    const target = event.target;

    // 1. スマホ版：タグ枠全体タップで追加／解除
    const pill = target.closest(".tag-pill");
    if (pill && window.matchMedia("(max-width: 800px)").matches) {
      const tagText = pill.querySelector(".tag-text");
      if (tagText) {
        const tag = tagText.textContent.trim();

        if (pill.classList.contains("selected")) {
          // すでに選択されていたら → 解除してテキストエリアからも削除
          pill.classList.remove("selected");
          removeTagFromPreview(tag);
        } else {
          // 未選択なら → 選択状態にして追加
          pill.classList.add("selected");
          addTagToPreview(tag);
        }
      }
      return; // スマホのタグタップはここで完結
    }

    // 2. それ以外（「まとめて追加」「編集」「削除」「＋」ボタン）は data-action を見る
    const button = target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const categoryId = button.dataset.categoryId;

    switch (action) {
      case "addAll": {
        const cat = categories.find((c) => c.id === categoryId);
        if (cat) addTagsToPreview(cat.tags);
        break;
      }
      case "addTag": {
        const tag = button.dataset.tag;
        if (tag) addTagToPreview(tag);
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

  // 保存していたプレビュー内容を反映
  const textarea = getPreviewTextarea();
  if (textarea) {
    textarea.value = initialPreviewText;
  }
});
