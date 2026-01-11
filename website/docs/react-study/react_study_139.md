# 第139章：`useImmer` の紹介

データ更新をめっちゃ楽にする魔法🪄

---

## 1️⃣ この章でできるようになること

この章では、こんなことができるようになるのがゴールです✨

* 「イミュータブル（元のデータを直接いじらない）」のつらさを再確認する
* そのつらさを一気に解決してくれるライブラリ **Immer** を知る
* React 用のカスタムフック **`useImmer`** の使い方を覚える
* `useState` では大変だった **ネストしたオブジェクトや配列** を、サクッと更新できるようになる

React公式ドキュメントでも、オブジェクトや配列の更新がつらくなってきたら Immer を使うと楽になるよ〜という話が出てきます。([React][1])

---

## 2️⃣ おさらい：「イミュータブルしんどい問題」😇

React では、**state は直接書き換えちゃダメ** でしたよね。

* `state.user.name = '...';` ❌
* `setState({ ...state, user: { ...state.user, name: '...' } })` ✅

例えば、ユーザー情報をこんなふうに持っていたとします：

```tsx
type User = {
  name: string;
  profile: {
    age: number;
    city: string;
  };
};

const [user, setUser] = useState<User>({
  name: 'さくら',
  profile: {
    age: 20,
    city: 'Tokyo',
  },
});
```

`city` だけ変えたいとき、イミュータブルを守ろうとすると…

```tsx
function handleChangeCity() {
  setUser({
    ...user,
    profile: {
      ...user.profile,
      city: 'Osaka',
    },
  });
}
```

🌀 スプレッド（`...`）だらけで、ネストが増えるほど
「今どの階層コピーしてるんだっけ…？」ってなりがちです。

React docs でも、「オブジェクトや配列を更新するときはコピーして新しい値を渡してね」と説明されていますが、ネストが深いとどうしてもコードが長くなります。([React][1])

そこで登場するのが **Immer & `useImmer`** です💪

---

## 3️⃣ Immer & `useImmer` ってなに？🧊

![Immerの概念図](./picture/react_study_139_immer_concept.png)

### 🧊 Immer のざっくりイメージ

Immer は、

> 「**ドラフト（下書き）** に対しては自由にミュート（直接書き換え）していいよ。
> 最後に **きれいなイミュータブルな新データ** を作って返しておくからね〜」

という魔法のようなライブラリです🪄([tuckerblackwell.com][2])

React の公式ドキュメントでも、イミュータブルな更新を楽にするための方法の1つとして Immer が紹介されています。([React][1])

### 🪄 `useImmer` とは？

`useImmer` は、Immer チームが作っている **React 用のカスタムフック** です。
React 本体の機能ではなく、**`use-immer` という外部ライブラリ** から提供されます。([GitHub][3])

見た目はほぼ `useState` と同じなんですが、
**更新関数に「ドラフト」を渡してくれる** のがポイントです。

---

## 4️⃣ ざっくり仕組みイメージ（Mermaid図）🧠

`useImmer` が裏側で何をしているか、イメージ図で見てみましょう👇

```mermaid
flowchart LR
  A["ユーザーがボタンをクリック🖱"] --> B[updateUser を呼ぶ]
  B --> C["Immer が draft(下書き) を用意"]
  C --> D["あなた: draft.profile.city = 'Osaka' など自由に変更"]
  D --> E["Immer: draft から<br/>新しい user を生成 ✨"]
  E --> F["React: 新しい user で再レンダリング"]
```

* あなたは **`draft` を「普通にミュート」している感覚** で書ける
* でも実際には Immer が、裏でちゃんとイミュータブルな新 state を作ってくれる

という流れです🌟

---

## 5️⃣ セットアップ：`use-immer` を入れよう 💿

ターミナルで、プロジェクトのフォルダに移動してから👇

```bash
npm install use-immer
```

これで `useImmer` フックが使えるようになります。([GitHub][3])

使うときは、コンポーネントのファイルでこう書きます：

```tsx
import { useImmer } from 'use-immer';
```

