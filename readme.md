# koishi-plugin-random-source-selector

[![npm](https://img.shields.io/npm/v/koishi-plugin-random-source-selector?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-random-source-selector)

透过多行文本链接随机抽出一条作为图片或文案发送，支援自定义指令


## 功能介绍

目前支援的数据解析类型:

- JSON
- 多行文本
- HTML
- 图片

目前支援的发送类型:

- 图片 (通常是图片网址)
- 文本


## 一般例子

**假设你的链接返回多行文本**，例如

```txt
今天礼拜四，V我50
今天是疯狂星期四！！
```

则选择发送类型为`文本`, 数据类型为`多行文本`, 插件便会从这两句文案中随机抽选一个返回。

**假设你的链接返回多行图片链接**，例如

```txt
https://cdn.xyz/abc.jpg
https://cdn.xyz/xyz.jpg
```

则选择发送类型为`图片`, 数据类型为`多汗文本`, 插件便会从这两条图片链接随机抽选一张图片返回。

**假设你的链接返回随机图片**

则选择发送类型为`图片`, 数据类型为`图片`, 插件则会直接把该链接返回的图片直接发送。

## 额外的解析类型选项 + 例子

### HTML

透过 Jquery 提取文本，设置如下

```yml
jquery_selector: 提取元素, 相当于 querySelectorAll(value)
attribute: 获取元素属性, 相当于 getAttribute(value)
```

例子如下:

```html
<img class="abc" src="https://cdn.xyz/abc1.img">
<img class="abc" src="https://cdn.xyz/abc2.img">
<img class="abc" src="https://cdn.xyz/abc3.img">
<img class="xyz" src="https://cdn.xyz/xyz.img">
```

想获取仅限 class 中包含 `abc` 的图片链接，则可用:

```yml
jquery_selector: .abc
attribute: src
```

插件则会从该三张图片中随机抽选。

__注意: 提取的 html 文本为 http 请求的文本，不包含js后期注入的html元素__

### JSON

透过字符进行JSON取值，设置如下

```yml
json_key: 需要扫描的key, 相当于在js中获取json数值时的引用 + 支援迭代逻辑 []
```

例子如下:

```json
[
    {
        "id": "_5degoesxi",
        "question": "What would you like to practice today?",
        "possible_answers": [
            {
                "label": "HTML & CSS",
                "action": {
                    "key": "lesson_category",
                    "type": "html-css"
                }
            },
            {
                "label": "General Typing",
                "action": {
                    "key": "lesson_category",
                    "type": "general"
                }
            }
        ]
    },
    {
        "id": "_zvcr8k6sq",
        "question": "Choose your difficult level.",
        "possible_answers": [
            {
                "label": "Easy",
                "action": {
                    "key": "difficulty",
                    "type": "easy"
                }
            },
            {
                "label": "Medium",
                "action": {
                    "key": "difficulty",
                    "type": "medium"
                }
            },
            {
                "label": "Hard",
                "action": {
                    "key": "difficulty",
                    "type": "hard"
                }
            }
        ]
    }
]
```

若想获取所有元素中内 action 的 type, 则使用

```yml
json_key: "[].possible_answers[].action.type"
```

[] 代表迭代，则会提取每个迭代元素的值。提取后将会从 `hard`, `medium`, `easy`, `general`, `html-css` 中随机抽选。

若 JSON 从 object 而非 array 开始迭代，则直接填入该 object 的 key 即可，例如:

```json
{
    "abc": {
        "xyz": ["foo", "bar"]
    }
}
```

则填入:

```yml
json_key: "abc.xyz"
```

就可获得 `foo`, `bar` 随机抽选。

__注意: 若 `json_key` 填写不当有可能会导致插件报错。__


