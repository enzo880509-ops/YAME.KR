import fs from 'node:fs'
import vm from 'node:vm'

const source = fs.readFileSync(new URL('../../public/app.js', import.meta.url), 'utf8')

function objectSource(name) {
  const declaration = `const ${name} =`
  const marker = source.indexOf(declaration)
  if (marker < 0) throw new Error(`Could not find ${name} in public/app.js`)
  const start = source.indexOf('{', marker + declaration.length)
  let depth = 0
  let quote = ''
  let escaped = false
  for (let index = start; index < source.length; index += 1) {
    const char = source[index]
    if (quote) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = ''
      continue
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue }
    if (char === '{') depth += 1
    if (char === '}' && --depth === 0) return source.slice(start, index + 1)
  }
  throw new Error(`Could not parse ${name}`)
}

const stories = vm.runInNewContext(`(${objectSource('stories')})`)
const translations = vm.runInNewContext(`(${objectSource('translations')})`)

function portableText(blocks, keyPrefix) {
  return (blocks || []).map((item, index) => {
    const text = typeof item === 'string' ? item : item.heading || item.quote || ''
    const style = typeof item === 'string' ? 'normal' : item.heading ? 'h2' : 'blockquote'
    return {
      _type: 'block',
      _key: `${keyPrefix}-${index}`,
      style,
      markDefs: [],
      children: [{_type: 'span', _key: `${keyPrefix}-${index}-span`, text, marks: []}],
    }
  })
}

function rootImage(path) {
  return path?.startsWith('../assets/') ? path.replace('../assets/', '/assets/') : path || ''
}

const records = Object.entries(stories).map(([slug, story]) => {
  const ko = translations[slug]?.ko || {}
  const category = story.news || /^News\b/i.test(story.kicker) ? 'news' : 'review'
  const reviewType = /Audio/i.test(story.kicker) ? 'audio' : 'camera'
  const titleKo = ko.title || story.title
  const baseKickerKo = category === 'news' ? '뉴스 / 스토리' : `리뷰 / ${reviewType === 'audio' ? '오디오' : reviewType === 'video' ? '영상' : '카메라'}`
  const doc = {
    _id: `yame-${slug}`,
    _type: 'article',
    slug: {_type: 'slug', current: slug},
    category,
    reviewType,
    author: story.author || 'YAME Editorial Desk',
    readTime: story.readTime || '2 min read',
    published: true,
    titleEn: story.title,
    kickerEn: story.kicker,
    dekEn: story.dek || '',
    bodyEn: portableText(story.body, `en-${slug}`),
    titleKo,
    kickerKo: baseKickerKo,
    dekKo: ko.dek || story.dek || '',
    bodyKo: portableText(ko.body || story.body, `ko-${slug}`),
    coverUrl: rootImage(story.image),
    captionEn: story.caption || '',
    captionKo: story.caption || '',
    ...(story.source ? {sourceLabel: story.source.label, sourceUrl: story.source.url} : {}),
  }
  return doc
})

const output = new URL('../initial-articles.ndjson', import.meta.url)
fs.writeFileSync(output, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`)
console.log(`Prepared ${records.length} existing YAME articles in ${output.pathname}`)
