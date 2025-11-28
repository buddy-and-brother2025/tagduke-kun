// タグヅケくん script.js

// ===== 定数 =====
const STORAGE_KEY = "tagduke-data-v1";
const STORAGE_PREVIEW_KEY = "tagduke-preview-v1";

// デフォルトカテゴリ
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

// ===== 状態管理 =====
let categories = [];
let currentDelimiter = "space"; // "space" | "newline"
let initialPreviewText = "";

// ===== ローカルストレージ =====
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.categories)) {
        categories = parsed.categories;
      } else {
        categories = [...defaultCategories];
      }
      currentDelimiter = parsed.delimiter || "space";
    } else {
      categories = [...defaultCategories];
      currentDelimiter = "space";
    }

    const previewRaw = localStorage.getItem(STORAGE_PREVIEW_KEY);
    if (previewRaw) {
      const preview = JSON.parse(previewRaw);
      initialPreviewText = preview.text || "";
      currentDelimiter = preview.delimiter || currentDelimiter;
    }
  } catch (e) {
    console.error("loadData error", e);
    categories = [...defaultCategories];
    currentDelimiter = "space";
  }
}

function saveData() {
  const payload = {
    categories,
    delimiter: currentDelimiter,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function savePreview() {
  const textarea = getPreviewTextarea();
  if (!textarea) return;
  const payload = {
    text: textarea.value || "",
    delimiter: currentDelimiter,
  };
  localStorage.setItem(STORAGE_PREVIEW_KEY, JSON.stringify(payload));
}

// ===== プレビュー関連 =====
function getPreviewTextarea() {
  return document.getElementById("previewArea");
}

function getCurrentTagsFromPreview() {
  const textarea = getPreviewTextarea();
  if (!textarea) return [];
  const text = textarea.value.trim();
  if (!text) return [];

  if (currentDelimiter === "newline") {
    return text
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  } else {
    return text
      .split(" ")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }
}

function setPreviewTags(tags) {
  const textarea = getPreviewTextarea();
  if (!textarea) return;

  const unique = Array.from(new Set(tags));
  let text = "";
  if (currentDelimiter === "newline") {
    text = unique.join("\n");
  } else {
    text = unique.join(" ");
  }

  textarea.value = text;
  savePreview();
}

function addTagToPreview(tag) {
  const tags = getCurrentTagsFromPreview();
  tags.push(tag);
  setPreviewTags(tags);
}

function addTagsToPreview(newTags) {
  const tags = getCurrentTagsFromPreview();
  setPreviewTags([...tags, ...newTags]);
}

// タグ1つ削除
function removeTagFromPreview(tag) {
  const tags = getCurrentTagsFromPreview();
  const filtered = tags.filter((t) => t !== tag);
  setPreviewTags(filtered);
}

// クリップボードコピー
function copyToClipboard() {
  const textarea = getPreviewTextarea();
  if (!textarea) return;

  textarea.select();
  textarea.setSelectionRange(0, 99999);

  try {
    document.execCommand("copy");
  } catch (e) {
    console.error("copy failed", e);
  }
}

// ===== カテゴリ描画 =====
function renderCategories() {
  const container = document.getElementById("categoryList");
  if (!container) return;

  container.innerHTML = "";

  categories.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "category-card";
    section.dataset.categoryId = cat.id;

    const header = document.createElement("div");
    header.className = "category-header";

    const title = document.createElement("h3");
    title.className = "category-title";
    title.textContent = cat.name;

    const headerActions = document.createElement("div");
    headerActions.className = "category-actions";

    const addAllBtn = document.createElement("button");
    addAllBtn.className = "chip-button chip-button-primary";
    addAllBtn.textContent = "＋ まとめて追加";
    addAllBtn.dataset.action = "addAll";
    addAllBtn.dataset.categoryId = cat.id;

    const editBtn = document.createElement("button");
    editBtn.className = "chip-button chip-button-ghost";
    editBtn.textContent = "編集";
    editBtn.dataset.action = "edit";
    editBtn.dataset.categoryId = cat.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "chip-button chip-button-danger";
    deleteBtn.textContent = "削除";
    deleteBtn.dataset.action = "deleteCategory";
    deleteBtn.dataset.categoryId = cat.id;

    headerActions.appendChild(addAllBtn);
    headerActions.appendChild(editBtn);
    headerActions.appendChild(deleteBtn);

    header.appendChild(title);
    header.appendChild(headerActions);

    const body = document.createElement("div");
    body.className = "category-body";

    const tagList = document.createElement("div");
    tagList.className = "tag-list";

    cat.tags.forEach((tag) => {
      const pill = document.createElement("div");
      pill.className = "tag-pill";

      const textSpan = document.createElement("span");
      textSpan.className = "tag-text";
      textSpan.textContent = tag;

      const addBtn = document.createElement("button");
      addBtn.className = "tag-add-btn";
      addBtn.type = "button";
      addBtn.textContent = "＋";
      addBtn.dataset.action = "addTag";
      addBtn.dataset.tag = tag;
      addBtn.dataset.categoryId = cat.id;

      pill.appendChild(textSpan);
      pill.appendChild(addBtn);
      tagList.appendChild(pill);
    });

    body.appendChild(tagList);

    section.appendChild(header);
    section.appendChild(body);

    container.appendChild(section);
  });
}

