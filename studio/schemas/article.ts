import {defineField, defineType} from 'sanity'

const localizedText = (name: string, title: string, group: string, rows = 3) =>
  defineField({name, title, type: 'text', rows, group})

const richText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      {
        type: 'block',
        styles: [{title: '본문', value: 'normal'}, {title: '소제목', value: 'h2'}, {title: '인용문', value: 'blockquote'}],
        marks: {decorators: [{title: '굵게', value: 'strong'}, {title: '기울임', value: 'em'}]},
      },
      {type: 'image', options: {hotspot: true}, fields: [{name: 'alt', title: '이미지 대체 텍스트', type: 'string'}]},
    ],
  })

export default defineType({
  name: 'article',
  title: '기사',
  type: 'document',
  groups: [
    {name: 'basic', title: '기본 정보', default: true},
    {name: 'english', title: '영문'},
    {name: 'korean', title: '한국어'},
    {name: 'media', title: '사진·출처'},
  ],
  fields: [
    defineField({name: 'slug', title: '기사 주소 (영문)', type: 'slug', group: 'basic', options: {source: 'titleEn', maxLength: 80}, validation: (rule) => rule.required()}),
    defineField({name: 'category', title: '카테고리', type: 'string', group: 'basic', options: {list: [{title: 'Review', value: 'review'}, {title: 'News', value: 'news'}]}, validation: (rule) => rule.required()}),
    defineField({name: 'reviewType', title: '리뷰 주제', type: 'string', group: 'basic', hidden: ({document}) => document?.category !== 'review', options: {list: [{title: 'Camera', value: 'camera'}, {title: 'Audio', value: 'audio'}]}}),
    defineField({name: 'author', title: '작성자', type: 'string', group: 'basic'}),
    defineField({name: 'readTime', title: '읽는 시간', type: 'string', group: 'basic', initialValue: '2 min read'}),
    defineField({name: 'published', title: '사이트에 공개', type: 'boolean', group: 'basic', initialValue: false}),
    defineField({name: 'titleEn', title: '기사 제목 (English)', type: 'string', group: 'english', validation: (rule) => rule.required()}),
    defineField({name: 'kickerEn', title: '카테고리 표시 (English)', type: 'string', group: 'english'}),
    {...localizedText('dekEn', '짧은 소개 (English)', 'english', 3)},
    {...richText('bodyEn', '기사 내용 (English)'), group: 'english'},
    defineField({name: 'titleKo', title: '기사 제목 (한국어)', type: 'string', group: 'korean'}),
    defineField({name: 'kickerKo', title: '카테고리 표시 (한국어)', type: 'string', group: 'korean'}),
    localizedText('dekKo', '짧은 소개 (한국어)', 'korean', 3),
    {...richText('bodyKo', '기사 내용 (한국어)'), group: 'korean'},
    defineField({name: 'coverImage', title: '대표 사진', type: 'image', group: 'media', options: {hotspot: true}, fields: [{name: 'alt', title: '사진 설명', type: 'string'}], validation: (rule) => rule.custom((value, context) => value || context.document?.coverUrl ? true : '대표 사진을 올려주세요.')}),
    defineField({name: 'coverUrl', title: '기존 사이트 사진 경로', type: 'string', group: 'media', hidden: true, readOnly: true}),
    defineField({name: 'captionEn', title: '사진 설명 (English)', type: 'string', group: 'media'}),
    defineField({name: 'captionKo', title: '사진 설명 (한국어)', type: 'string', group: 'media'}),
    defineField({name: 'sourceLabel', title: '출처 이름', type: 'string', group: 'media'}),
    defineField({name: 'sourceUrl', title: '출처 링크', type: 'url', group: 'media'}),
    defineField({name: 'gallery', title: '추가 사진', type: 'array', group: 'media', of: [{type: 'image', options: {hotspot: true}, fields: [{name: 'alt', title: '사진 설명', type: 'string'}]}]}),
  ],
  preview: {select: {title: 'titleEn', subtitle: 'category', media: 'coverImage'}},
})