---

## 6️⃣ `useImmer` の基本形を見てみよう ✨

まずは、シンプルなオブジェクトの例から。

### 🎀 例1：プロフィールを `useImmer` で管理

#### 🔹 Before：`useState` 版（おさらい）

```tsx
type Profile = {
  name: string;
  age: number;
  city: string;
};

const [profile, setProfile] = useState<Profile>({
  name: 'さくら',
  age: 20,
  city: 'Tokyo',
});

function handleBirthday() {
  setProfile({
    ...profile,
    age: profile.age + 1,
  });
}
```

#### 🔹 After：`useImmer` 版（ドラフトに直接書く🎉）

```tsx
import { useImmer } from 'use-immer';

type Profile = {
  name: string;
  age: number;
  city: string;
};

const [profile, updateProfile] = useImmer<Profile>({
  name: 'さくら',
  age: 20,
  city: 'Tokyo',
});

function handleBirthday() {
  updateProfile((draft) => {
    draft.age = draft.age + 1;
  });
}

function moveToOsaka() {
  updateProfile((draft) => {
    draft.city = 'Osaka';
  });
}
```

☝ ポイント：

* `useImmer<Profile>(初期値)`
  → `useState<Profile>` とほぼ同じ感覚で使える
* 更新関数 `updateProfile` に **関数を渡す** と、

  * その関数の引数 `draft` が「ドラフトオブジェクト」
  * `draft.age++` みたいに直接変更して OK
* Immer が裏で「イミュータブルな新しい `profile`」を作ってくれる

---

## 7️⃣ 配列の例：TODOリストを `useImmer` 化してみる ✅

次は、配列を扱うときのよくあるパターンです。

### 🔹 型定義

```tsx
type Todo = {
  id: number;
  title: string;
  done: boolean;
};
```

### 🔹 `useImmer` で TODO 配列を管理する

