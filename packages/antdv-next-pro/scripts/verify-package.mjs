import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(scriptDirectory, '..')
const packageJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8'))
const require = createRequire(import.meta.url)

const expectedEntries = {
  main: './dist/index.cjs',
  module: './dist/index.js',
  style: './dist/style.css',
  types: './dist/index.d.ts',
}

for (const [field, expected] of Object.entries(expectedEntries)) {
  assert.equal(packageJson[field], expected, `${field} 应指向 ${expected}`)
  assert.ok(existsSync(resolve(packageRoot, expected)), `${expected} 不存在`)
}

for (const declaration of ['dist/index.d.ts', 'dist/index.d.cts']) {
  const declarationPath = resolve(packageRoot, declaration)
  const declarationContent = readFileSync(declarationPath, 'utf8')
  const sourceMap = declarationContent.match(/\/\/# sourceMappingURL=(.+)$/m)
  assert.ok(sourceMap?.[1], `${declaration} 缺少 sourceMappingURL`)
  assert.ok(
    existsSync(resolve(dirname(declarationPath), sourceMap[1])),
    `${declaration} 引用的 ${sourceMap[1]} 不存在`,
  )
}

assert.deepEqual(packageJson.exports['.'], {
  import: {
    types: './dist/index.d.ts',
    default: './dist/index.js',
  },
  require: {
    types: './dist/index.d.cts',
    default: './dist/index.cjs',
  },
})
assert.equal(packageJson.exports['./style.css'], './dist/style.css')

const esmEntry = fileURLToPath(import.meta.resolve(packageJson.name))
assert.equal(esmEntry, resolve(packageRoot, 'dist/index.js'))
assert.equal(require.resolve(packageJson.name), resolve(packageRoot, 'dist/index.cjs'))
assert.equal(
  require.resolve(`${packageJson.name}/style.css`),
  resolve(packageRoot, 'dist/style.css'),
)

const expectedRuntimeExports = [
  'AntdvNextPro',
  'DrawerForm',
  'EditableProTable',
  'Embed',
  'Form',
  'LightFilter',
  'ModalForm',
  'ProTable',
  'QueryFilter',
  'SchemaForm',
  'StepForm',
  'StepsForm',
  'default',
]

const esmSource = readFileSync(resolve(packageRoot, 'dist/index.js'), 'utf8')
const esmExportBlock = esmSource.match(
  /export\s*\{([\s\S]*?)\};?\s*(?:\/\/# sourceMappingURL|$)/,
)?.[1]
assert.ok(esmExportBlock, '无法读取 ESM 导出列表')
const esmExports = new Set(
  esmExportBlock.split(',').map((specifier) => {
    const parts = specifier.trim().split(/\s+as\s+/)
    return parts.at(-1)
  }),
)

const cjsSource = readFileSync(resolve(packageRoot, 'dist/index.cjs'), 'utf8')
const cjsExports = new Set(
  Array.from(cjsSource.matchAll(/exports\.([A-Za-z_$][\w$]*)\s*=/g), (match) => match[1]),
)
for (const name of expectedRuntimeExports) {
  assert.ok(esmExports.has(name), `ESM 缺少导出 ${name}`)
  assert.ok(cjsExports.has(name), `CJS 缺少导出 ${name}`)
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const packResult = spawnSync(npmCommand, ['pack', '--dry-run', '--json', '--ignore-scripts'], {
  cwd: packageRoot,
  encoding: 'utf8',
  shell: process.platform === 'win32',
})

assert.equal(
  packResult.status,
  0,
  `npm pack --dry-run 失败：${packResult.stderr || packResult.stdout}`,
)

const packReport = JSON.parse(packResult.stdout)
const packedFiles = new Set(packReport[0]?.files?.map((file) => file.path) ?? [])
for (const file of [
  'LICENSE',
  'README.md',
  'dist/index.cjs',
  'dist/index.cjs.map',
  'dist/index.d.cts',
  'dist/index.d.cts.map',
  'dist/index.d.ts',
  'dist/index.d.ts.map',
  'dist/index.js',
  'dist/index.js.map',
  'dist/style.css',
  'package.json',
]) {
  assert.ok(packedFiles.has(file), `npm 包缺少 ${file}`)
}

console.log(`已验证 ${packageJson.name} 的 ESM、CJS、类型、样式和 npm pack 文件清单。`)