// ===== カテゴリ編集系 =====
function createCategory() {
  const name = window.prompt("新しいカテゴリ名を入力してください。", "新規カテゴリ");
  if (!name) return;

  const idBase = name.replace(/\s+/g, "").toLowerCase() || "category";
  let id = idBase;
  let i = 1;
  while (categories.some((c) => c.id === id)) {
    id = `${idBase}-${i++}`;
  }

  categories.push({
    id,
    name,
    tags: [],
  });

  saveData();
  renderCategories();
}

function enterEditMode(categoryId) {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return;

  const text = cat.tags.join("\n");
  const edited = window.prompt(
    "タグを1行ずつ入力してください（改行ごとに1タグ）。",
    text
  );
  if (edited === null) return;

  const tags = edited
    .split("\n")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  cat.tags = tags;
  saveData();
  renderCategories();
}

function deleteCategory(categoryId) {
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return;

  if (!window.confirm(`「${cat.name}」を削除してもよろしいですか？`)) return;

  categories = categories.filter((c) => c.id !== categoryId);
  saveData();
  renderCategories();
}

// ===== イベントバインド =====
function bindEvents() {
  const categoryList = document.getElementById("categoryList");
  const addCategoryBtn = document.getElementById("addCategoryBtn");
  const copyBtn = document.getElementById("copyBtn");
  const clearBtn = document.getElementById("clearBtn");
  const delimiterRadios = document.querySelectorAll('input[name="delimiter"]');
  const textarea = getPreviewTextarea();

  // カテゴリ追加ボタン
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      createCategory();
    });
  }

  // コピー
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      copyToClipboard();
    });
  }

  // クリア：テキストエリアを空にし、選択状態も解除
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (textarea) {
        textarea.value = "";
        savePreview();
      }

      document.querySelectorAll(".tag-pill.selected").forEach((pill) => {
        pill.classList.remove("selected");
      });
    });
  }

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

  // カテゴリリスト内のクリック（まとめて追加 / 編集 / 削除 / タグクリック）
  if (categoryList) {
    categoryList.addEventListener("click", (event) => {
      const target = event.target;

      // 1. スマホ版：タグ枠全体タップで追加／解除
      const pill = target.closest(".tag-pill");
      if (pill && window.matchMedia("(max-width: 800px)").matches) {
        const tagText = pill.querySelector(".tag-text");
        if (tagText) {
          const tag = tagText.textContent.trim();

          if (pill.classList.contains("selected")) {
            pill.classList.remove("selected");
            removeTagFromPreview(tag);
          } else {
            pill.classList.add("selected");
            addTagToPreview(tag);
          }
        }
        return; // スマホのタグタップはここで完結
      }

      // 2. それ以外（ボタン系）は data-action を見る
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
        case "deleteCategory": {
          deleteCategory(categoryId);
          break;
        }
        default:
          break;
      }
    });
  }
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  renderCategories();
  bindEvents();

  const textarea = getPreviewTextarea();
  if (textarea) {
    textarea.value = initialPreviewText;
  }
});
