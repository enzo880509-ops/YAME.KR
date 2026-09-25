import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'yame-editor',
  title: 'YAME 기사 편집',
  projectId: 'x0whfq92',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {types: schemaTypes},
})
