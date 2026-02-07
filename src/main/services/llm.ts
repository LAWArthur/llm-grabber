import axios from "axios";
import { ExtractedWord, Translation } from "../../shared/types";
import { getConfig } from '../config';

export async function callZhipuAPI(messages) {
  const model = getConfig('llmModel')
  const baseUrl = getConfig('llmEndpoint')
  const apiKey = getConfig('llmApiKey')

  if (!baseUrl || !model || !apiKey) {
    throw new Error('LLM not correctly configured. Please set it in settings.')
  }

  const urlBuilder = new URL('chat/completions', baseUrl)
  const url = urlBuilder.toString()

  const response = await axios({
    method: 'POST',
    url: url,
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    data: {
      model: model,
      messages: messages,
      temperature: 1.0
    }
  });

  return await response.data;
}

export async function requestJSON(userPrompt: string) {
  const history = [
        {
          role: "system",
          content: `你是一个JSON数据生成器。请严格按照要求返回有效的JSON格式。
    
要求：
1. 只返回JSON，不要有任何额外的解释、标记或文本，尤其是不要添加代码块
2. 确保JSON语法正确
3. 如果无法确定某个字段，使用null值
4. 所有字符串使用双引号`
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
  while (true) {
    const result = (await callZhipuAPI(
      history
    )).choices[0].message.content

    try {
      const json = JSON.parse(result)
      return json
    }
    catch (e) {
      console.log(result, e)
      history.push(
        {role: 'assistant', content: result},
        {role: 'user', content: `JSON格式不正确：${e}，请修正JSON格式。
要求：
1. 只返回JSON，不要有任何额外的解释、标记或文本，尤其是不要添加代码块
2. 确保JSON语法正确
3. 如果无法确定某个字段，使用null值
4. 所有字符串使用双引号` }
      )
    }
  }
}

export async function extractWord(text: string, index: number): Promise<ExtractedWord> {
  const textModified = text.slice(0, index) + ">>" + text[index] + "<<" + text.slice(index + 1)
  const userPrompt = `给出一个任意语言的片段，这一片段重复两遍，第二遍选中了一个字符（用>><<示出），你需要返回1. 该语种名称 2. 片段中包含这个字符的单词/词语/语法片段

请按照以下格式返回JSON：
{"language": <string>, "word": <string>}

例子：

今日は太陽がとても良い
今日は太陽が>>と<<ても良い
返回：{"language":"japanese", "word": "とても"}

Сoлнце сeгодня такое
Сoлнце сe>>г<<одня такое

返回：{"language":"russian", "word": "сeгодня"}

------

输入：
${text}
${textModified}
`

  return await requestJSON(userPrompt)
}

export async function getTranslation(language:string, text: string): Promise<Translation> {
  const userPrompt = `给出一个特定语言的单词/词语/语法片段，你需要用JSON格式给出如下信息：
1. language(string): 如果输入语言是auto-detect，你需要推测语种；否则直接输出给定的语种
2. pronunciation(string): 使用对应语言最合适的方式为该词语注音
3. translations(array): 
  - partOfSpeech: 使用对应语言最合适的方式写出词性
  - translation: 对应的中文翻译
4. examples(array): 多数情况下，只需要给出一个例句；但如果某个词语有若干差别很大的主要含义，应分别给出一个例句。
  - example: 给出一个短小的例句，如果没有办法很短就用省略号省去不重要的部分。
  - translation: 例句的翻译。

例子：
[japanese] 吾輩
{
  "language": "japanese",
	"pronunciation": "わがはい (wagahai)",
	"translations": [
	  {
	    "partOfSpeech": "代名詞",
	    "translation": "我（一种自称，带有傲慢或幽默的语气）"
	  }
	],
	"examples": [
	  {
	    "example": "吾輩は猫である。",
	    "translation": "我是猫。"
	  }
	]
}

[auto-detect] record
{
  "language": "english",
  "pronunciation": "verb: /rɪˈkɔːrd/; noun: /ˈrekərd/",
  "translations": [
    {
      "partOfSpeech": "verb",
      "translation": "记录，录音"
    },
    {
      "partOfSpeech": "noun",
      "translation": "记录，唱片"
    }
  ],
  "examples": [
    {
      "example": "She recorded the lecture.",
      "translation": "她录制了讲座."
    },
    {
      "example": "The record was broken last year.",
      "translation": "去年这项记录被打破了。"
    }
  ]
}

------

输入：
[${language}] ${text}
`
  return await requestJSON(userPrompt)
}