```tsx
import { useImmer } from 'use-immer';

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

export function TodoListUseImmer() {
  const [todos, updateTodos] = useImmer<Todo[]>([
    { id: 1, title: 'React を学ぶ', done: true },
    { id: 2, title: 'useImmer を試す', done: false },
  ]);

  function handleAdd() {
    updateTodos((draft) => {
      const nextId =
        draft.length === 0 ? 1 : draft[draft.length - 1].id + 1;

      draft.push({
        id: nextId,
        title: `新しいタスク ${nextId}`,
        done: false,
      });
    });
  }

  function handleToggle(id: number) {
    updateTodos((draft) => {
      const todo = draft.find((t) => t.id === id);
      if (todo == null) {
        return;
      }
      todo.done = !todo.done;
    });
  }

  return (
    <div>
      <h2>useImmer TODO 📝</h2>
      <button onClick={handleAdd}>追加</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggle(todo.id)}
              />
              {todo.title}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

ここでのポイントはこんな感じ👇

* `draft.push(...)` して OK（普通の配列みたいに書ける）
* `draft.find(...)` で見つけた `todo.done` を直接反転して OK
* でも実際は Immer が **ちゃんと新しい配列を作って** くれている

「`...todos` とか `map` とか `filter` を駆使して新配列を組み立てる」のに比べると、
だいぶメンタルが楽になります😌([Zenn][4])

---

## 8️⃣ 型の話：`useImmer<StateType>` の考え方 👓

`useImmer` もジェネリクスで型を指定できます。

```tsx
const [profile, updateProfile] = useImmer<Profile>(/* 初期値 */);
const [todos, updateTodos] = useImmer<Todo[]>(/* 初期配列 */);
```

### 💡 型の付け方のコツ

* **オブジェクトや配列を管理するときは `useImmer<型>` を素直に書く**

  * そのほうが VS Code が型補完をガッツリ出してくれて安心
* 逆に単純な `number` や `string` だけなら、
  わざわざ `useImmer` を使わず `useState` のままで OK

Stack Overflow などでも、`useImmer` は「オブジェクトや配列を扱うときに便利なツールであって、必須ではないよ」という位置づけで説明されています。([Stack Overflow][5])

---

## 9️⃣ `useImmer` を使うとき・使わないときチェックリスト ✅❌

### ✅ 使うとハッピーなとき

* state が **ネストしたオブジェクト or 配列** で

  * `...` の嵐になって頭がこんがらがるとき
* TODOリスト・フォーム入力・設定画面など

  * 「ちょっと深めの階層」をよくいじる UI
* 「型もちゃんと守りながら楽に書きたい」とき

### ❌ 無理に使わなくていいとき

* `count` みたいに、**ただの数字や文字列** を ちょっと更新するだけ

  * → `useState<number>` で十分
* ほんの少しのデータで、ネストも浅いとき

  * → まずは素の `useState` で書いてみて、
    「つらくなってきたら `useImmer` に乗り換える」でOK

---

## 🔟 ミニ練習タイム ✍️（手を動かしてみよう）

実際に `useImmer` を使ってみる練習問題です。
答えはこの章では書かないので、**VSCodeで手を動かしながら** 試してみてください😉

---

### 📝 練習1：プロフィールカードを `useImmer` 化する

1. `ProfileCard.tsx` というコンポーネントを作る

2. `Profile` 型はこんな感じで定義：

   ```tsx
   type Profile = {
     name: string;
     profile: {
       age: number;
       city: string;
       hobby: string;
     };
   };
   ```

3. `useImmer<Profile>` で state を持つ

4. ボタンを3つ作る

   * 「1歳年をとる」（`age` を +1）
   * 「都市を Osaka に変える」（`city` を書き換え）
   * 「趣味を '旅行' に変える」

5. それぞれのボタンの中では、**`draft` に直接代入して更新** してみる

---

### ✅ 練習2：TODO + タグ機能を `useImmer` で

1. `TodoWithTag.tsx` を作る

2. `Todo` 型を少しリッチにする：

   ```tsx
   type Todo = {
     id: number;
     title: string;
     done: boolean;
     tags: string[];
   };
   ```

3. やりたいこと：

   * 「タグを追加」ボタン

     * 対象の TODO の `tags` 配列に、新しいタグを `push`
   * 「完了/未完了」トグルボタン

     * `done` を `true/false` 切り替え

4. すべて `updateTodos((draft) => { ... })` の中で

   * `draft[index].tags.push('React')`
   * `draft[index].done = !draft[index].done`
     みたいに書いてみる

---

## 🎯 まとめ：この章で押さえておきたいこと

* Immer は「**ドラフトに自由に書いていいよ、最終的なイミュータブルはこっちで作るね**」っていうライブラリ🧊
* `useImmer` はその React 版カスタムフックで、

  * `useState` と同じ顔をしているけど
  * 更新時に `draft` を渡してくれるのがポイント
* ネストしたオブジェクト・配列の更新が **スッキリ & ミスりにくくなる** ✨
* ただし、なんでもかんでも `useImmer` にする必要はなくて、

  * シンプルな値は `useState`
  * 複雑・ネスト深めなら `useImmer`
    くらいの感じで使い分けるとバランス良い👌

次の **第140章** では、
実際に今まで `useState` で書いていたコードを **`useImmer` に書き換えてみる実践編** に入っていきます💻🔥

[1]: https://react.dev/learn/updating-objects-in-state?utm_source=chatgpt.com "Updating Objects in State"
[2]: https://www.tuckerblackwell.com/immutability-with-immer/?utm_source=chatgpt.com "Use Immer to Manage Your Immutable React State"
[3]: https://github.com/immerjs/use-immer?utm_source=chatgpt.com "Use immer to drive state with a React hooks"
[4]: https://zenn.dev/nonoyamalfoy/articles/f6cce13addc4fe?utm_source=chatgpt.com "「Immer」を使ったイミュータブル実装"
[5]: https://stackoverflow.com/questions/75826933/when-to-use-useimmer-vs-usestate?utm_source=chatgpt.com "When to use useImmer vs useState? - javascript"
