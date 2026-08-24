# Changesets

本目录记录 `antdv-next-pro` 的用户可见变更，并由 GitHub Actions 维护版本 PR 与 npm 发布。

创建变更说明：

```bash
pnpm changeset
```

选择受影响的包与语义化版本级别，随后提交生成的 Markdown 文件。合并到 `main` 后，Changesets 会更新版本 PR；版本 PR 合并后发布到 npm。

提交 changeset 时请说明用户能观察到的变化，不要只记录内部文件名或实现步骤。
